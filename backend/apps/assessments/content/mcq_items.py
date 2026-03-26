"""
30-question career MCQ: RIASEC (Q01–Q12), five core traits (Q13–Q22),
basic personality (Q23–Q30). Option weights use legacy interest slugs for
career matching (quiz path) and feed game scenario scoring (mapped to traits).
"""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

SECTION_SLUG_RIASEC = "riasec-interests"
SECTION_SLUG_TRAITS = "work-traits"
SECTION_SLUG_PERSONALITY = "work-personality"


def _h(code: str) -> Dict[str, int]:
    holland = {
        "R": {"technical": 5},
        "I": {"analytical": 5, "scientific": 3},
        "A": {"creative": 5},
        "S": {"social": 5, "verbal": 3},
        "E": {"verbal": 5, "organizational": 4},
        "C": {"organizational": 5, "analytical": 3},
    }
    return dict(holland[code])


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


MCQ_ITEMS: List[Dict[str, Any]] = [
    _mcq(
        "Q01", SECTION_SLUG_RIASEC, "scenario", "home",
        "Your ceiling fan suddenly stops working. What's your first move?",
        [
            ("🔧 Open it up and check the wires myself", _h("R")),
            ("🔍 Search online for what could be wrong", _h("I")),
            ("📞 Call someone who knows how to fix things", _h("S")),
            ("💡 Think of a different way to cool the room",
             {"creative": 4, "verbal": 4, "organizational": 4}),
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
        "You’re playing a strategy game and something isn’t working as expected. What do you do?",
        [
            ("🔍 Analyze the pattern to figure out the logic", _h("I")),
            ("🛠 Try random actions until something works", _h("R")),
            ("👥 Ask teammates for ideas", _h("S")),
            ("🎨 Change the strategy creatively", _h("A")),
        ], "I", "R",
    ),
    _mcq(
        "Q04", SECTION_SLUG_RIASEC, "scenario", "school",
        "You’re given a complex assignment. How do you approach it?",
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
        "You’re organizing an event. What’s your approach?",
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
    _mcq(
        "Q13", SECTION_SLUG_TRAITS, "scenario", "",
        "You encounter something new. What do you do?",
        [
            ("🔍 Explore it deeply", {"analytical": 5, "scientific": 4, "creative": 3}),
            ("📋 Ignore unless needed", {"analytical": 2, "organizational": 3}),
            ("👥 Ask someone", {"social": 4, "analytical": 4, "verbal": 3}),
            ("🎨 Try creatively", {"creative": 5, "analytical": 3}),
        ],
        "curiosity",
    ),
    _mcq(
        "Q14", SECTION_SLUG_TRAITS, "quick_pick", "",
        "What excites you most?",
        [
            ("🔍 Learning new things", {"analytical": 5, "scientific": 4}),
            ("📋 Completing tasks", {"organizational": 5, "analytical": 3}),
            ("👥 Talking to people", {"social": 5, "verbal": 4}),
            ("🎨 Creating things", {"creative": 5}),
        ],
        "curiosity",
    ),
    _mcq(
        "Q15", SECTION_SLUG_TRAITS, "scenario", "",
        "When things get tough?",
        [
            ("💪 Keep trying", {"organizational": 5, "analytical": 4}),
            ("📋 Change plan", {"organizational": 4, "analytical": 4}),
            ("👥 Ask for help", {"social": 4, "organizational": 3}),
            ("🎨 Do something else", {"creative": 4, "analytical": 3}),
        ],
        "persistence",
    ),
    _mcq(
        "Q16", SECTION_SLUG_TRAITS, "scenario", "",
        "Long task?",
        [
            ("💪 Finish it no matter what", {"organizational": 5, "analytical": 3}),
            ("📋 Break into steps", {"organizational": 5, "analytical": 4}),
            ("👥 Work with others", {"social": 5, "organizational": 3}),
            ("🎨 Take breaks", {"creative": 3, "social": 3, "analytical": 3}),
        ],
        "persistence",
    ),
    _mcq(
        "Q17", SECTION_SLUG_TRAITS, "scenario", "school",
        "You see something that needs improvement. What do you do?",
        [
            ("🚀 Take action immediately", {"organizational": 5, "verbal": 4}),
            ("📋 Plan before acting", {"organizational": 5, "analytical": 4}),
            ("👥 Discuss with others", {"social": 5, "verbal": 3}),
            ("🎨 Think of creative ideas first", {"creative": 5, "analytical": 3}),
        ],
        "initiative",
    ),
    _mcq(
        "Q18", SECTION_SLUG_TRAITS, "role_choice", "daily_life",
        "In a new situation, you usually:",
        [
            ("🚀 Take the lead", {"verbal": 5, "organizational": 4}),
            ("📋 Wait and observe", {"analytical": 5, "organizational": 3}),
            ("👥 Follow others", {"social": 4, "organizational": 3}),
            ("🎨 Explore freely", {"creative": 5, "analytical": 3}),
        ],
        "initiative",
    ),
    _mcq(
        "Q19", SECTION_SLUG_TRAITS, "scenario", "friends",
        "Your team member is struggling. What do you do?",
        [
            ("👥 Help and support them", {"social": 5, "verbal": 3}),
            ("📋 Focus on your own task", {"analytical": 4, "organizational": 3}),
            ("🔍 Analyze their problem", {"analytical": 5, "scientific": 3}),
            ("🎨 Motivate in a fun way", {"creative": 4, "social": 4}),
        ],
        "empathy_teamwork",
    ),
    _mcq(
        "Q20", SECTION_SLUG_TRAITS, "role_choice", "school",
        "In a group, you prefer to:",
        [
            ("👥 Collaborate closely", {"social": 5, "verbal": 4}),
            ("📋 Work independently", {"analytical": 4, "organizational": 3}),
            ("🔍 Take analytical role", {"analytical": 5, "scientific": 3}),
            ("🎨 Bring energy/fun", {"creative": 5, "social": 4}),
        ],
        "empathy_teamwork",
    ),
    _mcq(
        "Q21", SECTION_SLUG_TRAITS, "planning", "daily_life",
        "You have multiple things to do. What’s your approach?",
        [
            ("📋 Plan everything clearly", {"organizational": 5, "analytical": 3}),
            ("🚀 Start immediately", {"organizational": 4, "analytical": 3}),
            ("👥 Ask others", {"social": 4, "organizational": 3}),
            ("🎨 Go with the flow", {"creative": 4, "organizational": 2}),
        ],
        "planning_organization",
    ),
    _mcq(
        "Q22", SECTION_SLUG_TRAITS, "scenario", "home",
        "How do you manage deadlines?",
        [
            ("📋 Schedule in advance", {"organizational": 5, "analytical": 3}),
            ("🚀 Work last minute", {"creative": 4, "analytical": 3, "organizational": 3}),
            ("👥 Coordinate with others", {"social": 4, "organizational": 3}),
            ("🎨 Adjust dynamically", {"creative": 4, "analytical": 4}),
        ],
        "planning_organization",
    ),
    _mcq(
        "Q23", SECTION_SLUG_PERSONALITY, "scenario", "friends",
        "After a long week, you prefer:",
        [
            ("🧘 Spend time alone", {"analytical": 4, "creative": 4}),
            ("🎉 Go out with friends", {"social": 5, "verbal": 5}),
            ("👥 Small group hangout", {"social": 4, "verbal": 3}),
            ("🎨 Do something creative alone", {"creative": 5, "analytical": 3}),
        ],
        "introversion_extroversion",
    ),
    _mcq(
        "Q24", SECTION_SLUG_PERSONALITY, "quick_pick", "daily_life",
        "What energizes you more?",
        [
            ("🧘 Alone time", {"analytical": 4, "creative": 3}),
            ("🎉 Social gatherings", {"social": 5, "verbal": 5}),
            ("👥 Meaningful conversations", {"social": 4, "verbal": 4}),
            ("🎨 Creative time", {"creative": 5, "analytical": 3}),
        ],
        "introversion_extroversion",
    ),
    _mcq(
        "Q25", SECTION_SLUG_PERSONALITY, "scenario", "daily_life",
        "You get a risky opportunity. What do you do?",
        [
            ("🚀 Take the risk", {"creative": 4, "organizational": 4, "analytical": 3}),
            ("📋 Evaluate carefully", {"analytical": 5, "organizational": 4}),
            ("👥 Ask others", {"social": 4, "analytical": 3}),
            ("🎨 Try a safe variation", {"analytical": 4, "creative": 3, "organizational": 3}),
        ],
        "risk_cautious",
    ),
    _mcq(
        "Q26", SECTION_SLUG_PERSONALITY, "quick_pick", "game",
        "In games, you prefer:",
        [
            ("🚀 Aggressive strategy", {"creative": 4, "organizational": 3}),
            ("📋 Safe strategy", {"analytical": 5, "organizational": 4}),
            ("👥 Team-based play", {"social": 5, "organizational": 3}),
            ("🎨 Creative moves", {"creative": 5, "analytical": 3}),
        ],
        "risk_cautious",
    ),
    _mcq(
        "Q27", SECTION_SLUG_PERSONALITY, "scenario", "school",
        "How do you like your work?",
        [
            ("📋 Structured and clear", {"organizational": 5, "analytical": 3}),
            ("🎨 Flexible and open", {"creative": 5, "analytical": 3}),
            ("👥 Collaborative", {"social": 5, "organizational": 3}),
            ("🔍 Analytical", {"analytical": 5, "scientific": 3}),
        ],
        "structure_flexibility",
    ),
    _mcq(
        "Q28", SECTION_SLUG_PERSONALITY, "planning", "daily_life",
        "Your daily routine is:",
        [
            ("📋 Planned", {"organizational": 5}),
            ("🎨 Spontaneous", {"creative": 5, "analytical": 3}),
            ("👥 Socially driven", {"social": 5, "verbal": 3}),
            ("🔍 Task-based", {"analytical": 5, "organizational": 4}),
        ],
        "structure_flexibility",
    ),
    _mcq(
        "Q29", SECTION_SLUG_PERSONALITY, "scenario", "school",
        "When given freedom, you:",
        [
            ("🚀 Set your own direction", {"analytical": 4, "organizational": 4, "creative": 3}),
            ("📋 Follow instructions", {"organizational": 5, "analytical": 3}),
            ("👥 Ask for guidance", {"social": 4, "organizational": 3}),
            ("🎨 Explore freely", {"creative": 5, "analytical": 3}),
        ],
        "self_directed_externally_guided",
    ),
    _mcq(
        "Q30", SECTION_SLUG_PERSONALITY, "role_choice", "daily_life",
        "In general, you prefer:",
        [
            ("🚀 Making your own decisions", {"analytical": 4, "organizational": 4, "verbal": 3}),
            ("📋 Following clear rules", {"organizational": 5, "analytical": 3}),
            ("👥 Getting advice", {"social": 4, "verbal": 4, "analytical": 3}),
            ("🎨 Trying different paths", {"creative": 5, "analytical": 3}),
        ],
        "self_directed_externally_guided",
    ),
]
