"""
30 career MCQs → 15 scoring dimensions:

  RIASEC (6)     — Q01–Q12 interest types
  Traits (5)     — Q13–Q22 work habits
  Personality (4) — Q23–Q30 style

Each chosen option adds weights. Scoring builds a user profile; careers
are matched using similarity with each career's profile.
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
        "Your ceiling fan stops working. What do you do first?",
        [
            ("🔧 Open it and try to check the wires myself", _h("R")),
            ("🔍 Search online why it stopped", _h("I")),
            ("📞 Call someone who can repair it", _h("S")),
            ("💡 Think of another way to cool the room", _h("A")),
        ], "R", "I",
    ),
    _mcq(
        "Q02", SECTION_SLUG_RIASEC, "quick_pick", "hobby",
        "Free weekend and no plans. What do you enjoy most?",
        [
            ("🎨 Draw, paint, or design something", _h("A")),
            ("📖 Read a book or learn deeply about a topic", _h("I")),
            ("🛠 Build or fix something with my hands", _h("R")),
            ("👥 Meet friends and spend time together", _h("S")),
        ], "R", "A",
    ),
    _mcq(
        "Q03", SECTION_SLUG_RIASEC, "puzzle", "game",
        "In a strategy game, your plan is not working. What do you do?",
        [
            ("🔍 Study the pattern and try to understand the logic", _h("I")),
            ("🛠 Change moves or settings and see what happens (try by doing)", _h("R")),
            ("👥 Ask teammates for ideas", _h("S")),
            ("🎨 Try a new, creative plan", _h("A")),
        ], "I", "R",
    ),
    _mcq(
        "Q04", SECTION_SLUG_RIASEC, "scenario", "school",
        "You get a difficult school assignment. How do you start?",
        [
            ("🔍 Break it into parts and understand each part", _h("I")),
            ("🗂 Follow clear steps, one by one", _h("C")),
            ("👥 Talk about it with classmates", _h("S")),
            ("🎨 Try my own different way", _h("A")),
        ], "I", "C",
    ),
    _mcq(
        "Q05", SECTION_SLUG_RIASEC, "creative_task", "hobby",
        "You have an idea in your mind. How do you like to share it?",
        [
            ("🎨 Through art, music, or a post/video", _h("A")),
            ("🗣 By talking to people", _h("S")),
            ("🧠 By thinking it through step by step", _h("I")),
            ("📋 By writing a clear plan or list", _h("C")),
        ], "A", "S",
    ),
    _mcq(
        "Q06", SECTION_SLUG_RIASEC, "scenario", "internet",
        "You want to do something online. What sounds most fun to you?",
        [
            ("🎨 Making creative posts or designs", _h("A")),
            ("📈 Growing followers or a small business", _h("E")),
            ("🔍 Reading data and finding what is trending", _h("I")),
            ("👥 Making a group or community", _h("S")),
        ], "A", "E",
    ),
    _mcq(
        "Q07", SECTION_SLUG_RIASEC, "scenario", "friends",
        "A friend looks sad or upset. What do you do?",
        [
            ("👥 Listen and support them", _h("S")),
            ("🎨 Do something fun or creative together", _h("A")),
            ("🔍 Try to find out why they feel that way", _h("I")),
            ("📋 Suggest clear steps they can follow", _h("C")),
        ], "S", "A",
    ),
    _mcq(
        "Q08", SECTION_SLUG_RIASEC, "role_choice", "school",
        "In a group project, which role fits you best?",
        [
            ("👥 Helping everyone and keeping the group together", _h("S")),
            ("📈 Leading and making decisions", _h("E")),
            ("🔍 Finding information and facts", _h("I")),
            ("🎨 Design, posters, or presentation look", _h("A")),
        ], "S", "E",
    ),
    _mcq(
        "Q09", SECTION_SLUG_RIASEC, "scenario", "daily_life",
        "School announces something new: a competition, club, trip, or event. What do you feel like doing?",
        [
            ("📈 Join quickly or offer to lead", _h("E")),
            ("👥 Talk to friends or teachers before I decide", _h("S")),
            ("🔍 Read all details first — good points and risks", _h("I")),
            ("🎨 Think of a new way to take part", _h("A")),
        ], "E", "S",
    ),
    _mcq(
        "Q10", SECTION_SLUG_RIASEC, "planning", "home",
        "You are organizing an event (fest, party, or school function). What do you focus on?",
        [
            ("📈 Lead the team and decide things", _h("E")),
            ("📋 Make a detailed plan — time, place, tasks", _h("C")),
            ("👥 Talk to everyone and match their work", _h("S")),
            ("🎨 Themes, decoration, and creative ideas", _h("A")),
        ], "E", "C",
    ),
    _mcq(
        "Q11", SECTION_SLUG_RIASEC, "scenario", "school",
        "You have many tasks (homework, chores, projects). What do you do first?",
        [
            ("📋 Make a list and order them", _h("C")),
            ("🔍 See which task is most important", _h("I")),
            ("👥 Ask someone for help", _h("S")),
            ("🎨 Start with the part I like most", _h("A")),
        ], "C", "I",
    ),
    _mcq(
        "Q12", SECTION_SLUG_RIASEC, "quick_pick", "daily_life",
        "What do you enjoy more?",
        [
            ("📋 Keeping things neat and in order", _h("C")),
            ("🛠 Repairing or building things", _h("R")),
            ("🔍 Learning how things work", _h("I")),
            ("👥 Helping people", _h("S")),
        ], "C", "R",
    ),

    # ── CORE TRAITS  (Q13-Q22, 2 questions per trait) ──────────────

    # curiosity (Q13-Q14)
    _mcq(
        "Q13", SECTION_SLUG_TRAITS, "scenario", "",
        "Something new comes — a new app, topic, or gadget. What do you do first?",
        [
            ("🔍 Read, watch videos, or search how it works", {"trait_curiosity": 5}),
            ("📋 Ignore it unless I need it", {"trait_curiosity": 1}),
            ("👥 Ask someone who knows", {"trait_curiosity": 3}),
            ("🎨 Try buttons and options without reading much", {"trait_curiosity": 4}),
        ],
        "curiosity",
    ),
    _mcq(
        "Q14", SECTION_SLUG_TRAITS, "quick_pick", "",
        "What makes you happiest?",
        [
            ("🔍 Learning how something works", {"trait_curiosity": 5}),
            ("📋 Finishing tasks on my list", {"trait_curiosity": 2}),
            ("👥 Listening to others' stories and ideas", {"trait_curiosity": 3}),
            ("🎨 Making or designing something new", {"trait_curiosity": 4}),
        ],
        "curiosity",
    ),

    # persistence (Q15-Q16)
    _mcq(
        "Q15", SECTION_SLUG_TRAITS, "scenario", "",
        "When work gets hard, what do you usually do?",
        [
            ("💪 Keep trying the same way until I get it", {"trait_persistence": 5}),
            ("📋 Change my method but still finish the work", {"trait_persistence": 4}),
            ("👥 Ask for help, then try again", {"trait_persistence": 2}),
            ("🎨 Leave it and do something else for some time", {"trait_persistence": 1}),
        ],
        "persistence",
    ),
    _mcq(
        "Q16", SECTION_SLUG_TRAITS, "scenario", "",
        "You have a long or boring task. You usually:",
        [
            ("💪 Keep going until it is finished", {"trait_persistence": 5}),
            ("📋 Cut it into small parts and do little by little", {"trait_persistence": 4}),
            ("👥 Do it with friends so it feels easier", {"trait_persistence": 3}),
            ("🎨 Do a part, then rest, then continue", {"trait_persistence": 2}),
        ],
        "persistence",
    ),

    # initiative (Q17-Q18)
    _mcq(
        "Q17", SECTION_SLUG_TRAITS, "scenario", "school",
        "You see something in school or class that should be better. What do you do?",
        [
            ("🚀 Start fixing it or speak up at once", {"trait_initiative": 5}),
            ("📋 Think of a plan, then act", {"trait_initiative": 4}),
            ("👥 Talk to others before doing anything", {"trait_initiative": 2}),
            ("🎨 First think of creative ideas", {"trait_initiative": 3}),
        ],
        "initiative",
    ),
    _mcq(
        "Q18", SECTION_SLUG_TRAITS, "role_choice", "daily_life",
        "In a new place or new group, you usually:",
        [
            ("🚀 Step forward and take the lead", {"trait_initiative": 5}),
            ("📋 Wait quietly and watch first", {"trait_initiative": 2}),
            ("👥 Follow what others do", {"trait_initiative": 1}),
            ("🎨 Look around and try things on my own", {"trait_initiative": 4}),
        ],
        "initiative",
    ),

    # empathy & teamwork (Q19-Q20)
    _mcq(
        "Q19", SECTION_SLUG_TRAITS, "scenario", "friends",
        "A teammate is stuck or slow. What do you do?",
        [
            ("👥 Help them and cheer them on", {"trait_empathy_teamwork": 5}),
            ("📋 Focus only on my own part", {"trait_empathy_teamwork": 1}),
            ("🔍 Try to find the reason for their problem", {"trait_empathy_teamwork": 3}),
            ("🎨 Encourage them in a fun way", {"trait_empathy_teamwork": 4}),
        ],
        "empathy_teamwork",
    ),
    _mcq(
        "Q20", SECTION_SLUG_TRAITS, "role_choice", "school",
        "In a group, you like to:",
        [
            ("👥 Work closely with everyone", {"trait_empathy_teamwork": 5}),
            ("📋 Work alone on my part", {"trait_empathy_teamwork": 1}),
            ("🔍 Be the one who checks facts and data", {"trait_empathy_teamwork": 2}),
            ("🎨 Bring fun and energy to the team", {"trait_empathy_teamwork": 4}),
        ],
        "empathy_teamwork",
    ),

    # planning & organization (Q21-Q22)
    _mcq(
        "Q21", SECTION_SLUG_TRAITS, "planning", "daily_life",
        "Many things are on your plate. What do you do?",
        [
            ("📋 Make a clear plan — what first, what later", {"trait_planning": 5}),
            ("🚀 Start the first thing I see", {"trait_planning": 3}),
            ("👥 Ask someone what I should do first", {"trait_planning": 2}),
            ("🎨 No fixed plan — I see as I go", {"trait_planning": 1}),
        ],
        "planning_organization",
    ),
    _mcq(
        "Q22", SECTION_SLUG_TRAITS, "scenario", "home",
        "How do you handle last dates for homework or projects?",
        [
            ("📋 Mark dates early and work step by step", {"trait_planning": 5}),
            ("🚀 Do most of it the night before", {"trait_planning": 1}),
            ("👥 Match timing with friends or group", {"trait_planning": 3}),
            ("🎨 Change my plan if something new comes", {"trait_planning": 2}),
        ],
        "planning_organization",
    ),

    # ── PERSONALITY  (Q23-Q30, 2 questions per dimension) ──────────

    # introversion / extroversion (Q23-Q24)
    _mcq(
        "Q23", SECTION_SLUG_PERSONALITY, "scenario", "friends",
        "After a long week, you prefer:",
        [
            ("🧘 Rest alone at home", {"personality_extroversion": 1}),
            ("🎉 Go out with many friends", {"personality_extroversion": 5}),
            ("👥 Meet a small group of close friends", {"personality_extroversion": 3}),
            ("🎨 Do a quiet creative hobby alone", {"personality_extroversion": 2}),
        ],
        "introversion_extroversion",
    ),
    _mcq(
        "Q24", SECTION_SLUG_PERSONALITY, "quick_pick", "daily_life",
        "What gives you more energy?",
        [
            ("🧘 Quiet time alone", {"personality_extroversion": 1}),
            ("🎉 Big parties or crowded events", {"personality_extroversion": 5}),
            ("👥 Deep talk with one or two people", {"personality_extroversion": 3}),
            ("🎨 Time for drawing, music, or writing", {"personality_extroversion": 2}),
        ],
        "introversion_extroversion",
    ),

    # risk-taking / cautious (Q25-Q26)
    _mcq(
        "Q25", SECTION_SLUG_PERSONALITY, "scenario", "daily_life",
        "You can try something where people may see you fail — speech on stage, hard competition, or a new sport. What do you do?",
        [
            ("🚀 Try it anyway", {"personality_risk_taking": 5}),
            ("📋 Think slowly and then decide", {"personality_risk_taking": 2}),
            ("👥 Ask friends or family first", {"personality_risk_taking": 3}),
            ("🛡️ Say no or choose the safest choice", {"personality_risk_taking": 1}),
        ],
        "risk_cautious",
    ),
    _mcq(
        "Q26", SECTION_SLUG_PERSONALITY, "scenario", "daily_life",
        "You saved ₹10,000. A friend asks you to put it in their business idea — you may double the money or lose it all. What do you do?",
        [
            ("🛡️ Put all of it in a safe bank FD", {"personality_risk_taking": 1}),
            ("⚖️ Put half in the idea, keep half safe", {"personality_risk_taking": 3}),
            ("🚀 Put all the money in — big risk, big gain", {"personality_risk_taking": 5}),
            ("🤝 Put money in and also help run the work", {"personality_risk_taking": 4}),
        ],
        "risk_cautious",
    ),

    # structure / flexibility (Q27-Q28)
    _mcq(
        "Q27", SECTION_SLUG_PERSONALITY, "scenario", "school",
        "For school projects and homework, what style do you like?",
        [
            ("📋 Clear steps, marking scheme, and last dates", {"personality_structure": 5}),
            ("🎨 Only a simple topic — I choose how to do it", {"personality_structure": 1}),
            ("👥 Clear roles for each person in the group", {"personality_structure": 3}),
            ("📚 A sample or format to copy, then I fill my part", {"personality_structure": 4}),
        ],
        "structure_flexibility",
    ),
    _mcq(
        "Q28", SECTION_SLUG_PERSONALITY, "planning", "daily_life",
        "Your normal day is more like:",
        [
            ("📋 Planned — I know what to do and when", {"personality_structure": 5}),
            ("🎨 No fixed plan — I decide on the spot", {"personality_structure": 1}),
            ("👥 Plans change with friends or family", {"personality_structure": 2}),
            ("📌 I do what is urgent or due soon", {"personality_structure": 4}),
        ],
        "structure_flexibility",
    ),

    # self-directed / externally-guided (Q29-Q30)
    _mcq(
        "Q29", SECTION_SLUG_PERSONALITY, "scenario", "school",
        "Teacher says: 'Choose your own topic and how to show it.' You:",
        [
            ("🚀 Choose topic and plan on my own — I don't wait", {"personality_self_direction": 5}),
            ("📋 Ask teacher for exact format and steps", {"personality_self_direction": 1}),
            ("👥 Ask teacher or friends before I start", {"personality_self_direction": 2}),
            ("🎨 Start trying ideas and change plan as I work", {"personality_self_direction": 4}),
        ],
        "self_directed_externally_guided",
    ),
    _mcq(
        "Q30", SECTION_SLUG_PERSONALITY, "role_choice", "daily_life",
        "A free Sunday — no homework, no one ordering you. You like to:",
        [
            ("🚀 Make my own plan for the day", {"personality_self_direction": 5}),
            ("📋 Follow a routine (mine or parents')", {"personality_self_direction": 1}),
            ("👥 Do what friends or family suggest", {"personality_self_direction": 2}),
            ("🎨 Try a few things — no strict plan", {"personality_self_direction": 4}),
        ],
        "self_directed_externally_guided",
    ),
]
