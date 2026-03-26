"""
Assessment serializers.
"""
from rest_framework import serializers

from apps.assessments.models import (
    AnswerOption,
    AssessmentAttempt,
    Category,
    Question,
    UserResponse,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description")


class AnswerOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerOption
        fields = ("id", "text", "order")


class QuestionSerializer(serializers.ModelSerializer):
    answer_options = AnswerOptionSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Question
        fields = ("id", "text", "category", "order", "answer_options", "metadata")


class UserResponseInputSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    answer_option_id = serializers.IntegerField()


class SubmitAssessmentSerializer(serializers.Serializer):
    responses = UserResponseInputSerializer(many=True)


class AssessmentResultSerializer(serializers.Serializer):
    result_id = serializers.IntegerField()
    category_scores = serializers.JSONField()
    stream_recommendation = serializers.JSONField()
    career_recommendations = serializers.JSONField()
