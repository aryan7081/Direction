"""
User/auth URLs.
"""
from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.CustomTokenObtainPairView.as_view(), name="login"),
    path("google/", views.GoogleAuthView.as_view(), name="google-auth"),
    path("refresh/", views.ThrottledTokenRefreshView.as_view(), name="refresh"),
    path("profile/", views.UserProfileView.as_view(), name="profile"),
]
