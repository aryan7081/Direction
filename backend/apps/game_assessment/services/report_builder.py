"""
Builds the full career report data structure from a completed GameSession.
Uses stored TraitScore and CareerMatchScore — never modifies scoring.
"""
from __future__ import annotations

from datetime import date

from ..models import (
    GameSession,
    TraitScore,
    CareerMatchScore,
    GameCareerTraitWeight,
    TRAIT_CHOICES,
    TRAIT_SLUGS,
)
from apps.careers.models import Career

# ── Trait metadata ──────────────────────────────────────────────────

TRAIT_META = {
    "analytical_reasoning": {
        "label": "Analytical Reasoning",
        "icon": "brain",
        "description": (
            "This trait measures how naturally you break down complex problems "
            "into smaller parts, spot patterns, and reach logical conclusions. "
            "Students who score high here enjoy puzzles, love asking 'why', and "
            "feel comfortable working through problems step by step. In the real "
            "world, this translates into careers where critical thinking and "
            "data-driven decisions matter — from engineering to law to research."
        ),
    },
    "quantitative_comfort": {
        "label": "Quantitative Comfort",
        "icon": "calculator",
        "description": (
            "This reflects how at ease you feel working with numbers, formulas, "
            "and data. A high score means you tend to trust figures over feelings "
            "and can quickly make sense of graphs, percentages, and calculations. "
            "This is valuable in finance, data science, engineering, and any role "
            "where number-crunching forms the backbone of daily work."
        ),
    },
    "creativity_innovation": {
        "label": "Creativity & Innovation",
        "icon": "lightbulb",
        "description": (
            "Creativity measures your drive to imagine new ideas, think outside "
            "conventional boundaries, and approach problems from unexpected angles. "
            "High scorers often enjoy brainstorming, doodling, writing, or building "
            "things from scratch. Careers in design, marketing, product development, "
            "software engineering, and the arts reward this kind of thinking."
        ),
    },
    "verbal_communication": {
        "label": "Verbal & Communication",
        "icon": "message-circle",
        "description": (
            "This trait captures how effectively you express ideas, whether through "
            "speaking, writing, or storytelling. Students who score high enjoy "
            "debates, essay writing, and explaining concepts to others. Strong "
            "communicators thrive in law, journalism, teaching, management, and "
            "any role that involves persuading, presenting, or negotiating."
        ),
    },
    "social_orientation": {
        "label": "Social Orientation",
        "icon": "users",
        "description": (
            "Social orientation reflects how much you enjoy working with people, "
            "collaborating in teams, and contributing to community well-being. "
            "High scorers are empathetic, enjoy group activities, and feel energised "
            "by helping others. This aligns well with careers in healthcare, education, "
            "psychology, social work, and human resources."
        ),
    },
    "leadership_drive": {
        "label": "Leadership Drive",
        "icon": "trophy",
        "description": (
            "This measures your natural inclination to take charge, make decisions "
            "for a group, and guide others towards a goal. Students with high "
            "leadership drive often volunteer to lead projects, aren't afraid to "
            "voice opinions, and prefer responsibility over following instructions. "
            "Careers in management, entrepreneurship, politics, and consulting "
            "value this trait highly."
        ),
    },
    "risk_appetite": {
        "label": "Risk Appetite",
        "icon": "zap",
        "description": (
            "Risk appetite shows how comfortable you are with uncertainty, bold "
            "decisions, and stepping outside your comfort zone. High scorers "
            "prefer the thrill of new ventures over the safety of routine. This "
            "trait is important for entrepreneurship, startup culture, investing, "
            "creative fields, and any career where innovation outweighs predictability."
        ),
    },
    "structure_discipline": {
        "label": "Structure & Discipline",
        "icon": "calendar",
        "description": (
            "This trait measures how much you value planning, routine, organisation, "
            "and following established processes. High scorers tend to make schedules, "
            "complete tasks on time, and prefer clarity over ambiguity. Careers in "
            "accounting, medicine, civil services, project management, and operations "
            "particularly reward this quality."
        ),
    },
}

# ── Confidence bands ────────────────────────────────────────────────

def _confidence_badge(score_percent: float) -> str:
    if score_percent >= 80:
        return "High"
    if score_percent >= 60:
        return "Moderate"
    return "Exploratory"


# ── Career analysis ─────────────────────────────────────────────────

WORK_STYLE = {
    "software-engineer": "Remote-friendly, project-based, fast-paced tech teams",
    "data-scientist": "Research-oriented, analytical, often hybrid/remote",
    "doctor": "Hospital/clinic-based, structured shifts, patient-facing",
    "chartered-accountant": "Office-based, deadline-driven, audit seasons",
    "graphic-designer": "Studio or freelance, visual projects, flexible hours",
    "writer": "Freelance or publishing house, deadline-based, solitary creative work",
    "marketing-manager": "Office + hybrid, campaign-driven, cross-team collaboration",
    "business-analyst": "Corporate environment, data + meetings, consulting style",
    "mechanical-engineer": "Factory + office, design and manufacturing cycles",
    "accountant": "Office-based, structured hours, financial reporting cycles",
    "teacher": "School/university, academic calendar, community-oriented",
    "psychologist": "Clinic or private practice, patient sessions, research",
    "architect": "Studio, site visits, design + project management",
    "lawyer": "Court + office, case-driven, research-heavy, client meetings",
    "civil-engineer": "Site + office, project lifecycle, team coordination",
}

EDUCATION_PATH = {
    "software-engineer": "PCM in 11-12 → B.Tech (CS/IT) from IIT/NIT/IIIT or equivalent → optional M.Tech or direct placement",
    "data-scientist": "PCM in 11-12 → B.Tech (CS) or B.Sc (Stats/Math) → M.Sc/M.Tech in Data Science or ML",
    "doctor": "PCB in 11-12 → NEET → MBBS (5.5 years) → MD/MS specialisation",
    "chartered-accountant": "Commerce in 11-12 → CA Foundation after 12th → Intermediate → Articleship → CA Final",
    "graphic-designer": "Any stream → BDes/B.Fine Arts from NID/NIFT or equivalent → portfolio-based career",
    "writer": "Any stream (Arts preferred) → BA (English/Journalism) → MA or creative writing programs",
    "marketing-manager": "Any stream → BBA/B.Com/BA → MBA (Marketing) from IIM or top B-school",
    "business-analyst": "Commerce/Science → B.Tech or BBA → MBA or certifications (PMP, Six Sigma)",
    "mechanical-engineer": "PCM in 11-12 → B.Tech (Mechanical) from IIT/NIT → M.Tech or industry placement",
    "accountant": "Commerce in 11-12 → B.Com → M.Com or professional certifications (CMA, ACCA)",
    "teacher": "Relevant subject graduation → B.Ed → NET/SET for college teaching, or direct school placement",
    "psychologist": "Arts/Science → BA/B.Sc (Psychology) → MA (Psychology) → M.Phil (Clinical) for practice license",
    "architect": "PCM in 11-12 → NATA exam → B.Arch (5 years) from IIT/SPA/NIT → Council registration",
    "lawyer": "Any stream → CLAT exam → BA LLB (5 years) from NLU → LLM for specialisation",
    "civil-engineer": "PCM in 11-12 → B.Tech (Civil) from IIT/NIT → M.Tech or GATE for PSU jobs",
}


def _career_why_match(career_slug: str, career_name: str, traits: dict) -> str:
    """Generate a 'why this career matches you' paragraph based on top traits."""
    weights = {
        w.trait_name: w.weight
        for w in GameCareerTraitWeight.objects.filter(career__slug=career_slug)
    }
    if not weights:
        return f"{career_name} aligns with your overall trait profile."

    weighted_traits = []
    for trait in TRAIT_SLUGS:
        w = weights.get(trait, 0)
        s = traits.get(trait, 0)
        weighted_traits.append((trait, w, s))

    weighted_traits.sort(key=lambda x: x[1] * x[2], reverse=True)
    top = weighted_traits[:3]

    parts = []
    for trait, weight, score in top:
        label = TRAIT_META[trait]["label"]
        if score >= 7:
            parts.append(f"your strong {label} ({score:.1f}/10)")
        elif score >= 4:
            parts.append(f"your developing {label} ({score:.1f}/10)")
        else:
            parts.append(f"your {label} foundation ({score:.1f}/10)")

    return (
        f"{career_name} is a strong match because of {', '.join(parts[:2])}"
        f"{(' and ' + parts[2]) if len(parts) > 2 else ''}. "
        f"This career values exactly the combination of abilities your assessment revealed."
    )


# ── Stream recommendation ──────────────────────────────────────────

def _recommend_stream(careers: list) -> dict:
    streams = [c.get("stream", "") for c in careers if c.get("stream")]
    primary = streams[0] if streams else "General"
    reasoning = (
        f"Based on your trait profile, {primary} is the recommended academic stream. "
        f"Your top career matches ({', '.join(c['career_name'] for c in careers[:2])}) "
        f"fall within this stream, suggesting a natural alignment with your abilities."
    )
    return {"stream": primary, "reasoning": reasoning}


# ── Development roadmap ─────────────────────────────────────────────

def _build_roadmap(top_career: dict, traits: dict) -> dict:
    slug = top_career.get("career_slug", "")
    name = top_career.get("career_name", "your target career")

    strong = [t for t in TRAIT_SLUGS if traits.get(t, 0) >= 7]
    developing = [t for t in TRAIT_SLUGS if 4 <= traits.get(t, 0) < 7]

    strong_labels = [TRAIT_META[t]["label"] for t in strong[:3]]
    develop_labels = [TRAIT_META[t]["label"] for t in developing[:2]]

    return {
        "class_10": (
            f"Focus on building a strong academic foundation. "
            f"{'Your strengths in ' + ' and '.join(strong_labels) + ' are already evident — keep nurturing them. ' if strong_labels else ''}"
            f"Explore extracurriculars that test different skills: science fairs, debate clubs, coding workshops, or creative writing."
        ),
        "class_11_12": (
            f"Choose the right stream aligned with {name}. "
            f"{EDUCATION_PATH.get(slug, 'Pick subjects that keep your career options open.')} "
            f"{'Work on strengthening ' + ' and '.join(develop_labels) + ' through practice and projects.' if develop_labels else ''}"
        ),
        "after_12th": (
            f"Pursue entrance exams and degree programmes suited for {name}. "
            f"Build a portfolio of projects, internships, or volunteer work that demonstrates your top traits. "
            f"Connect with professionals in the field through LinkedIn, college alumni, or career workshops."
        ),
    }


# ── Areas to improve ───────────────────────────────────────────────

def _areas_to_improve(traits: dict) -> list:
    sorted_traits = sorted(TRAIT_SLUGS, key=lambda t: traits.get(t, 0))
    areas = []
    for t in sorted_traits[:3]:
        score = traits.get(t, 0)
        if score >= 7:
            break
        meta = TRAIT_META[t]
        if score < 4:
            tip = (
                f"Your {meta['label']} score ({score:.1f}/10) shows room for exciting growth. "
                f"Try activities that gently stretch this area — it doesn't need to become your "
                f"strongest trait, but even small improvements can open new doors."
            )
        else:
            tip = (
                f"Your {meta['label']} score ({score:.1f}/10) is developing well. "
                f"With focused practice, this can become a real asset. "
                f"Look for opportunities that challenge you in this area."
            )
        areas.append({"trait": t, "label": meta["label"], "score": score, "tip": tip})
    return areas


# ── Main builder ────────────────────────────────────────────────────

def build_report(session: GameSession) -> dict:
    """
    Build the complete report payload from a scored session.
    Does NOT modify any scores or rankings.
    """
    trait_qs = TraitScore.objects.filter(session=session)
    match_qs = (
        CareerMatchScore.objects.filter(session=session)
        .select_related("career")
        .order_by("rank")
    )

    traits = {t.trait_name: t.normalized_score for t in trait_qs}
    trait_list = []
    for slug in TRAIT_SLUGS:
        score = traits.get(slug, 0)
        meta = TRAIT_META.get(slug, {})
        trait_list.append({
            "trait": slug,
            "label": meta.get("label", slug),
            "icon": meta.get("icon", ""),
            "score": round(score, 1),
            "max": 10,
            "description": meta.get("description", ""),
        })

    careers = []
    for m in match_qs:
        c = m.career
        slug = c.slug
        careers.append({
            "rank": m.rank,
            "career_id": c.id,
            "career_name": c.name,
            "career_slug": slug,
            "stream": c.stream,
            "description": c.description or "",
            "score_percent": round(m.score * 100, 1) if m.score <= 1 else round(m.score, 1),
            "confidence": _confidence_badge(
                round(m.score * 100, 1) if m.score <= 1 else m.score
            ),
            "why_match": _career_why_match(slug, c.name, traits),
            "work_style": WORK_STYLE.get(slug, "Varies by organisation and role"),
            "education_path": EDUCATION_PATH.get(slug, "Consult a guidance counsellor for personalised advice"),
            "min_education": c.min_education or "",
            "salary_range": c.salary_range or "",
            "growth_outlook": c.growth_outlook or "",
        })

    top = careers[0] if careers else {}

    user = session.user
    profile_data = {}
    if user:
        profile_data["name"] = user.get_full_name() or user.email
        profile_data["email"] = user.email
        try:
            p = user.profile
            profile_data["grade"] = p.grade or ""
            profile_data["school"] = p.school or ""
            if p.date_of_birth:
                today = date.today()
                age = today.year - p.date_of_birth.year - (
                    (today.month, today.day) < (p.date_of_birth.month, p.date_of_birth.day)
                )
                profile_data["age"] = age
                profile_data["date_of_birth"] = p.date_of_birth.isoformat()
        except Exception:
            pass

    stream_rec = _recommend_stream(careers)
    roadmap = _build_roadmap(top, traits) if top else {}
    improvements = _areas_to_improve(traits)

    completed_fmt = None
    if session.completed_at:
        completed_fmt = session.completed_at.strftime("%d %B %Y, %I:%M %p")

    return {
        "session_id": str(session.id),
        "completed_at": completed_fmt,
        "generated_at": date.today().strftime("%d %B %Y"),
        "student": profile_data,
        "hero": {
            "career_name": top.get("career_name", "—"),
            "score_percent": top.get("score_percent", 0),
            "confidence": top.get("confidence", "Exploratory"),
        },
        "traits": trait_list,
        "careers": careers,
        "stream_recommendation": stream_rec,
        "roadmap": roadmap,
        "areas_to_improve": improvements,
        "disclaimer": (
            "This report is generated using behavioral gameplay and trait modeling. "
            "It is intended for educational guidance purposes only."
        ),
    }
