"""
Recommendation URLs.
"""
from django.urls import path

from . import views

urlpatterns = [
    path(
        "recommendations/<int:attempt_id>/",
        views.RecommendationListView.as_view(),
        name="recommendation-list",
    ),
]
