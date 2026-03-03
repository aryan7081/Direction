"""
Logic & Pattern Challenge — 5 micro-tasks.
Each task has: id, type, prompt, options, correct_answer, time_limit_seconds.
Traits measured: analytical_reasoning, quantitative_comfort.
"""

LOGIC_TASKS = [
    {
        "id": "logic_1",
        "type": "number_sequence",
        "prompt": "What comes next in the sequence: 2, 6, 18, 54, ?",
        "options": ["108", "162", "72", "216"],
        "correct_answer": "162",
        "time_limit": 30,
        "traits": {
            "analytical_reasoning": 0.6,
            "quantitative_comfort": 0.4,
        },
    },
    {
        "id": "logic_2",
        "type": "shape_pattern",
        "prompt": (
            "A pattern follows: Circle, Square, Triangle, Circle, Square, ?\n"
            "What shape comes next?"
        ),
        "options": ["Circle", "Triangle", "Square", "Pentagon"],
        "correct_answer": "Triangle",
        "time_limit": 20,
        "traits": {
            "analytical_reasoning": 0.8,
            "quantitative_comfort": 0.2,
        },
    },
    {
        "id": "logic_3",
        "type": "logical_deduction",
        "prompt": (
            "All roses are flowers. Some flowers fade quickly. "
            "Which statement MUST be true?"
        ),
        "options": [
            "All roses fade quickly",
            "Some roses may fade quickly",
            "No roses fade quickly",
            "Roses are not flowers",
        ],
        "correct_answer": "Some roses may fade quickly",
        "time_limit": 30,
        "traits": {
            "analytical_reasoning": 0.9,
            "quantitative_comfort": 0.1,
        },
    },
    {
        "id": "logic_4",
        "type": "quick_math",
        "prompt": (
            "A store offers 20% discount on an item priced ₹1,200. "
            "You also have a ₹50 coupon. What do you pay?"
        ),
        "options": ["₹910", "₹960", "₹1,010", "₹900"],
        "correct_answer": "₹910",
        "time_limit": 40,
        "traits": {
            "analytical_reasoning": 0.3,
            "quantitative_comfort": 0.7,
        },
    },
    {
        "id": "logic_5",
        "type": "data_interpretation",
        "prompt": (
            "In a school, Class A has 30 students and Class B has 45 students. "
            "If 10 students from Class A and 15 from Class B passed with distinction, "
            "which class has a higher distinction rate?"
        ),
        "options": [
            "Class A (33.3%)",
            "Class B (33.3%)",
            "Both are equal",
            "Cannot be determined",
        ],
        "correct_answer": "Both are equal",
        "time_limit": 40,
        "traits": {
            "analytical_reasoning": 0.5,
            "quantitative_comfort": 0.5,
        },
    },
]


def get_logic_tasks():
    """Return tasks without correct answers (for client)."""
    safe = []
    for t in LOGIC_TASKS:
        safe.append(
            {
                "id": t["id"],
                "type": t["type"],
                "prompt": t["prompt"],
                "options": t["options"],
                "time_limit": t["time_limit"],
            }
        )
    return safe


def get_logic_answers():
    """Return task id → correct answer mapping (server only)."""
    return {t["id"]: t["correct_answer"] for t in LOGIC_TASKS}


def get_logic_trait_weights():
    """Return task id → trait weight mapping."""
    return {t["id"]: t["traits"] for t in LOGIC_TASKS}
