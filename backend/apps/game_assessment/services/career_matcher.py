"""
Matches normalized trait scores to careers using cosine similarity.
Cosine similarity measures how well the SHAPE of the user's trait profile
aligns with the career's weight profile — not just raw magnitude.
"""

import math

from ..models import GameCareerTraitWeight, TRAIT_SLUGS
from apps.careers.career_categories import category_label_for_slug
from apps.careers.models import Career


def _cosine_similarity(user_vec: list, career_vec: list) -> float:
    dot = sum(u * c for u, c in zip(user_vec, career_vec))
    mag_u = math.sqrt(sum(u * u for u in user_vec))
    mag_c = math.sqrt(sum(c * c for c in career_vec))
    if mag_u == 0 or mag_c == 0:
        return 0.0
    return dot / (mag_u * mag_c)


def match_careers(
    normalized_scores: dict,
    top_n: int = 3,
) -> list:
    """
    Compute career compatibility via cosine similarity and return top N.
    """
    active_careers = Career.objects.filter(is_active=True)
    career_scores = []

    user_vec = [normalized_scores.get(t, 0) for t in TRAIT_SLUGS]

    for career in active_careers:
        weights = {
            w.trait_name: w.weight
            for w in GameCareerTraitWeight.objects.filter(career=career)
        }
        if not weights:
            continue

        career_vec = [weights.get(t, 0) for t in TRAIT_SLUGS]
        similarity = _cosine_similarity(user_vec, career_vec)
        score_percent = round(similarity * 100, 1)

        _cat = (career.category or "").strip() or category_label_for_slug(career.slug)
        career_scores.append(
            {
                "career_id": career.id,
                "career_name": career.name,
                "career_slug": career.slug,
                "career_category": _cat,
                "stream": career.stream,
                "description": career.description[:200] if career.description else "",
                "score": round(similarity, 4),
                "score_percent": score_percent,
            }
        )

    career_scores.sort(key=lambda c: c["score"], reverse=True)

    for i, cs in enumerate(career_scores[:top_n], 1):
        cs["rank"] = i

    return career_scores[:top_n]
