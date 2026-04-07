"""
Build normalized 0–1 student psychometric profiles from scenario MCQ events
and compute career fit (interest, aptitude, personality, values).

Readiness is computed but excluded from career_fit_score per product spec.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, List, Tuple

from apps.assessments.game_catalog import get_mcq_catalog
from apps.careers.career_categories import category_label_for_slug
from apps.careers.models import Career

from ..models import GameCareerTraitWeight, GameEventLog, GameSession, TRAIT_SLUGS

MILLI = 1000.0

RIASEC_KEYS = [
    "riasec_realistic",
    "riasec_investigative",
    "riasec_artistic",
    "riasec_social",
    "riasec_enterprising",
    "riasec_conventional",
]
PERSONALITY_KEYS = ["personality_E", "personality_A", "personality_C", "personality_ES", "personality_O"]
VALUES_KEYS = [
    "values_money",
    "values_impact",
    "values_security",
    "values_creativity",
    "values_growth",
    "values_balance",
]
APTITUDE_KEYS = ["aptitude_verbal", "aptitude_numerical", "aptitude_abstract", "aptitude_spatial"]

def _item_by_code() -> Dict[str, Dict[str, Any]]:
    return {it["code"].upper(): it for it in get_mcq_catalog()}


def _decode_option_weights(raw: Dict[str, int]) -> Dict[str, float]:
    out: Dict[str, float] = {}
    for k, v in raw.items():
        if not isinstance(v, (int, float)):
            continue
        iv = int(v)
        if k.startswith("aptitude_"):
            out[k] = 1.0 if iv >= 1 else 0.0
        elif iv > 10:
            out[k] = iv / MILLI
        else:
            out[k] = float(iv)
    return out


def build_option_profile_map() -> Tuple[Dict[str, Dict[str, float]], Dict[str, bool]]:
    """option_id -> decoded weights; option_id -> is_scenario (behavioral)."""
    letters = ("a", "b", "c", "d")
    weights: Dict[str, Dict[str, float]] = {}
    is_scenario: Dict[str, bool] = {}
    for item in get_mcq_catalog():
        qid = item["code"].lower()
        meta = item.get("metadata") or {}
        scen = bool(meta.get("scenario_behavioral"))
        api_ids = item.get("option_api_ids") or []
        for i, (_, rw) in enumerate(item["options"]):
            if i < len(api_ids):
                oid = api_ids[i]
            else:
                oid = f"{qid}_{letters[i]}"
            weights[oid] = _decode_option_weights(dict(rw))
            is_scenario[oid] = scen
    return weights, is_scenario


_option_profile_cache: Tuple[Dict[str, Dict[str, float]], Dict[str, bool]] | None = None


def invalidate_option_profile_cache() -> None:
    global _option_profile_cache
    _option_profile_cache = None


def get_option_profile_maps() -> Tuple[Dict[str, Dict[str, float]], Dict[str, bool]]:
    global _option_profile_cache
    if _option_profile_cache is None:
        _option_profile_cache = build_option_profile_map()
    return _option_profile_cache


def get_option_profile_weight_dict() -> Dict[str, Dict[str, float]]:
    w, _ = get_option_profile_maps()
    return w


def _option_code_from_id(option_id: str) -> str:
    if "_" not in option_id:
        return ""
    qid, _ = option_id.rsplit("_", 1)
    return qid.upper()


def build_student_psych_profile(session: GameSession) -> Dict[str, Any]:
    """
    Aggregate all scenario answers into normalized sub-profiles (0–1).
    """
    sums = defaultdict(float)
    counts = defaultdict(int)
    apt_hits = defaultdict(int)
    apt_correct = defaultdict(int)

    events = GameEventLog.objects.filter(
        session=session, game_name="scenario", event_type="answer"
    ).order_by("timestamp")

    option_weights, option_is_scenario = get_option_profile_maps()
    items_by_code = _item_by_code()
    for ev in events:
        oid = (ev.payload or {}).get("selected_option_id") or ""
        if not oid or oid not in option_weights:
            continue
        w = option_weights[oid]
        is_scen = option_is_scenario.get(oid, False)
        code = _option_code_from_id(oid)
        item = items_by_code.get(code)
        meta = (item or {}).get("metadata") or {}
        apt_sub = meta.get("aptitude_subtest")

        for dim, val in w.items():
            if dim.startswith("aptitude_"):
                continue
            if is_scen:
                sums[dim] += val
            else:
                sums[dim] += val / 4.0
            counts[dim] += 1

        if apt_sub and apt_sub in ("verbal", "numerical", "abstract", "spatial"):
            key = f"aptitude_{apt_sub}"
            apt_hits[key] += 1
            if w.get(key, 0) >= 1:
                apt_correct[key] += 1

    def norm_dim(keys: List[str]) -> Dict[str, float]:
        out = {}
        for k in keys:
            if counts[k] > 0:
                out[k] = max(0.0, min(1.0, sums[k] / counts[k]))
            else:
                out[k] = 0.5
        return out

    riasec = norm_dim(RIASEC_KEYS)
    personality = norm_dim(PERSONALITY_KEYS)
    values = norm_dim(VALUES_KEYS)
    readiness_val = norm_dim(["readiness"]).get("readiness", 0.5)

    aptitude: Dict[str, float] = {}
    for k in APTITUDE_KEYS:
        if apt_hits[k] > 0:
            aptitude[k.replace("aptitude_", "")] = apt_correct[k] / apt_hits[k]
        else:
            aptitude[k.replace("aptitude_", "")] = 0.5

    return {
        "riasec": riasec,
        "personality": personality,
        "values": values,
        "readiness": readiness_val,
        "aptitude": aptitude,
    }


def profile_to_eight_trait_scores(profile: Dict[str, Any]) -> Dict[str, float]:
    """Map psychometric profile to legacy 8-trait raw 0–1 (for TraitScore + reports)."""
    r = profile["riasec"]
    p = profile["personality"]
    v = profile["values"]
    a = profile["aptitude"]

    return {
        "analytical_reasoning": 0.55 * r["riasec_investigative"] + 0.25 * a.get("abstract", 0.5) + 0.2 * a.get("verbal", 0.5),
        "quantitative_comfort": 0.5 * r["riasec_conventional"] + 0.35 * a.get("numerical", 0.5) + 0.15 * r["riasec_realistic"],
        "creativity_innovation": 0.5 * r["riasec_artistic"] + 0.35 * p["personality_O"] + 0.15 * v.get("values_creativity", 0.5),
        "verbal_communication": 0.4 * p["personality_E"] + 0.35 * a.get("verbal", 0.5) + 0.25 * r["riasec_social"],
        "social_orientation": 0.65 * r["riasec_social"] + 0.35 * p["personality_A"],
        "leadership_drive": 0.7 * r["riasec_enterprising"] + 0.3 * p["personality_E"],
        "risk_appetite": 0.45 * p["personality_O"] + 0.35 * r["riasec_enterprising"] + 0.2 * (1.0 - v.get("values_security", 0.5)),
        "structure_discipline": 0.55 * r["riasec_conventional"] + 0.45 * p["personality_C"],
    }


def _legacy_weights_for_career(career: Career) -> Dict[str, float]:
    w = {
        wt.trait_name: float(wt.weight)
        for wt in GameCareerTraitWeight.objects.filter(career=career)
    }
    for t in TRAIT_SLUGS:
        w.setdefault(t, 0.0)
    return w


def _interest_target_from_legacy(w: Dict[str, float]) -> Dict[str, float]:
    """Target RIASEC preference on 1–5 scale from legacy 8-trait weights."""
    return {
        "riasec_realistic": 1.0 + 4.0 * (0.5 * w["quantitative_comfort"] + 0.5 * w["structure_discipline"]) * (1.0 - 0.35 * w["creativity_innovation"]),
        "riasec_investigative": 1.0 + 4.0 * w["analytical_reasoning"],
        "riasec_artistic": 1.0 + 4.0 * w["creativity_innovation"],
        "riasec_social": 1.0 + 4.0 * w["social_orientation"],
        "riasec_enterprising": 1.0 + 4.0 * (0.6 * w["leadership_drive"] + 0.4 * w["verbal_communication"]),
        "riasec_conventional": 1.0 + 4.0 * (0.55 * w["structure_discipline"] + 0.45 * w["quantitative_comfort"]),
    }


def _personality_target_from_legacy(w: Dict[str, float]) -> Dict[str, float]:
    return {
        "personality_E": 1.0 + 4.0 * (0.55 * w["verbal_communication"] + 0.45 * w["leadership_drive"]),
        "personality_A": 1.0 + 4.0 * w["social_orientation"],
        "personality_C": 1.0 + 4.0 * w["structure_discipline"],
        "personality_ES": 1.0 + 4.0 * (1.0 - w["risk_appetite"] * 0.35 - (1.0 - w["structure_discipline"]) * 0.2),
        "personality_O": 1.0 + 4.0 * (0.6 * w["creativity_innovation"] + 0.4 * w["risk_appetite"]),
    }


def _values_target_from_legacy(w: Dict[str, float]) -> Dict[str, float]:
    return {
        "values_money": 1.0 + 4.0 * (0.45 * w["quantitative_comfort"] + 0.55 * w["leadership_drive"]),
        "values_impact": 1.0 + 4.0 * w["social_orientation"],
        "values_security": 1.0 + 4.0 * (0.7 * w["structure_discipline"] + 0.3 * (1.0 - w["risk_appetite"])),
        "values_creativity": 1.0 + 4.0 * w["creativity_innovation"],
        "values_growth": 1.0 + 4.0 * (0.5 * w["analytical_reasoning"] + 0.5 * w["creativity_innovation"]),
        "values_balance": 3.0,
    }


def _aptitude_targets_from_legacy(w: Dict[str, float]) -> Tuple[Dict[str, float], Dict[str, float], Dict[str, float]]:
    """min, ideal, importance for verbal, numerical, abstract, spatial."""
    numerical = 0.25 + 0.65 * w["quantitative_comfort"] + 0.1 * w["analytical_reasoning"]
    abstract = 0.2 + 0.75 * w["analytical_reasoning"] + 0.05 * w["creativity_innovation"]
    verbal = 0.25 + 0.55 * w["verbal_communication"] + 0.2 * w["social_orientation"]
    spatial = 0.25 + 0.45 * w["analytical_reasoning"] + 0.35 * w["creativity_innovation"]
    mins = {
        "verbal": max(0.15, verbal * 0.35),
        "numerical": max(0.15, numerical * 0.35),
        "abstract": max(0.15, abstract * 0.35),
        "spatial": max(0.15, spatial * 0.35),
    }
    ideals = {
        "verbal": min(0.95, 0.45 + 0.5 * verbal),
        "numerical": min(0.95, 0.45 + 0.5 * numerical),
        "abstract": min(0.95, 0.45 + 0.5 * abstract),
        "spatial": min(0.95, 0.45 + 0.5 * spatial),
    }
    imp = {"verbal": 0.25, "numerical": 0.25, "abstract": 0.25, "spatial": 0.25}
    if numerical > max(verbal, abstract, spatial):
        imp["numerical"] = 0.4
        for k in imp:
            if k != "numerical":
                imp[k] = 0.2
    return mins, ideals, imp


def _personality_weights_default() -> Dict[str, float]:
    return {k: 0.2 for k in PERSONALITY_KEYS}


def _values_weights_default() -> Dict[str, float]:
    return {k: 1.0 / 6 for k in VALUES_KEYS}


def interest_fit(student: Dict[str, float], target_15: Dict[str, float]) -> float:
    s = [student[k] for k in RIASEC_KEYS]
    t = [(target_15[k] - 1.0) / 4.0 for k in RIASEC_KEYS]
    return max(0.0, 1.0 - sum(abs(s[i] - t[i]) for i in range(6)) / 6.0)


def aptitude_fit(student_apt: Dict[str, float], mins: Dict[str, float], ideals: Dict[str, float], imp: Dict[str, float]) -> float:
    total_w = sum(imp.values()) or 1.0
    acc = 0.0
    for d in ("verbal", "numerical", "abstract", "spatial"):
        s = student_apt.get(d, 0.5)
        lo = mins.get(d, 0.2)
        hi = ideals.get(d, 0.85)
        w = imp.get(d, 0.25)
        if s < lo:
            part = 0.0
        elif s >= hi:
            part = 1.0
        else:
            part = (s - lo) / (hi - lo) if hi > lo else 1.0
        acc += w * part
    return max(0.0, min(1.0, acc / total_w))


def weighted_abs_fit(student: Dict[str, float], target: Dict[str, float], weights: Dict[str, float]) -> float:
    num = 0.0
    den = 0.0
    for k in student:
        tw = weights.get(k, 0.2)
        sv = student[k]
        tv = (target[k] - 1.0) / 4.0
        num += tw * abs(sv - tv)
        den += tw
    if den <= 0:
        return 0.5
    return max(0.0, 1.0 - num / den)


def career_fit_score(components: Dict[str, float]) -> float:
    return (
        0.40 * components["interest"]
        + 0.20 * components["aptitude"]
        + 0.15 * components["personality"]
        + 0.15 * components["values"]
    )


def fit_label(score: float) -> str:
    if score > 0.75:
        return "High"
    if score >= 0.50:
        return "Medium"
    return "Explore"


def _brief_explanation(top: List[Tuple[str, float]], profile: Dict[str, Any], components: Dict[str, float]) -> str:
    r = profile["riasec"]
    top_letters = sorted(r.items(), key=lambda x: -x[1])[:2]
    parts = [
        f"{fit_label(career_fit_score(components))} fit based on your profile.",
        f"Strongest interest signals: {top_letters[0][0].replace('riasec_', '').title()} and {top_letters[1][0].replace('riasec_', '').title()}.",
        f"Aptitude match {int(components['aptitude'] * 100)}%, personality alignment {int(components['personality'] * 100)}%, values alignment {int(components['values'] * 100)}%.",
    ]
    return " ".join(parts)


def match_careers_psychometric(profile: Dict[str, Any], top_n: int = 12) -> List[dict]:
    student_r = profile["riasec"]
    student_p = profile["personality"]
    student_v = profile["values"]
    student_a = profile["aptitude"]
    pw = _personality_weights_default()
    vw = _values_weights_default()

    career_scores: List[dict] = []
    for career in Career.objects.filter(is_active=True):
        lw = _legacy_weights_for_career(career)
        if not lw or all(v == 0 for v in lw.values()):
            continue
        it = _interest_target_from_legacy(lw)
        pt = _personality_target_from_legacy(lw)
        vt = _values_target_from_legacy(lw)
        mins, ideals, imp = _aptitude_targets_from_legacy(lw)

        ifit = interest_fit(student_r, it)
        afit = aptitude_fit(student_a, mins, ideals, imp)
        pfit = weighted_abs_fit(student_p, pt, pw)
        vfit = weighted_abs_fit(student_v, vt, vw)
        comp = {"interest": ifit, "aptitude": afit, "personality": pfit, "values": vfit}
        cfs = career_fit_score(comp)
        career_scores.append(
            {
                "career_id": career.id,
                "career_name": career.name,
                "career_slug": career.slug,
                "career_category": (career.category or "").strip() or category_label_for_slug(career.slug),
                "stream": career.stream,
                "description": (career.description[:200] if career.description else ""),
                "score": round(cfs, 4),
                "score_percent": round(cfs * 100, 1),
                "fit_label": fit_label(cfs),
                "components": comp,
                "explanation": _brief_explanation([], profile, comp),
            }
        )

    career_scores.sort(key=lambda c: c["score"], reverse=True)
    for i, row in enumerate(career_scores[:top_n], 1):
        row["rank"] = i
    return career_scores[:top_n]
