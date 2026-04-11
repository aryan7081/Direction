"""
Recommendation views.
"""
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.assessments.models import AssessmentAttempt
from apps.recommendations.services import get_recommendation_engine


class RecommendationListView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "recommendations_read"

    def get(self, request, attempt_id):
        attempt = AssessmentAttempt.objects.filter(
            user=request.user, id=attempt_id, is_complete=True
        ).first()
        if not attempt:
            return Response(
                {"error": "Completed assessment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        engine = get_recommendation_engine()
        recs = engine.get_recommendations(attempt, top_n=5)
        return Response({"recommendations": recs})
