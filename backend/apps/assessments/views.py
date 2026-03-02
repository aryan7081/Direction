"""
Assessment views - thin layer delegating to services.
"""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.assessments.models import AssessmentAttempt, Question, UserResponse
from apps.assessments.serializers import (
    QuestionSerializer,
    SubmitAssessmentSerializer,
    AssessmentResultSerializer,
)
from apps.assessments.services import complete_assessment_flow


class QuestionListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = QuestionSerializer
    queryset = Question.objects.filter(is_active=True).select_related(
        "category"
    ).prefetch_related("answer_options").order_by("order")


class StartAssessmentView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        from apps.assessments.models import AssessmentAttempt

        attempt = AssessmentAttempt.objects.create(user=request.user)
        return Response(
            {"attempt_id": attempt.id, "message": "Assessment started"},
            status=status.HTTP_201_CREATED,
        )


class SubmitAssessmentView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubmitAssessmentSerializer

    def post(self, request, attempt_id):
        attempt = AssessmentAttempt.objects.filter(
            user=request.user, id=attempt_id, is_complete=False
        ).first()
        if not attempt:
            return Response(
                {"error": "Invalid or completed attempt"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = SubmitAssessmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from django.db import transaction

        with transaction.atomic():
            UserResponse.objects.filter(attempt=attempt).delete()
            for r in serializer.validated_data["responses"]:
                UserResponse.objects.create(
                    attempt=attempt,
                    question_id=r["question_id"],
                    answer_option_id=r["answer_option_id"],
                )

        result_data = complete_assessment_flow(attempt)
        return Response(
            AssessmentResultSerializer(result_data).data,
            status=status.HTTP_200_OK,
        )


class AssessmentResultView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, attempt_id):
        attempt = (
            AssessmentAttempt.objects.filter(
                user=request.user, id=attempt_id, is_complete=True
            )
            .select_related("result")
            .first()
        )
        if not attempt:
            return Response({"error": "Result not found"}, status=status.HTTP_404_NOT_FOUND)

        from apps.recommendations.services import get_recommendation_engine

        engine = get_recommendation_engine()
        recs = engine.get_recommendations(attempt, top_n=5)
        stream_rec = getattr(attempt, "stream_recommendation", None)

        data = {
            "result_id": attempt.result.id,
            "category_scores": attempt.result.category_scores,
            "stream_recommendation": {
                "primary": stream_rec.primary_stream if stream_rec else "",
                "secondary": stream_rec.secondary_stream if stream_rec else "",
                "tertiary": stream_rec.tertiary_stream if stream_rec else "",
                "scores": stream_rec.scores if stream_rec else {},
            },
            "career_recommendations": recs,
        }
        return Response(data)


class DashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        attempts = (
            AssessmentAttempt.objects.filter(user=request.user)
            .order_by("-created_at")[:10]
            .values("id", "is_complete", "completed_at", "created_at")
        )
        latest_complete = (
            AssessmentAttempt.objects.filter(user=request.user, is_complete=True)
            .order_by("-completed_at")
            .first()
        )
        return Response(
            {
                "attempts": list(attempts),
                "latest_result_attempt_id": latest_complete.id if latest_complete else None,
            }
        )
