"""
Orchestrates the full scoring pipeline:
  events → parse → calculate traits → normalize → match careers → persist
"""

from django.utils import timezone

from ..models import GameSession, GameEventLog, TraitScore, CareerMatchScore
from .event_parser import (
    parse_logic_events,
    parse_risk_events,
    parse_planner_events,
    parse_scenario_events,
)
from .trait_calculator import calculate_trait_scores
from .normalizer import normalize_scores
from .career_matcher import match_careers


def run_scoring_pipeline(session: GameSession) -> dict:
    """
    Full scoring pipeline for a completed game session.
    Returns {trait_scores: {...}, career_matches: [...]}.
    """
    events = GameEventLog.objects.filter(session=session)

    logic_events = events.filter(game_name="logic")
    risk_events = events.filter(game_name="risk")
    planner_events = events.filter(game_name="planner")
    scenario_events = events.filter(game_name="scenario")

    logic_signals = parse_logic_events(logic_events)
    risk_signals = parse_risk_events(risk_events)
    planner_signals = parse_planner_events(planner_events)
    scenario_signals = parse_scenario_events(scenario_events)

    raw_scores = calculate_trait_scores(
        logic_signals, risk_signals, planner_signals, scenario_signals
    )
    normalized = normalize_scores(raw_scores)

    TraitScore.objects.filter(session=session).delete()
    for trait_name, norm_score in normalized.items():
        TraitScore.objects.create(
            session=session,
            trait_name=trait_name,
            raw_score=raw_scores.get(trait_name, 0),
            normalized_score=norm_score,
        )

    career_results = match_careers(normalized)

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
