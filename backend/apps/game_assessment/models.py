import math
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.common.models import TimeStampedModel


TRAIT_CHOICES = [
    ("analytical_reasoning", "Analytical Reasoning"),
    ("quantitative_comfort", "Quantitative Comfort"),
    ("creativity_innovation", "Creativity & Innovation"),
    ("verbal_communication", "Verbal & Communication"),
    ("social_orientation", "Social Orientation"),
    ("leadership_drive", "Leadership Drive"),
    ("risk_appetite", "Risk Appetite"),
    ("structure_discipline", "Structure & Discipline"),
]

TRAIT_SLUGS = [t[0] for t in TRAIT_CHOICES]

GAME_CHOICES = [
    ("logic", "Logic & Pattern Challenge"),
    ("risk", "Risk & Leadership Simulator"),
    ("planner", "Planner & Organization Game"),
    ("scenario", "Scenario Section"),
]


class GameSession(TimeStampedModel):
    class AssessmentTier(models.TextChoices):
        FREE = "free", "Free overview"
        PREMIUM = "premium", "Full profile"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="game_sessions",
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_complete = models.BooleanField(default=False)
    pending_email = models.EmailField(blank=True)
    assessment_tier = models.CharField(
        max_length=20,
        choices=AssessmentTier.choices,
        default=AssessmentTier.FREE,
        db_index=True,
    )
    premium_unlocked = models.BooleanField(
        default=False,
        help_text="True after ₹99 premium bundle payment (before extra questions).",
    )
    premium_extension_complete = models.BooleanField(
        default=False,
        help_text="True after user completes premium-only questions and rescoring.",
    )

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        label = self.user.email if self.user else "anonymous"
        return f"GameSession {self.id} ({label})"


class GameEventLog(models.Model):
    session = models.ForeignKey(
        GameSession, on_delete=models.CASCADE, related_name="events"
    )
    game_name = models.CharField(max_length=30, choices=GAME_CHOICES)
    event_type = models.CharField(max_length=50)
    payload = models.JSONField(default=dict)
    timestamp = models.DateTimeField()

    class Meta:
        ordering = ["timestamp"]
        indexes = [
            models.Index(fields=["session", "game_name"]),
        ]

    def __str__(self):
        return f"{self.game_name}:{self.event_type} @ {self.timestamp}"


class TraitScore(models.Model):
    session = models.ForeignKey(
        GameSession, on_delete=models.CASCADE, related_name="trait_scores"
    )
    trait_name = models.CharField(max_length=30, choices=TRAIT_CHOICES)
    raw_score = models.FloatField(default=0)
    normalized_score = models.FloatField(default=0, help_text="0-10 scale")

    class Meta:
        unique_together = ("session", "trait_name")

    def __str__(self):
        return f"{self.trait_name}: {self.normalized_score:.1f}"


class CareerMatchScore(models.Model):
    session = models.ForeignKey(
        GameSession, on_delete=models.CASCADE, related_name="career_matches"
    )
    career = models.ForeignKey(
        "careers.Career", on_delete=models.CASCADE, related_name="game_matches"
    )
    score = models.FloatField(default=0)
    rank = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("session", "career")
        ordering = ["rank"]

    def __str__(self):
        return f"#{self.rank} {self.career.name}: {self.score:.2f}"


class GameCareerTraitWeight(TimeStampedModel):
    """Maps each career to the 8-trait model with weights 0-1."""

    career = models.ForeignKey(
        "careers.Career",
        on_delete=models.CASCADE,
        related_name="game_trait_weights",
    )
    trait_name = models.CharField(max_length=30, choices=TRAIT_CHOICES)
    weight = models.FloatField(
        default=0,
        help_text="0.0 to 1.0 — how important this trait is for the career",
    )

    class Meta:
        unique_together = ("career", "trait_name")

    def __str__(self):
        return f"{self.career.name} / {self.trait_name}: {self.weight}"

    def clean(self):
        w = float(self.weight)
        if math.isnan(w) or math.isinf(w):
            raise ValidationError({"weight": "Weight must be a finite number."})
        if w < 0 or w > 1:
            raise ValidationError({"weight": "Weight must be between 0.0 and 1.0."})


PAYMENT_STATUS_CHOICES = [
    ("pending", "Pending"),
    ("paid", "Paid"),
    ("failed", "Failed"),
]


class PaymentCoupon(TimeStampedModel):
    """Admin-managed percentage discount codes for report / bundle checkout."""

    code = models.CharField(
        max_length=40,
        unique=True,
        db_index=True,
        help_text="Stored uppercase. Shown to users as entered.",
    )
    discount_percent = models.PositiveSmallIntegerField(
        help_text="0–100. Use 100 for a fully free checkout (no Razorpay charge).",
    )
    is_active = models.BooleanField(default=True, db_index=True)
    valid_from = models.DateTimeField(
        null=True,
        blank=True,
        help_text="If set, code is not valid before this instant (UTC).",
    )
    valid_until = models.DateTimeField(
        null=True,
        blank=True,
        help_text="If set, code is not valid after this instant (UTC).",
    )
    max_redemptions = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Leave empty for unlimited total uses.",
    )
    max_redemptions_per_user = models.PositiveSmallIntegerField(
        default=1,
        help_text="How many successful checkouts per user can apply this code.",
    )
    internal_note = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Payment coupon"
        verbose_name_plural = "Payment coupons"

    def __str__(self) -> str:
        return f"{self.code} ({self.discount_percent}%)"

    def clean(self):
        super().clean()
        d = int(self.discount_percent)
        if d > 100:
            raise ValidationError({"discount_percent": "Cannot exceed 100%."})

    def save(self, *args, **kwargs):
        self.code = (self.code or "").strip().upper()
        super().save(*args, **kwargs)


class CouponRedemption(TimeStampedModel):
    """Audit trail: one row per successful discounted checkout (initial or upgrade)."""

    class Context(models.TextChoices):
        INITIAL = "initial", "Initial purchase"
        UPGRADE = "upgrade", "Premium bundle upgrade"

    coupon = models.ForeignKey(
        PaymentCoupon,
        on_delete=models.PROTECT,
        related_name="redemptions",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="coupon_redemptions",
    )
    report_order = models.ForeignKey(
        "ReportOrder",
        on_delete=models.CASCADE,
        related_name="coupon_redemptions",
    )
    context = models.CharField(max_length=16, choices=Context.choices)
    list_price_inr = models.PositiveIntegerField()
    final_amount_inr = models.PositiveIntegerField()
    discount_percent = models.PositiveSmallIntegerField()

    class Meta:
        ordering = ["-created_at"]
        unique_together = [("report_order", "context")]
        verbose_name = "Coupon redemption"
        verbose_name_plural = "Coupon redemptions"

    def __str__(self) -> str:
        return f"{self.coupon.code} · {self.context} · order {self.report_order_id}"


class ReportOrder(TimeStampedModel):
    """Tracks payment for a career report or premium bundle."""

    class ProductType(models.TextChoices):
        REPORT = "report", "Career report (Phase 1)"
        PREMIUM_BUNDLE = "premium_bundle", "Premium extension + report"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="report_orders",
    )
    session = models.ForeignKey(
        GameSession,
        on_delete=models.CASCADE,
        related_name="report_orders",
    )
    amount = models.PositiveIntegerField(default=49, help_text="Amount in INR")
    product_type = models.CharField(
        max_length=20,
        choices=ProductType.choices,
        default=ProductType.REPORT,
        db_index=True,
    )
    status = models.CharField(
        max_length=10, choices=PAYMENT_STATUS_CHOICES, default="pending"
    )
    razorpay_order_id = models.CharField(max_length=100, blank=True, default="")
    razorpay_payment_id = models.CharField(max_length=100, blank=True, default="")
    razorpay_signature = models.CharField(max_length=200, blank=True, default="")
    paid_at = models.DateTimeField(null=True, blank=True)
    # Second checkout when upgrading from paid report-only → premium bundle (₹50 delta).
    upgrade_razorpay_order_id = models.CharField(max_length=100, blank=True, default="")
    upgrade_razorpay_payment_id = models.CharField(max_length=100, blank=True, default="")
    # Locked when user starts a checkout with a coupon; cleared after redemption or abandoned.
    pending_coupon = models.ForeignKey(
        PaymentCoupon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pending_orders",
    )
    pending_checkout_kind = models.CharField(
        max_length=16,
        blank=True,
        default="",
        help_text="initial | upgrade — matches CouponRedemption.context",
    )
    pending_list_price_inr = models.PositiveIntegerField(null=True, blank=True)
    pending_final_amount_inr = models.PositiveIntegerField(null=True, blank=True)
    pending_discount_percent = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("user", "session")

    def ensure_premium_bundle_session_unlocked(self) -> None:
        """Paid premium-bundle orders must set session.premium_unlocked (admin bulk-update skips save())."""
        if (
            self.status == "paid"
            and self.product_type == self.ProductType.PREMIUM_BUNDLE
            and self.session_id
        ):
            GameSession.objects.filter(pk=self.session_id, premium_unlocked=False).update(
                premium_unlocked=True
            )

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.ensure_premium_bundle_session_unlocked()

    def __str__(self):
        return f"Order {self.id} ({self.status}) — {self.user.email}"


class CareerCounselingRequest(TimeStampedModel):
    """Student requested a call from the team after viewing the paid career report."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONTACTED = "contacted", "Contacted"
        CLOSED = "closed", "Closed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="career_counseling_requests",
    )
    session = models.ForeignKey(
        GameSession,
        on_delete=models.CASCADE,
        related_name="counseling_requests",
    )
    phone = models.CharField(max_length=15, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    admin_notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Career counseling request"
        verbose_name_plural = "Requested counselings"

    def __str__(self) -> str:
        return f"{self.phone} · {self.user_id} · {self.created_at:%Y-%m-%d %H:%M}"
