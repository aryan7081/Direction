"""
Scenario section: same 30 items as quiz (RIASEC + core traits + personality).
Interest weights are mapped to game trait signals for the scoring pipeline.
"""

from __future__ import annotations

from typing import Any, Dict, List

from apps.assessments.content.mcq_items import MCQ_ITEMS

_LETTERS = ("a", "b", "c", "d")


def _interest_weights_to_traits(category_weights: Dict[str, int]) -> Dict[str, float]:
    traits: Dict[str, float] = {}

    def bump(trait: str, cap: float, intensity: float) -> None:
        v = min(1.0, cap * intensity)
        traits[trait] = max(traits.get(trait, 0.0), v)

    if not category_weights:
        return {"analytical_reasoning": 0.5}

    for slug, raw in category_weights.items():
        intensity = float(raw) / 5.0
        if slug == "analytical":
            bump("analytical_reasoning", 0.95, intensity)
        elif slug == "scientific":
            bump("analytical_reasoning", 0.55, intensity)
            bump("quantitative_comfort", 0.8, intensity)
        elif slug == "creative":
            bump("creativity_innovation", 0.95, intensity)
            bump("risk_appetite", 0.45, intensity)
        elif slug == "social":
            bump("social_orientation", 0.95, intensity)
        elif slug == "verbal":
            bump("verbal_communication", 0.95, intensity)
            bump("leadership_drive", 0.5, intensity)
        elif slug == "organizational":
            bump("structure_discipline", 0.92, intensity)
            bump("leadership_drive", 0.55, intensity)
        elif slug == "technical":
            bump("quantitative_comfort", 0.72, intensity)
            bump("analytical_reasoning", 0.48, intensity)

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
