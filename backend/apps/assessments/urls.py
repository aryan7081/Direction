"""
Assessment URLs.
"""
from django.urls import path

from . import views

urlpatterns = [
    path("dashboard/", views.DashboardView.as_view(), name="dashboard"),
    path("questions/", views.QuestionListView.as_view(), name="question-list"),
    path("assessment/start/", views.StartAssessmentView.as_view(), name="assessment-start"),
    path(
        "assessment/<int:attempt_id>/submit/",
        views.SubmitAssessmentView.as_view(),
        name="assessment-submit",
    ),
    path(
        "assessment/<int:attempt_id>/result/",
        views.AssessmentResultView.as_view(),
        name="assessment-result",
    ),
]
