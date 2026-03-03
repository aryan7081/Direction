import datetime

from django.utils import timezone
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import GameSession, GameEventLog, TraitScore, CareerMatchScore
from .serializers import (
    LogEventSerializer,
    SubmitSessionSerializer,
    SessionResultSerializer,
    TraitScoreSerializer,
    CareerMatchSerializer,
)
from .services import run_scoring_pipeline
from .content.logic_game import get_logic_tasks
from .content.risk_game import get_risk_scenarios
from .content.planner_game import get_planner_config
from .content.scenarios import get_scenario_questions


class GameContentView(GenericAPIView):
    """GET — returns all game content (tasks, scenarios, planner config)."""

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
    """POST — creates a new GameSession."""

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
    """POST — stores a batch of GameEventLog entries."""

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
    """POST — triggers the scoring pipeline for a session."""

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
    """GET — returns trait scores and career matches for a completed session."""

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
