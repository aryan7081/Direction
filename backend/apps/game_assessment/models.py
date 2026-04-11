import math
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.common.models import TimeStampedModel


TRAIT_CHOICES = [
    ("analytical_reasoning", "Analytical Reasoning"),
    ("quantitative_comfort", "Quantitative Comfort"),
    ("creativity_innovation", "Creativity & Innovation"),
    ("verbal_communication", "Verbal & Communication"),
    ("social_orientation", "Social Orientation"),
    ("leadership_drive", "Leadership Drive"),
    ("risk_appetite", "Risk Appetite"),
    ("structure_discipline", "Structure & Discipline"),
]

TRAIT_SLUGS = [t[0] for t in TRAIT_CHOICES]

GAME_CHOICES = [
    ("logic", "Logic & Pattern Challenge"),
    ("risk", "Risk & Leadership Simulator"),
    ("planner", "Planner & Organization Game"),
    ("scenario", "Scenario Section"),
]


class GameSession(TimeStampedModel):
    class AssessmentTier(models.TextChoices):
        FREE = "free", "Free overview"
        PREMIUM = "premium", "Full profile"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="game_sessions",
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_complete = models.BooleanField(default=False)
    pending_email = models.EmailField(blank=True)
    assessment_tier = models.CharField(
        max_length=20,
        choices=AssessmentTier.choices,
        default=AssessmentTier.FREE,
        db_index=True,
    )
    premium_unlocked = models.BooleanField(
        default=False,
        help_text="True after ₹99 premium bundle payment (before extra questions).",
    )
    premium_extension_complete = models.BooleanField(
        default=False,
        help_text="True after user completes premium-only questions and rescoring.",
    )

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        label = self.user.email if self.user else "anonymous"
        return f"GameSession {self.id} ({label})"


class GameEventLog(models.Model):
    session = models.ForeignKey(
        GameSession, on_delete=models.CASCADE, related_name="events"
    )
    game_name = models.CharField(max_length=30, choices=GAME_CHOICES)
    event_type = models.CharField(max_length=50)
    payload = models.JSONField(default=dict)
    timestamp = models.DateTimeField()

    class Meta:
        ordering = ["timestamp"]
        indexes = [
            models.Index(fields=["session", "game_name"]),
        ]

    def __str__(self):
        return f"{self.game_name}:{self.event_type} @ {self.timestamp}"


class TraitScore(models.Model):
    session = models.ForeignKey(
        GameSession, on_delete=models.CASCADE, related_name="trait_scores"
    )
    trait_name = models.CharField(max_length=30, choices=TRAIT_CHOICES)
    raw_score = models.FloatField(default=0)
    normalized_score = models.FloatField(default=0, help_text="0-10 scale")

    class Meta:
        unique_together = ("session", "trait_name")

    def __str__(self):
        return f"{self.trait_name}: {self.normalized_score:.1f}"


class CareerMatchScore(models.Model):
    session = models.ForeignKey(
        GameSession, on_delete=models.CASCADE, related_name="career_matches"
    )
    career = models.ForeignKey(
        "careers.Career", on_delete=models.CASCADE, related_name="game_matches"
    )
    score = models.FloatField(default=0)
    rank = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("session", "career")
        ordering = ["rank"]

    def __str__(self):
        return f"#{self.rank} {self.career.name}: {self.score:.2f}"


class GameCareerTraitWeight(TimeStampedModel):
    """Maps each career to the 8-trait model with weights 0-1."""

    career = models.ForeignKey(
        "careers.Career",
        on_delete=models.CASCADE,
        related_name="game_trait_weights",
    )
    trait_name = models.CharField(max_length=30, choices=TRAIT_CHOICES)
    weight = models.FloatField(
        default=0,
        help_text="0.0 to 1.0 — how important this trait is for the career",
    )

    class Meta:
        unique_together = ("career", "trait_name")

    def __str__(self):
        return f"{self.career.name} / {self.trait_name}: {self.weight}"

    def clean(self):
        w = float(self.weight)
        if math.isnan(w) or math.isinf(w):
            raise ValidationError({"weight": "Weight must be a finite number."})
        if w < 0 or w > 1:
            raise ValidationError({"weight": "Weight must be between 0.0 and 1.0."})


PAYMENT_STATUS_CHOICES = [
    ("pending", "Pending"),
    ("paid", "Paid"),
    ("failed", "Failed"),
]


class ReportOrder(TimeStampedModel):
    """Tracks payment for a career report or premium bundle."""

    class ProductType(models.TextChoices):
        REPORT = "report", "Career report (Phase 1)"
        PREMIUM_BUNDLE = "premium_bundle", "Premium extension + report"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="report_orders",
    )
    session = models.ForeignKey(
        GameSession,
        on_delete=models.CASCADE,
        related_name="report_orders",
    )
    amount = models.PositiveIntegerField(default=49, help_text="Amount in INR")
    product_type = models.CharField(
        max_length=20,
        choices=ProductType.choices,
        default=ProductType.REPORT,
        db_index=True,
    )
    status = models.CharField(
        max_length=10, choices=PAYMENT_STATUS_CHOICES, default="pending"
    )
    razorpay_order_id = models.CharField(max_length=100, blank=True, default="")
    razorpay_payment_id = models.CharField(max_length=100, blank=True, default="")
    razorpay_signature = models.CharField(max_length=200, blank=True, default="")
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("user", "session")

    def __str__(self):
        return f"Order {self.id} ({self.status}) — {self.user.email}"
