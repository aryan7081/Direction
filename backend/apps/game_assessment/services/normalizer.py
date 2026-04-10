"""
Normalizes raw trait scores to a 0–10 scale that uses the full range
meaningfully, so students see clear differentiation between strong
and developing traits.
"""


def normalize_scores(raw_scores: dict) -> dict:
    """
    Two-stage normalization:

    1. Session-relative: the student's strongest trait maps toward 9–9.5
       and their weakest maps toward 2.5–3, with everything in between
       proportionally spread. This fills the visual range for bars/tiles.

    2. Absolute floor: any trait whose raw score is effectively zero
       (no meaningful signals) stays at 1.0 so the report honestly
       reflects lack of signal.

    Preserves rank ordering and relative gaps.
    """
    if not raw_scores:
        return {}

    values = [v for v in raw_scores.values() if v > 0]
    if not values:
        return {t: 1.0 for t in raw_scores}

    raw_min = min(values)
    raw_max = max(values)
    raw_range = raw_max - raw_min

    OUT_LOW = 3.0
    OUT_HIGH = 9.5

    normalized = {}
    for trait, raw in raw_scores.items():
        if raw <= 0.01:
            normalized[trait] = 1.0
            continue

        if raw_range > 0.01:
            pct = (raw - raw_min) / raw_range
            score = OUT_LOW + pct * (OUT_HIGH - OUT_LOW)
        else:
            score = 6.0

        normalized[trait] = round(max(1.0, min(10.0, score)), 1)

    return normalized
