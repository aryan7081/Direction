# Quiz Recommendation Flow

This document explains the **current quiz recommendation flow in code**: what happens when a user starts the quiz, submits answers, how rows are stored, how scores are computed, and how the final career recommendations are ranked.

This file is intentionally focused on the **quiz / MCQ path**. For the game assessment path, see [SCORING_SYSTEM.md](./SCORING_SYSTEM.md).

---

## 1. Scope

This document describes the logic behind:

- `POST /api/assessment/start/`
- `GET /api/questions/`
- `POST /api/assessment/<attempt_id>/submit/`
- `GET /api/assessment/<attempt_id>/result/`
- `GET /api/recommendations/<attempt_id>/`

Relevant backend files:

- `backend/apps/assessments/models.py`
- `backend/apps/assessments/views.py`
- `backend/apps/assessments/services.py`
- `backend/apps/assessments/serializers.py`
- `backend/apps/recommendations/services.py`
- `backend/apps/recommendations/views.py`
- `backend/apps/careers/models.py`
- `backend/apps/assessments/content/mcq_items.py`

---

## 2. End-to-End Flow

The quiz recommendation path is:

```text
User opens quiz
    -> GET /api/questions/
    -> frontend renders DB-backed questions + answer options

User starts quiz
    -> POST /api/assessment/start/
    -> AssessmentAttempt row is created

User submits answers
    -> POST /api/assessment/<attempt_id>/submit/
    -> existing UserResponse rows for that attempt are deleted
    -> new UserResponse rows are inserted
    -> complete_assessment_flow(attempt) runs

complete_assessment_flow(attempt)
    -> AssessmentScoringService.save_result()
    -> WeightedSimilarityEngine.get_recommendations()
    -> StreamRecommendation.objects.update_or_create(...)
    -> attempt.is_complete = True

Frontend receives
    -> category_scores
    -> stream_recommendation
    -> top 5 career_recommendations
```

---

## 3. What Gets Stored

### 3.1 Questions and options

Quiz content ultimately lives in the database as:

- `Category`
- `Question`
- `AnswerOption`

The source of truth for the current quiz bank is `backend/apps/assessments/content/mcq_items.py`, which is used by the seed command to populate `Question` and `AnswerOption`.

Important detail: an `AnswerOption` has both:

- `score` - legacy numeric score
- `category_weights` - JSON mapping of category slug to weight

The current scoring service prefers `category_weights` when present.

### 3.2 Attempt lifecycle tables

When the user starts and completes a quiz, these records are involved:

| Model | What it stores |
|------|-----------------|
| `AssessmentAttempt` | One quiz run for one user |
| `UserResponse` | One selected option per question for that attempt |
| `AssessmentResult` | Computed category scores, raw score breakdown, question count |
| `StreamRecommendation` | Primary / secondary / tertiary stream for the attempt |

### 3.3 Recommendations are mostly computed, not persisted

There is a `CareerRecommendation` model in `backend/apps/recommendations/models.py`, but the current quiz flow does **not** write to it.

Current behavior:

- `AssessmentResult` is persisted
- `StreamRecommendation` is persisted
- career recommendations are **computed on demand** by `WeightedSimilarityEngine`

That means:

- `POST /api/assessment/<attempt_id>/submit/` computes recommendations and returns them
- `GET /api/assessment/<attempt_id>/result/` computes recommendations again from stored result data
- `GET /api/recommendations/<attempt_id>/` also computes them on the fly

---

## 4. API Flow In Detail

### 4.1 `GET /api/questions/`

`QuestionListView` returns active questions from the DB:

- ordered by `Question.order`
- includes `category`
- includes `answer_options`
- includes `metadata`

The serializer exposed to the frontend returns each answer option with:

- `id`
- `text`
- `order`

The frontend submits back only the chosen `answer_option_id`; it does not compute recommendation math itself.

### 4.2 `POST /api/assessment/start/`

`StartAssessmentView` creates:

- one `AssessmentAttempt(user=request.user)`

and returns:

```json
{
  "attempt_id": 123,
  "message": "Assessment started"
}
```

### 4.3 `POST /api/assessment/<attempt_id>/submit/`

Expected payload:

```json
{
  "responses": [
    { "question_id": 1, "answer_option_id": 4 },
    { "question_id": 2, "answer_option_id": 10 }
  ]
}
```

`SubmitAssessmentView` does the following:

1. Verifies the attempt belongs to the authenticated user and is not already complete.
2. Validates the request with `SubmitAssessmentSerializer`.
3. Deletes all prior `UserResponse` rows for that attempt.
4. Re-inserts one `UserResponse` row per submitted answer.
5. Calls `complete_assessment_flow(attempt)`.
6. Returns the scored result payload.

Because the view deletes and recreates responses, submission behaves like "replace the full answer set for this attempt".

---

## 5. How Quiz Scores Are Computed

The scoring entrypoint is `AssessmentScoringService.save_result()`.

It performs two related computations:

- `compute_scores()` -> normalized category scores
- `get_raw_scores()` -> raw per-category sums / counts / averages

### 5.1 Response loading

The service loads all `UserResponse` rows for the attempt and joins:

- `question`
- `answer_option`
- `question__category`

### 5.2 Category scoring logic

For each response:

1. Read `answer_option.category_weights`.
2. If `category_weights` exists, use that mapping.
3. If not, fall back to:
   - `question.category_id`
   - `answer_option.score`

So the current quiz is not just "question belongs to one category and option has one score". It supports multi-category contribution per selected option.

### 5.3 Exact normalization rule

For each category:

1. Sum all contributed values for that category
2. Count how many contributions were added
3. Compute average = `total / count`
4. Normalize to 0-1 with:

```text
normalized = min(1.0, average / 5.0)
```

The result is stored in `AssessmentResult.category_scores` as JSON using **stringified category IDs** as keys.

Example shape:

```json
{
  "1": 0.84,
  "2": 0.56,
  "5": 0.92
}
```

### 5.4 Raw score storage

`AssessmentResult.raw_scores` stores debugging-style aggregates per category:

```json
{
  "1": {
    "sum": 21.0,
    "count": 5,
    "avg": 4.2
  }
}
```

This is useful because the normalized score alone does not tell you how it was built.

### 5.5 Persisted result row

`save_result()` uses `AssessmentResult.objects.update_or_create(...)`, so the result is overwritten if the same attempt is rescored.

Stored fields:

- `attempt`
- `category_scores`
- `raw_scores`
- `total_questions_answered`

---

## 6. How Careers Are Ranked

Career ranking is done by `WeightedSimilarityEngine.get_recommendations(attempt, top_n=5)`.

The engine reads:

- `AssessmentResult.category_scores`
- `attempt.user.profile.subject_marks` if available
- `attempt.user.profile.financial_tier` if available
- all active `Career` rows
- related `CareerCategoryWeight`
- related `CareerSubjectWeight`

For every active career, it computes:

```text
total = interest * 0.60 + academic * 0.25 + financial * 0.15
```

Then it sorts descending and returns the top 5.

### 6.1 Interest compatibility (60%)

This is the most important factor.

The engine compares the user's category scores against the career's `CareerCategoryWeight` rows.

Important implementation details:

- category score keys are looked up by **category ID as string**
- if the user has no score for a category, the engine uses `0.5` as neutral
- careers with no category weights are skipped

The current method is **not plain cosine similarity**. It uses a custom weighted formula designed to:

- reward high user interest where the career has high weight
- penalize low user interest where the career has high weight
- treat `0.5` as neutral
- break ties among very flat response patterns

Core idea:

```text
weighted_sum += career_weight * (user_score - 0.5)
```

That weighted sum is then normalized into 0-1 using:

```text
raw_min = -0.3 * weight_sum
raw_max = 0.5 * weight_sum
base = (weighted_sum - raw_min) / (raw_max - raw_min)
```

Then a small 1% tie-breaker is blended in:

- if the base score is very low, lighter careers are favored
- if the base score is very high, heavier careers are favored
- otherwise a dot-product-style signal is used

Final interest score:

```text
interest = clamp(base * 0.99 + tie_break * 0.01, 0, 1)
```

This custom logic exists because a simpler similarity metric did not distinguish well enough between "all disagree" and "all agree" response patterns.

### 6.2 Academic compatibility (25%)

This uses:

- `Profile.subject_marks`
- `CareerSubjectWeight`

Supported subject keys are whatever careers use in `subject_slug`, currently intended for values like:

- `math`
- `science`
- `english`
- `social_science`

Rules:

- if the user has **no subject marks at all**, academic score = `1.0`
- if the career has **no subject weights**, academic score = `1.0`
- if some subjects are missing from the user's marks, that missing subject defaults to `50`

Formula:

```text
academic = sum((mark / 100) * weight) / sum(weight)
```

So academic fit is a weighted average of normalized marks.

### 6.3 Financial compatibility (15%)

This uses:

- `Profile.financial_tier`
- `Career.education_cost_tier`

If the user has no financial tier, the score is `1.0`.

If the user selected `prefer_not`, the code converts that to empty and also treats it as `1.0`.

Current matrix:

| User tier | Career cost | Score |
|-----------|-------------|-------|
| low | low | 1.0 |
| low | medium | 0.5 |
| low | high | 0.2 |
| medium | low | 1.0 |
| medium | medium | 1.0 |
| medium | high | 0.6 |
| high | low | 1.0 |
| high | medium | 1.0 |
| high | high | 1.0 |

### 6.4 Final returned recommendation shape

Each returned item looks like:

```json
{
  "career_id": 17,
  "career_name": "Software Engineer",
  "career_slug": "software-engineer",
  "stream": "Science",
  "compatibility_score": 0.88,
  "compatibility_percent": 88.0
}
```

Notes:

- `compatibility_score` is rounded to 2 decimals
- `compatibility_percent` is `score * 100`, capped at `100`

---

## 7. Stream Recommendation

After career recommendations are computed, `complete_assessment_flow()` derives streams from the ranked careers.

Current behavior:

1. Walk the top career recommendations in rank order
2. Collect unique stream names
3. Use the first three unique streams as:
   - `primary`
   - `secondary`
   - `tertiary`

If no career recommendations are returned, the code falls back to `StreamRecommendationService`, which maps category slugs into broad stream buckets:

- `Science`
- `Commerce`
- `Arts`

That fallback is based on keyword matching in category slugs.

The final stream recommendation is persisted in `StreamRecommendation`.

---

## 8. What `complete_assessment_flow()` Actually Does

`complete_assessment_flow(attempt)` orchestrates the full quiz completion sequence:

1. Score the attempt with `AssessmentScoringService`
2. Persist / update `AssessmentResult`
3. Compute top 5 careers with `WeightedSimilarityEngine`
4. Derive stream recommendation from those careers
5. Persist / update `StreamRecommendation`
6. Mark the attempt complete:
   - `attempt.is_complete = True`
   - `attempt.completed_at = timezone.now()`
7. Return the response payload

Returned shape:

```json
{
  "result_id": 55,
  "category_scores": { "1": 0.84, "2": 0.56 },
  "stream_recommendation": {
    "primary": "Science",
    "secondary": "Commerce",
    "tertiary": "Arts",
    "scores": {
      "Science": 1.0,
      "Commerce": 0.5,
      "Arts": 0.25
    }
  },
  "career_recommendations": [
    {
      "career_id": 17,
      "career_name": "Software Engineer",
      "career_slug": "software-engineer",
      "stream": "Science",
      "compatibility_score": 0.88,
      "compatibility_percent": 88.0
    }
  ]
}
```

---

## 9. Important Behaviors And Edge Cases

### 9.1 Re-submitting an incomplete attempt overwrites responses

Because `SubmitAssessmentView` deletes old `UserResponse` rows before inserting new ones, the stored answer set for an incomplete attempt is replaced on each submit.

### 9.2 Missing profile data does not penalize the student

The current engine is intentionally forgiving:

- no subject marks -> academic = `1.0`
- no financial tier -> financial = `1.0`
- `financial_tier = prefer_not` -> financial = `1.0`

### 9.3 Missing category scores default to neutral

If a career expects a category the user has no stored score for, the engine uses `0.5`, not `0`.

### 9.4 Recommendation rows are not cached per attempt

The `CareerRecommendation` model exists, but the current request flow does not persist top-5 quiz recommendations there.

### 9.5 Category score keys are IDs, not slugs

`AssessmentResult.category_scores` stores category IDs as string keys. The recommendation engine therefore matches careers by `category_id`, not by category slug.

---

## 10. Practical Trace For One Quiz Submission

If you want to trace a real request in code, follow this order:

1. `backend/apps/assessments/views.py`
   `SubmitAssessmentView.post()`
2. `backend/apps/assessments/services.py`
   `complete_assessment_flow()`
3. `backend/apps/assessments/services.py`
   `AssessmentScoringService.compute_scores()`
4. `backend/apps/recommendations/services.py`
   `WeightedSimilarityEngine.get_recommendations()`
5. `backend/apps/recommendations/services.py`
   `_interest_compatibility()`
6. `backend/apps/recommendations/services.py`
   `_academic_compatibility()`
7. `backend/apps/recommendations/services.py`
   `_financial_compatibility()`

---

## 11. Short Summary

When a user submits the quiz:

1. their selected options are stored in `UserResponse`
2. those responses are converted into normalized category scores in `AssessmentResult`
3. the system loads every active career and scores it across:
   - interest fit
   - academic fit
   - financial fit
4. the final score is:

```text
0.60 * interest + 0.25 * academic + 0.15 * financial
```

5. the top 5 careers are returned
6. stream recommendation is derived from those top careers
7. the attempt is marked complete

For the interactive game recommendation path, see [SCORING_SYSTEM.md](./SCORING_SYSTEM.md).
