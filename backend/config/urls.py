"""
URL configuration for Outcave Platform.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.common.urls")),
    path("api/auth/", include("apps.users.urls")),
    path("api/", include("apps.assessments.urls")),
    path("api/", include("apps.careers.urls")),
    path("api/", include("apps.recommendations.urls")),
    path("api/", include("apps.reports.urls")),
    path("api/", include("apps.game_assessment.urls")),
    path("api/docs/", include("config.schema_urls")),
]
