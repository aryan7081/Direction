"""
User auth views.
"""
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import Profile
from apps.users.serializers import UserRegistrationSerializer, UserSerializer, ProfileSerializer


class CustomTokenSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        Profile.objects.get_or_create(user=user)
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "message": "Registration successful",
            },
            status=status.HTTP_201_CREATED,
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile


class GoogleAuthView(APIView):
    """
    POST { credential, session_id? }
    Verify Google ID token, create or get user, optionally link session.
    Returns { user, access, refresh }.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        credential = request.data.get("credential")
        session_id = request.data.get("session_id")

        if not credential:
            return Response(
                {"detail": "credential is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        client_id = settings.GOOGLE_CLIENT_ID
        if not client_id:
            return Response(
                {"detail": "Google sign-in is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests

            idinfo = id_token.verify_oauth2_token(
                credential, google_requests.Request(), client_id
            )
            if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
                raise ValueError("Invalid issuer")
        except (ValueError, Exception) as e:
            return Response(
                {"detail": "Invalid Google credential."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        email = idinfo.get("email")
        if not email:
            return Response(
                {"detail": "Email not provided by Google."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        User = get_user_model()
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")

        try:
            user = User.objects.get(email__iexact=email)
            user.first_name = first_name or user.first_name
            user.last_name = last_name or user.last_name
            user.save(update_fields=["first_name", "last_name"])
        except User.DoesNotExist:
            from apps.users.serializers import _make_username_from_email

            user = User.objects.create_user(
                email=email,
                username=_make_username_from_email(email),
                password=User.objects.make_random_password(length=32),
                first_name=first_name,
                last_name=last_name,
            )
            user.set_unusable_password()
            user.save()

        Profile.objects.get_or_create(user=user)

        if session_id:
            try:
                from apps.game_assessment.models import GameSession

                session = GameSession.objects.get(id=session_id)
                if session.user is None and not session.is_complete:
                    session.user = user
                    session.pending_email = ""
                    session.save(update_fields=["user", "pending_email"])
            except Exception:
                pass

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )
