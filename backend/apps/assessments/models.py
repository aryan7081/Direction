"""
Assessment models: Question, AnswerOption, Category, AssessmentAttempt, UserResponse, AssessmentResult.
"""
from django.db import models

from apps.common.models import TimeStampedModel
from apps.users.models import User


class Category(TimeStampedModel):
    """Assessment category (Analytical, Creative, etc.) for scoring."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "categories"
        verbose_name_plural = "Categories"
        indexes = [models.Index(fields=["slug"])]

    def __str__(self):
        return self.name


class Question(TimeStampedModel):
    """Assessment question with category mapping."""

    text = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="questions")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "questions"
        ordering = ["order"]
        indexes = [
            models.Index(fields=["category", "is_active"]),
            models.Index(fields=["order"]),
        ]

    def __str__(self):
        return f"{self.text[:50]}..."


class AnswerOption(TimeStampedModel):
    """Answer option for a question with numeric score."""

    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="answer_options")
    text = models.CharField(max_length=500)
    score = models.PositiveSmallIntegerField()
    order = models.PositiveIntegerField(default=0)
    category_weights = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "answer_options"
        ordering = ["question", "order"]
        indexes = [models.Index(fields=["question"])]

    def __str__(self):
        return f"{self.question_id}: {self.text[:30]}"


class AssessmentAttempt(TimeStampedModel):
    """Single assessment attempt by a user."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="assessment_attempts")
    completed_at = models.DateTimeField(null=True, blank=True)
    is_complete = models.BooleanField(default=False)

    class Meta:
        db_table = "assessment_attempts"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["user", "is_complete"]),
        ]


class UserResponse(TimeStampedModel):
    """User's answer to a single question within an attempt."""

    attempt = models.ForeignKey(AssessmentAttempt, on_delete=models.CASCADE, related_name="responses")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_option = models.ForeignKey(AnswerOption, on_delete=models.CASCADE)

    class Meta:
        db_table = "user_responses"
        unique_together = [["attempt", "question"]]
        indexes = [
            models.Index(fields=["attempt"]),
        ]


class AssessmentResult(TimeStampedModel):
    """Computed result for a completed assessment attempt."""

    attempt = models.OneToOneField(
        AssessmentAttempt, on_delete=models.CASCADE, related_name="result"
    )
    category_scores = models.JSONField()  # {category_id: score}
    raw_scores = models.JSONField()  # {category_id: raw_value}
    total_questions_answered = models.PositiveIntegerField()

    class Meta:
        db_table = "assessment_results"
        indexes = [models.Index(fields=["attempt"])]
