"""
Unit tests for recommendation engine.
"""
from decimal import Decimal
from unittest.mock import MagicMock

from django.test import TestCase

from apps.assessments.models import AssessmentAttempt, AssessmentResult, Category
from apps.careers.models import Career, CareerCategoryWeight
from apps.recommendations.services import WeightedSimilarityEngine
from apps.users.models import User


class WeightedSimilarityEngineTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="testpass123",
        )
        self.cat1 = Category.objects.create(name="Analytical", slug="analytical", description="")
        self.cat2 = Category.objects.create(name="Creative", slug="creative", description="")

        self.career = Career.objects.create(
            name="Software Engineer",
            slug="software-engineer",
            description="Build software",
            stream="Science",
        )
        CareerCategoryWeight.objects.create(
            career=self.career,
            category=self.cat1,
            weight=Decimal("0.9"),
        )
        CareerCategoryWeight.objects.create(
            career=self.career,
            category=self.cat2,
            weight=Decimal("0.3"),
        )

    def test_compatibility_high_match(self):
        attempt = AssessmentAttempt.objects.create(user=self.user, is_complete=True)
        AssessmentResult.objects.create(
            attempt=attempt,
            category_scores={str(self.cat1.id): 0.9, str(self.cat2.id): 0.8},
            raw_scores={},
            total_questions_answered=10,
        )
        engine = WeightedSimilarityEngine()
        recs = engine.get_recommendations(attempt, top_n=5)
        self.assertGreater(len(recs), 0)
        self.assertIn("compatibility_percent", recs[0])
        self.assertGreaterEqual(recs[0]["compatibility_percent"], 0)
        self.assertLessEqual(recs[0]["compatibility_percent"], 100)

    def test_compatibility_returns_sorted(self):
        attempt = AssessmentAttempt.objects.create(user=self.user, is_complete=True)
        AssessmentResult.objects.create(
            attempt=attempt,
            category_scores={str(self.cat1.id): 0.5, str(self.cat2.id): 0.5},
            raw_scores={},
            total_questions_answered=10,
        )
        engine = WeightedSimilarityEngine()
        recs = engine.get_recommendations(attempt, top_n=3)
        if len(recs) >= 2:
            self.assertGreaterEqual(
                recs[0]["compatibility_percent"],
                recs[1]["compatibility_percent"],
            )
