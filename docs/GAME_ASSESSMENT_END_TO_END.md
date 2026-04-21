# Game assessment: end-to-end flow (quiz → storage → scores → careers)

This document explains **what happens in production code today**: from the moment a student starts until career recommendations are stored and shown. It is meant to be read in order.

**Related code (anchor paths):**

| Step | Location |
|------|----------|
| Start session, log events, submit | `backend/apps/game_assessment/views.py` |
| Event / session models | `backend/apps/game_assessment/models.py` |
| Question bank in API shape | `backend/apps/game_assessment/content/scenarios.py` |
| MCQ source (DB + cache) | `backend/apps/assessments/game_catalog.py` |
| Scoring orchestration | `backend/apps/game_assessment/services/__init__.py` |
| Psychometric profile + career fit | `backend/apps/game_assessment/services/psychometric_scoring.py` |
| 0–10 trait display scaling | `backend/apps/game_assessment/services/normalizer.py` |
| Report JSON | `backend/apps/game_assessment/services/report_builder.py` |
| Career trait seeds | `backend/apps/game_assessment/management/commands/seed_game_data.py` |

---

## 1. Concepts you need first

### 1.1 What we measure (the “psychometric profile”)

Each **answer option** in the MCQ bank can carry hidden **dimension weights**. After many answers, the server builds one **student profile** with these parts (all used for career math except where noted):

| Part | Keys (examples) | Role |
|------|-------------------|------|
| **RIASEC interests** | `riasec_realistic`, `riasec_investigative`, `riasec_artistic`, `riasec_social`, `riasec_enterprising`, `riasec_conventional` | Holland-style interest space (6 dimensions). |
| **Work personality** | `personality_E`, `personality_A`, `personality_C`, `personality_ES`, `personality_O` | Broad work-relevant traits (Extraversion, Agreeableness, Conscientiousness, Emotional Stability, Openness-style). |
| **Values** | `values_money`, `values_impact`, `values_security`, `values_creativity`, `values_growth`, `values_balance` | What the student tends to prioritize. |
| **Aptitude** | `verbal`, `numerical`, `abstract`, `spatial` (derived from items tagged with `aptitude_subtest` in metadata) | Accuracy per subtest: correct ÷ attempted. |
| **Readiness** | `readiness` | Computed in the profile but **excluded from the career fit formula** (product spec). |

Each RIASEC / personality / values dimension is eventually a **number in [0, 1]** (see §5). Aptitude subtests are also in **[0, 1]** as accuracy.

### 1.2 What we show on the report (“eight traits”)

For charts and copy, the product also uses **eight named traits** (same names as career weights in the DB):

`analytical_reasoning`, `quantitative_comfort`, `creativity_innovation`, `verbal_communication`, `social_orientation`, `leadership_drive`, `risk_appetite`, `structure_discipline`.

These are **not** read directly from a single question type. They are **blends** of the psychometric profile (§6).

### 1.3 What each career has (“ideal” eight weights)

Each `Career` can have rows in **`GameCareerTraitWeight`**: eight numbers in **[0, 1]** meaning **how important that trait is for that career** (expert-authored seeds in `seed_game_data.py`; editable in Django admin).

**Critical:** Career matching does **not** compare “student eight traits vs career eight weights” with cosine similarity in the live pipeline. Instead, those eight weights are **converted** into synthetic targets in RIASEC / personality / values / aptitude space, and the student’s **raw profile** is compared there (§8).

---

## 2. Lifecycle: from start to “completed”

### 2.1 Create a session

- **API:** `POST /api/game/start/` (see `config/urls.py` + `apps.game_assessment.urls`).
- **Stored:** one `GameSession` row: `id` (UUID), optional `user`, `assessment_tier` (typically `free` first), `is_complete=False`, timestamps.

No scores exist yet.

### 2.2 Load content

- **API:** game content endpoint returns `logic_tasks`, `risk_scenarios`, `planner_config`, and **`scenario_questions`**.
- **Scenario questions** are built from **`get_mcq_catalog()`**: active `Question` rows in the DB (seeded from `psychometric_items` and friends), ordered, with options.

**Free vs premium**

- **Free tier:** only items where `premium_only` is false.
- **Premium:** all items; after payment, extra premium-only items can be answered and the session **rescored** (see premium extension submit in `views.py`).

The client shows **question text and option ids**; it does **not** receive the real scoring weights for options (server rebuilds them from the catalog).

### 2.3 Log answers (and other events)

- **API:** `POST /api/game/log-event/` with `session_id` and a batch of `events`.
- Each event has: `game` (string), `event_type`, `payload` (JSON), `timestamp` (ms).

**What matters for scoring**

- `run_scoring_pipeline` builds the profile from logs where **`game_name == "scenario"`** and **`event_type == "answer"`**.
- The payload must include **`selected_option_id`** matching an option id the server knows (e.g. `scen_001_a`).

**Important practical note:** Other games (`logic`, `risk`, `planner`) may be played and logged, but **the current scoring pipeline does not read those logs**. Only **scenario MCQ answers** drive the psychometric profile and career ranks. (The docstring in `services/__init__.py` states: scenario MCQ events → profile → scores.)

### 2.4 Submit / complete

- **API:** `POST /api/game/submit/` with `session_id`.
- **Checks:** session not already complete; at least one event; count of **scenario** `answer` events ≥ `expected_scenario_question_count(tier)` (all required questions for that tier).
- **Then:** `run_scoring_pipeline(session)` runs inside a DB transaction.

**After success**

- `GameSession`: `is_complete=True`, `completed_at` set.
- **Deleted and recreated** for this session: `TraitScore` rows, `CareerMatchScore` rows.
- **Response** includes `trait_scores` and `career_matches` (top 12).

Premium extension: same `run_scoring_pipeline` is called again after more scenario answers; then flags like `premium_extension_complete` update.

---

## 3. Where the question weights live

1. **Database:** `Question`, `AnswerOption` with `category_weights` (JSON-like map from dimension key → integer weight).
2. **Catalog loader:** `load_mcq_items_from_db()` in `game_catalog.py` builds the same structure the scorer uses.
3. **Cache:** `get_mcq_catalog()` caches the list until invalidated on content changes.

**Decoding an option’s weights** (`_decode_option_weights` in `psychometric_scoring.py`):

- Keys starting with `aptitude_`: stored value ≥ 1 → **1.0**, else **0.0** (right/wrong).
- Other keys: if integer **> 10**, treat as **milli-units** (divide by 1000); else use as a **direct 0–1 style** float.

So authors can pack strengths either as small integers or as large “milli” values.

---

## 4. Building the student psychometric profile

**Function:** `build_student_psych_profile(session)`.

### 4.1 Which events count

- Only **`scenario` + `answer`** events.
- **Last answer per question code wins** (dedupes retries).

### 4.2 Aggregating non-aptitude dimensions

For each chosen option, for each **non-aptitude** key in the option’s weight map:

- If the item is **scenario behavioral** (`metadata.scenario_behavioral`): add **full** `val` to the running sum for that key.
- Otherwise: add **`val / 4`** (so one “direct” question doesn’t dominate the average).

Count how many times each key was updated.

### 4.3 Aptitude

For questions with `metadata.aptitude_subtest` in `{verbal, numerical, abstract, spatial}`:

- Increment attempts for that subtest.
- If decoded aptitude weight for that key is ~1.0, count as correct.

### 4.4 Normalizing to [0, 1]

- **RIASEC / personality / values:** for each key, if count > 0: `sum / count`, clamped to [0, 1]. If **never touched: 0.5** (neutral default).
- **Aptitude:** per subtest, `correct / attempts`; if **no attempts: 0.5**.

**Output structure:**

```python
{
  "riasec": { ... 6 keys ... },
  "personality": { ... 5 keys ... },
  "values": { ... 6 keys ... },
  "readiness": float,
  "aptitude": { "verbal", "numerical", "abstract", "spatial" },
}
```

This object is the **ground truth** for career matching in code.

---

## 5. From profile to the eight “report” traits and 0–10 display

### 5.1 Raw eight traits (0–1)

**Function:** `profile_to_eight_trait_scores(profile)`.

Each of the eight outputs is a **fixed weighted sum** of profile slices, e.g.:

- `analytical_reasoning` ← investigative RIASEC + abstract + verbal aptitude.
- `quantitative_comfort` ← conventional + numerical + realistic.
- `creativity_innovation` ← artistic + openness + values_creativity.
- …and so on for all eight (see the function body).

Any missing piece defaults to **0.5** inside `.get(..., 0.5)`.

### 5.2 Normalized 0–10 for the UI

**Function:** `normalize_scores(raw_scores)`.

- **Session-relative stretch:** strongest trait maps toward ~9.5, weakest toward ~3.0, so bars use the visual range.
- **Near-zero raw** traits clamp to **1.0** (“no signal”).
- If all raw are ~equal, everyone gets ~**6.0**.

**Persisted** as `TraitScore`: `trait_name`, `raw_score`, `normalized_score` per session.

---

## 6. Career recommendations (how ranks are computed)

**Function:** `match_careers_psychometric(profile, top_n=12)`.

For **every active** `Career`:

### 6.1 Load career eight-vector

From `GameCareerTraitWeight`. Missing traits default to 0; if **all zero**, code substitutes **uniform 1/8** so the career still participates.

### 6.2 Convert career weights → targets in student space

Deterministic formulas (same for every student):

- **`_interest_target_from_legacy`:** six RIASEC “targets” on a **1–5** scale derived from analytical, quantitative, creativity, social, leadership, verbal, structure, etc.
- **`_personality_target_from_legacy`:** five personality targets on **1–5**.
- **`_values_target_from_legacy`:** six value targets on **1–5**. **Note:** `values_balance` is hardcoded to **3.0 for every career** (no differentiation).
- **`_aptitude_targets_from_legacy`:** per subtest **minimum**, **ideal**, and **importance** weights (importance can emphasize numerical if that derived need is highest).

### 6.3 Four fit components

1. **Interest fit** — student RIASEC [0,1] vs career-derived RIASEC targets (converted to [0,1]):  
   `1 - mean(abs differences across 6 RIASEC))`.

2. **Aptitude fit** — student accuracy per subtest vs min/ideal band; weighted by importance.

3. **Personality fit** — weighted absolute distance in [0,1] vs 1–5-derived targets; converted to a 0–1 “closeness”.

4. **Values fit** — same style as personality, with equal default weights across the six value keys.

### 6.4 Final career score

```text
career_fit_score =
  0.40 * interest
+ 0.20 * aptitude
+ 0.15 * personality
+ 0.15 * values
```

**Readiness is not in this formula.**

### 6.5 Ranking

- Sort all careers by **descending** score.
- **Tie-break:** lower `career_slug` (alphabetically), then higher `career_id`.
- Top **12** returned; **persisted** as `CareerMatchScore` with `rank` 1…12 and `score` = `career_fit_score`.

---

## 7. Where “career weights” come from

- **Source of truth in repo:** `CAREER_TRAIT_MAP` in `seed_game_data.py` — **hand-authored** 0–1 “importance” per trait per career slug.
- **Loaded into DB** via management command: `GameCareerTraitWeight` rows.
- **Not** fitted from user outcome data in this codebase; **admin** can override.

Separate legacy system (non-game): `CareerCategoryWeight` + `WeightedSimilarityEngine` for the older 15-category MCQ attempt — **not** the same code path as `run_scoring_pipeline`.

---

## 8. Report after scoring

**Function:** `build_report(session)`.

- Reads **stored** `TraitScore` and `CareerMatchScore` (does not recompute ranks).
- Adds narrative, stream hints, education paths, etc.

So: **submit** computes and stores scores; **report** **explains** what was stored.

---

## 9. Mental model (one paragraph)

The student answers **scenario MCQs**; each option nudges many **latent dimensions** (RIASEC, personality, values, optional aptitude). The server **averages** those nudges into a **profile**. The same profile is **folded** into **eight friendly trait scores** for display (then **stretched** to 0–10 per session). **Careers** are not matched on those eight bars directly; each career’s **eight importance weights** are **transformed** into **expected** interest/personality/values/aptitude patterns, and the **profile** is scored against that pattern with **40% / 20% / 15% / 15%** weights. The top matches are saved and the report reads them back.

---

## 10. Common confusions (explicit)

| Confusion | Reality |
|-----------|---------|
| “Logic / risk / planner change my careers” | **Not in current `run_scoring_pipeline`.** Only **`scenario` answers** do. |
| “The eight bars are cosine-matched to careers” | **Display traits** are blends; **matching** uses **profile vs career-derived targets** (§6). |
| “Career weights were learned from data” | **Seeded** + admin; **judgment-based** in repo. |
| “Readiness changes my rank” | **Computed** in profile but **excluded** from `career_fit_score`. |

---

*Last aligned with backend layout as of the `run_scoring_pipeline` + `psychometric_scoring` implementation described above. If you change which `game_name` events are read, update §2.3 and §4.*
