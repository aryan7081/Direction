import uuid

from django.conf import settings
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
