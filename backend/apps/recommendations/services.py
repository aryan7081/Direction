"""
Recommendation engine — career matching from assessment scores.

Multi-factor:
  65 %  Profile similarity (cosine similarity across 15 dimensions)
  20 %  Academic marks fit
  15 %  Financial tier fit
"""
import math
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from django.db.models import Prefetch

from apps.assessments.models import AssessmentAttempt, AssessmentResult
from apps.careers.models import Career, CareerCategoryWeight, CareerSubjectWeight


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
    Multi-factor compatibility:
      Profile  (65 %) — cosine similarity of the user's 15-dimension score
                        vector against the career's ideal 15-dimension weights
      Academic (20 %) — weighted average of subject marks
      Financial(15 %) — user financial tier vs career education cost tier
    """

    PROFILE_WEIGHT = 0.65
    ACADEMIC_WEIGHT = 0.20
    FINANCIAL_WEIGHT = 0.15

    FINANCIAL_MATRIX = {
        ("low", "low"): 1.0,
        ("low", "medium"): 0.5,
        ("low", "high"): 0.2,
        ("medium", "low"): 1.0,
        ("medium", "medium"): 1.0,
        ("medium", "high"): 0.6,
        ("high", "low"): 1.0,
        ("high", "medium"): 1.0,
        ("high", "high"): 1.0,
    }

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

        profile = getattr(attempt.user, "profile", None)
        subject_marks = (profile.subject_marks or {}) if profile else {}
        financial_tier = (profile.financial_tier or "").lower() if profile else ""
        if financial_tier == "prefer_not":
            financial_tier = ""

        careers = (
            Career.objects.filter(is_active=True)
            .prefetch_related(
                Prefetch(
                    "category_weights",
                    queryset=CareerCategoryWeight.objects.select_related("category"),
                ),
                Prefetch("subject_weights", queryset=CareerSubjectWeight.objects.all()),
            )
            .order_by("order", "name")
        )

        scores = []
        for career in careers:
            profile_sim = self._profile_similarity(
                category_scores, list(career.category_weights.all())
            )
            if profile_sim is None:
                continue

            academic = self._academic_compatibility(
                subject_marks, list(career.subject_weights.all())
            )
            financial = self._financial_compatibility(
                financial_tier, career.education_cost_tier or "medium"
            )

            total = (
                profile_sim * self.PROFILE_WEIGHT
                + academic * self.ACADEMIC_WEIGHT
                + financial * self.FINANCIAL_WEIGHT
            )
            scores.append((career, total))

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

    # ── Profile similarity (cosine) ────────────────────────────────

    @staticmethod
    def _profile_similarity(
        user_scores: Dict[str, float],
        career_weights: List[CareerCategoryWeight],
    ) -> Optional[float]:
        """
        Cosine similarity between the user's 15-dimension score vector
        and the career's ideal weight vector.

        Both vectors are non-negative (0-1) so cosine sits in [0, 1].
        Returns None if the career has no weights (skip it).
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

    # ── Academic compatibility ──────────────────────────────────────

    @staticmethod
    def _academic_compatibility(
        subject_marks: Dict[str, float],
        subject_weights: List[CareerSubjectWeight],
    ) -> float:
        """Weighted average of marks by career's subject importance."""
        if not subject_marks or not subject_weights:
            return 1.0

        weighted_sum = 0.0
        weight_sum = 0.0

        for sw in subject_weights:
            mark = float(subject_marks.get(sw.subject_slug, 50)) / 100.0
            w = float(sw.weight)
            weighted_sum += mark * w
            weight_sum += w

        if weight_sum == 0:
            return 1.0

        return max(0.0, min(1.0, weighted_sum / weight_sum))

    # ── Financial compatibility ─────────────────────────────────────

    def _financial_compatibility(
        self, user_tier: str, career_cost_tier: str
    ) -> float:
        """Returns 0-1.  No user tier / prefer not → assume 1.0."""
        if not user_tier:
            return 1.0
        career_cost_tier = (career_cost_tier or "medium").lower()
        return self.FINANCIAL_MATRIX.get((user_tier, career_cost_tier), 1.0)


def get_recommendation_engine() -> BaseRecommendationEngine:
    """Factory — swap implementation here for an AI engine later."""
    return WeightedSimilarityEngine()
