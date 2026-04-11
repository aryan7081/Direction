import datetime
import hashlib
import hmac
import logging

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
    SaveProgressSerializer,
    CreateAccountFromSessionSerializer,
    SessionResultSerializer,
    TraitScoreSerializer,
    CareerMatchSerializer,
)
from .services import run_scoring_pipeline
from .services.report_builder import build_report
from apps.careers.career_categories import category_label_for_slug
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from .content.logic_game import get_logic_tasks
from .content.risk_game import get_risk_scenarios
from .content.planner_game import get_planner_config
from .content.scenarios import (
    expected_scenario_question_count,
    get_premium_extension_questions,
    get_scenario_questions,
)
from apps.users.models import Profile
from apps.users.serializers import UserSerializer

logger = logging.getLogger(__name__)


# ── Helpers ─────────────────────────────────────────────────────────

def _paid_order(user, session):
    if not user or not getattr(user, "is_authenticated", False):
        return None
    return (
        ReportOrder.objects.filter(user=user, session=session, status="paid")
        .order_by("-paid_at", "-created_at")
        .first()
    )


def _has_paid_order(user, session) -> bool:
    return _paid_order(user, session) is not None


def _has_report_access(user, session) -> bool:
    """User may open PDF / full JSON report."""
    o = _paid_order(user, session)
    if not o:
        return False
    if o.product_type == ReportOrder.ProductType.REPORT:
        return True
    if o.product_type == ReportOrder.ProductType.PREMIUM_BUNDLE:
        return session.premium_extension_complete
    return False


def _build_teaser(session) -> dict:
    """Build a partial report that reveals just enough to create desire.
    Does NOT expose trait scores or career names — only labels and count.
    """
    report = build_report(session)

    top_career = report["hero"]["career_name"]
    top_category = report["hero"].get("career_category", "")
    confidence = report["hero"]["confidence"]
    pattern = report.get("dominant_pattern") or {}

    trait_preview = [
        {"label": t["label"], "icon": t["icon"]}
        for t in report["traits"]
    ]

    careers = report["careers"]
    career_count = min(3, len(careers))
    career_preview = []
    for i in range(career_count):
        if i == 0 and careers:
            career_preview.append({
                "rank": 1,
                "career_category": careers[0].get("career_category", ""),
                "career_name": careers[0].get("career_name", ""),
                "stream": careers[0].get("stream", ""),
            })
        else:
            career_preview.append({"rank": i + 1})

    top_two_gap = None
    if len(careers) >= 2:
        p1 = careers[0].get("score_percent") or 0
        p2 = careers[1].get("score_percent") or 0
        top_two_gap = round(abs(float(p1) - float(p2)), 1)

    stream_rec = report.get("stream_recommendation", {})

    tier = getattr(session, "assessment_tier", "free") or "free"
    n_answered = GameEventLog.objects.filter(
        session=session, game_name="scenario", event_type="answer"
    ).count()
    need = expected_scenario_question_count(tier)
    if tier == "premium" or getattr(session, "premium_extension_complete", False):
        profile_depth = "full"
        profile_depth_title = "Full profile"
        profile_depth_detail = (
            "This result uses your extended assessment — more items across the same science-backed "
            "dimensions, so stream and career signals are steadier for big decisions."
        )
    else:
        profile_depth = "overview"
        profile_depth_title = "Directional snapshot"
        profile_depth_detail = (
            "This preview is from your first assessment only. It is useful for discussion and early "
            "exploration, but it is not the most stable read for final decisions. For maximum accuracy, "
            f"choose the premium bundle (₹{settings.PREMIUM_BUNDLE_PRICE_INR}): you complete extra questions, "
            "then unlock the full career report based on your refined profile. You can also unlock the report "
            f"from this run alone for ₹{settings.REPORT_PRICE_INR} if you prefer."
        )

    result = {
        "session_id": report["session_id"],
        "student_name": report["student"].get("name", "Student"),
        "hero_career": top_career,
        "hero_career_category": top_category,
        "hero_confidence": confidence,
        "dominant_pattern": pattern.get("name", ""),
        "dominant_pattern_description": pattern.get("description", ""),
        "stream_recommendation": stream_rec.get("stream", ""),
        "trait_preview": trait_preview,
        "career_preview": career_preview,
        "top_two_gap": top_two_gap,
        "total_traits": len(report["traits"]),
        "total_sections": 15,
        "is_paid": False,
        "assessment_tier": tier,
        "scenario_questions_answered": n_answered,
        "scenario_questions_expected": need,
        "profile_depth": profile_depth,
        "profile_depth_title": profile_depth_title,
        "profile_depth_detail": profile_depth_detail,
        "readiness": report.get("readiness", {}),
    }
    if hasattr(session, "pending_email") and session.pending_email:
        result["pending_email"] = session.pending_email
    return result


# ── Game content & session views ────────────────────────────────────

class GameContentView(GenericAPIView):
    permission_classes = [AllowAny]
    throttle_scope = "game_content"

    def get(self, request):
        n_free = expected_scenario_question_count("free")
        n_premium = expected_scenario_question_count("premium")
        return Response(
            {
                "logic_tasks": get_logic_tasks(),
                "risk_scenarios": get_risk_scenarios(),
                "planner_config": get_planner_config(),
                "scenario_questions": get_scenario_questions("free"),
                "assessment_tier": "free",
                "question_counts": {"free": n_free, "premium": n_premium},
            }
        )


class StartSessionView(GenericAPIView):
    permission_classes = [AllowAny]
    throttle_scope = "game_start"

    def post(self, request):
        session = GameSession.objects.create(
            user=request.user if request.user.is_authenticated else None,
            assessment_tier=GameSession.AssessmentTier.FREE,
        )
        return Response(
            {
                "session_id": str(session.id),
                "started_at": session.started_at,
                "assessment_tier": session.assessment_tier,
            },
            status=status.HTTP_201_CREATED,
        )


class SaveProgressView(GenericAPIView):
    """POST { session_id, email } — save email to pending_email for anonymous sessions."""

    permission_classes = [AllowAny]
    throttle_scope = "game_progress"
    serializer_class = SaveProgressSerializer

    def post(self, request):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data

        session, err = _get_session_for_request(request, d["session_id"])
        if err:
            return Response({"detail": err}, status=status.HTTP_404_NOT_FOUND)

        if session.is_complete:
            return Response(
                {"detail": "Session already completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.pending_email = d["email"]
        session.save(update_fields=["pending_email"])

        return Response({"detail": "Progress saved."}, status=status.HTTP_200_OK)


class CreateAccountFromSessionView(GenericAPIView):
    """POST { session_id, email, password } — create user from anonymous session with pending_email."""

    permission_classes = [AllowAny]
    throttle_scope = "auth_session_signup"
    serializer_class = CreateAccountFromSessionSerializer

    def post(self, request):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data

        User = get_user_model()

        session, err = _get_session_for_request(request, d["session_id"])
        if err:
            return Response({"detail": err}, status=status.HTTP_404_NOT_FOUND)

        if not session.pending_email or session.pending_email.lower() != d["email"].lower():
            return Response(
                {"detail": "Email does not match the email saved for this session."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email__iexact=d["email"]).exists():
            return Response(
                {"detail": "A user with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from apps.users.serializers import _make_username_from_email

        username = _make_username_from_email(d["email"])
        user = User.objects.create_user(
            email=d["email"],
            username=username,
            password=d["password"],
        )
        Profile.objects.get_or_create(user=user)

        session.user = user
        session.pending_email = ""
        session.save(update_fields=["user", "pending_email"])

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


def _get_session_for_request(request, session_id):
    """Resolve session: authenticated user must match session.user; anonymous allowed if session.user is None."""
    try:
        session = GameSession.objects.get(id=session_id)
    except GameSession.DoesNotExist:
        return None, "Session not found."
    if request.user.is_authenticated:
        if session.user_id != request.user.id:
            return None, "Session not found."
    else:
        if session.user_id is not None:
            return None, "Session not found."
    return session, None


class LogEventView(GenericAPIView):
    permission_classes = [AllowAny]
    throttle_scope = "game_log"
    serializer_class = LogEventSerializer

    def post(self, request):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data

        session, err = _get_session_for_request(request, d["session_id"])
        if err:
            return Response({"detail": err}, status=status.HTTP_404_NOT_FOUND)

        can_extend = (
            session.is_complete
            and session.premium_unlocked
            and not session.premium_extension_complete
        )
        if session.is_complete and not can_extend:
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
    permission_classes = [AllowAny]
    throttle_scope = "game_submit"
    serializer_class = SubmitSessionSerializer

    def post(self, request):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)

        session, err = _get_session_for_request(
            request, ser.validated_data["session_id"]
        )
        if err:
            return Response({"detail": err}, status=status.HTTP_404_NOT_FOUND)

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

        scenario_answers = GameEventLog.objects.filter(
            session=session, game_name="scenario", event_type="answer"
        ).count()
        need = expected_scenario_question_count(session.assessment_tier)
        if scenario_answers < need:
            return Response(
                {
                    "detail": (
                        f"This assessment needs {need} answered questions; "
                        f"{scenario_answers} found. Please complete all questions."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = run_scoring_pipeline(session)
        except Exception:
            logger.exception(
                "run_scoring_pipeline failed for session %s", session.id
            )
            return Response(
                {
                    "detail": (
                        "We couldn't process your results right now. "
                        "Please try again in a moment or contact support if this continues."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

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


class PremiumExtensionContentView(GenericAPIView):
    """GET — premium-only questions after ₹99 bundle (authenticated)."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "game_content"

    def get(self, request):
        session_id = request.query_params.get("session_id")
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
                {"detail": "Complete the main assessment first."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not session.premium_unlocked:
            return Response(
                {"detail": "Premium bundle not unlocked."},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )
        if session.premium_extension_complete:
            return Response(
                {"detail": "Premium extension already completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {
                "session_id": str(session.id),
                "scenario_questions": get_premium_extension_questions(),
            }
        )


class SubmitPremiumExtensionView(GenericAPIView):
    """POST — rescore after user logs all premium-only answers."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "game_submit"

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
                {"detail": "Invalid session state."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not session.premium_unlocked:
            return Response(
                {"detail": "Premium bundle not unlocked."},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )
        if session.premium_extension_complete:
            return Response(
                {"detail": "Already completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        n = GameEventLog.objects.filter(
            session=session, game_name="scenario", event_type="answer"
        ).count()
        need = expected_scenario_question_count("premium")
        if n < need:
            return Response(
                {
                    "detail": (
                        f"This step needs {need} scenario answers in total; "
                        f"{n} found. Finish all premium questions."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            run_scoring_pipeline(session)
        except Exception:
            logger.exception("premium extension scoring failed for session %s", session_id)
            return Response(
                {"detail": "We couldn't update your results. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        session.premium_extension_complete = True
        session.assessment_tier = GameSession.AssessmentTier.PREMIUM
        session.save(update_fields=["premium_extension_complete", "assessment_tier"])
        return Response({"session_id": str(session.id), "detail": "ok"})


class SessionResultView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "report_json"

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
                "career_category": (m.career.category or "").strip()
                or category_label_for_slug(m.career.slug),
                "stream": m.career.stream,
                "description": (m.career.description[:200] if m.career.description else ""),
                "score": m.score,
                "score_percent": round(m.score * 100, 1) if m.score <= 1 else round(m.score, 1),
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


GAME_PHASE_ORDER = ["scenario"]


def _detect_resume_phase(session):
    """Single-phase assessment: resume in scenario until all MCQ answers are logged."""
    n = GameEventLog.objects.filter(
        session=session, game_name="scenario", event_type="answer"
    ).count()
    need = expected_scenario_question_count(session.assessment_tier)
    if n < need:
        return "scenario"
    return "processing"


class GameDashboardView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "report_json"

    def get(self, request):
        sessions = (
            GameSession.objects.filter(user=request.user)
            .order_by("-started_at")[:10]
        )

        attempts = []
        for s in sessions:
            entry = {
                "id": str(s.id),
                "is_complete": s.is_complete,
                "started_at": s.started_at,
                "completed_at": s.completed_at,
                "created_at": s.started_at,
                "is_report_paid": _has_report_access(request.user, s),
                "assessment_tier": s.assessment_tier,
                "premium_unlocked": s.premium_unlocked,
                "premium_extension_complete": s.premium_extension_complete,
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
                    _has_report_access(request.user, latest_complete)
                    if latest_complete
                    else False
                ),
            }
        )


class ResumeSessionView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "game_content"

    def get(self, request):
        session = (
            GameSession.objects.filter(user=request.user, is_complete=False)
            .order_by("-started_at")
            .first()
        )
        if not session:
            return Response({"session": None})

        resume_phase = _detect_resume_phase(session)
        scenario_answer_index = GameEventLog.objects.filter(
            session=session, game_name="scenario", event_type="answer"
        ).count()

        return Response(
            {
                "session": {
                    "session_id": str(session.id),
                    "started_at": session.started_at,
                    "resume_phase": resume_phase,
                    "scenario_answer_index": scenario_answer_index,
                    "assessment_tier": session.assessment_tier,
                }
            }
        )


# ── Report teaser (free) ───────────────────────────────────────────

class ReportTeaserView(GenericAPIView):
    """GET — returns a partial report teaser (free, no payment needed)."""

    permission_classes = [AllowAny]
    throttle_scope = "game_teaser"

    def get(self, request, session_id):
        try:
            session = GameSession.objects.get(id=session_id)
        except GameSession.DoesNotExist:
            return Response(
                {"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if not session.is_complete:
            return Response(
                {"detail": "Session not yet completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report_accessible = (
            _has_report_access(session.user, session) if session.user else False
        )
        teaser = _build_teaser(session)
        teaser["report_price_inr"] = settings.REPORT_PRICE_INR
        teaser["premium_bundle_price_inr"] = settings.PREMIUM_BUNDLE_PRICE_INR
        teaser["report_accessible"] = report_accessible
        teaser["premium_unlocked"] = session.premium_unlocked
        teaser["premium_extension_complete"] = session.premium_extension_complete
        teaser["price"] = settings.REPORT_PRICE_INR
        if report_accessible:
            teaser["is_paid"] = True
        else:
            teaser["is_paid"] = False
        return Response(teaser)


# ── Gated full report ──────────────────────────────────────────────

class CareerReportView(GenericAPIView):
    """GET — returns the full career report JSON (paid only)."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "report_json"

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

        if not _has_report_access(request.user, session):
            if session.premium_unlocked and not session.premium_extension_complete:
                return Response(
                    {
                        "detail": (
                            "Complete your premium assessment to unlock the full report "
                            "included in your bundle."
                        ),
                        "code": "PREMIUM_EXTENSION_REQUIRED",
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )
            return Response(
                {"detail": "Payment required to access full report.", "code": "PAYMENT_REQUIRED"},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        report = build_report(session)
        return Response(report)


class CareerReportPDFView(GenericAPIView):
    """GET — returns a downloadable A4 PDF career report (paid only)."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "report_pdf"

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

        if not _has_report_access(request.user, session):
            if session.premium_unlocked and not session.premium_extension_complete:
                return Response(
                    {
                        "detail": (
                            "Complete your premium assessment to download the report "
                            "included in your bundle."
                        ),
                        "code": "PREMIUM_EXTENSION_REQUIRED",
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )
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
    """POST — creates a Razorpay order for report (₹49) or premium bundle (₹99)."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "payment_create"

    def post(self, request):
        session_id = request.data.get("session_id")
        if not session_id:
            return Response(
                {"detail": "session_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        raw_pt = request.data.get("product_type", ReportOrder.ProductType.REPORT)
        if raw_pt == ReportOrder.ProductType.PREMIUM_BUNDLE:
            product_type = ReportOrder.ProductType.PREMIUM_BUNDLE
            amount_inr = settings.PREMIUM_BUNDLE_PRICE_INR
        else:
            product_type = ReportOrder.ProductType.REPORT
            amount_inr = settings.REPORT_PRICE_INR

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

        if _has_paid_order(request.user, session):
            if _has_report_access(request.user, session):
                return Response(
                    {"detail": "Already purchased.", "is_paid": True},
                    status=status.HTTP_200_OK,
                )
            return Response(
                {
                    "detail": "Complete your premium assessment to unlock the report.",
                    "premium_pending_extension": True,
                    "session_id": str(session.id),
                },
                status=status.HTTP_200_OK,
            )

        order, _created = ReportOrder.objects.get_or_create(
            user=request.user,
            session=session,
            defaults={
                "amount": amount_inr,
                "product_type": product_type,
            },
        )

        if order.status == "paid":
            return Response({"detail": "Already paid.", "is_paid": True})

        order.product_type = product_type
        order.amount = amount_inr
        order.save(update_fields=["product_type", "amount"])

        if not settings.RAZORPAY_KEY_ID:
            order.status = "paid"
            order.paid_at = timezone.now()
            order.save()
            if product_type == ReportOrder.ProductType.PREMIUM_BUNDLE:
                session.premium_unlocked = True
                session.save(update_fields=["premium_unlocked"])
            return Response(
                {
                    "is_paid": product_type == ReportOrder.ProductType.REPORT
                    or session.premium_extension_complete,
                    "detail": "Payment gateway not configured — unlocked for dev.",
                    "product_type": product_type,
                }
            )

        import razorpay

        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        from apps.common.razorpay_text import (
            razorpay_safe_customer_name,
            razorpay_safe_email,
            razorpay_safe_note_value,
        )

        rz_order = client.order.create(
            {
                "amount": amount_inr * 100,
                "currency": "INR",
                "receipt": str(order.id),
                "notes": {
                    "session_id": razorpay_safe_note_value(str(session.id), max_length=80),
                    "user_email": razorpay_safe_note_value(
                        request.user.email or "", max_length=254
                    ),
                    "product_type": product_type,
                },
            }
        )

        order.razorpay_order_id = rz_order["id"]
        order.save(update_fields=["razorpay_order_id"])

        safe_name = razorpay_safe_customer_name(
            request.user.get_full_name() or request.user.email or ""
        )
        safe_email = razorpay_safe_email(request.user.email)

        return Response(
            {
                "order_id": rz_order["id"],
                "amount": amount_inr,
                "currency": "INR",
                "key_id": settings.RAZORPAY_KEY_ID,
                "user_email": safe_email,
                "user_name": safe_name,
                "product_type": product_type,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyPaymentView(GenericAPIView):
    """POST — verifies Razorpay payment signature and unlocks the report."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "payment_verify"

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

        sess = order.session
        if order.product_type == ReportOrder.ProductType.PREMIUM_BUNDLE:
            sess.premium_unlocked = True
            sess.save(update_fields=["premium_unlocked"])

        return Response(
            {
                "verified": True,
                "session_id": str(order.session_id),
                "product_type": order.product_type,
            }
        )
