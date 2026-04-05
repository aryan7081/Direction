"""
15-dimension metadata, scoring, and derived insights.

Dimensions are grouped into three sections:
  RIASEC Interests (6)  — What excites you
  Core Work Traits (5)  — How you work
  Personality Style (4) — Who you are

Career matching still uses the internal 8-trait system (cosine similarity).
This module powers the student-facing profile display.
"""
from __future__ import annotations

from typing import Dict, List, Tuple

from apps.assessments.content.mcq_items import ALL_MCQ_ITEMS

# ── Dimension slugs ─────────────────────────────────────────────────

RIASEC_SLUGS = [
    "riasec_realistic", "riasec_investigative", "riasec_artistic",
    "riasec_social", "riasec_enterprising", "riasec_conventional",
]
CORE_TRAIT_SLUGS = [
    "trait_curiosity", "trait_persistence", "trait_initiative",
    "trait_empathy_teamwork", "trait_planning",
]
PERSONALITY_SLUGS = [
    "personality_extroversion", "personality_risk_taking",
    "personality_structure", "personality_self_direction",
]

ALL_15D_SLUGS = RIASEC_SLUGS + CORE_TRAIT_SLUGS + PERSONALITY_SLUGS

# ── RIASEC Metadata ─────────────────────────────────────────────────

RIASEC_META = {
    "riasec_realistic": {
        "label": "Hands-On Builder",
        "short": "Realistic",
        "code": "R",
        "icon": "wrench",
        "emoji": "🔧",
        "description": (
            "You enjoy working with your hands, building things, and solving "
            "practical problems. Whether it's fixing a gadget, doing experiments, "
            "or tackling a hands-on project — you like action over theory."
        ),
        "careers_hint": "Engineering, Architecture, Robotics, Agriculture, Skilled trades",
    },
    "riasec_investigative": {
        "label": "Curious Thinker",
        "short": "Investigative",
        "code": "I",
        "icon": "microscope",
        "emoji": "🔬",
        "description": (
            "You love figuring things out. Puzzles, mysteries, research — you "
            "enjoy digging deep until you understand how something works. You're "
            "the one asking 'why?' when everyone else has moved on."
        ),
        "careers_hint": "Science, Research, Data Science, Medicine, Technology",
    },
    "riasec_artistic": {
        "label": "Creative Explorer",
        "short": "Artistic",
        "code": "A",
        "icon": "palette",
        "emoji": "🎨",
        "description": (
            "You have a strong creative streak. Whether it's drawing, writing, "
            "music, or just thinking differently — you prefer creating something "
            "original over following a rulebook."
        ),
        "careers_hint": "Design, Writing, Film, Fashion, Content Creation, Arts",
    },
    "riasec_social": {
        "label": "People Person",
        "short": "Social",
        "code": "S",
        "icon": "heart",
        "emoji": "❤️",
        "description": (
            "You genuinely care about people. Helping a friend, working in a "
            "team, or teaching someone — you feel most energised when you're "
            "making a difference in someone's life."
        ),
        "careers_hint": "Teaching, Psychology, Healthcare, Social Work, HR",
    },
    "riasec_enterprising": {
        "label": "Bold Leader",
        "short": "Enterprising",
        "code": "E",
        "icon": "rocket",
        "emoji": "🚀",
        "description": (
            "You're drawn to leading, persuading, and making things happen. "
            "Whether it's organising an event, pitching an idea, or starting "
            "something new — you naturally step up and take charge."
        ),
        "careers_hint": "Business, Management, Entrepreneurship, Law, Politics",
    },
    "riasec_conventional": {
        "label": "Organised Planner",
        "short": "Conventional",
        "code": "C",
        "icon": "clipboard",
        "emoji": "📋",
        "description": (
            "You bring order to chaos. Lists, plans, schedules — you feel "
            "satisfied when things are well-organised. Accuracy and attention "
            "to detail come naturally to you."
        ),
        "careers_hint": "Accounting, Finance, Administration, Banking, Operations",
    },
}

RIASEC_CODE_MAP = {v["code"]: k for k, v in RIASEC_META.items()}

# ── Core Trait Metadata ─────────────────────────────────────────────

CORE_TRAIT_META = {
    "trait_curiosity": {
        "label": "Curiosity",
        "icon": "search",
        "emoji": "🔍",
        "description": (
            "How driven you are to explore, ask questions, and learn new things. "
            "High curiosity means you're never satisfied with surface-level "
            "answers — you always want to know more."
        ),
    },
    "trait_persistence": {
        "label": "Persistence",
        "icon": "muscle",
        "emoji": "💪",
        "description": (
            "How well you stick with difficult tasks when things get tough. "
            "High persistence means you don't give up easily — you push through "
            "challenges even when it's frustrating."
        ),
    },
    "trait_initiative": {
        "label": "Initiative",
        "icon": "lightning",
        "emoji": "⚡",
        "description": (
            "How naturally you take action without waiting to be told. High "
            "initiative means you see something that needs doing and just do "
            "it — you don't wait for permission."
        ),
    },
    "trait_empathy_teamwork": {
        "label": "Empathy & Teamwork",
        "icon": "handshake",
        "emoji": "🤝",
        "description": (
            "How well you understand other people's feelings and work with a "
            "team. High empathy means you're the person friends come to for "
            "support — and teams work better when you're in them."
        ),
    },
    "trait_planning": {
        "label": "Planning",
        "icon": "calendar",
        "emoji": "📅",
        "description": (
            "How systematic and organised your approach is to tasks. High "
            "planning means you think ahead, make lists, and prefer having "
            "a clear roadmap before diving in."
        ),
    },
}

# ── Personality Metadata (bipolar spectrums) ────────────────────────

PERSONALITY_META = {
    "personality_extroversion": {
        "label_low": "Reserved",
        "label_high": "Outgoing",
        "icon": "users",
        "emoji": "👥",
        "description": (
            "Are you energised by people or by alone time? Neither is better "
            "— introverts bring depth, extroverts bring energy."
        ),
        "insights": {
            "low": "You recharge by spending time alone or with a small group. You think deeply before speaking and prefer meaningful one-on-one conversations over big crowds.",
            "mid": "You're comfortable in social settings but also value your alone time. You can switch between group energy and solo focus.",
            "high": "You light up in social settings. You think out loud, draw energy from people, and feel most alive in group activities.",
        },
    },
    "personality_risk_taking": {
        "label_low": "Cautious",
        "label_high": "Bold",
        "icon": "shield",
        "emoji": "🛡️",
        "description": (
            "Do you prefer safe, calculated moves or bold leaps? Cautious "
            "people build steadily; bold people find breakthroughs."
        ),
        "insights": {
            "low": "You prefer to analyse before acting. You make careful, well-thought-out decisions and avoid unnecessary risks — this makes you reliable.",
            "mid": "You take calculated risks — bold when the situation calls for it, careful when it matters. A good balance for most career paths.",
            "high": "You're comfortable with uncertainty. You'd rather try and fail than never try at all — this is the mindset of entrepreneurs and innovators.",
        },
    },
    "personality_structure": {
        "label_low": "Flexible",
        "label_high": "Structured",
        "icon": "grid",
        "emoji": "📊",
        "description": (
            "Do you thrive with routines or prefer to go with the flow? "
            "Structured people love systems; flexible people adapt quickly."
        ),
        "insights": {
            "low": "You prefer flexibility and spontaneity. Rigid rules and strict schedules feel limiting — you adapt quickly when plans change.",
            "mid": "You balance structure with flexibility — you plan when needed but can adapt when things change unexpectedly.",
            "high": "You love order. Schedules, to-do lists, and clear processes make you productive and happy. You're the person who keeps things on track.",
        },
    },
    "personality_self_direction": {
        "label_low": "Guided",
        "label_high": "Independent",
        "icon": "compass",
        "emoji": "🧭",
        "description": (
            "Do you prefer clear instructions or charting your own path? "
            "Guided learners thrive with mentors; independent thinkers forge "
            "new directions."
        ),
        "insights": {
            "low": "You value guidance and mentorship. You prefer clear instructions and feedback — and you learn best with a good teacher or mentor.",
            "mid": "You appreciate guidance but also enjoy making your own decisions. You can follow directions and also lead when needed.",
            "high": "You're self-directed. You prefer setting your own goals and figuring things out on your own — perfect for independent roles.",
        },
    },
}

# ── Dominant Pattern Archetypes (RIASEC-based) ──────────────────────

PATTERN_ARCHETYPES_V2: List[dict] = [
    {
        "top_codes": ("I", "R"),
        "name": "The Builder-Thinker",
        "description": (
            "You combine deep analytical thinking with a love for hands-on work. "
            "You don't just want to understand how things work — you want to build "
            "them. This pattern is common among engineers, scientists, and tech innovators "
            "who turn complex ideas into real-world products."
        ),
        "career_examples": "Software Engineer, Mechanical Engineer, Robotics Engineer, Data Scientist",
    },
    {
        "top_codes": ("I", "A"),
        "name": "The Innovator",
        "description": (
            "You blend logical depth with creative thinking — a rare and powerful "
            "combination. You approach problems with both rigour and imagination, "
            "often finding solutions others miss. This pattern drives breakthroughs "
            "in technology, design, research, and product development."
        ),
        "career_examples": "Product Designer, AI Engineer, Architect, Academic Researcher",
    },
    {
        "top_codes": ("I", "S"),
        "name": "The Researcher-Helper",
        "description": (
            "You combine deep intellectual curiosity with genuine care for people. "
            "You want to understand the world AND make it better. This pattern is "
            "found in healthcare professionals, psychologists, and educators — people "
            "who use knowledge to help others."
        ),
        "career_examples": "Doctor, Psychologist, Teacher, Physiotherapist",
    },
    {
        "top_codes": ("I", "E"),
        "name": "The Strategist",
        "description": (
            "You have a sharp analytical mind paired with business instinct. "
            "You see patterns others miss and know how to turn insight into action. "
            "This pattern is common among business leaders, consultants, and "
            "entrepreneurs who make data-driven decisions."
        ),
        "career_examples": "Business Analyst, Product Manager, Investment Banker, Entrepreneur",
    },
    {
        "top_codes": ("I", "C"),
        "name": "The Analyst",
        "description": (
            "You are driven by precision and deep understanding. You trust data, "
            "value accuracy, and feel satisfied when every detail is accounted for. "
            "This pattern excels in careers demanding systematic research, financial "
            "analysis, and quality assurance."
        ),
        "career_examples": "Data Scientist, Chartered Accountant, Financial Analyst, Auditor",
    },
    {
        "top_codes": ("A", "E"),
        "name": "The Visionary",
        "description": (
            "You combine bold creative ideas with the drive to make them happen. "
            "You're not just a dreamer — you're a doer who inspires others with your "
            "vision. This pattern thrives in marketing, media, entrepreneurship, and "
            "any field where persuasion meets originality."
        ),
        "career_examples": "Marketing Manager, Filmmaker, Content Creator, Entrepreneur",
    },
    {
        "top_codes": ("A", "S"),
        "name": "The Advocate",
        "description": (
            "You express yourself creatively AND connect deeply with people. "
            "Whether through writing, teaching, counselling, or performing — you "
            "use your creative gifts to inspire, heal, or educate. This pattern "
            "is found in some of the most impactful communicators."
        ),
        "career_examples": "Writer, Teacher, Psychologist, Journalist, UX Designer",
    },
    {
        "top_codes": ("S", "E"),
        "name": "The Connector",
        "description": (
            "You lead through relationships. People naturally trust you and follow "
            "your guidance because you combine genuine empathy with decisive action. "
            "This pattern is common among managers, HR leaders, politicians, and "
            "community builders."
        ),
        "career_examples": "HR Manager, Sales Manager, Lawyer, Event Manager, IAS Officer",
    },
    {
        "top_codes": ("E", "C"),
        "name": "The Manager",
        "description": (
            "You combine leadership ambition with organisational skill. You don't "
            "just lead — you build systems, track progress, and ensure things get done "
            "right. This pattern drives success in operations, finance leadership, "
            "and corporate management."
        ),
        "career_examples": "Operations Manager, CA, Supply Chain Manager, Airport Manager",
    },
    {
        "top_codes": ("R", "E"),
        "name": "The Pioneer",
        "description": (
            "You're hands-on AND entrepreneurial. You don't just talk about ideas — "
            "you build prototypes, test things, and make them real. This pattern is "
            "found among startup founders, field engineers, and leaders who lead from "
            "the front."
        ),
        "career_examples": "Entrepreneur, Civil Engineer, Pilot, Chef, Field Technician",
    },
    {
        "top_codes": ("R", "C"),
        "name": "The Implementer",
        "description": (
            "You execute with precision. You take detailed plans and make them "
            "real — carefully, accurately, and reliably. This pattern excels in "
            "technical operations, quality control, manufacturing, and any role "
            "where getting the details right matters."
        ),
        "career_examples": "Electrical Engineer, Database Administrator, Technician, Accountant",
    },
    {
        "top_codes": ("S", "C"),
        "name": "The Organiser-Helper",
        "description": (
            "You bring order to caring. You build systems that help people — "
            "whether it's organising a school event, managing a team's workflow, "
            "or running a healthcare operation. This pattern thrives where empathy "
            "meets structure."
        ),
        "career_examples": "Education Counselor, Nurse, HR Manager, Operations Manager",
    },
]

_PATTERN_LOOKUP: Dict[Tuple[str, str], dict] = {}
for _p in PATTERN_ARCHETYPES_V2:
    c1, c2 = _p["top_codes"]
    _PATTERN_LOOKUP[(c1, c2)] = _p
    _PATTERN_LOOKUP[(c2, c1)] = _p


# ── Subject Recommendation Maps ─────────────────────────────────────

_SCIENCE_SUBJECTS = {
    "pcm_cs": {
        "subjects": ["Physics", "Chemistry", "Mathematics", "Computer Science"],
        "label": "PCM + Computer Science",
        "best_for": "Engineering, Tech, Data Science, AI",
        "why": "Your analytical and investigative strengths combined with interest in building things make this the ideal combination for technology and engineering careers.",
    },
    "pcm": {
        "subjects": ["Physics", "Chemistry", "Mathematics"],
        "label": "PCM (Pure Science)",
        "best_for": "Engineering, Research, Architecture, Defence",
        "why": "A solid foundation for the widest range of Science careers. Keep your options open with the core trio.",
    },
    "pcb": {
        "subjects": ["Physics", "Chemistry", "Biology"],
        "label": "PCB (Medical)",
        "best_for": "Medicine, Dentistry, Pharmacy, Biotechnology",
        "why": "Your people orientation and investigative curiosity align perfectly with healthcare and life sciences.",
    },
    "pcmb": {
        "subjects": ["Physics", "Chemistry", "Mathematics", "Biology"],
        "label": "PCMB (All Sciences)",
        "best_for": "Maximum flexibility — Medicine OR Engineering",
        "why": "The heaviest workload but maximum flexibility. Choose this if you want to decide between medical and engineering later.",
    },
}

_COMMERCE_SUBJECTS = {
    "commerce_math": {
        "subjects": ["Accountancy", "Business Studies", "Economics", "Mathematics"],
        "label": "Commerce with Mathematics",
        "best_for": "CA, Finance, Data Analytics, Economics",
        "why": "Math opens doors to finance, data roles, and competitive exams. Strong quantitative profiles benefit most from this.",
    },
    "commerce_ip": {
        "subjects": ["Accountancy", "Business Studies", "Economics", "Informatics Practices"],
        "label": "Commerce with Informatics Practices",
        "best_for": "Business, Marketing, Management, Entrepreneurship",
        "why": "Digital literacy plus business fundamentals — ideal for the modern business landscape.",
    },
    "commerce_econ": {
        "subjects": ["Accountancy", "Business Studies", "Economics", "Applied Mathematics"],
        "label": "Commerce with Applied Math",
        "best_for": "Banking, Insurance, Business Analytics",
        "why": "Applied math gives practical quantitative skills without the theoretical depth of pure math.",
    },
}

_ARTS_SUBJECTS = {
    "arts_psychology": {
        "subjects": ["Psychology", "Sociology", "English", "Political Science"],
        "label": "Humanities with Psychology",
        "best_for": "Psychology, Counselling, Social Work, HR",
        "why": "Your strong people orientation and empathy make psychology and social sciences a natural fit.",
    },
    "arts_economics": {
        "subjects": ["Economics", "Political Science", "History", "English"],
        "label": "Humanities with Economics",
        "best_for": "UPSC, Law, Journalism, Policy Research",
        "why": "A powerful combination for careers in governance, law, and policy — backed by analytical and leadership skills.",
    },
    "arts_creative": {
        "subjects": ["English", "Fine Arts", "Mass Communication", "Sociology"],
        "label": "Humanities with Creative Arts",
        "best_for": "Design, Content Creation, Film, Advertising",
        "why": "Your creative drive combined with communication strength makes this the ideal path for creative careers.",
    },
    "arts_mass_comm": {
        "subjects": ["English", "Mass Communication", "Political Science", "Sociology"],
        "label": "Humanities with Mass Communication",
        "best_for": "Journalism, PR, Media, Content Strategy",
        "why": "Strong verbal and social skills paired with a creative outlook — perfect for media and communication careers.",
    },
}


# ── Scoring functions ───────────────────────────────────────────────

_LETTERS = ("a", "b", "c", "d")


def _build_15d_option_lookup() -> Dict[str, Dict[str, int]]:
    """Map option_id → original 15-dimension weights from all MCQ items."""
    lookup = {}
    for item in ALL_MCQ_ITEMS:
        qid = item["code"].lower()
        for i, (_text, weights) in enumerate(item["options"]):
            option_id = f"{qid}_{_LETTERS[i]}"
            lookup[option_id] = weights
    return lookup


_15D_OPTION_LOOKUP = _build_15d_option_lookup()


def calculate_15d_scores(session) -> Tuple[dict, dict, dict]:
    """
    Calculate raw 15-dimension scores from stored scenario events.

    Returns (riasec_normalized, traits_normalized, personality_raw).
    RIASEC and traits are normalized 0-10; personality stays 1-5 for spectrum display.
    """
    from ..models import GameEventLog

    events = GameEventLog.objects.filter(
        session=session,
        game_name="scenario",
        event_type="answer",
    )

    riasec_sums: Dict[str, float] = {s: 0.0 for s in RIASEC_SLUGS}
    riasec_counts: Dict[str, int] = {s: 0 for s in RIASEC_SLUGS}

    trait_values: Dict[str, list] = {s: [] for s in CORE_TRAIT_SLUGS}
    personality_values: Dict[str, list] = {s: [] for s in PERSONALITY_SLUGS}

    for ev in events:
        option_id = ev.payload.get("selected_option_id")
        if not option_id:
            continue
        weights = _15D_OPTION_LOOKUP.get(option_id, {})
        for dim, val in weights.items():
            if dim in riasec_sums:
                riasec_sums[dim] += val
                riasec_counts[dim] += 1
            elif dim in trait_values:
                trait_values[dim].append(val)
            elif dim in personality_values:
                personality_values[dim].append(val)

    # --- RIASEC: normalize sums to 0-10 ---
    r_vals = [v for v in riasec_sums.values() if v > 0]
    r_min = min(r_vals) if r_vals else 0
    r_max = max(r_vals) if r_vals else 1
    r_range = r_max - r_min

    riasec_norm = {}
    for slug, total in riasec_sums.items():
        if r_range > 0.01:
            pct = (total - r_min) / r_range
            riasec_norm[slug] = round(max(1.0, min(10.0, 3.0 + pct * 6.5)), 1)
        else:
            riasec_norm[slug] = 6.0

    # --- Core traits: average then normalize 0-10 ---
    trait_avgs = {}
    for slug, vals in trait_values.items():
        trait_avgs[slug] = sum(vals) / len(vals) if vals else 0

    t_vals = [v for v in trait_avgs.values() if v > 0]
    t_min = min(t_vals) if t_vals else 0
    t_max = max(t_vals) if t_vals else 1
    t_range = t_max - t_min

    traits_norm = {}
    for slug, avg in trait_avgs.items():
        if avg <= 0.01:
            traits_norm[slug] = 1.0
        elif t_range > 0.01:
            pct = (avg - t_min) / t_range
            traits_norm[slug] = round(max(1.0, min(10.0, 3.0 + pct * 6.5)), 1)
        else:
            traits_norm[slug] = 6.0

    # --- Personality: average raw (keep 1-5 for spectrum) ---
    personality_raw = {}
    for slug, vals in personality_values.items():
        personality_raw[slug] = round(sum(vals) / len(vals), 1) if vals else 3.0

    return riasec_norm, traits_norm, personality_raw


def derive_holland_code(riasec_scores: dict) -> str:
    """Top-3 RIASEC types as a 3-letter Holland code (e.g. 'ISA')."""
    sorted_types = sorted(
        RIASEC_SLUGS,
        key=lambda s: riasec_scores.get(s, 0),
        reverse=True,
    )
    return "".join(RIASEC_META[s]["code"] for s in sorted_types[:3])


def detect_dominant_pattern(riasec_scores: dict, trait_scores: dict) -> dict:
    """Detect personality archetype from top-2 RIASEC codes."""
    sorted_types = sorted(
        RIASEC_SLUGS,
        key=lambda s: riasec_scores.get(s, 0),
        reverse=True,
    )
    top1_code = RIASEC_META[sorted_types[0]]["code"]
    top2_code = RIASEC_META[sorted_types[1]]["code"]

    pattern = _PATTERN_LOOKUP.get((top1_code, top2_code))
    if not pattern:
        pattern = PATTERN_ARCHETYPES_V2[0]

    top_riasec = [
        {
            "slug": sorted_types[i],
            "label": RIASEC_META[sorted_types[i]]["label"],
            "code": RIASEC_META[sorted_types[i]]["code"],
            "score": round(riasec_scores.get(sorted_types[i], 0), 1),
        }
        for i in range(min(3, len(sorted_types)))
    ]

    strongest_trait_slug = max(
        CORE_TRAIT_SLUGS,
        key=lambda s: trait_scores.get(s, 0),
    )
    strongest_trait = {
        "slug": strongest_trait_slug,
        "label": CORE_TRAIT_META[strongest_trait_slug]["label"],
        "score": round(trait_scores.get(strongest_trait_slug, 0), 1),
    }

    return {
        "name": pattern["name"],
        "description": pattern["description"],
        "career_examples": pattern["career_examples"],
        "top_codes": list(pattern["top_codes"]),
        "top_riasec": top_riasec,
        "strongest_trait": strongest_trait,
    }


def recommend_subjects(
    riasec_scores: dict,
    trait_scores: dict,
    personality_scores: dict,
    recommended_stream: str,
) -> dict:
    """Map student profile to specific Class 11-12 subject combinations."""
    sorted_riasec = sorted(
        RIASEC_SLUGS,
        key=lambda s: riasec_scores.get(s, 0),
        reverse=True,
    )
    top1 = RIASEC_META[sorted_riasec[0]]["code"]
    top2 = RIASEC_META[sorted_riasec[1]]["code"]

    curiosity = trait_scores.get("trait_curiosity", 0)
    empathy = trait_scores.get("trait_empathy_teamwork", 0)
    initiative = trait_scores.get("trait_initiative", 0)

    stream = recommended_stream.lower()
    primary = None
    alternatives = []

    if stream == "science":
        social_score = riasec_scores.get("riasec_social", 0)
        artistic_score = riasec_scores.get("riasec_artistic", 0)
        realistic_score = riasec_scores.get("riasec_realistic", 0)

        if "S" in (top1, top2) or (empathy >= 7 and social_score > artistic_score):
            primary = _SCIENCE_SUBJECTS["pcb"]
            alternatives = [_SCIENCE_SUBJECTS["pcmb"], _SCIENCE_SUBJECTS["pcm"]]
        elif "A" in (top1, top2) or artistic_score > realistic_score:
            primary = _SCIENCE_SUBJECTS["pcm_cs"]
            alternatives = [_SCIENCE_SUBJECTS["pcm"], _SCIENCE_SUBJECTS["pcmb"]]
        else:
            primary = _SCIENCE_SUBJECTS["pcm"]
            alternatives = [_SCIENCE_SUBJECTS["pcm_cs"], _SCIENCE_SUBJECTS["pcmb"]]

    elif stream == "commerce":
        invest_score = riasec_scores.get("riasec_investigative", 0)
        enter_score = riasec_scores.get("riasec_enterprising", 0)

        if invest_score > 6 or "I" in (top1, top2):
            primary = _COMMERCE_SUBJECTS["commerce_math"]
            alternatives = [_COMMERCE_SUBJECTS["commerce_econ"], _COMMERCE_SUBJECTS["commerce_ip"]]
        elif initiative >= 7 or enter_score > invest_score:
            primary = _COMMERCE_SUBJECTS["commerce_ip"]
            alternatives = [_COMMERCE_SUBJECTS["commerce_math"], _COMMERCE_SUBJECTS["commerce_econ"]]
        else:
            primary = _COMMERCE_SUBJECTS["commerce_econ"]
            alternatives = [_COMMERCE_SUBJECTS["commerce_math"], _COMMERCE_SUBJECTS["commerce_ip"]]

    else:  # Arts / Humanities
        social_score = riasec_scores.get("riasec_social", 0)
        artistic_score = riasec_scores.get("riasec_artistic", 0)
        enter_score = riasec_scores.get("riasec_enterprising", 0)

        if empathy >= 7 or social_score > artistic_score:
            primary = _ARTS_SUBJECTS["arts_psychology"]
            alternatives = [_ARTS_SUBJECTS["arts_economics"], _ARTS_SUBJECTS["arts_mass_comm"]]
        elif "E" in (top1, top2) or enter_score > artistic_score:
            primary = _ARTS_SUBJECTS["arts_economics"]
            alternatives = [_ARTS_SUBJECTS["arts_mass_comm"], _ARTS_SUBJECTS["arts_psychology"]]
        elif curiosity >= 7:
            primary = _ARTS_SUBJECTS["arts_mass_comm"]
            alternatives = [_ARTS_SUBJECTS["arts_creative"], _ARTS_SUBJECTS["arts_psychology"]]
        else:
            primary = _ARTS_SUBJECTS["arts_creative"]
            alternatives = [_ARTS_SUBJECTS["arts_mass_comm"], _ARTS_SUBJECTS["arts_psychology"]]

    return {
        "primary": primary,
        "alternatives": alternatives[:2],
    }


def derive_working_style(personality_scores: dict) -> list:
    """Derive working style insights from personality dimensions."""
    insights = []
    for slug in PERSONALITY_SLUGS:
        meta = PERSONALITY_META[slug]
        score = personality_scores.get(slug, 3.0)

        if score <= 2.0:
            level = "low"
        elif score >= 4.0:
            level = "high"
        else:
            level = "mid"

        insight_text = meta["insights"][level]

        insights.append({
            "slug": slug,
            "label_low": meta["label_low"],
            "label_high": meta["label_high"],
            "emoji": meta["emoji"],
            "score": score,
            "max": 5.0,
            "position": round((score - 1.0) / 4.0 * 100),  # 0-100 for spectrum
            "insight": insight_text,
        })

    return insights


def build_interest_profile(riasec_scores: dict) -> dict:
    """Build the full RIASEC interest profile section."""
    holland_code = derive_holland_code(riasec_scores)
    dimensions = []
    for slug in RIASEC_SLUGS:
        meta = RIASEC_META[slug]
        dimensions.append({
            "slug": slug,
            "label": meta["label"],
            "short": meta["short"],
            "code": meta["code"],
            "emoji": meta["emoji"],
            "score": round(riasec_scores.get(slug, 0), 1),
            "max": 10,
            "description": meta["description"],
            "careers_hint": meta["careers_hint"],
        })
    dimensions.sort(key=lambda d: d["score"], reverse=True)
    return {
        "holland_code": holland_code,
        "dimensions": dimensions,
    }


def build_core_traits(trait_scores: dict, recommended_stream: str) -> list:
    """Build the 5 core trait display list with stream connections."""
    stream_connections = _generate_stream_connections(trait_scores, recommended_stream)
    traits = []
    for slug in CORE_TRAIT_SLUGS:
        meta = CORE_TRAIT_META[slug]
        score = round(trait_scores.get(slug, 0), 1)
        traits.append({
            "slug": slug,
            "label": meta["label"],
            "emoji": meta["emoji"],
            "score": score,
            "max": 10,
            "description": meta["description"],
            "stream_connection": stream_connections.get(slug, ""),
        })
    return traits


def build_personality_style(personality_scores: dict) -> list:
    """Build the 4 personality spectrum display list."""
    styles = []
    for slug in PERSONALITY_SLUGS:
        meta = PERSONALITY_META[slug]
        score = personality_scores.get(slug, 3.0)

        if score <= 2.0:
            level = "low"
        elif score >= 4.0:
            level = "high"
        else:
            level = "mid"

        styles.append({
            "slug": slug,
            "label_low": meta["label_low"],
            "label_high": meta["label_high"],
            "emoji": meta["emoji"],
            "score": round(score, 1),
            "max": 5.0,
            "position": round((score - 1.0) / 4.0 * 100),
            "description": meta["description"],
            "insight": meta["insights"][level],
        })
    return styles


def _generate_stream_connections(trait_scores: dict, stream: str) -> dict:
    """Generate one-line connection between each trait and the student's stream."""
    connections = {}
    s = stream.lower() if stream else "your chosen"

    for slug in CORE_TRAIT_SLUGS:
        score = trait_scores.get(slug, 0)
        label = CORE_TRAIT_META[slug]["label"]

        if score >= 7:
            strength = "strong"
        elif score >= 4:
            strength = "developing"
        else:
            strength = "growing"

        if slug == "trait_curiosity":
            if s == "science":
                if strength == "strong":
                    connections[slug] = f"Your {strength} curiosity is exactly what Science demands — keep feeding it with experiments and research."
                else:
                    connections[slug] = f"Science rewards curiosity. Building this through reading and experiments will strengthen your Science journey."
            elif s == "commerce":
                connections[slug] = f"Curiosity helps you understand markets and trends — a valuable edge in Commerce."
            else:
                connections[slug] = f"Your curiosity will drive you to explore new ideas and perspectives — the heart of Humanities."

        elif slug == "trait_persistence":
            if s == "science":
                connections[slug] = f"{'Your persistence is a major asset' if strength == 'strong' else 'Building persistence will help you'} for the demanding study load in Science stream."
            elif s == "commerce":
                connections[slug] = f"{'Strong persistence' if strength == 'strong' else 'Growing persistence'} is key for exams like CA, CFA, or any competitive Commerce path."
            else:
                connections[slug] = f"Persistence pays off in Arts — whether it's perfecting your craft or preparing for UPSC."

        elif slug == "trait_initiative":
            if strength == "strong":
                connections[slug] = f"Your initiative will help you stand out — take on projects, start clubs, and build your portfolio early."
            else:
                connections[slug] = f"Try leading one small project or activity this year — initiative grows with practice."

        elif slug == "trait_empathy_teamwork":
            if s == "science" and strength == "strong":
                connections[slug] = "Strong empathy combined with Science leads to powerful careers in healthcare and psychology."
            elif s == "commerce":
                connections[slug] = f"{'Your teamwork skills are' if strength == 'strong' else 'Growing teamwork will be'} valuable for management, HR, and client-facing Commerce roles."
            else:
                connections[slug] = f"{'Your empathy is a core strength' if strength == 'strong' else 'Building empathy will strengthen your path'} for people-focused Humanities careers."

        elif slug == "trait_planning":
            if strength == "strong":
                connections[slug] = f"Your planning ability will keep you on track through {stream}'s academic demands."
            else:
                connections[slug] = f"Start with small habits — a weekly planner or study schedule — to build this for {stream}."

    return connections
