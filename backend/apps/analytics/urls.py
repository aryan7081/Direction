from django.urls import path

from . import views

urlpatterns = [
    path("analytics/dashboard/", views.AnalyticsDashboardView.as_view(), name="analytics-dashboard"),
    path("analytics/health/", views.AnalyticsHealthView.as_view(), name="analytics-health"),
]
