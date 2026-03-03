"""
Normalizes raw trait scores (0.0 - 1.0) to a 0 - 10 scale.
"""


def normalize_scores(raw_scores: dict) -> dict:
    """
    Linear 0-1 → 0-10 mapping. No artificial floor — traits the user
    didn't engage with stay at 0, giving real differentiation between
    career profiles.
    """
    normalized = {}
    for trait, raw in raw_scores.items():
        clamped = max(0.0, min(1.0, raw))
        normalized[trait] = round(clamped * 10.0, 2)
    return normalized
