# Outcave — Game Assessment Scoring System

Complete technical documentation of how the interactive assessment works, from user interaction to career recommendation.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [The 8-Trait Model](#2-the-8-trait-model)
3. [Assessment Structure — 4 Games](#3-assessment-structure--4-games)
4. [Data Flow — End to End](#4-data-flow--end-to-end)
5. [Scoring Pipeline — Step by Step](#5-scoring-pipeline--step-by-step)
6. [Game 1: Logic & Pattern Challenge](#6-game-1-logic--pattern-challenge)
7. [Game 2: Risk & Leadership Simulator](#7-game-2-risk--leadership-simulator)
8. [Game 3: Planner & Organization Game](#8-game-3-planner--organization-game)
9. [Game 4: Scenario Section](#9-game-4-scenario-section)
10. [Trait Score Calculation](#10-trait-score-calculation)
11. [Normalization](#11-normalization)
12. [Career Matching — Cosine Similarity](#12-career-matching--cosine-similarity)
13. [Career Trait Weights](#13-career-trait-weights)
14. [Worked Example](#14-worked-example)
15. [API Endpoints](#15-api-endpoints)
16. [Database Models](#16-database-models)
17. [File Structure](#17-file-structure)

---

## 1. System Overview

The assessment replaces a static 20-question MCQ with 4 interactive games that feel engaging. The key architectural rule:

> **The frontend NEVER computes scores. It only collects raw interaction events and sends them to the backend.**

```
User plays games
       ↓
Frontend collects events: {game, event_type, payload, timestamp}
       ↓
Events sent to backend via POST /api/game/log-event/
       ↓
User finishes → POST /api/game/submit/
       ↓
Backend scoring pipeline runs:
  events → parse → calculate traits → normalize → match careers
       ↓
Results returned: 8 trait scores + top 3 career matches
```

---

## 2. The 8-Trait Model

Every user is scored on exactly 8 personality/aptitude traits, each on a 0–10 scale:

| # | Trait | Slug | What it measures |
|---|-------|------|------------------|
| 1 | Analytical Reasoning | `analytical_reasoning` | Logic, pattern recognition, deduction |
| 2 | Quantitative Comfort | `quantitative_comfort` | Comfort with numbers, math, data |
| 3 | Creativity & Innovation | `creativity_innovation` | Original thinking, artistic expression |
| 4 | Verbal & Communication | `verbal_communication` | Language, expression, storytelling |
| 5 | Social Orientation | `social_orientation` | People focus, empathy, collaboration |
| 6 | Leadership Drive | `leadership_drive` | Initiative, taking charge, influence |
| 7 | Risk Appetite | `risk_appetite` | Comfort with uncertainty, bold choices |
| 8 | Structure & Discipline | `structure_discipline` | Organization, planning, consistency |

These 8 traits form a vector like `[7.9, 7.5, 8.0, 5.5, 2.9, 4.8, 5.3, 7.3]` that uniquely describes each user.

---

## 3. Assessment Structure — 4 Games

| Game | Tasks | Traits Measured | Signal Source |
|------|-------|-----------------|---------------|
| **Logic Challenge** | 5 timed puzzles | Analytical, Quantitative | Accuracy + speed |
| **Risk Simulator** | 5 decision scenarios | Risk Appetite, Leadership | Choice values + decision speed |
| **Weekly Planner** | Drag-and-drop schedule | Structure, Social | Allocation patterns |
| **Scenario Section** | 10 situational questions | All 8 traits | Weighted option values |

The **first 3 games** measure specific traits through gameplay mechanics.
The **Scenario Section** covers all 8 traits through situational judgment.

Final formula:

```
Trait Score = (Game Signal × 0.6) + (Scenario Signal × 0.4)
```

Games count for 60% because they capture behavioral signals (speed, accuracy, choices under pressure). Scenarios count for 40% because they capture preferences and judgment.

---

## 4. Data Flow — End to End

### Step 1: User starts assessment
```
POST /api/game/start/
→ Creates GameSession (UUID)
→ Returns: { session_id, started_at }
```

### Step 2: User plays each game
Every interaction emits a structured event:
```json
{
  "game": "logic",
  "event_type": "answer",
  "payload": {
    "task_id": "logic_1",
    "selected_answer": "162",
    "time_taken_ms": 8500
  },
  "timestamp": 1709395200000
}
```

Events are batched and sent between game phases:
```
POST /api/game/log-event/
Body: { session_id, events: [...] }
```

### Step 3: User completes all games
```
POST /api/game/submit/
Body: { session_id }
→ Triggers run_scoring_pipeline(session)
→ Returns: { trait_scores, career_matches }
```

### Step 4: Results displayed
Frontend shows a radar chart of 8 traits + top 3 career matches with compatibility percentages.

---

## 5. Scoring Pipeline — Step by Step

File: `services/__init__.py` → `run_scoring_pipeline(session)`

```
┌─────────────────────────────────────────────────────┐
│                  GameEventLog table                  │
│  (all raw events stored during the session)          │
└────────────┬────────────────────────────────────────┘
             │ Filter by game_name
             ▼
┌─────────────────────────────────────────────────────┐
│              EVENT PARSERS (event_parser.py)         │
│                                                      │
│  parse_logic_events()    → logic_signals             │
│  parse_risk_events()     → risk_signals              │
│  parse_planner_events()  → planner_signals           │
│  parse_scenario_events() → scenario_signals          │
└────────────┬────────────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────────────┐
│         TRAIT CALCULATOR (trait_calculator.py)        │
│                                                      │
│  Game scores (logic + risk + planner)                │
│      × 0.6                                           │
│  +                                                   │
│  Scenario scores                                     │
│      × 0.4                                           │
│  = Raw trait scores (0.0 – 1.0)                      │
└────────────┬────────────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────────────┐
│            NORMALIZER (normalizer.py)                │
│                                                      │
│  raw × 10 = normalized (0 – 10)                      │
│  No artificial floor. 0 stays 0.                     │
└────────────┬────────────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────────────┐
│         CAREER MATCHER (career_matcher.py)           │
│                                                      │
│  For each career:                                    │
│    cosine_similarity(user_traits, career_weights)    │
│  Sort by similarity descending                       │
│  Return top 3                                        │
└─────────────────────────────────────────────────────┘
```

---

## 6. Game 1: Logic & Pattern Challenge

**File:** `content/logic_game.py`
**Traits:** analytical_reasoning, quantitative_comfort
**Parser:** `event_parser.py → parse_logic_events()`

### 5 Tasks

| ID | Type | Question (summary) | Correct Answer | Trait Split |
|----|------|--------------------|----------------|-------------|
| logic_1 | Number sequence | 2, 6, 18, 54, ? | 162 | Analytical 0.6, Quantitative 0.4 |
| logic_2 | Shape pattern | Circle, Square, Triangle, ... ? | Triangle | Analytical 0.8, Quantitative 0.2 |
| logic_3 | Logical deduction | All roses are flowers... | Some roses may fade quickly | Analytical 0.9, Quantitative 0.1 |
| logic_4 | Quick math | ₹1200 − 20% − ₹50 coupon | ₹910 | Analytical 0.3, Quantitative 0.7 |
| logic_5 | Data interpretation | Distinction rate comparison | Both are equal | Analytical 0.5, Quantitative 0.5 |

### How scoring works

For each task:

```
accuracy_score = 1.0 if correct, 0.0 if wrong

time_factor = max(0, 1 − (time_ms / 60000))
  → Faster = higher. 10s answer → 0.83. 30s answer → 0.50.

task_score = accuracy_score × (0.7 + 0.3 × time_factor)
  → A correct answer is worth 0.7–1.0 depending on speed
  → A wrong answer is always 0.0
```

Each task contributes to traits via **importance weights**. The trait "split" (e.g., Analytical 0.6, Quantitative 0.4) determines how much that task's score matters for each trait.

Signals stored as **(score, importance)** tuples:
```
analytical_reasoning: [(0.85, 0.6), (0.85, 0.8), (0.85, 0.9), (0.85, 0.3), (0.85, 0.5)]
```

These are combined via **weighted average** (not simple multiplication):
```
weighted_avg = Σ(score_i × importance_i) / Σ(importance_i)

Example for analytical:
= (0.85×0.6 + 0.85×0.8 + 0.85×0.9 + 0.85×0.3 + 0.85×0.5) / (0.6+0.8+0.9+0.3+0.5)
= 2.635 / 3.1
= 0.85
```

This means: **if you get all 5 right with decent speed, analytical and quantitative both score ~0.85**. The importance weights only control which tasks matter more — they don't reduce your score.

---

## 7. Game 2: Risk & Leadership Simulator

**File:** `content/risk_game.py`
**Traits:** risk_appetite, leadership_drive
**Parser:** `event_parser.py → parse_risk_events()`

### 5 Scenarios

Each scenario has 4 options. Every option has hidden values:
- `risk_level` (0.0 – 1.0): How risky the choice is
- `leadership_level` (0.0 – 1.0): How much leadership it shows

Example — Scenario 1 options:

| Option | Text | Risk | Leadership |
|--------|------|------|------------|
| r1a | Put it all in a safe fixed deposit | 0.1 | 0.1 |
| r1b | Invest half, save half | 0.5 | 0.3 |
| r1c | Invest everything | 0.9 | 0.4 |
| r1d | Invest and help run the startup | 0.8 | 0.9 |

### How scoring works

```
confidence = max(0, 1 − (time_ms / 30000))
  → Faster decisions = higher confidence
  → 5s decision → 0.83 confidence
  → 15s decision → 0.50 confidence

risk_boosted = risk_level × (0.8 + 0.2 × confidence)
leadership_boosted = leadership_level × (0.8 + 0.2 × confidence)
```

The confidence modifier adds 0–20% bonus for faster decisions. The idea: people who choose quickly are more committed to their choice.

Final trait signal = **average of all 5 boosted scores**:
```
risk_appetite = avg(risk_boosted_1, ..., risk_boosted_5)
leadership_drive = avg(leadership_boosted_1, ..., leadership_boosted_5)
```

---

## 8. Game 3: Planner & Organization Game

**File:** `content/planner_game.py`
**Traits:** structure_discipline, social_orientation
**Parser:** `event_parser.py → parse_planner_events()`

### Setup

User drags 6 activity blocks into a 7-day × 3-slot weekly grid (21 total slots):

| Activity | Category | Color |
|----------|----------|-------|
| Study | Academic | Blue |
| Self-learning | Academic | Cyan |
| Friends | Social | Yellow |
| Family | Social | Pink |
| Sports | Physical | Green |
| Hobby | Creative | Purple |

### How scoring works

The submitted schedule is analyzed:

**Social Orientation Signal:**
```
social_ratio = (friends_count + family_count) / total_filled_slots
```
If you allocated 2 out of 16 slots to social activities → social_ratio = 0.125

**Structure & Discipline Signal** (3 components):
```
coverage = filled_slots / 21
  → Rewards planning more of your week
  → 16/21 = 0.76

focus_bonus = min(1.0, unique_activities_used / 3)
  → Using 3+ activities = 1.0
  → You don't need all 6 to be "structured"

evenness = 1 − (variance_of_allocations × 4)
  → Rewards consistent allocation across chosen activities
  → Not wildly putting everything in one bucket

structure_score = coverage × 0.4 + evenness × 0.3 + focus_bonus × 0.3
```

A highly structured user: fills most slots, uses 3-4 activities consistently, distributes them evenly.

---

## 9. Game 4: Scenario Section

**File:** `content/scenarios.py`
**Traits:** All 8 traits
**Parser:** `event_parser.py → parse_scenario_events()`

### 10 Situational Questions

Each question has 4 options. Every option carries hidden **trait weights** (0.0 – 1.0) for one or more traits.

Example — "How would you make a climate change presentation stand out?"

| Option | Text | Hidden Weights |
|--------|------|----------------|
| sc1a | Vivid storytelling with real examples | verbal 0.9, creativity 0.6 |
| sc1b | Create an interactive quiz | creativity 0.9, social 0.5 |
| sc1c | Data charts with clear analysis | analytical 0.8, quantitative 0.5 |
| sc1d | Group skit to act out effects | leadership 0.6, creativity 0.8, social 0.6 |

### How scoring works

When the user picks an option, its trait weights are collected:
```
If user picks sc1b → creativity gets 0.9, social gets 0.5
If user picks sc1c → analytical gets 0.8, quantitative gets 0.5
```

After all 10 questions, each trait's signal is the **average of all weights it received**:
```
creativity_scenario = avg(0.9, 0.7, 0.9, 0.9, 0.8)  // if 5 creative options chosen
                    = 0.84

analytical_scenario = avg(0.8, 0.8)  // if 2 analytical options chosen
                    = 0.80
```

Traits that received **no signals** (the user never chose an option with that trait) get `None` and are handled by the trait calculator.

---

## 10. Trait Score Calculation

**File:** `services/trait_calculator.py`

This is where all signals merge. The formula:

```
For each of the 8 traits:

  If BOTH game signal AND scenario signal exist:
    raw_score = game_signal × 0.6 + scenario_signal × 0.4

  If ONLY game signal exists (e.g., structure from planner):
    raw_score = game_signal

  If ONLY scenario signal exists (e.g., creativity from scenarios):
    raw_score = scenario_signal

  If NEITHER exists:
    raw_score = 0.0
```

### Which games measure which traits?

| Trait | Game Source | Scenario Source |
|-------|-----------|-----------------|
| Analytical Reasoning | Logic game (weighted avg) | Scenario options with analytical weights |
| Quantitative Comfort | Logic game (weighted avg) | Scenario options with quantitative weights |
| Creativity & Innovation | — | Scenario options with creativity weights |
| Verbal & Communication | — | Scenario options with verbal weights |
| Social Orientation | Planner (social_ratio) | Scenario options with social weights |
| Leadership Drive | Risk game (avg leadership) | Scenario options with leadership weights |
| Risk Appetite | Risk game (avg risk) | Scenario options with risk weights |
| Structure & Discipline | Planner (structure_score) | Scenario options with structure weights |

**Notice:** Creativity and Verbal have NO game source — they come entirely from scenarios. This means your scenario choices matter a lot for those traits.

---

## 11. Normalization

**File:** `services/normalizer.py`

Dead simple — linear mapping:

```
normalized = raw_score × 10.0
```

- Raw 0.0 → Normalized 0.0
- Raw 0.5 → Normalized 5.0
- Raw 0.85 → Normalized 8.5
- Raw 1.0 → Normalized 10.0

No artificial floor or ceiling. If you never trigger a trait, it stays at 0. This is important because it ensures careers requiring that trait get properly penalized in the matching.

---

## 12. Career Matching — Cosine Similarity

**File:** `services/career_matcher.py`

This is the most critical part. We tried three approaches before settling on cosine similarity:

### Why not weighted average?
```
score = Σ(trait_i × weight_i) / (10 × Σ(weight_i))
```
Problem: Biases toward careers with concentrated weights. A career that only cares about 2 traits gets inflated when the user is good at those 2 things, even if the overall profile doesn't match.

### Why not raw dot product?
```
score = Σ(trait_i × weight_i)
```
Problem: Biases toward careers with many high weights. A career with weights [0.8, 0.8, 0.8, 0.8, 0.7, 0.8, 0.6, 0.5] accumulates more total score than a focused career, regardless of actual fit.

### Cosine Similarity (what we use)

```
                    Σ(user_i × career_i)
similarity = ─────────────────────────────────
             √(Σ(user_i²)) × √(Σ(career_i²))
```

This measures the **angle** between two vectors. It answers: "Does the *shape* of the user's trait profile point in the same *direction* as the career's weight profile?"

- If user is [high analytical, high creative, low social] and career values [high analytical, high creative, low social] → **high similarity** (same direction)
- If user is [high analytical, low creative] but career values [low analytical, high creative] → **low similarity** (different directions)
- The absolute magnitudes don't matter — only the proportional shape

**Score displayed as percentage** = similarity × 100

A score of 97.8% means the user's trait profile is nearly perfectly aligned with that career's ideal trait profile.

### Example calculation

User traits: `[7.9, 7.5, 8.0, 5.5, 2.9, 4.8, 5.3, 7.3]`
Software Engineer weights: `[0.9, 0.7, 0.8, 0.4, 0.3, 0.4, 0.6, 0.6]`

```
dot product = 7.9×0.9 + 7.5×0.7 + 8.0×0.8 + 5.5×0.4 + 2.9×0.3 + 4.8×0.4 + 5.3×0.6 + 7.3×0.6
            = 7.11 + 5.25 + 6.4 + 2.2 + 0.87 + 1.92 + 3.18 + 4.38
            = 31.31

|user| = √(7.9² + 7.5² + 8.0² + 5.5² + 2.9² + 4.8² + 5.3² + 7.3²)
       = √(350.80)
       = 18.73

|career| = √(0.9² + 0.7² + 0.8² + 0.4² + 0.3² + 0.4² + 0.6² + 0.6²)
         = √(3.07)
         = 1.75

similarity = 31.31 / (18.73 × 1.75) = 31.31 / 32.78 = 0.955 → 95.5%
```

---

## 13. Career Trait Weights

**File:** `management/commands/seed_game_data.py`

Each career has 8 weights (0.0 – 1.0) stored in the `GameCareerTraitWeight` database table. These weights define the "ideal trait profile" for that career.

| Career | Analytical | Quantitative | Creativity | Verbal | Social | Leadership | Risk | Structure |
|--------|-----------|-------------|-----------|--------|--------|-----------|------|----------|
| **Software Engineer** | 0.9 | 0.7 | **0.8** | 0.4 | 0.3 | 0.4 | **0.6** | 0.6 |
| Data Scientist | 0.9 | **0.9** | 0.5 | 0.4 | 0.2 | 0.3 | 0.4 | 0.7 |
| Doctor | 0.8 | 0.6 | 0.3 | 0.6 | **0.8** | 0.5 | 0.3 | **0.9** |
| Graphic Designer | 0.3 | 0.2 | **0.9** | 0.5 | 0.4 | 0.3 | 0.5 | 0.4 |
| Lawyer | **0.8** | 0.3 | 0.4 | **0.9** | 0.6 | 0.7 | 0.5 | 0.7 |
| Architect | 0.7 | 0.6 | **0.9** | 0.4 | 0.3 | 0.4 | 0.4 | 0.7 |
| Marketing Manager | 0.6 | 0.5 | 0.8 | 0.8 | 0.7 | **0.8** | 0.6 | 0.5 |
| Teacher | 0.5 | 0.4 | 0.6 | 0.8 | **0.9** | 0.6 | 0.2 | 0.7 |
| Psychologist | 0.7 | 0.3 | 0.5 | 0.8 | **0.9** | 0.4 | 0.3 | 0.6 |
| Accountant | 0.6 | **0.9** | 0.1 | 0.3 | 0.3 | 0.3 | 0.2 | **0.9** |
| Chartered Accountant | 0.7 | **0.9** | 0.2 | 0.4 | 0.3 | 0.4 | 0.3 | **0.9** |
| Mechanical Engineer | 0.8 | 0.8 | 0.5 | 0.3 | 0.3 | 0.4 | 0.4 | 0.8 |
| Civil Engineer | 0.8 | 0.8 | 0.4 | 0.3 | 0.3 | 0.5 | 0.4 | 0.8 |
| Business Analyst | 0.8 | 0.7 | 0.4 | 0.6 | 0.4 | 0.5 | 0.4 | 0.7 |
| Writer | 0.5 | 0.2 | 0.7 | **0.9** | 0.5 | 0.3 | 0.5 | 0.5 |

Key differentiators (bold):
- **Software Engineer** = high analytical + high creativity + moderate risk (unique combo)
- **Data Scientist** = highest quantitative + high analytical (math-heavy)
- **Doctor** = high structure + high social (disciplined caregiving)
- **Graphic Designer** = highest creativity + low analytical (pure creative)

These weights are stored in the database and editable via Django admin.

---

## 14. Worked Example

### User plays the assessment:

**Logic Game:** Gets all 5 correct in ~10 seconds each
```
task_score ≈ 1.0 × (0.7 + 0.3 × 0.83) = 0.95

analytical_reasoning game signal = weighted_avg of all (0.95, weight) pairs = 0.95
quantitative_comfort game signal = weighted_avg of all (0.95, weight) pairs = 0.95
```

**Risk Game:** Picks high-risk, high-leadership options quickly (~5s each)
```
risk_appetite game signal ≈ avg([0.72, 0.45, 0.63, 0.72, 0.72]) = 0.65
leadership_drive game signal ≈ avg([0.81, 0.81, 0.81, 0.45, 0.81]) = 0.74
```

**Planner:** Fills 16 slots, 4 activities, 2 social slots
```
structure_discipline game signal = 0.75
social_orientation game signal = 2/16 = 0.125
```

**Scenarios:** Picks 4 creative, 2 analytical, 2 structure, 1 risk, 1 quantitative options
```
creativity_innovation scenario signal = avg(0.9, 0.7, 0.9, 0.9) = 0.85
analytical_reasoning scenario signal = avg(0.8, 0.8) = 0.80
structure_discipline scenario signal = avg(0.8, 0.9) = 0.85
quantitative_comfort scenario signal = avg(0.7) = 0.70
risk_appetite scenario signal = avg(0.8) = 0.80
...etc
```

### Trait Calculation (60/40 merge):

```
analytical  = 0.95 × 0.6 + 0.80 × 0.4 = 0.57 + 0.32 = 0.89  → 8.9/10
quantitative = 0.95 × 0.6 + 0.70 × 0.4 = 0.57 + 0.28 = 0.85  → 8.5/10
creativity  = (no game) → scenario only = 0.85                  → 8.5/10
risk        = 0.65 × 0.6 + 0.80 × 0.4 = 0.39 + 0.32 = 0.71   → 7.1/10
leadership  = 0.74 × 0.6 + ... = ...                            → 6.5/10
structure   = 0.75 × 0.6 + 0.85 × 0.4 = 0.45 + 0.34 = 0.79   → 7.9/10
social      = 0.13 × 0.6 + ... = ...                            → 2.5/10
verbal      = (no game) → scenario only                          → 5.0/10
```

### Career Matching:

User vector: `[8.9, 8.5, 8.5, 5.0, 2.5, 6.5, 7.1, 7.9]`

```
cosine(user, Software Engineer [0.9,0.7,0.8,0.4,0.3,0.4,0.6,0.6]) → 97.8%
cosine(user, Architect         [0.7,0.6,0.9,0.4,0.3,0.4,0.4,0.7]) → 97.3%
cosine(user, Data Scientist    [0.9,0.9,0.5,0.4,0.2,0.3,0.4,0.7]) → 96.1%
```

**Result: Software Engineer #1 at 97.8%** because the user's trait SHAPE (high analytical + high creativity + moderate risk + moderate structure) most closely aligns with SE's weight SHAPE.

---

## 15. API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/game/content/` | No | Returns all game tasks, scenarios, planner config (no answers) |
| POST | `/api/game/start/` | Yes | Creates a new GameSession, returns session_id |
| POST | `/api/game/log-event/` | Yes | Stores a batch of interaction events |
| POST | `/api/game/submit/` | Yes | Triggers scoring pipeline, returns results |
| GET | `/api/game/results/{session_id}/` | Yes | Fetches saved results for a completed session |

### Event format (sent from frontend):
```json
{
  "session_id": "uuid-here",
  "events": [
    {
      "game": "logic",
      "event_type": "answer",
      "payload": {
        "task_id": "logic_1",
        "selected_answer": "162",
        "time_taken_ms": 8500
      },
      "timestamp": 1709395200000
    }
  ]
}
```

### Event types by game:

| Game | event_type | Payload fields |
|------|-----------|----------------|
| logic | `answer` | task_id, selected_answer, time_taken_ms |
| risk | `decision` | scenario_id, selected_option_id, time_taken_ms |
| planner | `slot_assign` | slot, activity |
| planner | `schedule_submit` | schedule (full slot→activity map) |
| scenario | `answer` | question_id, selected_option_id |

---

## 16. Database Models

```
GameSession
├── id (UUID, primary key)
├── user (FK → User, nullable)
├── started_at
├── completed_at
└── is_complete

GameEventLog
├── session (FK → GameSession)
├── game_name (logic / risk / planner / scenario)
├── event_type
├── payload (JSON)
└── timestamp

TraitScore
├── session (FK → GameSession)
├── trait_name (one of 8 traits)
├── raw_score (0.0 – 1.0)
└── normalized_score (0.0 – 10.0)

CareerMatchScore
├── session (FK → GameSession)
├── career (FK → Career)
├── score (cosine similarity, 0.0 – 1.0)
└── rank (1, 2, 3)

GameCareerTraitWeight
├── career (FK → Career)
├── trait_name (one of 8 traits)
└── weight (0.0 – 1.0)
```

---

## 17. File Structure

```
backend/apps/game_assessment/
├── models.py                          # All 5 models above
├── views.py                           # 5 API views
├── serializers.py                     # Request/response serializers
├── urls.py                            # 5 endpoints
├── admin.py                           # Admin panel registration
├── apps.py                            # Django app config
│
├── content/                           # Game content (tasks, scenarios)
│   ├── logic_game.py                  # 5 logic tasks + answers + trait weights
│   ├── risk_game.py                   # 5 risk scenarios + option risk/leadership levels
│   ├── planner_game.py                # Planner config + schedule analysis
│   └── scenarios.py                   # 10 scenario questions + option trait weights
│
├── services/                          # Scoring pipeline
│   ├── __init__.py                    # run_scoring_pipeline() orchestrator
│   ├── event_parser.py                # 4 parsers: logic, risk, planner, scenario
│   ├── trait_calculator.py            # Merges game + scenario signals (60/40)
│   ├── normalizer.py                  # Linear 0-1 → 0-10
│   └── career_matcher.py             # Cosine similarity matching
│
└── management/commands/
    └── seed_game_data.py              # Seeds career trait weights
```

```
frontend/src/features/game-assessment/
├── types.ts                           # TypeScript interfaces
├── store.ts                           # Zustand state (session, phase, events, result)
├── api.ts                             # API calls to backend
│
└── components/
    ├── GameEngine.tsx                 # Orchestrator — manages phase flow
    ├── GameProgressBar.tsx            # Progress indicator
    ├── IntroScreen.tsx                # Welcome + start button
    ├── LogicGame.tsx                  # Timed MCQ with auto-advance
    ├── RiskSimulator.tsx              # Decision scenario cards
    ├── PlannerGame.tsx                # Drag-and-drop weekly grid (@dnd-kit)
    ├── ScenarioSection.tsx            # Situational question cards
    ├── ProcessingScreen.tsx           # Animated loading while backend scores
    └── GameResultsPage.tsx            # Radar chart + career cards + confetti
```
