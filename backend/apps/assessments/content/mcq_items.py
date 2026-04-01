"""
30-question career MCQ scored across 15 explicit dimensions:

  RIASEC (6)   — Holland interest types from Q01-Q12
  Traits  (5)  — Core work traits from Q13-Q22
  Personality (4) — Behavioural style from Q23-Q30

Every option contributes weights that the scoring engine aggregates
into a 15-dimension user profile.  Career matching uses cosine
similarity between this profile and each career's ideal weights.
"""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

SECTION_SLUG_RIASEC = "riasec-interests"
SECTION_SLUG_TRAITS = "work-traits"
SECTION_SLUG_PERSONALITY = "work-personality"

# ── RIASEC helpers ──────────────────────────────────────────────────

_RIASEC_SLUGS = [
    "riasec_realistic",
    "riasec_investigative",
    "riasec_artistic",
    "riasec_social",
    "riasec_enterprising",
    "riasec_conventional",
]
_HOLLAND_IDX = {"R": 0, "I": 1, "A": 2, "S": 3, "E": 4, "C": 5}


def _h(code: str) -> Dict[str, int]:
    """RIASEC option: primary Holland type scores 5, all others score 1."""
    primary = _HOLLAND_IDX[code]
    return {slug: (5 if i == primary else 1) for i, slug in enumerate(_RIASEC_SLUGS)}


# ── generic builder ─────────────────────────────────────────────────

def _mcq(
    code: str,
    section_slug: str,
    format_: str,
    context: str,
    text: str,
    options: List[Tuple[str, Dict[str, int]]],
    primary_focus: str = "",
    secondary_signal: str = "",
) -> Dict[str, Any]:
    meta: Dict[str, Any] = {
        "code": code,
        "format": format_,
        "context": context,
        "section": section_slug.split("-")[0],
    }
    if primary_focus:
        meta["primary_focus"] = primary_focus
    if secondary_signal:
        meta["secondary_signal"] = secondary_signal
    return {
        "code": code,
        "section_category_slug": section_slug,
        "text": text,
        "metadata": meta,
        "options": options,
    }


# ====================================================================
#  MCQ_ITEMS — 30 questions
# ====================================================================

MCQ_ITEMS: List[Dict[str, Any]] = [
    # ── RIASEC  (Q01-Q12) ──────────────────────────────────────────
    _mcq(
        "Q01", SECTION_SLUG_RIASEC, "scenario", "home",
        "Your ceiling fan suddenly stops working. What's your first move?",
        [
            ("🔧 Open it up and check the wires myself", _h("R")),
            ("🔍 Search online for what could be wrong", _h("I")),
            ("📞 Call someone who knows how to fix things", _h("S")),
            ("💡 Think of a different way to cool the room", _h("A")),
        ], "R", "I",
    ),
    _mcq(
        "Q02", SECTION_SLUG_RIASEC, "quick_pick", "hobby",
        "Free weekend — zero plans! Pick your vibe:",
        [
            ("🎨 Draw, paint, or design something cool", _h("A")),
            ("📖 Read a book or deep-dive into a topic", _h("I")),
            ("🛠 Build or fix something with your hands", _h("R")),
            ("👥 Hang out and do something social", _h("S")),
        ], "R", "A",
    ),
    _mcq(
        "Q03", SECTION_SLUG_RIASEC, "puzzle", "game",
        "You're playing a strategy game and something isn't working as expected. What do you do?",
        [
            ("🔍 Analyze the pattern to figure out the logic", _h("I")),
            ("🛠 Try random actions until something works", _h("R")),
            ("👥 Ask teammates for ideas", _h("S")),
            ("🎨 Change the strategy creatively", _h("A")),
        ], "I", "R",
    ),
    _mcq(
        "Q04", SECTION_SLUG_RIASEC, "scenario", "school",
        "You're given a complex assignment. How do you approach it?",
        [
            ("🔍 Break it down and understand the concepts", _h("I")),
            ("🗂 Follow a structured method step-by-step", _h("C")),
            ("👥 Discuss with classmates", _h("S")),
            ("🎨 Try a unique approach", _h("A")),
        ], "I", "C",
    ),
    _mcq(
        "Q05", SECTION_SLUG_RIASEC, "creative_task", "hobby",
        "You want to express an idea. What do you prefer?",
        [
            ("🎨 Create art/music/content", _h("A")),
            ("🗣 Share it through conversation", _h("S")),
            ("🧠 Analyze it deeply", _h("I")),
            ("📋 Organize it into a plan", _h("C")),
        ], "A", "S",
    ),
    _mcq(
        "Q06", SECTION_SLUG_RIASEC, "scenario", "internet",
        "You want to start something online. What excites you most?",
        [
            ("🎨 Designing creative content", _h("A")),
            ("📈 Growing an audience/business", _h("E")),
            ("🔍 Researching trends", _h("I")),
            ("👥 Building a community", _h("S")),
        ], "A", "E",
    ),
    _mcq(
        "Q07", SECTION_SLUG_RIASEC, "scenario", "friends",
        "A friend is feeling low. What do you do?",
        [
            ("👥 Talk and support them", _h("S")),
            ("🎨 Do something fun/creative together", _h("A")),
            ("🔍 Try to understand the cause", _h("I")),
            ("📋 Suggest structured solutions", _h("C")),
        ], "S", "A",
    ),
    _mcq(
        "Q08", SECTION_SLUG_RIASEC, "role_choice", "school",
        "In a group project, what role do you take?",
        [
            ("👥 Coordinator/helper", _h("S")),
            ("📈 Leader/decision-maker", _h("E")),
            ("🔍 Researcher", _h("I")),
            ("🎨 Designer", _h("A")),
        ], "S", "E",
    ),
    _mcq(
        "Q09", SECTION_SLUG_RIASEC, "scenario", "daily_life",
        "You see an opportunity. What do you do?",
        [
            ("📈 Take initiative and act", _h("E")),
            ("👥 Discuss with others", _h("S")),
            ("🔍 Analyze risks", _h("I")),
            ("🎨 Think creatively", _h("A")),
        ], "E", "S",
    ),
    _mcq(
        "Q10", SECTION_SLUG_RIASEC, "planning", "home",
        "You're organizing an event. What's your approach?",
        [
            ("📈 Lead and make decisions", _h("E")),
            ("📋 Plan everything in detail", _h("C")),
            ("👥 Coordinate with people", _h("S")),
            ("🎨 Add creative elements", _h("A")),
        ], "E", "C",
    ),
    _mcq(
        "Q11", SECTION_SLUG_RIASEC, "scenario", "school",
        "You have a lot of tasks. What do you do?",
        [
            ("📋 Organize and list them", _h("C")),
            ("🔍 Analyze importance", _h("I")),
            ("👥 Ask for help", _h("S")),
            ("🎨 Do what feels right", _h("A")),
        ], "C", "I",
    ),
    _mcq(
        "Q12", SECTION_SLUG_RIASEC, "quick_pick", "daily_life",
        "Pick what you enjoy more:",
        [
            ("📋 Organizing things", _h("C")),
            ("🛠 Fixing things", _h("R")),
            ("🔍 Learning things", _h("I")),
            ("👥 Helping people", _h("S")),
        ], "C", "R",
    ),

    # ── CORE TRAITS  (Q13-Q22, 2 questions per trait) ──────────────

    # curiosity (Q13-Q14)
    _mcq(
        "Q13", SECTION_SLUG_TRAITS, "scenario", "",
        "You encounter something new. What do you do?",
        [
            ("🔍 Explore it deeply", {"trait_curiosity": 5}),
            ("📋 Ignore unless needed", {"trait_curiosity": 1}),
            ("👥 Ask someone", {"trait_curiosity": 3}),
            ("🎨 Try creatively", {"trait_curiosity": 4}),
        ],
        "curiosity",
    ),
    _mcq(
        "Q14", SECTION_SLUG_TRAITS, "quick_pick", "",
        "What excites you most?",
        [
            ("🔍 Learning new things", {"trait_curiosity": 5}),
            ("📋 Completing tasks", {"trait_curiosity": 2}),
            ("👥 Talking to people", {"trait_curiosity": 2}),
            ("🎨 Creating things", {"trait_curiosity": 4}),
        ],
        "curiosity",
    ),

    # persistence (Q15-Q16)
    _mcq(
        "Q15", SECTION_SLUG_TRAITS, "scenario", "",
        "When things get tough?",
        [
            ("💪 Keep trying", {"trait_persistence": 5}),
            ("📋 Change plan", {"trait_persistence": 4}),
            ("👥 Ask for help", {"trait_persistence": 2}),
            ("🎨 Do something else", {"trait_persistence": 1}),
        ],
        "persistence",
    ),
    _mcq(
        "Q16", SECTION_SLUG_TRAITS, "scenario", "",
        "Long task?",
        [
            ("💪 Finish it no matter what", {"trait_persistence": 5}),
            ("📋 Break into steps", {"trait_persistence": 4}),
            ("👥 Work with others", {"trait_persistence": 3}),
            ("🎨 Take breaks", {"trait_persistence": 2}),
        ],
        "persistence",
    ),

    # initiative (Q17-Q18)
    _mcq(
        "Q17", SECTION_SLUG_TRAITS, "scenario", "school",
        "You see something that needs improvement. What do you do?",
        [
            ("🚀 Take action immediately", {"trait_initiative": 5}),
            ("📋 Plan before acting", {"trait_initiative": 4}),
            ("👥 Discuss with others", {"trait_initiative": 2}),
            ("🎨 Think of creative ideas first", {"trait_initiative": 3}),
        ],
        "initiative",
    ),
    _mcq(
        "Q18", SECTION_SLUG_TRAITS, "role_choice", "daily_life",
        "In a new situation, you usually:",
        [
            ("🚀 Take the lead", {"trait_initiative": 5}),
            ("📋 Wait and observe", {"trait_initiative": 2}),
            ("👥 Follow others", {"trait_initiative": 1}),
            ("🎨 Explore freely", {"trait_initiative": 4}),
        ],
        "initiative",
    ),

    # empathy & teamwork (Q19-Q20)
    _mcq(
        "Q19", SECTION_SLUG_TRAITS, "scenario", "friends",
        "Your team member is struggling. What do you do?",
        [
            ("👥 Help and support them", {"trait_empathy_teamwork": 5}),
            ("📋 Focus on your own task", {"trait_empathy_teamwork": 1}),
            ("🔍 Analyze their problem", {"trait_empathy_teamwork": 3}),
            ("🎨 Motivate in a fun way", {"trait_empathy_teamwork": 4}),
        ],
        "empathy_teamwork",
    ),
    _mcq(
        "Q20", SECTION_SLUG_TRAITS, "role_choice", "school",
        "In a group, you prefer to:",
        [
            ("👥 Collaborate closely", {"trait_empathy_teamwork": 5}),
            ("📋 Work independently", {"trait_empathy_teamwork": 1}),
            ("🔍 Take analytical role", {"trait_empathy_teamwork": 2}),
            ("🎨 Bring energy/fun", {"trait_empathy_teamwork": 4}),
        ],
        "empathy_teamwork",
    ),

    # planning & organization (Q21-Q22)
    _mcq(
        "Q21", SECTION_SLUG_TRAITS, "planning", "daily_life",
        "You have multiple things to do. What's your approach?",
        [
            ("📋 Plan everything clearly", {"trait_planning": 5}),
            ("🚀 Start immediately", {"trait_planning": 3}),
            ("👥 Ask others", {"trait_planning": 2}),
            ("🎨 Go with the flow", {"trait_planning": 1}),
        ],
        "planning_organization",
    ),
    _mcq(
        "Q22", SECTION_SLUG_TRAITS, "scenario", "home",
        "How do you manage deadlines?",
        [
            ("📋 Schedule in advance", {"trait_planning": 5}),
            ("🚀 Work last minute", {"trait_planning": 1}),
            ("👥 Coordinate with others", {"trait_planning": 3}),
            ("🎨 Adjust dynamically", {"trait_planning": 2}),
        ],
        "planning_organization",
    ),

    # ── PERSONALITY  (Q23-Q30, 2 questions per dimension) ──────────

    # introversion / extroversion (Q23-Q24)
    _mcq(
        "Q23", SECTION_SLUG_PERSONALITY, "scenario", "friends",
        "After a long week, you prefer:",
        [
            ("🧘 Spend time alone", {"personality_extroversion": 1}),
            ("🎉 Go out with friends", {"personality_extroversion": 5}),
            ("👥 Small group hangout", {"personality_extroversion": 3}),
            ("🎨 Do something creative alone", {"personality_extroversion": 2}),
        ],
        "introversion_extroversion",
    ),
    _mcq(
        "Q24", SECTION_SLUG_PERSONALITY, "quick_pick", "daily_life",
        "What energizes you more?",
        [
            ("🧘 Alone time", {"personality_extroversion": 1}),
            ("🎉 Social gatherings", {"personality_extroversion": 5}),
            ("👥 Meaningful conversations", {"personality_extroversion": 3}),
            ("🎨 Creative time", {"personality_extroversion": 2}),
        ],
        "introversion_extroversion",
    ),

    # risk-taking / cautious (Q25-Q26)
    _mcq(
        "Q25", SECTION_SLUG_PERSONALITY, "scenario", "daily_life",
        "You get a risky opportunity. What do you do?",
        [
            ("🚀 Take the risk", {"personality_risk_taking": 5}),
            ("📋 Evaluate carefully", {"personality_risk_taking": 2}),
            ("👥 Ask others", {"personality_risk_taking": 3}),
            ("🎨 Try a safe variation", {"personality_risk_taking": 1}),
        ],
        "risk_cautious",
    ),
    _mcq(
        "Q26", SECTION_SLUG_PERSONALITY, "quick_pick", "game",
        "In games, you prefer:",
        [
            ("🚀 Aggressive strategy", {"personality_risk_taking": 5}),
            ("📋 Safe strategy", {"personality_risk_taking": 1}),
            ("👥 Team-based play", {"personality_risk_taking": 3}),
            ("🎨 Creative moves", {"personality_risk_taking": 4}),
        ],
        "risk_cautious",
    ),

    # structure / flexibility (Q27-Q28)
    _mcq(
        "Q27", SECTION_SLUG_PERSONALITY, "scenario", "school",
        "How do you like your work?",
        [
            ("📋 Structured and clear", {"personality_structure": 5}),
            ("🎨 Flexible and open", {"personality_structure": 1}),
            ("👥 Collaborative", {"personality_structure": 3}),
            ("🔍 Analytical", {"personality_structure": 4}),
        ],
        "structure_flexibility",
    ),
    _mcq(
        "Q28", SECTION_SLUG_PERSONALITY, "planning", "daily_life",
        "Your daily routine is:",
        [
            ("📋 Planned", {"personality_structure": 5}),
            ("🎨 Spontaneous", {"personality_structure": 1}),
            ("👥 Socially driven", {"personality_structure": 2}),
            ("🔍 Task-based", {"personality_structure": 4}),
        ],
        "structure_flexibility",
    ),

    # self-directed / externally-guided (Q29-Q30)
    _mcq(
        "Q29", SECTION_SLUG_PERSONALITY, "scenario", "school",
        "When given freedom, you:",
        [
            ("🚀 Set your own direction", {"personality_self_direction": 5}),
            ("📋 Follow instructions", {"personality_self_direction": 1}),
            ("👥 Ask for guidance", {"personality_self_direction": 2}),
            ("🎨 Explore freely", {"personality_self_direction": 4}),
        ],
        "self_directed_externally_guided",
    ),
    _mcq(
        "Q30", SECTION_SLUG_PERSONALITY, "role_choice", "daily_life",
        "In general, you prefer:",
        [
            ("🚀 Making your own decisions", {"personality_self_direction": 5}),
            ("📋 Following clear rules", {"personality_self_direction": 1}),
            ("👥 Getting advice", {"personality_self_direction": 2}),
            ("🎨 Trying different paths", {"personality_self_direction": 4}),
        ],
        "self_directed_externally_guided",
    ),
]
