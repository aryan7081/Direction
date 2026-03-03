"""
Parses raw GameEventLog entries into structured signals per game.
Each parser returns a dict of signal values consumed by trait_calculator.
"""

from ..content.logic_game import get_logic_answers, get_logic_trait_weights
from ..content.risk_game import get_risk_option_map
from ..content.planner_game import analyze_planner_allocation
from ..content.scenarios import get_scenario_option_weights


def parse_logic_events(events) -> dict:
    """
    Extract per-task accuracy, time, and trait-weighted signals from logic game events.
    Stores (score, importance_weight) tuples so the calculator can do weighted averages
    instead of flattening the signal.
    """
    answers = get_logic_answers()
    trait_weights = get_logic_trait_weights()

    signals = {
        "tasks": [],
        "trait_signals": {},  # trait_name → list of (score, importance_weight)
    }

    for ev in events:
        if ev.event_type != "answer":
            continue
        p = ev.payload
        task_id = p.get("task_id")
        if task_id not in answers:
            continue

        correct = p.get("selected_answer") == answers[task_id]
        time_ms = p.get("time_taken_ms", 30000)
        time_limit_ms = 30000
        time_factor = max(0, 1 - (time_ms / (time_limit_ms * 2)))

        accuracy_score = 1.0 if correct else 0.0
        task_score = accuracy_score * (0.7 + 0.3 * time_factor)

        signals["tasks"].append(
            {
                "task_id": task_id,
                "correct": correct,
                "time_ms": time_ms,
                "score": task_score,
            }
        )

        tw = trait_weights.get(task_id, {})
        for trait, importance in tw.items():
            signals["trait_signals"].setdefault(trait, [])
            signals["trait_signals"][trait].append((task_score, importance))

    return signals


def parse_risk_events(events) -> dict:
    """
    Extract risk appetite and leadership signals from decision events.
    """
    option_map = get_risk_option_map()

    signals = {
        "decisions": [],
        "risk_scores": [],
        "leadership_scores": [],
    }

    for ev in events:
        if ev.event_type != "decision":
            continue
        p = ev.payload
        option_id = p.get("selected_option_id")
        if option_id not in option_map:
            continue

        levels = option_map[option_id]
        time_ms = p.get("time_taken_ms", 10000)
        confidence = max(0, 1 - (time_ms / 30000))

        risk_raw = levels["risk_level"]
        leadership_raw = levels["leadership_level"]
        risk_boosted = risk_raw * (0.8 + 0.2 * confidence)
        leadership_boosted = leadership_raw * (0.8 + 0.2 * confidence)

        signals["decisions"].append(
            {
                "scenario_id": p.get("scenario_id"),
                "option_id": option_id,
                "risk": risk_boosted,
                "leadership": leadership_boosted,
                "time_ms": time_ms,
            }
        )
        signals["risk_scores"].append(risk_boosted)
        signals["leadership_scores"].append(leadership_boosted)

    return signals


def parse_planner_events(events) -> dict:
    """
    Extract structure and social signals from planner game.
    """
    for ev in events:
        if ev.event_type == "schedule_submit":
            schedule = ev.payload.get("schedule", {})
            return analyze_planner_allocation(schedule)

    return {"social_ratio": 0, "structure_score": 0, "balance_score": 0}


def parse_scenario_events(events) -> dict:
    """
    Extract trait signals from scenario answers.
    """
    option_weights = get_scenario_option_weights()

    signals = {"trait_signals": {}}

    for ev in events:
        if ev.event_type != "answer":
            continue
        option_id = ev.payload.get("selected_option_id")
        if option_id not in option_weights:
            continue

        weights = option_weights[option_id]
        for trait, w in weights.items():
            signals["trait_signals"].setdefault(trait, [])
            signals["trait_signals"][trait].append(w)

    return signals
