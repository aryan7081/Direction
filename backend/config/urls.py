"""
URL configuration for Outcave Platform.
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.common.urls")),
    path("api/auth/", include("apps.users.urls")),
    path("api/", include("apps.assessments.urls")),
    path("api/", include("apps.careers.urls")),
    path("api/", include("apps.recommendations.urls")),
    path("api/", include("apps.reports.urls")),
    path("api/", include("apps.game_assessment.urls")),
]

# OpenAPI / Swagger only in DEBUG — do not expose full schema in production
if settings.DEBUG:
    urlpatterns.append(path("api/docs/", include("config.schema_urls")))
