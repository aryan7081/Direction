"""
Computes raw trait scores from parsed game signals.
Formula: Final Trait Score = (Game Signals × 0.6) + (Scenario Signals × 0.4)
"""

from __future__ import annotations

from ..models import TRAIT_SLUGS


GAME_WEIGHT = 0.6
SCENARIO_WEIGHT = 0.4


def _avg(values: list) -> float:
    return sum(values) / len(values) if values else 0.0


def _weighted_avg(pairs: list) -> float:
    """
    Weighted average from (score, importance) tuples.
    Higher-importance tasks contribute more but don't crush the score.
    """
    if not pairs:
        return 0.0
    total_weight = sum(w for _, w in pairs)
    if total_weight == 0:
        return 0.0
    return sum(score * w for score, w in pairs) / total_weight


def calculate_trait_scores(
    logic_signals: dict,
    risk_signals: dict,
    planner_signals: dict,
    scenario_signals: dict,
) -> dict:
    """
    Merge signals from all four games + scenarios into per-trait raw scores.
    Returns {trait_name: raw_score} where raw_score is 0.0 - 1.0.
    """
    game_scores = _compute_game_scores(logic_signals, risk_signals, planner_signals)
    scenario_scores = _compute_scenario_scores(scenario_signals)

    final = {}
    for trait in TRAIT_SLUGS:
        g = game_scores.get(trait)
        s = scenario_scores.get(trait)

        if g is not None and s is not None:
            final[trait] = g * GAME_WEIGHT + s * SCENARIO_WEIGHT
        elif g is not None:
            final[trait] = g
        elif s is not None:
            final[trait] = s
        else:
            final[trait] = 0.0

    return final


def _compute_game_scores(logic: dict, risk: dict, planner: dict) -> dict:
    """Aggregate game-only signals per trait."""
    scores = {}

    logic_traits = logic.get("trait_signals", {})
    for trait in ("analytical_reasoning", "quantitative_comfort"):
        pairs = logic_traits.get(trait, [])
        if pairs:
            scores[trait] = _weighted_avg(pairs)

    risk_scores = risk.get("risk_scores", [])
    leadership_scores = risk.get("leadership_scores", [])
    if risk_scores:
        scores["risk_appetite"] = _avg(risk_scores)
    if leadership_scores:
        scores["leadership_drive"] = _avg(leadership_scores)

    structure = planner.get("structure_score", 0)
    social_ratio = planner.get("social_ratio", 0)
    if planner.get("total_slots_filled", 0) > 0:
        scores["structure_discipline"] = structure
        scores["social_orientation"] = social_ratio

    return scores


def _compute_scenario_scores(scenario: dict) -> dict:
    """Aggregate scenario signals per trait."""
    scores = {}
    trait_signals = scenario.get("trait_signals", {})
    for trait, vals in trait_signals.items():
        if vals:
            scores[trait] = _avg(vals)
    return scores
