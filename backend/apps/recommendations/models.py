"""
Recommendation result storage (optional - can be computed on-the-fly).
"""
from django.db import models

from apps.assessments.models import AssessmentAttempt
from apps.common.models import TimeStampedModel


class CareerRecommendation(TimeStampedModel):
    """Stored career recommendation for an assessment attempt."""

    attempt = models.ForeignKey(
        AssessmentAttempt, on_delete=models.CASCADE, related_name="career_recommendations"
    )
    career_id = models.PositiveIntegerField()  # Denormalized for report generation
    compatibility_score = models.DecimalField(max_digits=5, decimal_places=2)
    rank = models.PositiveIntegerField()

    class Meta:
        db_table = "career_recommendations"
        ordering = ["attempt", "rank"]
        indexes = [models.Index(fields=["attempt"])]
