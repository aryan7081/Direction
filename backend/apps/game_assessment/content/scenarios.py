"""
Scenario Section — 10 situational questions.
Each option carries weighted trait signals.
Primarily measures: creativity_innovation, verbal_communication, social_orientation.
Also contributes to: analytical_reasoning, leadership_drive, risk_appetite.
"""

SCENARIO_QUESTIONS = [
    {
        "id": "sc_1",
        "prompt": (
            "Your class has to present on climate change. "
            "How would you make it stand out?"
        ),
        "options": [
            {
                "id": "sc1a",
                "text": "Use vivid storytelling with real examples",
                "weights": {"verbal_communication": 0.9, "creativity_innovation": 0.6},
            },
            {
                "id": "sc1b",
                "text": "Create an interactive quiz for the audience",
                "weights": {"creativity_innovation": 0.9, "social_orientation": 0.5},
            },
            {
                "id": "sc1c",
                "text": "Present data charts with clear analysis",
                "weights": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.5},
            },
            {
                "id": "sc1d",
                "text": "Organize a group skit to act out the effects",
                "weights": {"leadership_drive": 0.6, "creativity_innovation": 0.8, "social_orientation": 0.6},
            },
        ],
    },
    {
        "id": "sc_2",
        "prompt": (
            "A younger student asks you for advice on dealing with exam stress. "
            "What do you say?"
        ),
        "options": [
            {
                "id": "sc2a",
                "text": "Share a study timetable that worked for you",
                "weights": {"structure_discipline": 0.8, "social_orientation": 0.4},
            },
            {
                "id": "sc2b",
                "text": "Tell them it's okay to feel stressed and listen",
                "weights": {"social_orientation": 0.9, "verbal_communication": 0.6},
            },
            {
                "id": "sc2c",
                "text": "Suggest fun techniques like mind maps and flashcards",
                "weights": {"creativity_innovation": 0.7, "social_orientation": 0.5},
            },
            {
                "id": "sc2d",
                "text": "Encourage them to focus on understanding, not marks",
                "weights": {"analytical_reasoning": 0.5, "verbal_communication": 0.7},
            },
        ],
    },
    {
        "id": "sc_3",
        "prompt": (
            "You find a wallet with ₹5,000 and an ID card on the school ground. "
            "What's your first move?"
        ),
        "options": [
            {
                "id": "sc3a",
                "text": "Hand it to the school office immediately",
                "weights": {"structure_discipline": 0.9, "social_orientation": 0.3},
            },
            {
                "id": "sc3b",
                "text": "Try to find the person using the ID yourself",
                "weights": {"leadership_drive": 0.6, "risk_appetite": 0.4, "social_orientation": 0.7},
            },
            {
                "id": "sc3c",
                "text": "Post about it on the school group chat",
                "weights": {"creativity_innovation": 0.4, "social_orientation": 0.6, "verbal_communication": 0.5},
            },
            {
                "id": "sc3d",
                "text": "Keep it safe and wait — they'll probably come looking",
                "weights": {"risk_appetite": 0.2, "structure_discipline": 0.5},
            },
        ],
    },
    {
        "id": "sc_4",
        "prompt": (
            "Your school is organizing a talent show. "
            "You're not sure what to perform. What do you do?"
        ),
        "options": [
            {
                "id": "sc4a",
                "text": "Try something completely new — maybe a magic act",
                "weights": {"risk_appetite": 0.8, "creativity_innovation": 0.9},
            },
            {
                "id": "sc4b",
                "text": "Perform a song you know well",
                "weights": {"structure_discipline": 0.5, "verbal_communication": 0.6},
            },
            {
                "id": "sc4c",
                "text": "Form a group act with friends",
                "weights": {"social_orientation": 0.8, "leadership_drive": 0.4},
            },
            {
                "id": "sc4d",
                "text": "Help organize backstage instead of performing",
                "weights": {"structure_discipline": 0.7, "leadership_drive": 0.5},
            },
        ],
    },
    {
        "id": "sc_5",
        "prompt": (
            "Your team is losing a cricket match badly at half time. "
            "As a team member, what do you do?"
        ),
        "options": [
            {
                "id": "sc5a",
                "text": "Analyze what went wrong and suggest a new strategy",
                "weights": {"analytical_reasoning": 0.8, "leadership_drive": 0.6},
            },
            {
                "id": "sc5b",
                "text": "Motivate everyone — keep spirits high",
                "weights": {"social_orientation": 0.7, "leadership_drive": 0.7, "verbal_communication": 0.5},
            },
            {
                "id": "sc5c",
                "text": "Focus on your own game — lead by example",
                "weights": {"structure_discipline": 0.6, "risk_appetite": 0.4},
            },
            {
                "id": "sc5d",
                "text": "Propose a bold, risky play to turn things around",
                "weights": {"risk_appetite": 0.9, "creativity_innovation": 0.6, "leadership_drive": 0.5},
            },
        ],
    },
    {
        "id": "sc_6",
        "prompt": (
            "You're writing an essay on 'The future of education.' "
            "How do you approach it?"
        ),
        "options": [
            {
                "id": "sc6a",
                "text": "Research statistics and present a data-driven argument",
                "weights": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "verbal_communication": 0.4},
            },
            {
                "id": "sc6b",
                "text": "Write a creative fictional story set in 2050",
                "weights": {"creativity_innovation": 0.9, "verbal_communication": 0.7},
            },
            {
                "id": "sc6c",
                "text": "Interview teachers and students for different perspectives",
                "weights": {"social_orientation": 0.8, "verbal_communication": 0.6},
            },
            {
                "id": "sc6d",
                "text": "Create an outline with clear sections and a strong conclusion",
                "weights": {"structure_discipline": 0.8, "verbal_communication": 0.5},
            },
        ],
    },
    {
        "id": "sc_7",
        "prompt": (
            "A new student joins your class mid-year and seems shy. "
            "What would you do?"
        ),
        "options": [
            {
                "id": "sc7a",
                "text": "Introduce yourself and invite them to sit with your group",
                "weights": {"social_orientation": 0.9, "leadership_drive": 0.4},
            },
            {
                "id": "sc7b",
                "text": "Give them space — they'll open up when ready",
                "weights": {"analytical_reasoning": 0.3, "risk_appetite": 0.1},
            },
            {
                "id": "sc7c",
                "text": "Ask the teacher to pair them with you for the next project",
                "weights": {"leadership_drive": 0.6, "social_orientation": 0.7, "structure_discipline": 0.3},
            },
            {
                "id": "sc7d",
                "text": "Write them a friendly note to break the ice",
                "weights": {"creativity_innovation": 0.6, "verbal_communication": 0.7, "social_orientation": 0.5},
            },
        ],
    },
    {
        "id": "sc_8",
        "prompt": (
            "You're given ₹500 to spend at a book fair. "
            "How do you decide what to buy?"
        ),
        "options": [
            {
                "id": "sc8a",
                "text": "Make a list of exactly what you need beforehand",
                "weights": {"structure_discipline": 0.9, "analytical_reasoning": 0.4},
            },
            {
                "id": "sc8b",
                "text": "Browse randomly and pick what catches your eye",
                "weights": {"creativity_innovation": 0.6, "risk_appetite": 0.5},
            },
            {
                "id": "sc8c",
                "text": "Ask friends what they're buying and get the same",
                "weights": {"social_orientation": 0.7, "risk_appetite": 0.1},
            },
            {
                "id": "sc8d",
                "text": "Compare prices across stalls to get the best deals",
                "weights": {"quantitative_comfort": 0.7, "analytical_reasoning": 0.6},
            },
        ],
    },
    {
        "id": "sc_9",
        "prompt": (
            "Your family is planning a vacation. "
            "They ask for your input. What do you suggest?"
        ),
        "options": [
            {
                "id": "sc9a",
                "text": "Research destinations, costs, and create an itinerary",
                "weights": {"structure_discipline": 0.7, "quantitative_comfort": 0.5, "analytical_reasoning": 0.5},
            },
            {
                "id": "sc9b",
                "text": "Suggest an offbeat place no one has been to",
                "weights": {"creativity_innovation": 0.8, "risk_appetite": 0.7},
            },
            {
                "id": "sc9c",
                "text": "Pick a place where the whole family will enjoy together",
                "weights": {"social_orientation": 0.9, "verbal_communication": 0.3},
            },
            {
                "id": "sc9d",
                "text": "Let someone else decide — you're happy anywhere",
                "weights": {"risk_appetite": 0.1, "leadership_drive": 0.1},
            },
        ],
    },
    {
        "id": "sc_10",
        "prompt": (
            "You notice a classmate copying during a test. "
            "What do you do?"
        ),
        "options": [
            {
                "id": "sc10a",
                "text": "Quietly inform the teacher after the test",
                "weights": {"structure_discipline": 0.8, "leadership_drive": 0.4, "risk_appetite": 0.3},
            },
            {
                "id": "sc10b",
                "text": "Mind your own business — it's not your problem",
                "weights": {"risk_appetite": 0.1, "social_orientation": 0.2},
            },
            {
                "id": "sc10c",
                "text": "Whisper to the classmate to stop",
                "weights": {"social_orientation": 0.6, "leadership_drive": 0.5, "risk_appetite": 0.5},
            },
            {
                "id": "sc10d",
                "text": "Focus on your paper — you can't control others",
                "weights": {"structure_discipline": 0.6, "analytical_reasoning": 0.3},
            },
        ],
    },
]


def get_scenario_questions():
    """Return questions without scoring weights (for client)."""
    safe = []
    for q in SCENARIO_QUESTIONS:
        safe.append(
            {
                "id": q["id"],
                "prompt": q["prompt"],
                "options": [{"id": o["id"], "text": o["text"]} for o in q["options"]],
            }
        )
    return safe


def get_scenario_option_weights():
    """Return option_id → trait weights dict (server only)."""
    mapping = {}
    for q in SCENARIO_QUESTIONS:
        for o in q["options"]:
            mapping[o["id"]] = o["weights"]
    return mapping
