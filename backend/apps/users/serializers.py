"""
User serializers.
"""
import re
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


def _make_username_from_email(email: str) -> str:
    """Generate unique username from email."""
    base = re.sub(r"[^a-zA-Z0-9_]", "_", email.split("@")[0])[:25] or "user"
    username = base
    n = 0
    while User.objects.filter(username=username).exists():
        n += 1
        username = f"{base}_{n}"[:30]
    return username


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    username = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("email", "username", "password", "first_name", "last_name")

    def create(self, validated_data):
        if not validated_data.get("username"):
            validated_data["username"] = _make_username_from_email(validated_data["email"])
        validated_data.setdefault("first_name", "")
        validated_data.setdefault("last_name", "")
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "username", "first_name", "last_name", "role")
        read_only_fields = ("id", "role")


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        from apps.users.models import Profile

        model = Profile
        fields = (
            "user",
            "grade",
            "school",
            "date_of_birth",
            "parent_email",
        )
