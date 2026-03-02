"""
User serializers.
"""
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "username", "password", "first_name", "last_name")

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


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
            "financial_tier",
            "subject_marks",
        )

    def validate_subject_marks(self, value):
        """Ensure subject keys are valid and values are 0-100."""
        valid_subjects = {"math", "science", "english", "social_science"}
        if not isinstance(value, dict):
            raise serializers.ValidationError("Must be an object")
        for k, v in value.items():
            if k not in valid_subjects:
                raise serializers.ValidationError(
                    f"Invalid subject '{k}'. Allowed: {', '.join(sorted(valid_subjects))}"
                )
            if not isinstance(v, (int, float)) or v < 0 or v > 100:
                raise serializers.ValidationError(f"Mark for {k} must be 0–100")
        return value
