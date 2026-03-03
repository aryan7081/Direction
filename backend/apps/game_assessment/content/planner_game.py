"""
Planner & Organization Game configuration.
User organizes activity blocks into a weekly schedule.
Traits measured: structure_discipline, social_orientation.
"""

ACTIVITIES = [
    {"id": "study", "label": "Study", "color": "#3b82f6", "category": "academic"},
    {"id": "friends", "label": "Friends", "color": "#f59e0b", "category": "social"},
    {"id": "sports", "label": "Sports", "color": "#10b981", "category": "physical"},
    {"id": "hobby", "label": "Hobby", "color": "#8b5cf6", "category": "creative"},
    {"id": "family", "label": "Family", "color": "#ec4899", "category": "social"},
    {"id": "self_learning", "label": "Self-learning", "color": "#06b6d4", "category": "academic"},
]

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

TIME_SLOTS = ["Morning", "Afternoon", "Evening"]

PLANNER_CONFIG = {
    "activities": ACTIVITIES,
    "days": DAYS,
    "time_slots": TIME_SLOTS,
    "instructions": (
        "Drag activities into the weekly calendar to plan your ideal week. "
        "You can place each activity in multiple slots. "
        "Try to create a balanced schedule that reflects your priorities."
    ),
}


def get_planner_config():
    return PLANNER_CONFIG


# --- Server-side analysis helpers ---

SOCIAL_ACTIVITIES = {"friends", "family"}
ACADEMIC_ACTIVITIES = {"study", "self_learning"}
CREATIVE_ACTIVITIES = {"hobby"}
PHYSICAL_ACTIVITIES = {"sports"}


def analyze_planner_allocation(schedule: dict) -> dict:
    """
    Analyze a submitted schedule.
    schedule format: {"Monday_Morning": "study", "Monday_Afternoon": "friends", ...}
    Returns signals for scoring.
    """
    total_possible = len(DAYS) * len(TIME_SLOTS)  # 21
    total = 0
    counts = {a["id"]: 0 for a in ACTIVITIES}

    for slot_value in schedule.values():
        if slot_value and slot_value in counts:
            counts[slot_value] += 1
            total += 1

    if total == 0:
        return {"social_ratio": 0, "structure_score": 0, "balance_score": 0, "total_slots_filled": 0}

    social_count = sum(counts.get(a, 0) for a in SOCIAL_ACTIVITIES)
    social_ratio = social_count / total

    # Coverage: how much of the week is planned (rewards filling slots)
    coverage = min(1.0, total / total_possible)

    # Consistency: repeated patterns across days (rewards deliberate allocation)
    used_activities = sum(1 for c in counts.values() if c > 0)
    allocations = [c / total for c in counts.values() if c > 0]
    if len(allocations) >= 2:
        mean_alloc = sum(allocations) / len(allocations)
        variance = sum((a - mean_alloc) ** 2 for a in allocations) / len(allocations)
        evenness = max(0, 1 - (variance * 4))
    else:
        evenness = 0.5

    # Structure = high coverage + intentional allocation.
    # A focused schedule (3-4 activities used heavily) is MORE structured
    # than a chaotic one. Don't require all 6 activities.
    focus_bonus = min(1.0, used_activities / 3.0)  # using 3+ activities is enough
    structure_score = coverage * 0.4 + evenness * 0.3 + focus_bonus * 0.3

    return {
        "social_ratio": round(social_ratio, 3),
        "structure_score": round(min(1.0, structure_score), 3),
        "balance_score": round(focus_bonus, 3),
        "counts": counts,
        "total_slots_filled": total,
    }
