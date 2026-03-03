from django.urls import path

from . import views

urlpatterns = [
    path("game/content/", views.GameContentView.as_view(), name="game-content"),
    path("game/start/", views.StartSessionView.as_view(), name="game-start"),
    path("game/log-event/", views.LogEventView.as_view(), name="game-log-event"),
    path("game/submit/", views.SubmitSessionView.as_view(), name="game-submit"),
    path(
        "game/results/<uuid:session_id>/",
        views.SessionResultView.as_view(),
        name="game-results",
    ),
    path("game/dashboard/", views.GameDashboardView.as_view(), name="game-dashboard"),
    path("game/resume/", views.ResumeSessionView.as_view(), name="game-resume"),
    path(
        "game/report/<uuid:session_id>/",
        views.CareerReportView.as_view(),
        name="game-report",
    ),
    path(
        "game/report/<uuid:session_id>/pdf/",
        views.CareerReportPDFView.as_view(),
        name="game-report-pdf",
    ),
]
