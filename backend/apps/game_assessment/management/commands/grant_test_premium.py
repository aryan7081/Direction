"""
Mark a user as having paid for the premium bundle (testing when Razorpay is unavailable).

Updates the latest completed game session: premium_unlocked=True, ReportOrder paid (premium_bundle).
Use --also-report to set premium_extension_complete so the full report unlocks without extra questions.
"""

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from apps.game_assessment.models import GameSession, ReportOrder
from apps.users.models import User


class Command(BaseCommand):
    help = "Grant premium bundle access for a user (manual testing; no payment)."

    def add_arguments(self, parser):
        parser.add_argument("email", type=str, help="User email (case-insensitive)")
        parser.add_argument(
            "--session-id",
            type=str,
            default="",
            help="Game session UUID; default: user's latest completed session",
        )
        parser.add_argument(
            "--also-report",
            action="store_true",
            help="Set premium_extension_complete so paid report access works without finishing premium questions",
        )

    def handle(self, *args, **options):
        email = (options["email"] or "").strip().lower()
        if not email:
            raise CommandError("email is required")

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist as e:
            raise CommandError(f"No user with email: {email}") from e

        sid = (options["session_id"] or "").strip()
        if sid:
            try:
                session = GameSession.objects.get(id=sid, user=user)
            except GameSession.DoesNotExist as e:
                raise CommandError(f"No session {sid} for this user.") from e
        else:
            session = (
                GameSession.objects.filter(user=user, is_complete=True)
                .order_by("-completed_at", "-started_at")
                .first()
            )
            if not session:
                session = (
                    GameSession.objects.filter(user=user)
                    .order_by("-started_at")
                    .first()
                )
            if not session:
                raise CommandError(
                    f"User {email} has no game sessions. Complete an assessment first."
                )

        if not session.is_complete:
            self.stdout.write(
                self.style.WARNING(
                    "Session is not marked complete; premium extension API may still block. "
                    "Consider completing Phase 1 first."
                )
            )

        amount = getattr(settings, "PREMIUM_BUNDLE_PRICE_INR", 99)
        order, created = ReportOrder.objects.get_or_create(
            user=user,
            session=session,
            defaults={
                "amount": amount,
                "product_type": ReportOrder.ProductType.PREMIUM_BUNDLE,
                "status": "paid",
                "paid_at": timezone.now(),
            },
        )
        if not created:
            order.product_type = ReportOrder.ProductType.PREMIUM_BUNDLE
            order.amount = amount
            order.status = "paid"
            order.paid_at = timezone.now()
            order.save()

        session.premium_unlocked = True
        if options["also_report"]:
            session.premium_extension_complete = True
            session.assessment_tier = GameSession.AssessmentTier.PREMIUM
        session.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Granted premium bundle for {email}\n"
                f"  session_id={session.id}\n"
                f"  report_order={order.id} status=paid product=premium_bundle\n"
                f"  premium_unlocked=True"
                + (
                    "\n  premium_extension_complete=True (full report unlocked)"
                    if options["also_report"]
                    else ""
                )
            )
        )
