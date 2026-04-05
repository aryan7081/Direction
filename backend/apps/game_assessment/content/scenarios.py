"""
Scenario section: RIASEC + core traits + personality (same items as quiz).

Bridge: 15 quiz dimensions → 8 game traits.

Free tier: core items only. Premium: core + premium_only items.
"""

from __future__ import annotations

from typing import Any, Dict, List

from apps.assessments.content.mcq_items import ALL_MCQ_ITEMS

_LETTERS = ("a", "b", "c", "d")

# ── Mapping table: quiz dimension slug → game trait contributions ──
_DIM_TO_TRAITS: Dict[str, List[tuple]] = {
    "riasec_realistic":       [("quantitative_comfort", 0.70), ("structure_discipline", 0.45)],
    "riasec_investigative":   [("analytical_reasoning", 0.95), ("quantitative_comfort", 0.55)],
    "riasec_artistic":        [("creativity_innovation", 0.95), ("risk_appetite", 0.35)],
    "riasec_social":          [("social_orientation", 0.95), ("verbal_communication", 0.45)],
    "riasec_enterprising":    [("leadership_drive", 0.85), ("verbal_communication", 0.60)],
    "riasec_conventional":    [("structure_discipline", 0.85), ("analytical_reasoning", 0.35)],
    "trait_curiosity":        [("analytical_reasoning", 0.55), ("creativity_innovation", 0.45)],
    "trait_persistence":      [("structure_discipline", 0.60)],
    "trait_initiative":       [("leadership_drive", 0.60), ("risk_appetite", 0.45)],
    "trait_empathy_teamwork": [("social_orientation", 0.70), ("verbal_communication", 0.35)],
    "trait_planning":         [("structure_discipline", 0.70)],
    "personality_extroversion":   [("social_orientation", 0.55), ("verbal_communication", 0.45)],
    "personality_risk_taking":    [("risk_appetite", 0.80)],
    "personality_structure":      [("structure_discipline", 0.60)],
    "personality_self_direction": [("leadership_drive", 0.45), ("analytical_reasoning", 0.30)],
}

_SIGNAL_THRESHOLD = 0.20


def _interest_weights_to_traits(category_weights: Dict[str, int]) -> Dict[str, float]:
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


def _items_for_tier(tier: str) -> List[Dict[str, Any]]:
    t = (tier or "free").lower()
    if t == "premium":
        return list(ALL_MCQ_ITEMS)
    return [it for it in ALL_MCQ_ITEMS if not it.get("premium_only")]


def expected_scenario_question_count(tier: str) -> int:
    return len(_items_for_tier(tier))


def _build_from_items(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for item in items:
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
        out.append(
            {
                "id": qid,
                "prompt": item["text"],
                "options": opts,
                "premium_only": bool(item.get("premium_only")),
            }
        )
    return out


SCENARIO_QUESTIONS_FULL = _build_from_items(ALL_MCQ_ITEMS)


def get_premium_extension_questions() -> List[Dict[str, Any]]:
    """Premium-only items (answered after initial 30Q + ₹99 bundle payment)."""
    ids = {item["code"].lower() for item in ALL_MCQ_ITEMS if item.get("premium_only")}
    safe: List[Dict[str, Any]] = []
    for q in SCENARIO_QUESTIONS_FULL:
        if q["id"] not in ids:
            continue
        safe.append(
            {
                "id": q["id"],
                "prompt": q["prompt"],
                "options": [{"id": o["id"], "text": o["text"]} for o in q["options"]],
            }
        )
    return safe


def get_scenario_questions(tier: str = "free") -> List[Dict[str, Any]]:
    items = _items_for_tier(tier)
    wanted = {item["code"].lower() for item in items}
    safe = []
    for q in SCENARIO_QUESTIONS_FULL:
        if q["id"] not in wanted:
            continue
        safe.append(
            {
                "id": q["id"],
                "prompt": q["prompt"],
                "options": [{"id": o["id"], "text": o["text"]} for o in q["options"]],
            }
        )
    return safe


def get_scenario_option_weights() -> Dict[str, Dict[str, float]]:
    mapping: Dict[str, Dict[str, float]] = {}
    for q in SCENARIO_QUESTIONS_FULL:
        for o in q["options"]:
            mapping[o["id"]] = o["weights"]
    return mapping
