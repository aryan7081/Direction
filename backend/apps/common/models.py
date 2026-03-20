"""
Common base models.
"""
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


class TimeStampedModel(models.Model):
    """Abstract base model with created_at and updated_at."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
