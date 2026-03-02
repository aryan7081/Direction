"""
Recommendation engine - career matching from assessment scores.
Multi-factor: interests + academic marks + financial fit.
"""
import math
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

from django.db.models import Prefetch

from apps.assessments.models import AssessmentAttempt, AssessmentResult
from apps.careers.models import Career, CareerCategoryWeight, CareerSubjectWeight


class BaseRecommendationEngine(ABC):
    """Abstract base for recommendation engines - enables future AI swap."""

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
    - Interest (60%): cosine similarity of category scores vs career category weights
    - Academic (25%): subject marks vs career subject weights (0-100 marks normalized)
    - Financial (15%): user financial tier vs career education cost tier
    """

    INTEREST_WEIGHT = 0.60
    ACADEMIC_WEIGHT = 0.25
    FINANCIAL_WEIGHT = 0.15

    # Financial fit: (user_tier, career_cost_tier) -> score 0-1
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
            interest = self._interest_compatibility(
                category_scores, list(career.category_weights.all())
            )
            if interest is None:
                continue

            academic = self._academic_compatibility(
                subject_marks, list(career.subject_weights.all())
            )
            financial = self._financial_compatibility(
                financial_tier, career.education_cost_tier or "medium"
            )

            total = (
                interest * self.INTEREST_WEIGHT
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

    def _interest_compatibility(
        self,
        user_scores: Dict[str, float],
        career_weights: List[CareerCategoryWeight],
    ) -> Optional[float]:
        """
        Score that differentiates low vs high engagement and penalizes mismatch.
        Uses (user_score - 0.5) so: low interest hurts, high interest helps, neutral=0.
        Cosine similarity gave identical rankings for "all disagree" vs "all agree".
        Adds small tie-breaker from dot product so uniform responses still rank.
        """
        if not career_weights:
            return None

        NEUTRAL = 0.5  # 3/5 on Likert scale
        weighted_sum = 0.0
        dot_product = 0.0
        weight_sum = 0.0

        for cw in career_weights:
            cat_key = str(cw.category_id)
            u = float(user_scores.get(cat_key, NEUTRAL))
            w = float(cw.weight)
            weighted_sum += w * (u - NEUTRAL)
            dot_product += u * w
            weight_sum += w

        if weight_sum == 0:
            return None

        raw_min = -0.3 * weight_sum
        raw_max = 0.5 * weight_sum
        span = raw_max - raw_min
        if span <= 0:
            base = 0.5
        else:
            base = max(0.0, min(1.0, (weighted_sum - raw_min) / span))

        # Tie-breaker for uniform responses:
        # "all agree" (base=1): favour careers with higher total weights
        # "all disagree" (base=0): favour careers with lower total weights
        if base < 0.1:
            tie_break = max(0, 1.0 - weight_sum / 4.0)  # lighter careers score higher
        elif base > 0.9:
            tie_break = min(1.0, weight_sum / 4.0)  # heavier careers score higher
        else:
            max_dot = weight_sum
            min_dot = 0.2 * weight_sum
            dot_span = max_dot - min_dot
            tie_break = (dot_product - min_dot) / dot_span if dot_span > 1e-9 else 0.5
        return max(0.0, min(1.0, base * 0.99 + tie_break * 0.01))

    def _academic_compatibility(
        self,
        subject_marks: Dict[str, float],
        subject_weights: List[CareerSubjectWeight],
    ) -> float:
        """
        Weighted average of marks by career's subject importance.
        Full marks in all subjects → 1.0 for every career (student is qualified).
        Cosine similarity previously penalized specialized careers (e.g. Doctor)
        even when the student had 100 in every subject.
        """
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

    def _financial_compatibility(
        self, user_tier: str, career_cost_tier: str
    ) -> float:
        """Returns 0-1. No user tier / prefer not = assume 1.0."""
        if not user_tier:
            return 1.0

        career_cost_tier = (career_cost_tier or "medium").lower()
        key = (user_tier, career_cost_tier)
        return self.FINANCIAL_MATRIX.get(key, 1.0)


def get_recommendation_engine() -> BaseRecommendationEngine:
    """Factory for recommendation engine - swap implementation here for AI."""
    return WeightedSimilarityEngine()
