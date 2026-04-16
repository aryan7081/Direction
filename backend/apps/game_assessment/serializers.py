import re

from rest_framework import serializers

from .models import GameSession, GameEventLog, TraitScore, CareerMatchScore


class StartSessionSerializer(serializers.Serializer):
    """No input needed — session is created for authenticated user."""

    pass


class GameEventSerializer(serializers.Serializer):
    game = serializers.CharField(max_length=30)
    event_type = serializers.CharField(max_length=50)
    payload = serializers.JSONField()
    timestamp = serializers.FloatField(help_text="Unix timestamp in ms from client")


class LogEventSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    events = GameEventSerializer(many=True)


class SubmitSessionSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()


class SaveProgressSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    email = serializers.EmailField()


class CreateAccountFromSessionSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)


class TraitScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = TraitScore
        fields = ["trait_name", "raw_score", "normalized_score"]


class CareerMatchSerializer(serializers.Serializer):
    career_id = serializers.IntegerField()
    career_name = serializers.CharField()
    career_slug = serializers.CharField()
    career_category = serializers.CharField(required=False, allow_blank=True)
    stream = serializers.CharField()
    description = serializers.CharField()
    score = serializers.FloatField()
    score_percent = serializers.FloatField()
    rank = serializers.IntegerField()


class SessionResultSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    completed_at = serializers.DateTimeField()
    trait_scores = TraitScoreSerializer(many=True)
    career_matches = CareerMatchSerializer(many=True)


class GameContentSerializer(serializers.Serializer):
    """Returns all game content needed by the frontend."""

    logic_tasks = serializers.ListField()
    risk_scenarios = serializers.ListField()
    planner_config = serializers.DictField()
    scenario_questions = serializers.ListField()


class CareerCounselingRequestSerializer(serializers.Serializer):
    """10-digit Indian mobile after normalisation."""

    phone = serializers.CharField(max_length=20)

    def validate_phone(self, value: str) -> str:
        s = re.sub(r"[\s\-]", "", (value or "").strip())
        if s.startswith("+91"):
            s = s[3:]
        elif len(s) == 12 and s.startswith("91") and s[2] in "6789":
            s = s[2:]
        if not re.fullmatch(r"[6-9]\d{9}", s):
            raise serializers.ValidationError(
                "Enter a valid 10-digit Indian mobile number."
            )
        return s
