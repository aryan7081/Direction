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


class TraitScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = TraitScore
        fields = ["trait_name", "raw_score", "normalized_score"]


class CareerMatchSerializer(serializers.Serializer):
    career_id = serializers.IntegerField()
    career_name = serializers.CharField()
    career_slug = serializers.CharField()
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
