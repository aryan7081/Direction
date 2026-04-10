"""
Phase 1 (30) + Phase 2 (48) psychometric MCQs.

Response scale for interest/personality/values/readiness Likert items:
  Very interested / Strongly agree → 4
  Interested / Agree → 3
  Slightly interested → 2
  Not interested / Disagree → 1

Aptitude: selected option marks 1 for correct subtest key, 0 otherwise (aggregated to 0–1).

Scenario items (Phase 2 only, end of flow): contributions are pre-multiplied by 0.4
(standard scenario weight) in the option dicts.
"""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

SECTION_RIASEC = "riasec-interests"
SECTION_PERSONALITY = "work-personality"
SECTION_VALUES = "values"
SECTION_READINESS = "readiness"
SECTION_APTITUDE = "aptitude"
SECTION_SCENARIO = "behavioral-scenarios"

_RIASEC_KEYS = ("R", "I", "A", "S", "E", "C")
_RIASEC_SLUG = {
    "R": "riasec_realistic",
    "I": "riasec_investigative",
    "A": "riasec_artistic",
    "S": "riasec_social",
    "E": "riasec_enterprising",
    "C": "riasec_conventional",
}


def _likert4(dim: str) -> List[Tuple[str, Dict[str, int]]]:
    return [
        ("Very interested", {dim: 4}),
        ("Interested", {dim: 3}),
        ("Slightly interested", {dim: 2}),
        ("Not interested", {dim: 1}),
    ]


def _agree4(dim: str) -> List[Tuple[str, Dict[str, int]]]:
    """Personality / values style agree scale."""
    return [
        ("Strongly agree", {dim: 4}),
        ("Agree", {dim: 3}),
        ("Slightly agree", {dim: 2}),
        ("Disagree", {dim: 1}),
    ]


def _item(
    code: str,
    section_slug: str,
    format_: str,
    context: str,
    text: str,
    options: List[Tuple[str, Dict[str, int]]],
    *,
    primary_focus: str = "",
    premium_only: bool = False,
    scenario_behavioral: bool = False,
    aptitude_subtest: str | None = None,
    correct_option_index: int | None = None,
    show_scenario_intro_before: bool = False,
) -> Dict[str, Any]:
    meta: Dict[str, Any] = {
        "code": code,
        "format": format_,
        "context": context,
        "section": section_slug.split("-")[0],
    }
    if primary_focus:
        meta["primary_focus"] = primary_focus
    if scenario_behavioral:
        meta["scenario_behavioral"] = True
    if aptitude_subtest:
        meta["aptitude_subtest"] = aptitude_subtest
    if correct_option_index is not None:
        meta["correct_option_index"] = correct_option_index
    if show_scenario_intro_before:
        meta["show_scenario_intro_before"] = True
    row: Dict[str, Any] = {
        "code": code,
        "section_category_slug": section_slug,
        "text": text,
        "metadata": meta,
        "options": options,
    }
    if premium_only:
        row["premium_only"] = True
        meta["premium_only"] = True
    return row


def _apt_options(
    labels: List[str], correct_idx: int, subtest: str
) -> List[Tuple[str, Dict[str, int]]]:
    out: List[Tuple[str, Dict[str, int]]] = []
    for i, lab in enumerate(labels):
        if i == correct_idx:
            out.append((lab, {f"aptitude_{subtest}": 1}))
        else:
            out.append((lab, {}))
    return out


def _sw(contribs: Dict[str, float]) -> Dict[str, int]:
    """Scenario weights: store as int milli-units to keep MCQ dict int-compatible."""
    return {k: int(round(v * 1000)) for k, v in contribs.items()}


def _scenario_mcq(
    code: str,
    text: str,
    opts: List[Tuple[str, Dict[str, float]]],
) -> Dict[str, Any]:
    """Scenario options: float contributions → int millis; pre-weighted by 0.4 in contribs."""
    options = [(lab, _sw(cw)) for lab, cw in opts]
    return _item(
        code,
        SECTION_SCENARIO,
        "scenario",
        "school",
        text,
        options,
        scenario_behavioral=True,
        primary_focus="behavioral_scenario",
        premium_only=True,
    )


# ── Phase 1 (30) ────────────────────────────────────────────────────

def _phase1_riasec() -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    triples = {
        "R": [
            "I enjoy fixing or assembling things like gadgets, cycles, or furniture.",
            "I enjoy making or building things (like school projects, DIY items, or simple working ideas).",
            "I prefer work that involves physical activity rather than sitting all the time.",
        ],
        "I": [
            "I enjoy learning science subjects like Physics, Chemistry, or Biology.",
            "I like doing experiments or finding out how things work.",
            "I like using science to solve real-world problems.",
        ],
        "A": [
            "I enjoy designing posters, logos, or presentations.",
            "I like creating videos, graphics, or digital content.",
            "I enjoy drawing, painting, or other creative activities.",
        ],
        "S": [
            "I enjoy helping people solve their everyday problems.",
            "I like helping people in emergency or difficult situations.",
            "I enjoy teaching or helping someone learn something new.",
        ],
        "E": [
            "I like taking leadership roles in school activities.",
            "I am interested in business or earning money through ideas.",
            "I enjoy promoting or selling something.",
        ],
        "C": [
            "I enjoy working with numbers.",
            "I like organizing tasks, lists, or information.",
            "I am interested in managing data or accounts.",
        ],
    }
    n = 1
    for letter in _RIASEC_KEYS:
        slug = _RIASEC_SLUG[letter]
        for t in triples[letter]:
            code = f"P1_{letter}{n}"
            items.append(
                _item(
                    code,
                    SECTION_RIASEC,
                    "quick_pick",
                    "career",
                    t,
                    _likert4(slug),
                    primary_focus=slug,
                )
            )
            n += 1
        n = 1
    return items


MCQ_ITEMS: List[Dict[str, Any]] = (
    _phase1_riasec()
    + [
        _item(
            "P1_PE1",
            SECTION_PERSONALITY,
            "quick_pick",
            "self",
            "I enjoy meeting new people.",
            _agree4("personality_E"),
            primary_focus="extraversion",
        ),
        _item(
            "P1_PE2",
            SECTION_PERSONALITY,
            "quick_pick",
            "self",
            "I feel confident speaking in front of others.",
            _agree4("personality_E"),
            primary_focus="extraversion",
        ),
        _item(
            "P1_PC1",
            SECTION_PERSONALITY,
            "quick_pick",
            "self",
            "I complete my work on time.",
            _agree4("personality_C"),
            primary_focus="conscientiousness",
        ),
        _item(
            "P1_PC2",
            SECTION_PERSONALITY,
            "quick_pick",
            "self",
            "I plan my tasks before starting.",
            _agree4("personality_C"),
            primary_focus="conscientiousness",
        ),
        _item(
            "P1_PO1",
            SECTION_PERSONALITY,
            "quick_pick",
            "self",
            "I enjoy learning new things.",
            _agree4("personality_O"),
            primary_focus="openness",
        ),
        _item(
            "P1_PO2",
            SECTION_PERSONALITY,
            "quick_pick",
            "self",
            "I like trying new ideas and approaches.",
            _agree4("personality_O"),
            primary_focus="openness",
        ),
        _item(
            "P1_V1",
            SECTION_VALUES,
            "quick_pick",
            "values",
            "Earning a good income in the future is important to me.",
            _agree4("values_money"),
            primary_focus="values_money",
        ),
        _item(
            "P1_V2",
            SECTION_VALUES,
            "quick_pick",
            "values",
            "I want a career where I can help people.",
            _agree4("values_impact"),
            primary_focus="values_impact",
        ),
        _item(
            "P1_V3",
            SECTION_VALUES,
            "quick_pick",
            "values",
            "I prefer a stable and secure job (like a government job).",
            _agree4("values_security"),
            primary_focus="values_security",
        ),
        _item(
            "P1_RY1",
            SECTION_READINESS,
            "quick_pick",
            "future",
            "I actively try to find information about different careers (online, videos, or asking others).",
            _agree4("readiness"),
            primary_focus="readiness",
        ),
        _item(
            "P1_NR1",
            SECTION_APTITUDE,
            "puzzle",
            "numerical",
            "15 × 6 = ?",
            _apt_options(["90", "80", "95", "85"], 0, "numerical"),
            primary_focus="numerical",
            aptitude_subtest="numerical",
            correct_option_index=0,
        ),
        _item(
            "P1_AR1",
            SECTION_APTITUDE,
            "puzzle",
            "abstract",
            "2, 4, 8, 16, ?",
            _apt_options(["18", "24", "32", "30"], 2, "abstract"),
            primary_focus="abstract",
            aptitude_subtest="abstract",
            correct_option_index=2,
        ),
    ]
)


# ── Phase 2 (48) premium ────────────────────────────────────────────

def _phase2_riasec() -> List[Dict[str, Any]]:
    pairs = [
        (
            "R",
            "I am interested in learning practical technical skills (like working with machines, tools, or hardware).",
            "I prefer hands-on work in real environments rather than only sitting and studying.",
        ),
        (
            "I",
            'I enjoy understanding how things work and finding answers to "why" and "how" questions.',
            "I like understanding how people think and behave.",
        ),
        (
            "A",
            "I enjoy designing ideas for apps, websites, or games.",
            "I like reviewing or giving opinions on art, music, or movies.",
        ),
        (
            "S",
            "I enjoy teaching or explaining things to a group.",
            "I enjoy supporting others and being someone people can rely on.",
        ),
        (
            "E",
            "I like motivating others to do better.",
            "I enjoy guiding or managing a team.",
        ),
        (
            "C",
            "I like maintaining records or organizing data.",
            "I prefer following clear steps to complete tasks.",
        ),
    ]
    items: List[Dict[str, Any]] = []
    for letter, a, b in pairs:
        slug = _RIASEC_SLUG[letter]
        # Avoid P2_S1/P2_S2 — those codes are reserved for behavioral scenarios (P2_S1…P2_S6).
        letter_key = "SO" if letter == "S" else letter
        for i, t in enumerate((a, b), 1):
            code = f"P2_{letter_key}{i}"
            items.append(
                _item(
                    code,
                    SECTION_RIASEC,
                    "quick_pick",
                    "career",
                    t,
                    _likert4(slug),
                    primary_focus=slug,
                    premium_only=True,
                )
            )
    return items


PREMIUM_MCQ_ITEMS: List[Dict[str, Any]] = (
    _phase2_riasec()
    + [
        _item("P2_PE1", SECTION_PERSONALITY, "quick_pick", "self", "I enjoy being the center of attention.", _agree4("personality_E"), premium_only=True),
        _item("P2_PE2", SECTION_PERSONALITY, "quick_pick", "self", "I like participating in group discussions.", _agree4("personality_E"), premium_only=True),
        _item("P2_PA1", SECTION_PERSONALITY, "quick_pick", "self", "I try to avoid conflicts.", _agree4("personality_A"), premium_only=True),
        _item("P2_PA2", SECTION_PERSONALITY, "quick_pick", "self", "I help others even when I am busy.", _agree4("personality_A"), premium_only=True),
        _item("P2_PC1", SECTION_PERSONALITY, "quick_pick", "self", "I pay attention to small details.", _agree4("personality_C"), premium_only=True),
        _item("P2_PC2", SECTION_PERSONALITY, "quick_pick", "self", "I stay disciplined without reminders.", _agree4("personality_C"), premium_only=True),
        _item("P2_PES1", SECTION_PERSONALITY, "quick_pick", "self", "I stay calm in stressful situations.", _agree4("personality_ES"), premium_only=True),
        _item("P2_PES2", SECTION_PERSONALITY, "quick_pick", "self", "I recover quickly after failure.", _agree4("personality_ES"), premium_only=True),
        _item("P2_PO1", SECTION_PERSONALITY, "quick_pick", "self", "I enjoy thinking creatively.", _agree4("personality_O"), premium_only=True),
        _item("P2_V1", SECTION_VALUES, "quick_pick", "values", "I want a career where I can keep learning new things.", _agree4("values_growth"), premium_only=True),
        _item("P2_V2", SECTION_VALUES, "quick_pick", "values", "I want freedom to make my own decisions at work.", _agree4("values_creativity"), premium_only=True),
        _item(
            "P2_V3",
            SECTION_VALUES,
            "quick_pick",
            "values",
            "I want a career that is respected in society (like doctor, engineer, civil services, etc.).",
            _agree4("values_impact"),
            premium_only=True,
        ),
        _item("P2_V4", SECTION_VALUES, "quick_pick", "values", "Work-life balance is important to me.", _agree4("values_balance"), premium_only=True),
        _item("P2_V5", SECTION_VALUES, "quick_pick", "values", "I enjoy taking on challenging goals.", _agree4("values_growth"), premium_only=True),
        _item("P2_V6", SECTION_VALUES, "quick_pick", "values", "I want to make a positive impact on society.", _agree4("values_impact"), premium_only=True),
        _item("P2_V7", SECTION_VALUES, "quick_pick", "values", "I prefer earning based on my performance.", _agree4("values_money"), premium_only=True),
        _item(
            "P2_RY1",
            SECTION_READINESS,
            "quick_pick",
            "future",
            "I actively search for information about careers (online, YouTube, etc.).",
            _agree4("readiness"),
            premium_only=True,
        ),
        _item("P2_RY2", SECTION_READINESS, "quick_pick", "future", "I have discussed career options with parents or teachers.", _agree4("readiness"), premium_only=True),
        _item("P2_RY3", SECTION_READINESS, "quick_pick", "future", "I know which subjects I am strong in.", _agree4("readiness"), premium_only=True),
        _item(
            "P2_RY4",
            SECTION_READINESS,
            "quick_pick",
            "future",
            "I have started thinking about which stream to choose (Science, Commerce, Arts).",
            _agree4("readiness"),
            premium_only=True,
        ),
        _item(
            "P2_VR1",
            SECTION_APTITUDE,
            "quick_pick",
            "verbal",
            "Antonym of Happy — choose the correct answer.",
            _apt_options(["Sad", "Joyful", "Calm", "Fast"], 0, "verbal"),
            premium_only=True,
            aptitude_subtest="verbal",
            correct_option_index=0,
        ),
        _item(
            "P2_VR2",
            SECTION_APTITUDE,
            "quick_pick",
            "verbal",
            "Which sentence is grammatically correct?",
            _apt_options(["She go to school.", "She goes to school.", "She going school.", "She school go."], 1, "verbal"),
            premium_only=True,
            aptitude_subtest="verbal",
            correct_option_index=1,
        ),
        _item(
            "P2_VR3",
            SECTION_APTITUDE,
            "quick_pick",
            "verbal",
            "Synonym of Difficult — choose the correct answer.",
            _apt_options(["Easy", "Hard", "Quick", "Small"], 1, "verbal"),
            premium_only=True,
            aptitude_subtest="verbal",
            correct_option_index=1,
        ),
        _item(
            "P2_NR1",
            SECTION_APTITUDE,
            "puzzle",
            "numerical",
            "What is 20% of 150?",
            _apt_options(["20", "30", "45", "35"], 1, "numerical"),
            premium_only=True,
            aptitude_subtest="numerical",
            correct_option_index=1,
        ),
        _item(
            "P2_NR2",
            SECTION_APTITUDE,
            "puzzle",
            "numerical",
            "45 ÷ 5 = ?",
            _apt_options(["7", "8", "9", "10"], 2, "numerical"),
            premium_only=True,
            aptitude_subtest="numerical",
            correct_option_index=2,
        ),
        _item(
            "P2_NR3",
            SECTION_APTITUDE,
            "puzzle",
            "numerical",
            "If x = 5, what is 2x + 3?",
            _apt_options(["10", "11", "13", "15"], 2, "numerical"),
            premium_only=True,
            aptitude_subtest="numerical",
            correct_option_index=2,
        ),
        _item(
            "P2_AR1",
            SECTION_APTITUDE,
            "puzzle",
            "abstract",
            "3, 6, 12, 24, ?",
            _apt_options(["30", "36", "48", "40"], 2, "abstract"),
            premium_only=True,
            aptitude_subtest="abstract",
            correct_option_index=2,
        ),
        _item(
            "P2_AR2",
            SECTION_APTITUDE,
            "puzzle",
            "abstract",
            "Complete the pattern: 1, 4, 9, 16, ?",
            _apt_options(["20", "24", "25", "30"], 2, "abstract"),
            premium_only=True,
            aptitude_subtest="abstract",
            correct_option_index=2,
        ),
        _item(
            "P2_SR1",
            SECTION_APTITUDE,
            "quick_pick",
            "spatial",
            "If you rotate the letter 'L' 90° clockwise, which shape looks most like the result?",
            _apt_options(["┘", "└", "┌", "┐"], 0, "spatial"),
            premium_only=True,
            aptitude_subtest="spatial",
            correct_option_index=0,
        ),
        _item(
            "P2_SR2",
            SECTION_APTITUDE,
            "quick_pick",
            "spatial",
            "Which 2D net can fold into a closed cube (all sides equal)?",
            _apt_options(
                [
                    "Six squares in a cross shape",
                    "Four squares in a line",
                    "Two squares only",
                    "Five squares in an L",
                ],
                0,
                "spatial",
            ),
            premium_only=True,
            aptitude_subtest="spatial",
            correct_option_index=0,
        ),
    ]
    + [
        _scenario_mcq(
            "P2_S1",
            "When working on a school group project, what do you usually do?",
            [
                ("Take the lead and guide everyone", {"riasec_enterprising": 0.5 * 0.4, "personality_E": 0.3 * 0.4}),
                ("Help teammates and support them", {"riasec_social": 0.5 * 0.4, "personality_A": 0.3 * 0.4}),
                ("Organize tasks and ensure everything is completed on time", {"personality_C": 0.5 * 0.4}),
                ("Suggest creative ideas and new approaches", {"riasec_artistic": 0.5 * 0.4, "personality_O": 0.3 * 0.4}),
            ],
        ),
        _scenario_mcq(
            "P2_S2",
            "Which activity do you enjoy the MOST in your free time?",
            [
                ("Fix or build things", {"riasec_realistic": 0.5 * 0.4}),
                ("Watch science or learning-based videos", {"riasec_investigative": 0.5 * 0.4}),
                ("Create designs, videos, or creative content", {"riasec_artistic": 0.5 * 0.4}),
                ("Spend time talking or hanging out with people", {"riasec_social": 0.5 * 0.4}),
            ],
        ),
        _scenario_mcq(
            "P2_S3",
            "In a competition, what matters most to you?",
            [
                ("Winning and leading others", {"riasec_enterprising": 0.5 * 0.4}),
                ("Learning something new", {"personality_O": 0.5 * 0.4}),
                ("Supporting your team", {"personality_A": 0.5 * 0.4}),
                ("Planning strategy and execution", {"personality_C": 0.5 * 0.4}),
            ],
        ),
        _scenario_mcq(
            "P2_S4",
            "When thinking about your future career, what matters most?",
            [
                ("High income", {"values_money": 0.5 * 0.4}),
                ("Helping people", {"values_impact": 0.5 * 0.4}),
                ("Job security", {"values_security": 0.5 * 0.4}),
                ("Creative work", {"values_creativity": 0.5 * 0.4}),
            ],
        ),
        _scenario_mcq(
            "P2_S5",
            "When you feel stressed (like during exams), what do you do?",
            [
                ("Stay calm and handle it step by step", {"personality_ES": 0.5 * 0.4}),
                ("Ask others for help", {"riasec_social": 0.5 * 0.4}),
                ("Make a clear plan", {"personality_C": 0.5 * 0.4}),
                ("Try a different approach", {"personality_O": 0.5 * 0.4}),
            ],
        ),
        _scenario_mcq(
            "P2_S6",
            "You get an exciting but risky opportunity. What do you do?",
            [
                ("Take the risk and go for it", {"riasec_enterprising": 0.5 * 0.4}),
                ("Analyze all details carefully", {"riasec_investigative": 0.5 * 0.4}),
                ("Ask others for advice", {"riasec_social": 0.5 * 0.4}),
                ("Choose the safer option", {"riasec_conventional": 0.5 * 0.4}),
            ],
        ),
    ]
)

# Mark first scenario with intro flag
for it in PREMIUM_MCQ_ITEMS:
    if it.get("metadata", {}).get("scenario_behavioral") and it["code"] == "P2_S1":
        it["metadata"]["show_scenario_intro_before"] = True
        break

ALL_MCQ_ITEMS: List[Dict[str, Any]] = MCQ_ITEMS + PREMIUM_MCQ_ITEMS
