"""
Assessment business logic - scoring engine.
"""
from decimal import Decimal
from typing import Dict, List

from django.db import transaction
from django.utils import timezone

from apps.assessments.models import (
    AssessmentAttempt,
    AssessmentResult,
    Category,
    UserResponse,
)
from apps.careers.models import StreamRecommendation


class AssessmentScoringService:
    """Service for computing assessment scores from user responses."""

    def __init__(self, attempt: AssessmentAttempt):
        self.attempt = attempt

    def compute_scores(self) -> Dict[int, float]:
        """Compute normalized category scores (0-1) from responses."""
        responses = UserResponse.objects.filter(attempt=self.attempt).select_related(
            "question", "answer_option", "question__category"
        )

        slug_to_id = dict(Category.objects.values_list("slug", "id"))
        totals: Dict[int, float] = {}
        counts: Dict[int, int] = {}

        for r in responses:
            opt = r.answer_option
            weights = opt.category_weights or {}
            if weights:
                for slug, val in weights.items():
                    cid = slug_to_id.get(slug)
                    if cid is None:
                        continue
                    totals[cid] = totals.get(cid, 0.0) + float(val)
                    counts[cid] = counts.get(cid, 0) + 1
                continue
            cid = r.question.category_id
            totals[cid] = totals.get(cid, 0.0) + float(opt.score)
            counts[cid] = counts.get(cid, 0) + 1

        category_scores: Dict[int, float] = {}
        max_possible = 5.0
        for cid, total in totals.items():
            n = counts.get(cid, 1)
            avg = total / n
            normalized = min(1.0, avg / max_possible)
            category_scores[cid] = round(normalized, 4)

        return category_scores

    def get_raw_scores(self) -> Dict[int, Dict]:
        """Get raw score data per category."""
        responses = UserResponse.objects.filter(attempt=self.attempt).select_related(
            "question", "answer_option", "question__category"
        )

        slug_to_id = dict(Category.objects.values_list("slug", "id"))
        category_data: Dict[int, Dict] = {}
        for r in responses:
            opt = r.answer_option
            weights = opt.category_weights or {}
            if weights:
                for slug, val in weights.items():
                    cid = slug_to_id.get(slug)
                    if cid is None:
                        continue
                    if cid not in category_data:
                        category_data[cid] = {"scores": [], "count": 0}
                    category_data[cid]["scores"].append(float(val))
                    category_data[cid]["count"] += 1
                continue
            cid = r.question.category_id
            if cid not in category_data:
                category_data[cid] = {"scores": [], "count": 0}
            category_data[cid]["scores"].append(float(opt.score))
            category_data[cid]["count"] += 1

        result = {}
        for cid, data in category_data.items():
            scores = data["scores"]
            result[cid] = {
                "sum": round(sum(scores), 2),
                "count": len(scores),
                "avg": round(sum(scores) / len(scores), 2) if scores else 0,
            }
        return result

    @transaction.atomic
    def save_result(self) -> AssessmentResult:
        """Compute and persist assessment result."""
        category_scores = self.compute_scores()
        raw_scores = self.get_raw_scores()
        total = UserResponse.objects.filter(attempt=self.attempt).count()

        result, _ = AssessmentResult.objects.update_or_create(
            attempt=self.attempt,
            defaults={
                "category_scores": {str(k): float(v) for k, v in category_scores.items()},
                "raw_scores": {str(k): v for k, v in raw_scores.items()},
                "total_questions_answered": total,
            },
        )
        return result


class StreamRecommendationService:
    """Service for computing stream recommendation from category scores."""

    STREAM_CATEGORY_MAP = {
        "Science": ["analytical", "logical", "mathematical", "scientific"],
        "Commerce": ["organizational", "numerical", "business", "administrative"],
        "Arts": ["creative", "verbal", "artistic", "social"],
    }

    def __init__(self, category_scores: Dict[int, float], category_slugs: Dict[int, str]):
        self.category_scores = category_scores
        self.category_slugs = category_slugs

    def compute_stream_scores(self) -> Dict[str, float]:
        """Map category scores to stream scores using slug matching."""
        stream_scores: Dict[str, float] = {s: 0.0 for s in self.STREAM_CATEGORY_MAP}

        for cat_id, score in self.category_scores.items():
            slug = (self.category_slugs.get(cat_id) or "").lower()
            for stream, keywords in self.STREAM_CATEGORY_MAP.items():
                if any(kw in slug for kw in keywords):
                    stream_scores[stream] += score

        total = sum(stream_scores.values())
        if total > 0:
            for k in stream_scores:
                stream_scores[k] = round(stream_scores[k] / total, 4)

        return stream_scores

    def get_top_streams(self, top_n: int = 3) -> List[tuple]:
        """Return top N streams by score."""
        scores = self.compute_stream_scores()
        sorted_streams = sorted(scores.items(), key=lambda x: -x[1])
        return sorted_streams[:top_n]


def complete_assessment_flow(attempt: AssessmentAttempt) -> dict:
    """
    Orchestrate: score -> save result -> career rec -> stream rec (from careers).
    Stream recommendation is derived from top career matches for consistency.
    """
    from apps.recommendations.services import get_recommendation_engine

    scoring = AssessmentScoringService(attempt)
    result = scoring.save_result()

    # Get career recommendations FIRST
    engine = get_recommendation_engine()
    career_recs = engine.get_recommendations(attempt, top_n=5)

    # Derive stream from top careers (ensures stream matches career requirements)
    streams_seen = []
    for rec in career_recs:
        s = rec.get("stream")
        if s and s not in streams_seen:
            streams_seen.append(s)
    primary = streams_seen[0] if streams_seen else "Science"
    secondary = streams_seen[1] if len(streams_seen) > 1 else ""
    tertiary = streams_seen[2] if len(streams_seen) > 2 else ""

    # Fallback: use category-based stream if no careers matched
    if not career_recs:
        category_scores = {int(k): v for k, v in result.category_scores.items()}
        slugs = dict(Category.objects.filter(id__in=category_scores).values_list("id", "slug"))
        stream_svc = StreamRecommendationService(category_scores, slugs)
        top_streams = stream_svc.get_top_streams(3)
        primary = top_streams[0][0] if top_streams else "Science"
        secondary = top_streams[1][0] if len(top_streams) > 1 else ""
        tertiary = top_streams[2][0] if len(top_streams) > 2 else ""
        stream_scores = stream_svc.compute_stream_scores()
    else:
        stream_scores = {primary: 1.0, secondary: 0.5 if secondary else 0, tertiary: 0.25 if tertiary else 0}
    StreamRecommendation.objects.update_or_create(
        attempt=attempt,
        defaults={
            "primary_stream": primary,
            "secondary_stream": secondary or "",
            "tertiary_stream": tertiary or "",
            "scores": stream_scores,
        },
    )

    attempt.is_complete = True
    attempt.completed_at = timezone.now()
    attempt.save(update_fields=["is_complete", "completed_at"])

    return {
        "result_id": result.id,
        "category_scores": result.category_scores,
        "stream_recommendation": {
            "primary": primary,
            "secondary": secondary,
            "tertiary": tertiary,
            "scores": stream_scores,
        },
        "career_recommendations": career_recs,
    }
