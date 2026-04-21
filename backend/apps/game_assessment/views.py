from __future__ import annotations

import datetime
import hashlib
import hmac
import logging
from typing import Tuple

from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    GameSession,
    GameEventLog,
    TraitScore,
    CareerMatchScore,
    ReportOrder,
    CareerCounselingRequest,
)
from .serializers import (
    LogEventSerializer,
    SubmitSessionSerializer,
    SaveProgressSerializer,
    CreateAccountFromSessionSerializer,
    SessionResultSerializer,
    TraitScoreSerializer,
    CareerMatchSerializer,
    CareerCounselingRequestSerializer,
)
from .services import run_scoring_pipeline
from .services.report_builder import build_report, redact_report_for_unpaid_preview
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


def _user_has_paid_report_order_any(user) -> bool:
    """True if user ever paid for the ₹49 report-only tier (any session)."""
    if not user or not getattr(user, "is_authenticated", False):
        return False
    return ReportOrder.objects.filter(
        user=user,
        status="paid",
        product_type=ReportOrder.ProductType.REPORT,
    ).exists()


def _user_has_paid_premium_bundle_any(user) -> bool:
    """True if user ever paid for the premium bundle (₹99 tier; any session)."""
    if not user or not getattr(user, "is_authenticated", False):
        return False
    return ReportOrder.objects.filter(
        user=user,
        status="paid",
        product_type=ReportOrder.ProductType.PREMIUM_BUNDLE,
    ).exists()


def _has_report_access(user, session) -> bool:
    """User may open PDF / full JSON report (this session or lifetime entitlement)."""
    if not user or not getattr(user, "is_authenticated", False):
        return False
    o = _paid_order(user, session)
    if o:
        if o.product_type == ReportOrder.ProductType.REPORT:
            return True
        if o.product_type == ReportOrder.ProductType.PREMIUM_BUNDLE:
            return session.premium_extension_complete
    # Retake / new session: same account already paid on an older session.
    if _user_has_paid_premium_bundle_any(user):
        return session.premium_extension_complete
    if _user_has_paid_report_order_any(user):
        return True
    return False


def _session_result_json_response(session, user, trait_list: list, career_matches: list) -> dict:
    """
    Full trait/career payloads only after report purchase (same rule as PDF / full report).
    Prevents DevTools / network inspection from leaking #1 career and scores before payment.
    """
    _sync_session_premium_unlock_from_bundle_order(session)
    if _has_report_access(user, session):
        return {
            "session_id": str(session.id),
            "completed_at": session.completed_at,
            "trait_scores": trait_list,
            "career_matches": career_matches,
        }
    return {
        "session_id": str(session.id),
        "completed_at": session.completed_at,
        "report_locked": True,
        "trait_scores": [],
        "career_matches": [],
    }


def _mask_in_mobile_display(phone: str) -> str:
    """Privacy-safe display for Indian mobile (10 digits)."""
    digits = "".join(c for c in (phone or "") if c.isdigit())
    if len(digits) == 10:
        return f"+91 {digits[:5]}···{digits[-2:]}"
    return "+91 ········"


def _counseling_request_summary(user, session) -> dict:
    """Latest counseling request for this session (for report UI persistence)."""
    latest = (
        CareerCounselingRequest.objects.filter(user=user, session=session)
        .order_by("-created_at")
        .first()
    )
    if not latest:
        return {"submitted": False}
    return {
        "submitted": True,
        "phone_masked": _mask_in_mobile_display(latest.phone),
    }


def _premium_upgrade_available(user, session) -> bool:
    """Paid ₹49 report only — can pay ₹50 more for the premium bundle add-on."""
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if _user_has_paid_premium_bundle_any(user):
        return False
    po = _paid_order(user, session)
    if po and po.status == "paid" and po.product_type == ReportOrder.ProductType.REPORT:
        return True
    return _user_has_paid_report_order_any(user)


def _sync_session_premium_unlock_from_bundle_order(session: GameSession) -> None:
    """
    If a paid premium-bundle ReportOrder exists for this session, ensure premium_unlocked.
    If the user paid for a bundle on any prior session, unlock premium on new sessions too.
    """
    if session.premium_unlocked or not session.pk:
        return
    if ReportOrder.objects.filter(
        session_id=session.pk,
        status="paid",
        product_type=ReportOrder.ProductType.PREMIUM_BUNDLE,
    ).exists():
        GameSession.objects.filter(pk=session.pk, premium_unlocked=False).update(
            premium_unlocked=True
        )
        session.premium_unlocked = True
        return
    uid = getattr(session, "user_id", None)
    if uid and ReportOrder.objects.filter(
        user_id=uid,
        status="paid",
        product_type=ReportOrder.ProductType.PREMIUM_BUNDLE,
    ).exists():
        GameSession.objects.filter(pk=session.pk, premium_unlocked=False).update(
            premium_unlocked=True
        )
        session.premium_unlocked = True


def _build_teaser(session, report_accessible: bool = False) -> dict:
    """Build a partial report for the marketing teaser JSON.

    When ``report_accessible`` is False (no paid report yet), do not expose #1 career
    names, stream, or score gaps — only ranks and trait icons/labels.
    """
    report = build_report(session)

    if report_accessible:
        top_career = report["hero"]["career_name"]
        top_category = report["hero"].get("career_category", "")
    else:
        top_career = "Unlock to reveal"
        top_category = ""
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
        if report_accessible and i == 0 and careers:
            career_preview.append({
                "rank": 1,
                "career_category": careers[0].get("career_category", ""),
                "career_name": careers[0].get("career_name", ""),
                "stream": careers[0].get("stream", ""),
            })
        else:
            career_preview.append({"rank": i + 1})

    top_two_gap = None
    if report_accessible and len(careers) >= 2:
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
        "stream_recommendation": stream_rec.get("stream", "") if report_accessible else "",
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

        _sync_session_premium_unlock_from_bundle_order(session)

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
            _session_result_json_response(
                session, request.user, trait_list, result["career_matches"]
            )
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
        _sync_session_premium_unlock_from_bundle_order(session)
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
        _sync_session_premium_unlock_from_bundle_order(session)
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
            _session_result_json_response(session, request.user, trait_data, career_data)
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
            _sync_session_premium_unlock_from_bundle_order(s)
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
        if latest_complete:
            _sync_session_premium_unlock_from_bundle_order(latest_complete)

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

        _sync_session_premium_unlock_from_bundle_order(session)

        if not session.is_complete:
            return Response(
                {"detail": "Session not yet completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report_accessible = (
            _has_report_access(session.user, session) if session.user else False
        )
        teaser = _build_teaser(session, report_accessible)
        teaser["report_price_inr"] = settings.REPORT_PRICE_INR
        teaser["premium_bundle_price_inr"] = settings.PREMIUM_BUNDLE_PRICE_INR
        teaser["premium_upgrade_price_inr"] = settings.PREMIUM_UPGRADE_FROM_REPORT_INR
        teaser["premium_upgrade_available"] = (
            _premium_upgrade_available(session.user, session) if session.user else False
        )
        teaser["report_accessible"] = report_accessible
        teaser["premium_unlocked"] = session.premium_unlocked
        teaser["premium_extension_complete"] = session.premium_extension_complete
        teaser["price"] = settings.REPORT_PRICE_INR
        if report_accessible:
            teaser["is_paid"] = True
        else:
            teaser["is_paid"] = False
        return Response(teaser)


class CareerReportPreviewView(GenericAPIView):
    """
    GET — same JSON shape as the paid report for the unpaid teaser page.
    Stream/career sections are blurred on the client until purchase; PDF remains gated.
    """

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

        _sync_session_premium_unlock_from_bundle_order(session)

        report = build_report(session)
        report["preview_mode"] = True
        if not (
            session.user
            and getattr(session.user, "is_authenticated", False)
            and _has_report_access(session.user, session)
        ):
            report = redact_report_for_unpaid_preview(report)
        su = session.user
        report["premium_upgrade"] = {
            "available": _premium_upgrade_available(su, session)
            if su and getattr(su, "is_authenticated", False)
            else False,
            "price_inr": settings.PREMIUM_UPGRADE_FROM_REPORT_INR,
        }
        if su and getattr(su, "is_authenticated", False):
            report["counseling_request"] = _counseling_request_summary(su, session)
        else:
            report["counseling_request"] = {"submitted": False}
        return Response(report)


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

        _sync_session_premium_unlock_from_bundle_order(session)

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
        report["premium_upgrade"] = {
            "available": _premium_upgrade_available(request.user, session),
            "price_inr": settings.PREMIUM_UPGRADE_FROM_REPORT_INR,
        }
        report["counseling_request"] = _counseling_request_summary(request.user, session)
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

        _sync_session_premium_unlock_from_bundle_order(session)

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


class CareerCounselingRequestCreateView(GenericAPIView):
    """POST — student requests a callback (same access gate as full report)."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "career_counseling_request"

    def post(self, request, session_id):
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

        _sync_session_premium_unlock_from_bundle_order(session)

        if not _has_report_access(request.user, session):
            if session.premium_unlocked and not session.premium_extension_complete:
                return Response(
                    {
                        "detail": (
                            "Complete your premium assessment to use this after your "
                            "bundle report is ready."
                        ),
                        "code": "PREMIUM_EXTENSION_REQUIRED",
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )
            return Response(
                {"detail": "Payment required.", "code": "PAYMENT_REQUIRED"},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        ser = CareerCounselingRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        phone = ser.validated_data["phone"]

        CareerCounselingRequest.objects.create(
            user=request.user,
            session=session,
            phone=phone,
        )

        return Response(
            {
                "detail": (
                    "Thanks — someone from our team will connect with you soon "
                    "on the number you shared."
                ),
                "phone": phone,
                "phone_masked": _mask_in_mobile_display(phone),
            },
            status=status.HTTP_201_CREATED,
        )


# ── Payment endpoints ──────────────────────────────────────────────


def _coupon_error_response(exc: DjangoValidationError) -> Response:
    msg = exc.messages[0] if getattr(exc, "messages", None) else str(exc)
    return Response({"detail": msg}, status=status.HTTP_400_BAD_REQUEST)


def _list_price_for_checkout(user, session, product_type: str) -> Tuple[int, str]:
    """
    Return (list_price_inr, checkout_kind) before any coupon.
    checkout_kind is 'upgrade' only for ₹50 delta after report-only purchase.
    """
    existing_paid = _paid_order(user, session)
    if (
        existing_paid
        and existing_paid.status == "paid"
        and existing_paid.product_type == ReportOrder.ProductType.REPORT
        and product_type == ReportOrder.ProductType.PREMIUM_BUNDLE
    ):
        return settings.PREMIUM_UPGRADE_FROM_REPORT_INR, "upgrade"
    if (
        product_type == ReportOrder.ProductType.PREMIUM_BUNDLE
        and not existing_paid
        and _user_has_paid_report_order_any(user)
        and not _user_has_paid_premium_bundle_any(user)
    ):
        # New session after a prior ₹49 purchase — bundle add-on is still the delta price.
        return settings.PREMIUM_UPGRADE_FROM_REPORT_INR, "upgrade"
    if product_type == ReportOrder.ProductType.PREMIUM_BUNDLE:
        return settings.PREMIUM_BUNDLE_PRICE_INR, "initial"
    return settings.REPORT_PRICE_INR, "initial"


class ValidatePaymentCouponView(GenericAPIView):
    """POST — preview coupon: same % applies to report (₹49), bundle (₹99), and upgrade (₹50) when relevant."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "payment_coupon_validate"

    def post(self, request):
        session_id = request.data.get("session_id")
        code = (request.data.get("coupon_code") or "").strip()

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

        _sync_session_premium_unlock_from_bundle_order(session)

        from .services.coupon import price_line_inr, validate_coupon_for_checkout

        def _empty_previews():
            z = 0
            return {
                "valid": True,
                "coupon_applied": False,
                "discount_percent": z,
                "report": price_line_inr(settings.REPORT_PRICE_INR, z),
                "premium_bundle": price_line_inr(settings.PREMIUM_BUNDLE_PRICE_INR, z),
                "upgrade": (
                    price_line_inr(settings.PREMIUM_UPGRADE_FROM_REPORT_INR, z)
                    if _premium_upgrade_available(request.user, session)
                    else None
                ),
            }

        if not code:
            return Response(_empty_previews())

        try:
            coupon, _, _ = validate_coupon_for_checkout(
                code=code,
                user=request.user,
                list_price_inr=settings.REPORT_PRICE_INR,
            )
        except DjangoValidationError as e:
            return _coupon_error_response(e)

        dp = int(coupon.discount_percent)
        body = {
            "valid": True,
            "coupon_applied": True,
            "coupon_code": coupon.code,
            "discount_percent": dp,
            "report": price_line_inr(settings.REPORT_PRICE_INR, dp),
            "premium_bundle": price_line_inr(settings.PREMIUM_BUNDLE_PRICE_INR, dp),
        }
        if _premium_upgrade_available(request.user, session):
            body["upgrade"] = price_line_inr(settings.PREMIUM_UPGRADE_FROM_REPORT_INR, dp)
        else:
            body["upgrade"] = None
        return Response(body)


class CreatePaymentOrderView(GenericAPIView):
    """POST — Razorpay order for report (₹49), bundle (₹99), or upgrade delta; optional coupon_code."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "payment_create"

    def post(self, request):
        session_id = request.data.get("session_id")
        coupon_code = (request.data.get("coupon_code") or "").strip()
        if not session_id:
            return Response(
                {"detail": "session_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        raw_pt = request.data.get("product_type", ReportOrder.ProductType.REPORT)
        if raw_pt == ReportOrder.ProductType.PREMIUM_BUNDLE:
            product_type = ReportOrder.ProductType.PREMIUM_BUNDLE
        else:
            product_type = ReportOrder.ProductType.REPORT

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

        _sync_session_premium_unlock_from_bundle_order(session)

        # Do not charge again for a tier the user already purchased on any session.
        if product_type == ReportOrder.ProductType.REPORT:
            if _user_has_paid_premium_bundle_any(request.user):
                return Response(
                    {"detail": "Already purchased.", "is_paid": True},
                    status=status.HTTP_200_OK,
                )
            if _user_has_paid_report_order_any(request.user):
                return Response(
                    {"detail": "Already purchased.", "is_paid": True},
                    status=status.HTTP_200_OK,
                )
        if product_type == ReportOrder.ProductType.PREMIUM_BUNDLE:
            if _user_has_paid_premium_bundle_any(request.user):
                return Response(
                    {"detail": "Already purchased.", "is_paid": True},
                    status=status.HTTP_200_OK,
                )

        list_price_inr, _checkout_kind = _list_price_for_checkout(
            request.user, session, product_type
        )

        from .services.coupon import (
            attach_pending_coupon_to_order,
            validate_coupon_for_checkout,
        )
        from .services.payment_finalize import (
            finalize_premium_upgrade_payment,
            finalize_report_order_payment,
        )

        existing_paid = _paid_order(request.user, session)
        if (
            existing_paid
            and existing_paid.status == "paid"
            and existing_paid.product_type == ReportOrder.ProductType.REPORT
            and product_type == ReportOrder.ProductType.PREMIUM_BUNDLE
        ):
            order = existing_paid
            try:
                coupon, final_amount, savings = validate_coupon_for_checkout(
                    code=coupon_code,
                    user=request.user,
                    list_price_inr=list_price_inr,
                )
            except DjangoValidationError as e:
                return _coupon_error_response(e)
            dp = int(coupon.discount_percent) if coupon else 0
            attach_pending_coupon_to_order(
                order,
                coupon=coupon,
                checkout_kind="upgrade",
                list_price_inr=list_price_inr,
                final_amount_inr=final_amount,
                discount_percent=dp,
            )
            order.save(
                update_fields=[
                    "pending_coupon",
                    "pending_checkout_kind",
                    "pending_list_price_inr",
                    "pending_final_amount_inr",
                    "pending_discount_percent",
                ]
            )
            amount_inr = final_amount

            if not settings.RAZORPAY_KEY_ID:
                finalize_premium_upgrade_payment(
                    order, "dev_upgrade", "dev:upgrade_finalize"
                )
                session.refresh_from_db()
                return Response(
                    {
                        "is_paid": False,
                        "detail": "Payment gateway not configured — upgrade applied for dev.",
                        "product_type": ReportOrder.ProductType.PREMIUM_BUNDLE,
                        "is_premium_upgrade": True,
                        "list_price_inr": list_price_inr,
                        "final_amount_inr": amount_inr,
                        "savings_inr": list_price_inr - amount_inr,
                        "discount_percent": dp,
                    }
                )

            if amount_inr == 0:
                finalize_premium_upgrade_payment(
                    order, "COUPON_FREE", "coupon:free"
                )
                session.refresh_from_db()
                return Response(
                    {
                        "is_paid": False,
                        "detail": "Coupon applied — premium bundle unlocked.",
                        "product_type": ReportOrder.ProductType.PREMIUM_BUNDLE,
                        "is_premium_upgrade": True,
                        "coupon_applied": True,
                        "list_price_inr": list_price_inr,
                        "final_amount_inr": 0,
                        "savings_inr": list_price_inr,
                        "discount_percent": dp,
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
                    "receipt": f"{order.id}-up"[:40],
                    "notes": {
                        "session_id": razorpay_safe_note_value(str(session.id), max_length=80),
                        "user_email": razorpay_safe_note_value(
                            request.user.email or "", max_length=254
                        ),
                        "product_type": "premium_bundle_upgrade",
                    },
                }
            )

            order.upgrade_razorpay_order_id = rz_order["id"]
            order.save(update_fields=["upgrade_razorpay_order_id"])

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
                    "product_type": ReportOrder.ProductType.PREMIUM_BUNDLE,
                    "is_premium_upgrade": True,
                    "list_price_inr": list_price_inr,
                    "final_amount_inr": amount_inr,
                    "savings_inr": list_price_inr - amount_inr,
                    "discount_percent": dp,
                },
                status=status.HTTP_201_CREATED,
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
                "amount": list_price_inr,
                "product_type": product_type,
            },
        )

        if order.status == "paid":
            return Response({"detail": "Already paid.", "is_paid": True})

        try:
            coupon, final_amount, savings = validate_coupon_for_checkout(
                code=coupon_code,
                user=request.user,
                list_price_inr=list_price_inr,
            )
        except DjangoValidationError as e:
            return _coupon_error_response(e)
        dp = int(coupon.discount_percent) if coupon else 0
        attach_pending_coupon_to_order(
            order,
            coupon=coupon,
            checkout_kind="initial",
            list_price_inr=list_price_inr,
            final_amount_inr=final_amount,
            discount_percent=dp,
        )
        amount_inr = final_amount
        order.product_type = product_type
        order.amount = amount_inr
        order.save(
            update_fields=[
                "product_type",
                "amount",
                "pending_coupon",
                "pending_checkout_kind",
                "pending_list_price_inr",
                "pending_final_amount_inr",
                "pending_discount_percent",
            ]
        )

        extra = {
            "list_price_inr": list_price_inr,
            "final_amount_inr": amount_inr,
            "savings_inr": list_price_inr - amount_inr,
            "discount_percent": dp,
        }

        if not settings.RAZORPAY_KEY_ID:
            finalize_report_order_payment(order, "DEV", "dev:no_gateway")
            session.refresh_from_db()
            return Response(
                {
                    "is_paid": product_type == ReportOrder.ProductType.REPORT
                    or session.premium_extension_complete,
                    "detail": "Payment gateway not configured — unlocked for dev.",
                    "product_type": product_type,
                    **extra,
                }
            )

        if amount_inr == 0:
            finalize_report_order_payment(order, "COUPON_FREE", "coupon:free")
            session.refresh_from_db()
            return Response(
                {
                    "is_paid": product_type == ReportOrder.ProductType.REPORT
                    or session.premium_extension_complete,
                    "detail": "Coupon applied — access unlocked.",
                    "product_type": product_type,
                    "coupon_applied": True,
                    **extra,
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
                **extra,
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

        order = (
            ReportOrder.objects.filter(user=request.user)
            .filter(
                Q(razorpay_order_id=razorpay_order_id)
                | Q(upgrade_razorpay_order_id=razorpay_order_id)
            )
            .first()
        )
        if not order:
            return Response(
                {"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND
            )

        is_upgrade_payment = (
            bool(order.upgrade_razorpay_order_id)
            and order.upgrade_razorpay_order_id == razorpay_order_id
            and order.status == "paid"
            and order.product_type == ReportOrder.ProductType.REPORT
        )

        expected_sig = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(expected_sig, razorpay_signature):
            if not is_upgrade_payment:
                order.status = "failed"
                order.save(update_fields=["status"])
            return Response(
                {"detail": "Payment verification failed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if is_upgrade_payment:
            from .services.payment_finalize import finalize_premium_upgrade_payment

            finalize_premium_upgrade_payment(
                order, razorpay_payment_id, razorpay_signature
            )
            return Response(
                {
                    "verified": True,
                    "session_id": str(order.session_id),
                    "product_type": ReportOrder.ProductType.PREMIUM_BUNDLE,
                    "is_premium_upgrade": True,
                }
            )

        if order.status == "paid":
            return Response({"verified": True, "detail": "Already verified."})

        from .services.payment_finalize import finalize_report_order_payment

        finalize_report_order_payment(order, razorpay_payment_id, razorpay_signature)

        return Response(
            {
                "verified": True,
                "session_id": str(order.session_id),
                "product_type": order.product_type,
            }
        )


class RazorpayWebhookView(APIView):
    """
    Razorpay server webhook: finalize payment if the browser never called /payment/verify/.
    Configure URL in Razorpay Dashboard → Webhooks (e.g. https://api.example.com/api/game/payment/webhook/).
    """

    permission_classes = [AllowAny]
    authentication_classes = ()
    throttle_scope = "payment_webhook"

    def post(self, request):
        from .services.payment_finalize import finalize_report_order_payment
        from .services.razorpay_webhook import (
            extract_failed_order_id,
            extract_payment_from_payload,
            parse_webhook_body,
            verify_webhook_signature,
        )

        secret = getattr(settings, "RAZORPAY_WEBHOOK_SECRET", "") or ""
        if not secret:
            logger.warning("razorpay.webhook missing RAZORPAY_WEBHOOK_SECRET")
            return Response(
                {"detail": "Webhook signing secret not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        sig = (request.META.get("HTTP_X_RAZORPAY_SIGNATURE") or "").strip()
        body = request.body or b""
        if not verify_webhook_signature(body, sig, secret):
            logger.warning("razorpay.webhook invalid_signature")
            return Response(
                {"detail": "Invalid signature."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = parse_webhook_body(body)
        if not data:
            return Response(
                {"detail": "Invalid JSON."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event = str(data.get("event") or "")
        payload = data.get("payload") or {}

        if event == "payment.failed":
            oid = extract_failed_order_id(payload)
            if oid:
                from .services.coupon import clear_pending_coupon

                order = (
                    ReportOrder.objects.filter(
                        Q(razorpay_order_id=oid) | Q(upgrade_razorpay_order_id=oid)
                    )
                    .first()
                )
                if order:
                    clear_pending_coupon(order)
                    if order.status == "pending":
                        ReportOrder.objects.filter(pk=order.pk).update(status="failed")
                    elif order.upgrade_razorpay_order_id == oid:
                        ReportOrder.objects.filter(pk=order.pk).update(
                            upgrade_razorpay_order_id=""
                        )
                    logger.info("razorpay.webhook payment_failed order rz=%s", oid)
            return Response({"ok": True})

        if event != "payment.captured":
            return Response({"ok": True, "ignored": event})

        extracted = extract_payment_from_payload(payload)
        if not extracted:
            return Response({"ok": True, "ignored": "no_payment"})

        rz_order_id, rz_payment_id = extracted
        order = (
            ReportOrder.objects.select_related("session")
            .filter(
                Q(razorpay_order_id=rz_order_id)
                | Q(upgrade_razorpay_order_id=rz_order_id)
            )
            .first()
        )
        if not order:
            logger.warning("razorpay.webhook unknown_rz_order_id=%s", rz_order_id)
            return Response({"ok": True})

        sig_note = f"webhook:{event}"[:200]
        is_upgrade = (
            bool(order.upgrade_razorpay_order_id)
            and order.upgrade_razorpay_order_id == rz_order_id
            and order.status == "paid"
            and order.product_type == ReportOrder.ProductType.REPORT
        )
        if is_upgrade:
            from .services.payment_finalize import finalize_premium_upgrade_payment

            finalize_premium_upgrade_payment(order, rz_payment_id, sig_note)
        else:
            if order.status == "paid":
                return Response({"ok": True, "ignored": "already_paid"})
            finalize_report_order_payment(order, rz_payment_id, sig_note)
        return Response({"ok": True})
