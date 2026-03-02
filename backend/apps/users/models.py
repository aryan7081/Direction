"""
User and Profile models.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.common.models import TimeStampedModel


class User(AbstractUser):
    """Custom user model with role support."""

    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        ADMIN = "admin", "Admin"
        PARENT = "parent", "Parent"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
        ]


class Profile(TimeStampedModel):
    """Extended user profile for career assessment context."""

    class FinancialTier(models.TextChoices):
        LOW = "low", "Limited (need scholarships/vocational options)"
        MEDIUM = "medium", "Moderate (can afford degree courses)"
        HIGH = "high", "Comfortable (can afford premium education)"
        PREFER_NOT = "prefer_not", "Prefer not to say"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    grade = models.CharField(max_length=10, blank=True)
    school = models.CharField(max_length=255, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    parent_email = models.EmailField(blank=True)
    # Financial context - affects career affordability
    financial_tier = models.CharField(
        max_length=20,
        choices=FinancialTier.choices,
        blank=True,
        default="",
    )
    # Latest subject marks (percentages 0–100). Keys: math, science, english, social_science
    subject_marks = models.JSONField(
        default=dict,
        blank=True,
        help_text="e.g. {'math': 85, 'science': 82, 'english': 78, 'social_science': 75}",
    )

    class Meta:
        db_table = "profiles"
