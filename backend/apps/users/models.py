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
    """Extended user profile (grade, school, DOB) for reports and context."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    grade = models.CharField(max_length=10, blank=True)
    school = models.CharField(max_length=255, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    parent_email = models.EmailField(blank=True)

    class Meta:
        db_table = "profiles"
