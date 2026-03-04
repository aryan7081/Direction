import datetime
import hashlib
import hmac

from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import (
    GameSession,
    GameEventLog,
    TraitScore,
    CareerMatchScore,
    ReportOrder,
)
from .serializers import (
    LogEventSerializer,
    SubmitSessionSerializer,
    SessionResultSerializer,
    TraitScoreSerializer,
    CareerMatchSerializer,
)
from .services import run_scoring_pipeline
from .services.report_builder import build_report
from .content.logic_game import get_logic_tasks
from .content.risk_game import get_risk_scenarios
from .content.planner_game import get_planner_config
from .content.scenarios import get_scenario_questions


# ── Helpers ─────────────────────────────────────────────────────────

def _has_paid(user, session) -> bool:
    return ReportOrder.objects.filter(
        user=user, session=session, status="paid"
    ).exists()


def _build_teaser(session) -> dict:
    """Build a partial report that reveals just enough to create desire.
    Does NOT expose trait scores or career names — only labels and count.
    """
    report = build_report(session)

    top_career = report["hero"]["career_name"]
    confidence = report["hero"]["confidence"]
    pattern = report.get("dominant_pattern", {})

    trait_preview = [
        {"label": t["label"], "icon": t["icon"]}
        for t in report["traits"]
    ]

    career_count = min(3, len(report["careers"]))
    career_preview = [{"rank": i + 1} for i in range(career_count)]

    return {
        "session_id": report["session_id"],
        "student_name": report["student"].get("name", "Student"),
        "hero_career": top_career,
        "hero_confidence": confidence,
        "dominant_pattern": pattern.get("name", ""),
        "trait_preview": trait_preview,
        "career_preview": career_preview,
        "total_traits": len(report["traits"]),
        "total_sections": 8,
        "is_paid": False,
    }


# ── Game content & session views ────────────────────────────────────

class GameContentView(GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "logic_tasks": get_logic_tasks(),
                "risk_scenarios": get_risk_scenarios(),
                "planner_config": get_planner_config(),
                "scenario_questions": get_scenario_questions(),
            }
        )


class StartSessionView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session = GameSession.objects.create(
            user=request.user if request.user.is_authenticated else None,
        )
        return Response(
            {"session_id": str(session.id), "started_at": session.started_at},
            status=status.HTTP_201_CREATED,
        )


class LogEventView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LogEventSerializer

    def post(self, request):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data

        try:
            session = GameSession.objects.get(
                id=d["session_id"], user=request.user
            )
        except GameSession.DoesNotExist:
            return Response(
                {"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if session.is_complete:
            return Response(
                {"detail": "Session already completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        logs = []
        for ev in d["events"]:
            ts = datetime.datetime.fromtimestamp(
                ev["timestamp"] / 1000, tz=datetime.timezone.utc
            )
            logs.append(
                GameEventLog(
                    session=session,
                    game_name=ev["game"],
                    event_type=ev["event_type"],
                    payload=ev["payload"],
                    timestamp=ts,
                )
            )
        GameEventLog.objects.bulk_create(logs)

        return Response({"logged": len(logs)}, status=status.HTTP_201_CREATED)


class SubmitSessionView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubmitSessionSerializer

    def post(self, request):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)

        try:
            session = GameSession.objects.get(
                id=ser.validated_data["session_id"], user=request.user
            )
        except GameSession.DoesNotExist:
            return Response(
                {"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if session.is_complete:
            return Response(
                {"detail": "Session already scored."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event_count = GameEventLog.objects.filter(session=session).count()
        if event_count == 0:
            return Response(
                {"detail": "No events logged for this session."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = run_scoring_pipeline(session)

        trait_list = [
            {
                "trait_name": tn,
                "raw_score": vals["raw"],
                "normalized_score": vals["normalized"],
            }
            for tn, vals in result["trait_scores"].items()
        ]

        return Response(
            {
                "session_id": str(session.id),
                "completed_at": session.completed_at,
                "trait_scores": trait_list,
                "career_matches": result["career_matches"],
            }
        )


class SessionResultView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            session = GameSession.objects.get(id=session_id, user=request.user)
        except GameSession.DoesNotExist:
            return Response(
                {"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if not session.is_complete:
            return Response(
                {"detail": "Session not yet completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        traits = TraitScore.objects.filter(session=session)
        matches = CareerMatchScore.objects.filter(session=session).select_related(
            "career"
        )

        trait_data = TraitScoreSerializer(traits, many=True).data
        career_data = [
            {
                "career_id": m.career.id,
                "career_name": m.career.name,
                "career_slug": m.career.slug,
                "stream": m.career.stream,
                "description": (m.career.description[:200] if m.career.description else ""),
                "score": m.score,
                "score_percent": round(m.score / max(m.score, 1) * 100, 1)
                if m.score
                else 0,
                "rank": m.rank,
            }
            for m in matches
        ]

        return Response(
            {
                "session_id": str(session.id),
                "completed_at": session.completed_at,
                "trait_scores": trait_data,
                "career_matches": career_data,
            }
        )


GAME_PHASE_ORDER = ["logic", "risk", "planner", "scenario"]


def _detect_resume_phase(session):
    logged_games = set(
        GameEventLog.objects.filter(session=session)
        .values_list("game_name", flat=True)
        .distinct()
    )
    for phase in GAME_PHASE_ORDER:
        if phase not in logged_games:
            return phase
    return "processing"


class GameDashboardView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = (
            GameSession.objects.filter(user=request.user)
            .order_by("-started_at")[:10]
        )

        paid_session_ids = set(
            ReportOrder.objects.filter(user=request.user, status="paid")
            .values_list("session_id", flat=True)
        )

        attempts = []
        for s in sessions:
            entry = {
                "id": str(s.id),
                "is_complete": s.is_complete,
                "started_at": s.started_at,
                "completed_at": s.completed_at,
                "created_at": s.started_at,
                "is_report_paid": s.id in paid_session_ids,
            }
            if not s.is_complete:
                entry["resume_phase"] = _detect_resume_phase(s)
            attempts.append(entry)

        latest_complete = (
            GameSession.objects.filter(user=request.user, is_complete=True)
            .order_by("-completed_at")
            .first()
        )

        return Response(
            {
                "attempts": attempts,
                "latest_result_session_id": (
                    str(latest_complete.id) if latest_complete else None
                ),
                "latest_report_paid": (
                    latest_complete.id in paid_session_ids if latest_complete else False
                ),
            }
        )


class ResumeSessionView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        session = (
            GameSession.objects.filter(user=request.user, is_complete=False)
            .order_by("-started_at")
            .first()
        )
        if not session:
            return Response({"session": None})

        resume_phase = _detect_resume_phase(session)

        return Response(
            {
                "session": {
                    "session_id": str(session.id),
                    "started_at": session.started_at,
                    "resume_phase": resume_phase,
                }
            }
        )


# ── Report teaser (free) ───────────────────────────────────────────

class ReportTeaserView(GenericAPIView):
    """GET — returns a partial report teaser (free, no payment needed)."""

    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            session = GameSession.objects.get(id=session_id, user=request.user)
        except GameSession.DoesNotExist:
            return Response(
                {"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if not session.is_complete:
            return Response(
                {"detail": "Session not yet completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        paid = _has_paid(request.user, session)
        if paid:
            teaser = _build_teaser(session)
            teaser["is_paid"] = True
            return Response(teaser)

        teaser = _build_teaser(session)
        teaser["price"] = settings.REPORT_PRICE_INR
        return Response(teaser)


# ── Gated full report ──────────────────────────────────────────────

class CareerReportView(GenericAPIView):
    """GET — returns the full career report JSON (paid only)."""

    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            session = GameSession.objects.get(id=session_id, user=request.user)
        except GameSession.DoesNotExist:
            return Response(
                {"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if not session.is_complete:
            return Response(
                {"detail": "Session not yet completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not _has_paid(request.user, session):
            return Response(
                {"detail": "Payment required to access full report.", "code": "PAYMENT_REQUIRED"},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        report = build_report(session)
        return Response(report)


class CareerReportPDFView(GenericAPIView):
    """GET — returns a downloadable A4 PDF career report (paid only)."""

    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            session = GameSession.objects.get(id=session_id, user=request.user)
        except GameSession.DoesNotExist:
            return Response(
                {"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if not session.is_complete:
            return Response(
                {"detail": "Session not yet completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not _has_paid(request.user, session):
            return Response(
                {"detail": "Payment required to download report.", "code": "PAYMENT_REQUIRED"},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        report = build_report(session)

        try:
            from .services.pdf_renderer import render_report_pdf

            pdf_bytes = render_report_pdf(report)
        except (ImportError, OSError) as e:
            return Response(
                {"detail": f"PDF generation is not available: {e}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            return Response(
                {"detail": f"PDF generation failed: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = (
            f'attachment; filename="career-report-{session_id}.pdf"'
        )
        return response


# ── Payment endpoints ──────────────────────────────────────────────

class CreatePaymentOrderView(GenericAPIView):
    """POST — creates a Razorpay order for a report."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.data.get("session_id")
        if not session_id:
            return Response(
                {"detail": "session_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            session = GameSession.objects.get(id=session_id, user=request.user)
        except GameSession.DoesNotExist:
            return Response(
                {"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if not session.is_complete:
            return Response(
                {"detail": "Session not yet completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if _has_paid(request.user, session):
            return Response(
                {"detail": "Report already purchased.", "is_paid": True},
                status=status.HTTP_200_OK,
            )

        amount_inr = settings.REPORT_PRICE_INR

        order, created = ReportOrder.objects.get_or_create(
            user=request.user,
            session=session,
            defaults={"amount": amount_inr},
        )

        if order.status == "paid":
            return Response({"detail": "Already paid.", "is_paid": True})

        if not settings.RAZORPAY_KEY_ID:
            order.status = "paid"
            order.paid_at = timezone.now()
            order.save()
            return Response({
                "is_paid": True,
                "detail": "Payment gateway not configured — report unlocked for free (dev mode).",
            })

        import razorpay

        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        rz_order = client.order.create(
            {
                "amount": amount_inr * 100,
                "currency": "INR",
                "receipt": str(order.id),
                "notes": {
                    "session_id": str(session.id),
                    "user_email": request.user.email,
                },
            }
        )

        order.razorpay_order_id = rz_order["id"]
        order.save()

        return Response(
            {
                "order_id": rz_order["id"],
                "amount": amount_inr,
                "currency": "INR",
                "key_id": settings.RAZORPAY_KEY_ID,
                "user_email": request.user.email,
                "user_name": request.user.get_full_name() or request.user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyPaymentView(GenericAPIView):
    """POST — verifies Razorpay payment signature and unlocks the report."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get("razorpay_order_id", "")
        razorpay_payment_id = request.data.get("razorpay_payment_id", "")
        razorpay_signature = request.data.get("razorpay_signature", "")

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response(
                {"detail": "Missing payment details."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = ReportOrder.objects.get(
                razorpay_order_id=razorpay_order_id, user=request.user
            )
        except ReportOrder.DoesNotExist:
            return Response(
                {"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if order.status == "paid":
            return Response({"verified": True, "detail": "Already verified."})

        expected_sig = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(expected_sig, razorpay_signature):
            order.status = "failed"
            order.save()
            return Response(
                {"detail": "Payment verification failed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = "paid"
        order.razorpay_payment_id = razorpay_payment_id
        order.razorpay_signature = razorpay_signature
        order.paid_at = timezone.now()
        order.save()

        return Response({"verified": True, "session_id": str(order.session_id)})
