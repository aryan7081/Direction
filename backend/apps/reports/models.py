"""
Report models (if any persisted report metadata needed).
"""
from django.db import models

from apps.assessments.models import AssessmentAttempt
from apps.common.models import TimeStampedModel


class GeneratedReport(TimeStampedModel):
    """Track generated PDF reports."""

    attempt = models.ForeignKey(
        AssessmentAttempt, on_delete=models.CASCADE, related_name="generated_reports"
    )
    file_path = models.CharField(max_length=500, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "generated_reports"
