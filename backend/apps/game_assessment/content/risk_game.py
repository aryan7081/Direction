"""
Risk & Leadership Simulator — 5 decision scenarios.
Each option has a risk_level (0-1) and leadership_level (0-1).
Traits measured: risk_appetite, leadership_drive.
"""

RISK_SCENARIOS = [
    {
        "id": "risk_1",
        "prompt": (
            "You have ₹10,000 saved. A friend pitches a startup idea "
            "that could double your money — or lose it all. What do you do?"
        ),
        "options": [
            {
                "id": "r1a",
                "text": "Put it all in a safe fixed deposit",
                "risk_level": 0.1,
                "leadership_level": 0.1,
            },
            {
                "id": "r1b",
                "text": "Invest half, save half",
                "risk_level": 0.5,
                "leadership_level": 0.3,
            },
            {
                "id": "r1c",
                "text": "Invest everything — high risk, high reward",
                "risk_level": 0.9,
                "leadership_level": 0.4,
            },
            {
                "id": "r1d",
                "text": "Invest and offer to help run the startup",
                "risk_level": 0.8,
                "leadership_level": 0.9,
            },
        ],
    },
    {
        "id": "risk_2",
        "prompt": (
            "Two classmates are in a heated argument during a group project. "
            "The deadline is tomorrow. What do you do?"
        ),
        "options": [
            {
                "id": "r2a",
                "text": "Stay quiet and finish your own part",
                "risk_level": 0.1,
                "leadership_level": 0.1,
            },
            {
                "id": "r2b",
                "text": "Try to calm them down and mediate",
                "risk_level": 0.3,
                "leadership_level": 0.6,
            },
            {
                "id": "r2c",
                "text": "Take charge — reassign tasks and set a new plan",
                "risk_level": 0.5,
                "leadership_level": 0.9,
            },
            {
                "id": "r2d",
                "text": "Side with the person you think is right",
                "risk_level": 0.6,
                "leadership_level": 0.3,
            },
        ],
    },
    {
        "id": "risk_3",
        "prompt": (
            "Your school announces a new inter-school competition "
            "in a subject you're decent at but not the best. "
            "Do you participate?"
        ),
        "options": [
            {
                "id": "r3a",
                "text": "No — better to avoid embarrassment",
                "risk_level": 0.0,
                "leadership_level": 0.1,
            },
            {
                "id": "r3b",
                "text": "Yes — it's a learning opportunity",
                "risk_level": 0.5,
                "leadership_level": 0.3,
            },
            {
                "id": "r3c",
                "text": "Yes, and volunteer to lead the school team",
                "risk_level": 0.7,
                "leadership_level": 0.9,
            },
            {
                "id": "r3d",
                "text": "Only if a friend joins with you",
                "risk_level": 0.2,
                "leadership_level": 0.2,
            },
        ],
    },
    {
        "id": "risk_4",
        "prompt": (
            "You get two job offers after college: a stable government job "
            "and an exciting but uncertain role at a new tech company. "
            "Which do you pick?"
        ),
        "options": [
            {
                "id": "r4a",
                "text": "Government job — stability matters most",
                "risk_level": 0.1,
                "leadership_level": 0.2,
            },
            {
                "id": "r4b",
                "text": "Tech company — growth potential is higher",
                "risk_level": 0.7,
                "leadership_level": 0.5,
            },
            {
                "id": "r4c",
                "text": "Tech company, and pitch to lead a project right away",
                "risk_level": 0.8,
                "leadership_level": 0.9,
            },
            {
                "id": "r4d",
                "text": "Ask for more time to research both options",
                "risk_level": 0.3,
                "leadership_level": 0.3,
            },
        ],
    },
    {
        "id": "risk_5",
        "prompt": (
            "Your group's project idea is solid but boring. "
            "You have a wild idea that could be amazing — or flop. "
            "What do you do?"
        ),
        "options": [
            {
                "id": "r5a",
                "text": "Stick with the safe idea",
                "risk_level": 0.1,
                "leadership_level": 0.1,
            },
            {
                "id": "r5b",
                "text": "Suggest your idea and let the group vote",
                "risk_level": 0.5,
                "leadership_level": 0.5,
            },
            {
                "id": "r5c",
                "text": "Strongly push for your idea — convince everyone",
                "risk_level": 0.8,
                "leadership_level": 0.9,
            },
            {
                "id": "r5d",
                "text": "Combine elements of both ideas",
                "risk_level": 0.4,
                "leadership_level": 0.6,
            },
        ],
    },
]


def get_risk_scenarios():
    """Return scenarios for client (no scoring metadata)."""
    safe = []
    for s in RISK_SCENARIOS:
        safe.append(
            {
                "id": s["id"],
                "prompt": s["prompt"],
                "options": [{"id": o["id"], "text": o["text"]} for o in s["options"]],
            }
        )
    return safe


def get_risk_option_map():
    """Return option_id → {risk_level, leadership_level} (server only)."""
    mapping = {}
    for s in RISK_SCENARIOS:
        for o in s["options"]:
            mapping[o["id"]] = {
                "risk_level": o["risk_level"],
                "leadership_level": o["leadership_level"],
            }
    return mapping
