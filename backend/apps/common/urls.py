"""
Common app URLs.
"""
from django.urls import path

from . import views

urlpatterns = [
    path("visitors/track/", views.VisitorTrackView.as_view(), name="visitor-track"),
]
