"""
Orchestrates the full scoring pipeline:
  scenario MCQ events → psychometric profile → legacy trait scores + career fit → persist
"""

from django.db import transaction
from django.utils import timezone

from ..models import GameSession, TraitScore, CareerMatchScore
from .normalizer import normalize_scores
from .psychometric_scoring import (
    build_student_psych_profile,
    match_careers_psychometric,
    profile_to_eight_trait_scores,
)


def run_scoring_pipeline(session: GameSession) -> dict:
    """
    Full scoring pipeline for a completed game session.
    Returns {trait_scores: {...}, career_matches: [...]}.
    """
    profile = build_student_psych_profile(session)
    raw_scores = profile_to_eight_trait_scores(profile)
    normalized = normalize_scores(raw_scores)
    career_results = match_careers_psychometric(profile, top_n=12)

    with transaction.atomic():
        TraitScore.objects.filter(session=session).delete()
        for trait_name, norm_score in normalized.items():
            TraitScore.objects.create(
                session=session,
                trait_name=trait_name,
                raw_score=raw_scores.get(trait_name, 0),
                normalized_score=norm_score,
            )

        CareerMatchScore.objects.filter(session=session).delete()
        from apps.careers.models import Career

        for cr in career_results:
            try:
                career = Career.objects.get(id=cr["career_id"])
                CareerMatchScore.objects.create(
                    session=session,
                    career=career,
                    score=cr["score"],
                    rank=cr["rank"],
                )
            except Career.DoesNotExist:
                pass

        session.is_complete = True
        session.completed_at = timezone.now()
        session.save()

    return {
        "trait_scores": {
            tn: {"raw": raw_scores[tn], "normalized": normalized[tn]}
            for tn in normalized
        },
        "career_matches": career_results,
    }
