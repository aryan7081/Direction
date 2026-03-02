"""
Report URLs.
"""
from django.urls import path

from . import views

urlpatterns = [
    path(
        "reports/<int:attempt_id>/pdf/",
        views.GenerateReportView.as_view(),
        name="report-pdf",
    ),
]
