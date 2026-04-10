"""
Career and stream recommendation models.
"""
from django.db import models

from apps.assessments.models import AssessmentAttempt, Category
from apps.common.models import TimeStampedModel


class Career(TimeStampedModel):
    """Career option with metadata."""

    class EducationCostTier(models.TextChoices):
        LOW = "low", "Low (govt colleges, vocational)"
        MEDIUM = "medium", "Medium (private degree)"
        HIGH = "high", "High (MBBS, IIT, premium courses)"

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    # Broad domain (e.g. "Tech & Engineering") — shown before the specific role in reports.
    category = models.CharField(max_length=120, blank=True)
    description = models.TextField()
    stream = models.CharField(max_length=50)  # Science, Commerce, Arts
    min_education = models.CharField(max_length=100, blank=True)
    salary_range = models.CharField(max_length=100, blank=True)
    growth_outlook = models.CharField(max_length=100, blank=True)
    # Affects whether career is recommended for low financial tier
    education_cost_tier = models.CharField(
        max_length=20,
        choices=EducationCostTier.choices,
        default=EducationCostTier.MEDIUM,
    )
    is_active = models.BooleanField(default=True)
    # If True, seed_data may deactivate this row when its slug is removed from the catalogue.
    # Admin-created careers should keep this False so they are not auto-retired.
    managed_by_seed = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "careers"
        ordering = ["order", "name"]
        indexes = [
            models.Index(fields=["stream"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return self.name


class CareerCategoryWeight(TimeStampedModel):
    """Weight of each category for a career (for recommendation matching)."""

    career = models.ForeignKey(Career, on_delete=models.CASCADE, related_name="category_weights")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="career_weights")
    weight = models.DecimalField(max_digits=4, decimal_places=2)  # 0.00 - 1.00

    class Meta:
        db_table = "career_category_weights"
        unique_together = [["career", "category"]]
        indexes = [
            models.Index(fields=["career"]),
            models.Index(fields=["category"]),
        ]


class CareerSubjectWeight(TimeStampedModel):
    """Importance of each subject for a career (for academic-fit scoring)."""

    career = models.ForeignKey(Career, on_delete=models.CASCADE, related_name="subject_weights")
    subject_slug = models.CharField(max_length=30)  # math, science, english, social_science
    weight = models.DecimalField(max_digits=4, decimal_places=2)  # 0.00 - 1.00

    class Meta:
        db_table = "career_subject_weights"
        unique_together = [["career", "subject_slug"]]
        indexes = [
            models.Index(fields=["career"]),
        ]


class StreamRecommendation(TimeStampedModel):
    """Stream recommendation for a completed assessment."""

    attempt = models.OneToOneField(
        AssessmentAttempt, on_delete=models.CASCADE, related_name="stream_recommendation"
    )
    primary_stream = models.CharField(max_length=50)
    secondary_stream = models.CharField(max_length=50, blank=True)
    tertiary_stream = models.CharField(max_length=50, blank=True)
    scores = models.JSONField()  # {stream: score}

    class Meta:
        db_table = "stream_recommendations"
