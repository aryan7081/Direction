"""
Anchor model for Django permissions only (no business data stored here).
"""
from django.db import models


class AnalyticsSettings(models.Model):
    """
    Placeholder row for attaching the analytics dashboard permission.
    Staff: assign "Can view analytics dashboard" to users or add them to the
    "Analytics dashboard viewers" group (created by migration).
    """

    class Meta:
        managed = True
        verbose_name = "Analytics access"
        verbose_name_plural = "Analytics access"
        permissions = [
            ("view_analyticsdashboard", "Can view analytics dashboard"),
        ]

    def __str__(self) -> str:
        return "Analytics dashboard access"
