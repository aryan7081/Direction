"""
Recommendation engine — career matching from assessment scores.

100 % profile similarity (cosine similarity across 15 dimensions).
No subject-marks or financial-tier factors — pure trait-based matching.
"""
import math
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from django.db.models import Prefetch

from apps.assessments.models import AssessmentAttempt, AssessmentResult
from apps.careers.models import Career, CareerCategoryWeight


class BaseRecommendationEngine(ABC):
    """Abstract base for recommendation engines — enables future AI swap."""

    @abstractmethod
    def get_recommendations(
        self,
        attempt: AssessmentAttempt,
        top_n: int = 5,
    ) -> List[Dict[str, Any]]:
        """Return top N career recommendations with compatibility scores."""
        pass


class WeightedSimilarityEngine(BaseRecommendationEngine):
    """
    Pure cosine similarity between the user's 15-dimension score vector
    and each career's ideal 15-dimension weight vector.
    """

    def get_recommendations(
        self,
        attempt: AssessmentAttempt,
        top_n: int = 5,
    ) -> List[Dict[str, Any]]:
        result = AssessmentResult.objects.filter(attempt=attempt).first()
        if not result:
            return []

        category_scores = result.category_scores
        if not category_scores:
            return []

        careers = (
            Career.objects.filter(is_active=True)
            .prefetch_related(
                Prefetch(
                    "category_weights",
                    queryset=CareerCategoryWeight.objects.select_related("category"),
                ),
            )
            .order_by("order", "name")
        )

        scores = []
        for career in careers:
            similarity = self._profile_similarity(
                category_scores, list(career.category_weights.all())
            )
            if similarity is None:
                continue
            scores.append((career, similarity))

        scores.sort(key=lambda x: -x[1])
        top = scores[:top_n]

        return [
            {
                "career_id": c.id,
                "career_name": c.name,
                "career_slug": c.slug,
                "stream": c.stream,
                "compatibility_score": round(float(compat), 2),
                "compatibility_percent": min(100, round(float(compat) * 100, 1)),
            }
            for c, compat in top
        ]

    @staticmethod
    def _profile_similarity(
        user_scores: Dict[str, float],
        career_weights: List[CareerCategoryWeight],
    ) -> Optional[float]:
        """
        Cosine similarity between the user's score vector and the career's
        ideal weight vector.  Both are non-negative so result sits in [0, 1].
        """
        if not career_weights:
            return None

        user_vec: List[float] = []
        career_vec: List[float] = []

        for cw in career_weights:
            cat_key = str(cw.category_id)
            u = float(user_scores.get(cat_key, 0.0))
            c = float(cw.weight)
            user_vec.append(u)
            career_vec.append(c)

        dot = sum(u * c for u, c in zip(user_vec, career_vec))
        norm_u = math.sqrt(sum(u * u for u in user_vec))
        norm_c = math.sqrt(sum(c * c for c in career_vec))

        if norm_u < 1e-9 or norm_c < 1e-9:
            return 0.0

        return dot / (norm_u * norm_c)


def get_recommendation_engine() -> BaseRecommendationEngine:
    """Factory — swap implementation here for an AI engine later."""
    return WeightedSimilarityEngine()
