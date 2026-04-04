"""
Builds the full career report data structure from a completed GameSession.
Uses stored TraitScore and CareerMatchScore — never modifies scoring.

Report payload now includes the student-facing 15-dimension profile
(RIASEC 6 + Core Traits 5 + Personality 4) alongside the internal
8-trait system used for career matching.
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
from apps.careers.career_categories import category_label_for_slug
from apps.careers.models import Career

from .dimension_meta import (
    calculate_15d_scores,
    build_interest_profile,
    build_core_traits,
    build_personality_style,
    detect_dominant_pattern,
    recommend_subjects,
    derive_working_style,
)

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

CONFIDENCE_THRESHOLDS = {
    "High": {
        "min": 80,
        "explanation": (
            "Your top match is significantly aligned with your behavioural "
            "pattern, indicating a stable preference direction. This level of "
            "alignment suggests a natural fit that is likely to feel rewarding "
            "and sustainable over time."
        ),
    },
    "Moderate": {
        "min": 60,
        "explanation": (
            "Your match shows solid alignment with several key traits. With "
            "targeted development in a few areas, this career path can become "
            "a strong and fulfilling choice."
        ),
    },
    "Exploratory": {
        "min": 0,
        "explanation": (
            "This match indicates emerging alignment. It is worth exploring "
            "through internships, projects, or conversations with professionals "
            "before committing to this direction."
        ),
    },
}


def _confidence_badge(score_percent: float) -> str:
    if score_percent >= 80:
        return "High"
    if score_percent >= 60:
        return "Moderate"
    return "Exploratory"


def _confidence_explanation(badge: str) -> str:
    return CONFIDENCE_THRESHOLDS.get(badge, CONFIDENCE_THRESHOLDS["Exploratory"])["explanation"]


# ── Career-specific closing insights ────────────────────────────────

CAREER_CLOSING_INSIGHTS = {
    "software-engineer": (
        "Your {structure} suggests you can handle debugging cycles and long "
        "development sprints — something essential in engineering roles. Combined "
        "with your {creativity}, you are well-suited for building innovative "
        "software products from the ground up."
    ),
    "data-scientist": (
        "Your {quantitative} gives you an edge in statistical modelling and data "
        "manipulation, while your {analytical} helps you extract meaningful insights "
        "from complex datasets — the core of data science."
    ),
    "doctor": (
        "Your {structure} is crucial for the rigorous study and long training path "
        "medicine demands. Your {social} indicates the empathy needed for patient "
        "care — an often-overlooked but essential quality in healthcare."
    ),
    "chartered-accountant": (
        "Your {quantitative} and {structure} are a natural fit for the precision "
        "and regulatory compliance that chartered accountancy demands. Audit "
        "seasons reward exactly this kind of disciplined, number-focused thinking."
    ),
    "graphic-designer": (
        "Your {creativity} is the engine of visual design, while your "
        "{verbal} helps you articulate design intent to clients and teams — a "
        "skill that separates good designers from great ones."
    ),
    "writer": (
        "Your {verbal} forms the backbone of compelling writing. Paired with "
        "your {creativity}, you have the ability to craft narratives that resonate "
        "and persuade — whether in journalism, fiction, or content strategy."
    ),
    "marketing-manager": (
        "Your {creativity} helps you craft compelling campaigns, while "
        "your {leadership} ensures you can rally cross-functional teams to "
        "execute them. Marketing leadership needs exactly this combination."
    ),
    "business-analyst": (
        "Your {analytical} and {quantitative} allow you to translate raw data "
        "into business strategy. Combined with {verbal}, you can present findings "
        "persuasively to stakeholders — a key differentiator in consulting."
    ),
    "mechanical-engineer": (
        "Your {analytical} drives the problem-solving that mechanical design "
        "demands, while your {structure} ensures you can manage long design-to-"
        "manufacturing cycles without losing precision."
    ),
    "accountant": (
        "Your {quantitative} and {structure} are the foundation of accurate "
        "financial reporting. The attention to detail these traits represent is "
        "exactly what audit firms and finance departments value."
    ),
    "teacher": (
        "Your {verbal} makes you effective at explaining complex ideas simply, "
        "and your {social} means you genuinely enjoy connecting with and "
        "mentoring students — the heart of great teaching."
    ),
    "psychologist": (
        "Your {social} and {analytical} combine uniquely — the empathy to "
        "connect with patients and the reasoning to identify behavioural patterns. "
        "This blend is rare and highly valued in clinical practice."
    ),
    "architect": (
        "Your {creativity} fuels the design vision, while your {structure} "
        "ensures technical drawings, building codes, and project timelines stay "
        "on track — the dual demand of architecture."
    ),
    "lawyer": (
        "Your {analytical} powers legal reasoning and case analysis, while "
        "your {verbal} ensures you can argue persuasively in court or "
        "negotiate effectively in boardrooms."
    ),
    "civil-engineer": (
        "Your {quantitative} supports the structural calculations this role "
        "demands, and your {structure} ensures you can manage large-scale "
        "projects from blueprint to completion."
    ),
}

TRAIT_SHORT = {
    "analytical_reasoning": "Analytical Reasoning",
    "quantitative_comfort": "Quantitative Comfort",
    "creativity_innovation": "Creativity & Innovation",
    "verbal_communication": "Verbal & Communication",
    "social_orientation": "Social Orientation",
    "leadership_drive": "Leadership Drive",
    "risk_appetite": "Risk Appetite",
    "structure_discipline": "Structure & Discipline",
}


def _format_trait_ref(trait_slug: str, score: float) -> str:
    return f"{TRAIT_SHORT.get(trait_slug, trait_slug)} ({score:.1f}/10)"


def _career_why_match(career_slug: str, career_name: str, traits: dict, rank: int) -> str:
    """Generate a unique 'why this career matches you' paragraph based on top traits."""
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

    opening = (
        f"{career_name} is a strong match because of {', '.join(parts[:2])}"
        f"{(' and ' + parts[2]) if len(parts) > 2 else ''}."
    )

    closing_template = CAREER_CLOSING_INSIGHTS.get(career_slug)
    if closing_template:
        top_trait_refs = {
            "analytical": _format_trait_ref("analytical_reasoning", traits.get("analytical_reasoning", 0)),
            "quantitative": _format_trait_ref("quantitative_comfort", traits.get("quantitative_comfort", 0)),
            "creativity": _format_trait_ref("creativity_innovation", traits.get("creativity_innovation", 0)),
            "verbal": _format_trait_ref("verbal_communication", traits.get("verbal_communication", 0)),
            "social": _format_trait_ref("social_orientation", traits.get("social_orientation", 0)),
            "leadership": _format_trait_ref("leadership_drive", traits.get("leadership_drive", 0)),
            "risk": _format_trait_ref("risk_appetite", traits.get("risk_appetite", 0)),
            "structure": _format_trait_ref("structure_discipline", traits.get("structure_discipline", 0)),
        }
        closing = " " + closing_template.format(**top_trait_refs)
    else:
        closing = ""

    return opening + closing


# ── Dominant pattern ───────────────────────────────────────────────

PATTERN_ARCHETYPES = [
    {
        "key_traits": ["analytical_reasoning", "quantitative_comfort", "structure_discipline"],
        "name": "Technical-Structured",
        "description": (
            "You show a strong Technical-Structured profile with high analytical "
            "reasoning and discipline. This pattern is commonly found in engineering, "
            "data-driven, and finance careers where systematic thinking and precision "
            "are valued above all."
        ),
    },
    {
        "key_traits": ["creativity_innovation", "risk_appetite", "verbal_communication"],
        "name": "Creative-Expressive",
        "description": (
            "You show a Creative-Expressive profile driven by imagination, bold "
            "thinking, and strong communication. This pattern thrives in design, "
            "marketing, media, entrepreneurship, and any field that rewards "
            "original ideas and persuasive storytelling."
        ),
    },
    {
        "key_traits": ["social_orientation", "verbal_communication", "leadership_drive"],
        "name": "People-Leadership",
        "description": (
            "You show a People-Leadership profile built on strong interpersonal "
            "skills, communication, and a drive to guide others. This pattern is "
            "common among managers, counsellors, teachers, and HR professionals — "
            "roles where influence and empathy drive success."
        ),
    },
    {
        "key_traits": ["analytical_reasoning", "creativity_innovation", "risk_appetite"],
        "name": "Innovator-Builder",
        "description": (
            "You show an Innovator-Builder profile that combines analytical depth "
            "with creative risk-taking. This pattern is often seen in entrepreneurs, "
            "product managers, software engineers, and researchers — people who "
            "build new things by blending logic with imagination."
        ),
    },
    {
        "key_traits": ["structure_discipline", "quantitative_comfort", "social_orientation"],
        "name": "Organised-Collaborative",
        "description": (
            "You show an Organised-Collaborative profile that combines discipline "
            "with teamwork. This pattern fits well in operations, healthcare, "
            "education, and public service — roles that require both systematic "
            "processes and human connection."
        ),
    },
]


def _detect_dominant_pattern(traits: dict) -> dict:
    best_match = None
    best_score = -1

    for archetype in PATTERN_ARCHETYPES:
        avg = sum(traits.get(t, 0) for t in archetype["key_traits"]) / len(archetype["key_traits"])
        if avg > best_score:
            best_score = avg
            best_match = archetype

    key_trait_details = []
    for t in best_match["key_traits"]:
        meta = TRAIT_META.get(t, {})
        key_trait_details.append({
            "trait": t,
            "label": meta.get("label", t),
            "score": round(traits.get(t, 0), 1),
            "max": 10,
        })

    return {
        "name": best_match["name"],
        "description": best_match["description"],
        "key_traits": key_trait_details,
    }


# ── Careers that may feel less natural ─────────────────────────────

CAREER_DOMAIN_TRAITS = {
    "high_social": {
        "label": "High Social Interaction",
        "examples": "hospitality management, public relations, event management",
        "key_trait": "social_orientation",
    },
    "high_risk": {
        "label": "High Risk & Uncertainty",
        "examples": "startup founding, stock trading, venture capital",
        "key_trait": "risk_appetite",
    },
    "high_creativity": {
        "label": "High Creative Freedom",
        "examples": "fine arts, filmmaking, fashion design",
        "key_trait": "creativity_innovation",
    },
    "high_structure": {
        "label": "High Routine & Compliance",
        "examples": "civil services, auditing, military administration",
        "key_trait": "structure_discipline",
    },
    "high_verbal": {
        "label": "Heavy Verbal Persuasion",
        "examples": "litigation, politics, sales management",
        "key_trait": "verbal_communication",
    },
}


def _less_natural_careers(traits: dict) -> list:
    """Identify 2-3 career domains that require extra effort based on lowest traits."""
    sorted_traits = sorted(TRAIT_SLUGS, key=lambda t: traits.get(t, 0))
    weakest = sorted_traits[:3]

    results = []
    for domain_info in CAREER_DOMAIN_TRAITS.values():
        if domain_info["key_trait"] in weakest:
            score = traits.get(domain_info["key_trait"], 0)
            if score < 6:
                results.append({
                    "domain": domain_info["label"],
                    "examples": domain_info["examples"],
                    "trait": TRAIT_META[domain_info["key_trait"]]["label"],
                    "score": round(score, 1),
                    "note": (
                        f"Careers requiring {domain_info['label'].lower()} "
                        f"(e.g., {domain_info['examples']}) may require extra effort "
                        f"given your current {TRAIT_META[domain_info['key_trait']]['label']} "
                        f"score of {score:.1f}/10. This does not mean these paths are "
                        f"closed — it means they would need more deliberate skill-building."
                    ),
                })
    return results[:3]


# ── Stream conflict clarification ──────────────────────────────────

def _stream_conflict_note(recommended_stream: str, careers: list) -> str:
    """If any top-3 career has a different stream, add a clarifying note."""
    conflicts = []
    for c in careers:
        c_stream = c.get("stream", "")
        if c_stream and c_stream.lower() != recommended_stream.lower():
            conflicts.append((c["career_name"], c_stream))

    if not conflicts:
        return ""

    conflict_parts = [f"{name} (typically through {stream})" for name, stream in conflicts]
    return (
        f"Note: Although {' and '.join(conflict_parts)} can be pursued through "
        f"a different stream, choosing {recommended_stream} keeps maximum flexibility "
        f"and aligns with the majority of your top career matches."
    )


# ── Career comparison analysis ─────────────────────────────────────

def _comparison_analysis(careers: list, traits: dict) -> str:
    """Generate intelligent comparison paragraph instead of just listing numbers."""
    if len(careers) < 2:
        return ""

    top = careers[0]
    scores = [c["score_percent"] for c in careers]
    spread = max(scores) - min(scores)

    top_weights = {
        w.trait_name: w.weight
        for w in GameCareerTraitWeight.objects.filter(career__slug=top["career_slug"])
    }
    best_trait = max(
        top_weights.items(), key=lambda x: x[1] * traits.get(x[0], 0), default=(None, 0)
    )
    differentiator = TRAIT_META.get(best_trait[0], {}).get("label", "") if best_trait[0] else ""

    if spread <= 2:
        tightness = "very narrow"
        domain_note = "strong compatibility with multiple related domains"
    elif spread <= 5:
        tightness = "moderate"
        domain_note = "a clear direction with viable alternatives"
    else:
        tightness = "significant"
        domain_note = "a distinct preference for your top match"

    analysis = (
        f"The difference between your top {len(careers)} matches is {tightness} "
        f"({spread:.1f}%), indicating {domain_note}. "
    )

    if differentiator:
        analysis += (
            f"However, {top['career_name']} edges ahead due to slightly stronger "
            f"alignment in {differentiator.lower()}-driven problem solving."
        )

    return analysis


# ── Work style & education maps ────────────────────────────────────

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


# ── Stream recommendation ──────────────────────────────────────────

def _recommend_stream(careers: list) -> dict:
    streams = [c.get("stream", "") for c in careers if c.get("stream")]
    primary = streams[0] if streams else "General"
    reasoning = (
        f"Based on your trait profile, {primary} is the recommended academic stream. "
        f"Your top career matches ({', '.join(c['career_name'] for c in careers[:2])}) "
        f"fall within this stream, suggesting a natural alignment with your abilities."
    )
    conflict_note = _stream_conflict_note(primary, careers)
    if conflict_note:
        reasoning += " " + conflict_note
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


# ── Areas to improve (with practical steps) ───────────────────────

PRACTICAL_STEPS = {
    "analytical_reasoning": [
        "Solve logic puzzles or brain teasers for 15 minutes daily",
        "Practice breaking down news articles into cause-and-effect chains",
        "Join a coding or robotics club to build structured thinking",
    ],
    "quantitative_comfort": [
        "Use apps like Khan Academy for daily math practice",
        "Track personal expenses in a spreadsheet to build comfort with numbers",
        "Participate in math olympiads or quiz competitions",
    ],
    "creativity_innovation": [
        "Set aside 20 minutes daily for free writing or sketching",
        "Try 'lateral thinking' puzzles that require non-obvious solutions",
        "Start a small DIY project — building something from scratch builds creative confidence",
    ],
    "verbal_communication": [
        "Join a debate club or participate in Model United Nations",
        "Practice explaining a topic you learned today to a friend or family member",
        "Start a blog or journal — even 100 words daily builds fluency",
    ],
    "social_orientation": [
        "Join group projects or team sports to build collaboration skills",
        "Volunteer at community events or NGOs on weekends",
        "Participate in Model UN or student council for structured teamwork",
    ],
    "leadership_drive": [
        "Volunteer to lead a class project or extracurricular event",
        "Organise a small study group and coordinate tasks",
        "Take ownership of one responsibility at home each week",
    ],
    "risk_appetite": [
        "Try one new activity per month outside your comfort zone",
        "Enter competitions where the outcome is uncertain — the experience matters more than winning",
        "Read biographies of entrepreneurs to normalise smart risk-taking",
    ],
    "structure_discipline": [
        "Use a daily planner or to-do app to schedule your study and free time",
        "Set small deadlines for yourself and track completion",
        "Practise the 'two-minute rule' — if a task takes less than 2 minutes, do it now",
    ],
}


STRETCH_TIPS = {
    "analytical_reasoning": "Push beyond school-level problems — try competitive math, coding challenges, or case-study analysis to sharpen this elite skill.",
    "quantitative_comfort": "Explore data science mini-projects or financial modelling to take your quantitative skills from strong to exceptional.",
    "creativity_innovation": "Enter design competitions, start a creative blog, or build something from scratch — channel your creativity into a portfolio.",
    "verbal_communication": "Join debate or Model UN, start a podcast, or write for your school magazine to make your communication skills unforgettable.",
    "social_orientation": "Volunteer to lead community projects or mentor juniors — transform your people skills into measurable leadership impact.",
    "leadership_drive": "Take on a real leadership challenge: organise a school event, run a club, or start a small student initiative.",
    "risk_appetite": "Enter startup pitch competitions or take on ambitious personal projects where the outcome isn't guaranteed — this is where growth happens.",
    "structure_discipline": "Level up your systems: learn project management basics (Trello/Notion), build daily review habits, and track weekly goals.",
}


def _areas_to_improve(traits: dict) -> list:
    sorted_traits = sorted(TRAIT_SLUGS, key=lambda t: traits.get(t, 0))
    areas = []
    all_strong = all(traits.get(t, 0) >= 7 for t in sorted_traits[:3])

    if all_strong:
        for t in sorted_traits[:3]:
            score = traits.get(t, 0)
            meta = TRAIT_META[t]
            tip = STRETCH_TIPS.get(t, (
                f"Your {meta['label']} is already strong. "
                f"Challenge yourself to go from good to exceptional."
            ))
            areas.append({
                "trait": t,
                "label": meta["label"],
                "score": round(score, 1),
                "tip": tip,
                "steps": PRACTICAL_STEPS.get(t, []),
                "is_stretch": True,
            })
        return areas

    for t in sorted_traits[:3]:
        score = traits.get(t, 0)
        if score >= 7:
            break
        meta = TRAIT_META[t]
        steps = PRACTICAL_STEPS.get(t, [])
        if score < 4:
            tip = (
                f"Your {meta['label']} score shows room for exciting growth. "
                f"This doesn't need to become your strongest trait, but even "
                f"small improvements here can open new doors."
            )
        else:
            tip = (
                f"Your {meta['label']} is developing well. With focused practice, "
                f"this can become a real asset in your career journey."
            )
        areas.append({
            "trait": t,
            "label": meta["label"],
            "score": round(score, 1),
            "tip": tip,
            "steps": steps,
            "is_stretch": False,
        })
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

    traits = {t.trait_name: round(t.normalized_score, 1) for t in trait_qs}
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
            "bar_width": min(100, int(round(score * 10))),
            "description": meta.get("description", ""),
        })

    careers = []
    for m in match_qs:
        c = m.career
        slug = c.slug
        pct = round(m.score * 100, 1) if m.score <= 1 else round(m.score, 1)
        cat = (c.category or "").strip() or category_label_for_slug(slug)
        careers.append({
            "rank": m.rank,
            "career_id": c.id,
            "career_name": c.name,
            "career_slug": slug,
            "career_category": cat,
            "stream": c.stream,
            "description": c.description or "",
            "score_percent": pct,
            "confidence": _confidence_badge(pct),
            "why_match": _career_why_match(slug, c.name, traits, m.rank),
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
    less_natural = _less_natural_careers(traits)
    comparison_text = _comparison_analysis(careers, traits)

    hero_confidence = top.get("confidence", "Exploratory")

    completed_fmt = None
    if session.completed_at:
        completed_fmt = session.completed_at.strftime("%d %B %Y, %I:%M %p")

    # ── 15-dimension profile (student-facing) ──────────────────────
    riasec_scores, core_trait_scores, personality_scores = calculate_15d_scores(session)
    recommended_stream = stream_rec.get("stream", "General")

    interest_profile = build_interest_profile(riasec_scores)
    core_traits_15d = build_core_traits(core_trait_scores, recommended_stream)
    personality_style = build_personality_style(personality_scores)
    dominant_pattern = detect_dominant_pattern(riasec_scores, core_trait_scores)
    subject_rec = recommend_subjects(
        riasec_scores, core_trait_scores, personality_scores, recommended_stream,
    )
    working_style = derive_working_style(personality_scores)

    return {
        "session_id": str(session.id),
        "completed_at": completed_fmt,
        "generated_at": date.today().strftime("%d %B %Y"),
        "student": profile_data,
        "hero": {
            "career_category": top.get("career_category", ""),
            "career_name": top.get("career_name", "—"),
            "score_percent": top.get("score_percent", 0),
            "confidence": hero_confidence,
            "confidence_explanation": _confidence_explanation(hero_confidence),
        },
        # 8-trait system (kept for career matching context / why_match)
        "traits": trait_list,
        # 15-dimension student-facing profile
        "interest_profile": interest_profile,
        "core_traits": core_traits_15d,
        "personality_style": personality_style,
        "dominant_pattern": dominant_pattern,
        "subject_recommendation": subject_rec,
        "working_style": working_style,
        # Career data
        "careers": careers,
        "career_comparison_text": comparison_text,
        "less_natural_careers": less_natural,
        "stream_recommendation": stream_rec,
        "roadmap": roadmap,
        "areas_to_improve": improvements,
        "disclaimer": (
            "This report is generated from a 30-question behavioral assessment "
            "across 15 scientifically-backed dimensions. It is intended for "
            "educational guidance purposes and works best when discussed with "
            "a parent or school counsellor."
        ),
    }
