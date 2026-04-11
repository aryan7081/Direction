"""
Common base models.
"""
from django.conf import settings
from django.db import models


class VisitorLog(models.Model):
    """Records visitor IP addresses when users open the website."""

    ip_address = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=500, blank=True)
    path = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Visitor log"
        verbose_name_plural = "Visitor logs"

    def __str__(self):
        return f"{self.ip_address} - {self.created_at}"


class ApiErrorLog(models.Model):
    """
    Unhandled exceptions from DRF API views (500s).
    Staff can review these in Django admin — use a real error tracker (e.g. Sentry)
    for alerts and richer context at scale.
    """

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="api_error_logs",
    )
    path = models.CharField(max_length=512)
    method = models.CharField(max_length=16)
    exception_class = models.CharField(max_length=255, db_index=True)
    message = models.TextField()
    traceback_text = models.TextField(blank=True)
    client_ip = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "API error log"
        verbose_name_plural = "API error logs"
        indexes = [
            models.Index(fields=["-created_at", "exception_class"]),
        ]

    def __str__(self):
        return f"{self.created_at:%Y-%m-%d %H:%M} {self.exception_class} {self.path}"


class TimeStampedModel(models.Model):
    """Abstract base with created_at and updated_at."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
