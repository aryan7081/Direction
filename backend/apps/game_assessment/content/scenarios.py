"""
Scenario section: full psychometric item bank (Phase 1 + Phase 2).

API returns prompts without raw scoring weights; the server rebuilds weights
via psychometric_scoring.build_option_profile_map().
"""

from __future__ import annotations

from typing import Any, Dict, List

from apps.assessments.game_catalog import get_mcq_catalog

_LETTERS = ("a", "b", "c", "d")


def _interest_weights_to_traits(category_weights: Dict[str, int]) -> Dict[str, float]:
    """
    Legacy hook: map arbitrary dimension keys to a single analytical signal so
    old parsers never break. Primary scoring uses psychometric_scoring instead.
    """
    if not category_weights:
        return {"analytical_reasoning": 0.5}
    # Any RIASEC / personality signal bumps analytical slightly (placeholder bridge)
    return {"analytical_reasoning": min(1.0, 0.35 + 0.05 * len(category_weights))}


def _items_for_tier(tier: str) -> List[Dict[str, Any]]:
    t = (tier or "free").lower()
    all_items = get_mcq_catalog()
    if t == "premium":
        return list(all_items)
    return [it for it in all_items if not it.get("premium_only")]


def expected_scenario_question_count(tier: str) -> int:
    return len(_items_for_tier(tier))


def _build_from_items(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for item in items:
        qid = item["code"].lower()
        api_ids = item.get("option_api_ids") or []
        opts = []
        for i, (text, cw) in enumerate(item["options"]):
            if i < len(api_ids):
                opt_id = api_ids[i]
            else:
                opt_id = f"{qid}_{_LETTERS[i]}"
            opts.append(
                {
                    "id": opt_id,
                    "text": text,
                    "weights": _interest_weights_to_traits(cw),
                }
            )
        meta = item.get("metadata") or {}
        row: Dict[str, Any] = {
            "id": qid,
            "prompt": item["text"],
            "options": opts,
            "premium_only": bool(item.get("premium_only")),
            "section_category_slug": item.get("section_category_slug") or "",
        }
        if meta.get("context"):
            row["question_context"] = meta["context"]
        if meta.get("primary_focus"):
            row["primary_focus"] = meta["primary_focus"]
        if meta.get("format"):
            row["question_format"] = meta["format"]
        if meta.get("aptitude_subtest"):
            row["aptitude_subtest"] = meta["aptitude_subtest"]
        if meta.get("show_scenario_intro_before"):
            row["show_scenario_intro_before"] = True
        if meta.get("scenario_behavioral"):
            row["scenario_behavioral"] = True
        out.append(row)
    return out


def _scenario_questions_full() -> List[Dict[str, Any]]:
    return _build_from_items(get_mcq_catalog())


def get_premium_extension_questions() -> List[Dict[str, Any]]:
    """Premium-only items (answered after Phase 1 questionnaire + premium bundle payment)."""
    ids = {item["code"].lower() for item in get_mcq_catalog() if item.get("premium_only")}
    safe: List[Dict[str, Any]] = []
    for q in _scenario_questions_full():
        if q["id"] not in ids:
            continue
        row: Dict[str, Any] = {
            "id": q["id"],
            "prompt": q["prompt"],
            "options": [{"id": o["id"], "text": o["text"]} for o in q["options"]],
        }
        for key in (
            "show_scenario_intro_before",
            "scenario_behavioral",
            "section_category_slug",
            "question_context",
            "primary_focus",
            "question_format",
            "aptitude_subtest",
        ):
            if key in q:
                row[key] = q[key]
        safe.append(row)
    return safe


def get_scenario_questions(tier: str = "free") -> List[Dict[str, Any]]:
    items = _items_for_tier(tier)
    wanted = {item["code"].lower() for item in items}
    safe = []
    for q in _scenario_questions_full():
        if q["id"] not in wanted:
            continue
        row: Dict[str, Any] = {
            "id": q["id"],
            "prompt": q["prompt"],
            "options": [{"id": o["id"], "text": o["text"]} for o in q["options"]],
        }
        for key in (
            "show_scenario_intro_before",
            "scenario_behavioral",
            "section_category_slug",
            "question_context",
            "primary_focus",
            "question_format",
            "aptitude_subtest",
        ):
            if key in q:
                row[key] = q[key]
        safe.append(row)
    return safe


def get_scenario_option_weights() -> Dict[str, Dict[str, float]]:
    from apps.game_assessment.services.psychometric_scoring import (
        get_option_profile_weight_dict,
    )

    return get_option_profile_weight_dict()
