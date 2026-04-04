"""
Career serializers.
"""
from rest_framework import serializers

from apps.careers.models import Career, CareerCategoryWeight


class CareerCategoryWeightSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = CareerCategoryWeight
        fields = ("id", "category", "category_name", "weight")


class CareerListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Career
        fields = ("id", "name", "slug", "category", "stream", "description", "order")


class CareerDetailSerializer(serializers.ModelSerializer):
    category_weights = CareerCategoryWeightSerializer(many=True, read_only=True)

    class Meta:
        model = Career
        fields = (
            "id",
            "name",
            "slug",
            "category",
            "description",
            "stream",
            "min_education",
            "salary_range",
            "growth_outlook",
            "category_weights",
        )
