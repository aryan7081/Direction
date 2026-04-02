"""
Scenario section: same 30 items as quiz (RIASEC + core traits + personality).
Interest weights are mapped to game trait signals for the scoring pipeline.

Bridge: 15 quiz dimensions → 8 game traits.
"""

from __future__ import annotations

from typing import Any, Dict, List

from apps.assessments.content.mcq_items import MCQ_ITEMS

_LETTERS = ("a", "b", "c", "d")

# ── Mapping table: quiz dimension slug → game trait contributions ──
# Each entry is (game_trait, cap).  Intensity is raw/5.
_DIM_TO_TRAITS: Dict[str, List[tuple]] = {
    # RIASEC
    "riasec_realistic":       [("quantitative_comfort", 0.70), ("structure_discipline", 0.45)],
    "riasec_investigative":   [("analytical_reasoning", 0.95), ("quantitative_comfort", 0.55)],
    "riasec_artistic":        [("creativity_innovation", 0.95), ("risk_appetite", 0.35)],
    "riasec_social":          [("social_orientation", 0.95), ("verbal_communication", 0.45)],
    "riasec_enterprising":    [("leadership_drive", 0.85), ("verbal_communication", 0.60)],
    "riasec_conventional":    [("structure_discipline", 0.85), ("analytical_reasoning", 0.35)],
    # Core traits
    "trait_curiosity":        [("analytical_reasoning", 0.55), ("creativity_innovation", 0.45)],
    "trait_persistence":      [("structure_discipline", 0.60)],
    "trait_initiative":       [("leadership_drive", 0.60), ("risk_appetite", 0.45)],
    "trait_empathy_teamwork": [("social_orientation", 0.70), ("verbal_communication", 0.35)],
    "trait_planning":         [("structure_discipline", 0.70)],
    # Personality
    "personality_extroversion":   [("social_orientation", 0.55), ("verbal_communication", 0.45)],
    "personality_risk_taking":    [("risk_appetite", 0.80)],
    "personality_structure":      [("structure_discipline", 0.60)],
    "personality_self_direction": [("leadership_drive", 0.45), ("analytical_reasoning", 0.30)],
}


_SIGNAL_THRESHOLD = 0.20  # discard noise from non-primary RIASEC base-1 scores


def _interest_weights_to_traits(category_weights: Dict[str, int]) -> Dict[str, float]:
    """Map quiz option category_weights to game trait signals.

    Signals below _SIGNAL_THRESHOLD are discarded — they come from the
    RIASEC base-1 scores given to non-primary types and would otherwise
    drag every trait's average down to 2–4 / 10.
    """
    traits: Dict[str, float] = {}

    def bump(trait: str, cap: float, intensity: float) -> None:
        v = min(1.0, cap * intensity)
        if v < _SIGNAL_THRESHOLD:
            return
        traits[trait] = max(traits.get(trait, 0.0), v)

    if not category_weights:
        return {"analytical_reasoning": 0.5}

    for slug, raw in category_weights.items():
        intensity = float(raw) / 5.0
        mappings = _DIM_TO_TRAITS.get(slug)
        if not mappings:
            continue
        for game_trait, cap in mappings:
            bump(game_trait, cap, intensity)

    return traits


def _build_from_mcq() -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for item in MCQ_ITEMS:
        qid = item["code"].lower()
        opts = []
        for i, (text, cw) in enumerate(item["options"]):
            letter = _LETTERS[i]
            opts.append(
                {
                    "id": f"{qid}_{letter}",
                    "text": text,
                    "weights": _interest_weights_to_traits(cw),
                }
            )
        out.append({"id": qid, "prompt": item["text"], "options": opts})
    return out


SCENARIO_QUESTIONS = _build_from_mcq()


def get_scenario_questions():
    safe = []
    for q in SCENARIO_QUESTIONS:
        safe.append(
            {
                "id": q["id"],
                "prompt": q["prompt"],
                "options": [{"id": o["id"], "text": o["text"]} for o in q["options"]],
            }
        )
    return safe


def get_scenario_option_weights():
    mapping = {}
    for q in SCENARIO_QUESTIONS:
        for o in q["options"]:
            mapping[o["id"]] = o["weights"]
    return mapping
