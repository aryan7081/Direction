"""
Career URLs.
"""
from django.urls import path

from . import views

urlpatterns = [
    path("careers/", views.CareerListView.as_view(), name="career-list"),
    path("careers/<slug:slug>/", views.CareerDetailView.as_view(), name="career-detail"),
]
