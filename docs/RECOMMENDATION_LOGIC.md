# How Career Recommendations Work — Complete Guide

**A beginner-friendly explanation of how our platform recommends careers to users after they complete an assessment.**

This document explains everything from the basics to the technical details. No prior knowledge required.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [Two Ways to Get Recommendations](#2-two-ways-to-get-recommendations)
3. [Path A: Quiz Assessment (MCQ)](#3-path-a-quiz-assessment-mcq)
4. [Path B: Game Assessment](#4-path-b-game-assessment)
5. [How We Match Users to Careers](#5-how-we-match-users-to-careers)
6. [The Data We Use](#6-the-data-we-use)
7. [Worked Examples](#7-worked-examples)
8. [Glossary](#8-glossary)
9. [Technical Reference](#9-technical-reference)

---

## 1. The Big Picture

### What happens in simple terms?

1. **User takes an assessment** — Either a quiz (multiple-choice questions) or interactive games
2. **We collect their responses** — What they chose, how they performed, how long they took
3. **We compute a "profile"** — A set of scores that describes their interests, strengths, and context
4. **We compare this profile to 127 careers** — Each career has an "ideal profile"
5. **We rank careers by fit** — The better the match, the higher the career ranks
6. **We show the top 5 (quiz) or top 3 (game) careers** — Plus a stream recommendation (Science/Commerce/Arts)

### The core idea

> **Recommendation = How well does the user's profile match each career's ideal profile?**

We don't guess. We use math to measure similarity between:
- **User profile**: Scores from their assessment
- **Career profile**: Pre-defined weights for what that career values

---

## 2. Two Ways to Get Recommendations

Our platform has **two different assessments**. Each uses different logic:

| Aspect | Quiz Assessment | Game Assessment |
|--------|-----------------|-----------------|
| **Format** | Multiple-choice questions (Strongly disagree → Strongly agree) | 4 interactive games |
| **What we measure** | 7 interest categories (Analytical, Creative, Social, etc.) | 8 traits (Analytical Reasoning, Creativity, Leadership, etc.) |
| **Profile data used** | Subject marks, financial situation | None (games only) |
| **Matching method** | Weighted sum (Interest 60% + Academic 25% + Financial 15%) | Cosine similarity (shape of profile) |
| **Careers returned** | Top 5 | Top 3 |
| **Stream recommendation** | From top careers or category scores | From top career |

---

## 3. Path A: Quiz Assessment (MCQ)

### 3.1 The Flow (Step by Step)

```
User answers ~40 questions
        ↓
Each question belongs to a CATEGORY (e.g., Analytical, Creative, Social)
Each answer has a SCORE (1 = Strongly disagree, 5 = Strongly agree)
        ↓
We average scores per category → CATEGORY SCORES (0 to 1)
        ↓
We load user's PROFILE (subject marks, financial tier) if they filled it
        ↓
For each of 127 careers:
  - Interest fit: How well do category scores match career's category weights?
  - Academic fit: How well do subject marks match career's subject importance?
  - Financial fit: Can user afford this career's education cost?
        ↓
Total = Interest×60% + Academic×25% + Financial×15%
        ↓
Sort careers by total score, take top 5
        ↓
Stream = Primary stream of top career (Science/Commerce/Arts)
```

### 3.2 Categories (What the Quiz Measures)

Each question is tagged with one of 7 categories:

| Category | Slug | What it captures |
|----------|------|------------------|
| Analytical | analytical | Logical reasoning, problem-solving, puzzles |
| Creative | creative | Art, design, new ideas, storytelling |
| Social | social | Helping others, teamwork, empathy |
| Organizational | organizational | Planning, time management, structure |
| Technical | technical | Computers, coding, fixing things |
| Verbal | verbal | Reading, writing, debating |
| Scientific | scientific | Biology, medicine, health sciences |

**Example**: "I enjoy solving puzzles and brain teasers" → **Analytical** category

### 3.3 How Category Scores Are Computed

1. For each question, the user picks an option: 1 (Strongly disagree) to 5 (Strongly agree)
2. We group responses by category
3. For each category: **average of all scores in that category ÷ 5** = score from 0 to 1

**Example**:
- User answers 5 Analytical questions with scores: 5, 4, 5, 3, 4
- Average = 4.2
- Normalized = 4.2 / 5 = **0.84** (84% interest in Analytical)

### 3.4 The Three Factors in Career Matching

#### Factor 1: Interest (60% weight)

**Question**: How well do the user's interests align with what this career values?

Each career has **category weights**. For example:
- **Software Engineer**: analytical 0.9, technical 0.9, organizational 0.5
- **Doctor**: analytical 0.7, social 0.9, scientific 0.95

We use a formula that:
- Rewards **high user score + high career weight** (e.g., user loves analytical, career needs analytical)
- Penalizes **low user score + high career weight** (e.g., user dislikes analytical, but career needs it)
- Treats **neutral (0.5)** as "no strong opinion"

The result is a number from 0 to 1. Higher = better interest fit.

#### Factor 2: Academic (25% weight)

**Question**: Does the user have the right subject strengths for this career?

Each career has **subject weights**. For example:
- **Doctor**: science 0.95, math 0.6, english 0.5
- **Writer**: english 0.95, creative 0.8

If the user filled their **subject marks** (math, science, english, social_science) in their profile:
- We take: (mark/100) × weight for each subject
- Weighted average = academic fit (0 to 1)

If the user **didn't fill marks**: we assume **1.0** (no penalty). We don't punish users for not sharing.

#### Factor 3: Financial (15% weight)

**Question**: Can the user afford the education required for this career?

- **User financial tier**: low / medium / high (from profile)
- **Career education cost tier**: low / medium / high

We use a lookup table:

| User | Career Cost | Score |
|------|-------------|-------|
| Low | Low | 1.0 ✓ |
| Low | Medium | 0.5 |
| Low | High | 0.2 ✗ |
| Medium | Any | 1.0 ✓ |
| High | Any | 1.0 ✓ |

If the user **didn't share** or chose "Prefer not to say": we assume **1.0** (no penalty).

### 3.5 Final Score per Career

```
Total = (Interest × 0.60) + (Academic × 0.25) + (Financial × 0.15)
```

Example: Interest 0.8, Academic 1.0, Financial 1.0  
→ Total = 0.48 + 0.25 + 0.15 = **0.88** (88% compatibility)

We sort all 127 careers by this total and return the **top 5**.

### 3.6 Stream Recommendation (Quiz Path)

- **Primary stream** = Stream of the #1 recommended career
- **Secondary** = Stream of #2 career (if different)
- **Tertiary** = Stream of #3 career (if different)

If no careers matched (edge case), we use category scores to infer stream (e.g., high scientific → Science).

---

## 4. Path B: Game Assessment

### 4.1 The Flow (Step by Step)

```
User plays 4 games: Logic, Risk, Planner, Scenario
        ↓
Each game produces SIGNALS (e.g., accuracy, speed, choices)
        ↓
Signals are merged into 8 TRAIT SCORES (0 to 1 raw)
        ↓
Raw scores × 10 = NORMALIZED scores (0 to 10 scale)
        ↓
For each career: COSINE SIMILARITY between user traits and career trait weights
        ↓
Sort careers by similarity, take top 3
        ↓
Stream = Stream of #1 career
```

### 4.2 The 8 Traits

| # | Trait | What it measures |
|---|-------|------------------|
| 1 | Analytical Reasoning | Logic, pattern recognition |
| 2 | Quantitative Comfort | Comfort with numbers, math |
| 3 | Creativity & Innovation | Original thinking, artistic expression |
| 4 | Verbal & Communication | Language, expression |
| 5 | Social Orientation | People focus, collaboration |
| 6 | Leadership Drive | Taking charge, influence |
| 7 | Risk Appetite | Comfort with uncertainty |
| 8 | Structure & Discipline | Organization, planning |

### 4.3 How Trait Scores Are Computed

**Formula**: `Trait = (Game Signal × 0.6) + (Scenario Signal × 0.4)`

- **Games (60%)**: Logic game → Analytical, Quantitative; Risk game → Risk, Leadership; Planner → Structure, Social
- **Scenarios (40%)**: 10 situational questions, each option has trait weights

If a trait has only game OR only scenario data, we use whichever exists. If neither, score = 0.

### 4.4 Cosine Similarity (The Matching Method)

**Simple explanation**: We compare the *shape* of two profiles, not the size.

Imagine two arrows in space:
- **User arrow**: [7, 8, 3, 5, 2, 4, 6, 7] (8 trait scores)
- **Career arrow**: [0.9, 0.8, 0.3, 0.5, 0.2, 0.4, 0.6, 0.7] (career's ideal weights)

**Cosine similarity** = How much do these arrows point in the same direction?

- Same direction (user strong where career needs strong) → **High score (up to 1.0)**
- Opposite direction (user weak where career needs strong) → **Low score (near 0)**

**Formula**:
```
similarity = (user·career) / (|user| × |career|)
```
Where · is dot product and | | is vector length.

**Why this method?** It focuses on *proportional fit*. A user who is [high analytical, low social] matches a career that values [high analytical, low social] — even if the user's raw numbers are different from another user.

### 4.5 Stream Recommendation (Game Path)

Primary stream = Stream of the top-ranked career (e.g., Software Engineer → Science).

---

## 5. How We Match Users to Careers

### 5.1 Career Profiles (Pre-defined)

Every career in our database has:

| Data | Used in Quiz? | Used in Game? |
|------|---------------|---------------|
| **Category weights** (analytical, creative, etc.) | ✓ | ✗ |
| **Subject weights** (math, science, english, social_science) | ✓ | ✗ |
| **Education cost tier** (low/medium/high) | ✓ | ✗ |
| **Trait weights** (8 traits, 0–1 each) | ✗ | ✓ |
| **Stream** (Science/Commerce/Arts) | ✓ | ✓ |

### 5.2 Why Two Different Systems?

- **Quiz** uses categories (broader interest areas) + profile data (marks, finances). Good for students who have academic context.
- **Game** uses traits (behavioral/aptitude) from gameplay. Good for users who prefer interactive assessment and may not have filled a profile.

Both paths recommend from the same **127 careers**. The matching logic differs, but the career pool is shared.

---

## 6. The Data We Use

### 6.1 From the Assessment

| Source | Quiz | Game |
|--------|------|------|
| Question responses (1–5) | ✓ | ✗ |
| Game events (answers, time, choices) | ✗ | ✓ |

### 6.2 From the User Profile (Optional)

| Field | Used for |
|-------|----------|
| **subject_marks** | Academic fit (e.g., {math: 85, science: 82}) |
| **financial_tier** | Financial fit (low/medium/high) |

If not provided, we assume best case (no penalty).

### 6.3 From the Database

| Table | Purpose |
|-------|---------|
| **Career** | 127 careers with name, stream, cost tier |
| **CareerCategoryWeight** | Which categories each career values (quiz) |
| **CareerSubjectWeight** | Which subjects each career needs (quiz) |
| **GameCareerTraitWeight** | Which traits each career values (game) |

---

## 7. Worked Examples

### Example 1: Quiz — High Analytical, Low Social User

**User's category scores**: Analytical 0.9, Creative 0.4, Social 0.3, Technical 0.85, ...

**Software Engineer** (weights: analytical 0.9, technical 0.9):
- User strong in analytical ✓, strong in technical ✓ → High interest score

**Psychologist** (weights: social 0.95, verbal 0.7):
- User weak in social ✗ → Low interest score

**Result**: Software Engineer ranks much higher than Psychologist.

### Example 2: Quiz — Low Financial Tier User

**User**: financial_tier = "low"

**Doctor** (education_cost_tier = "high"): Financial score = 0.2 (poor fit)

**Accountant** (education_cost_tier = "low"): Financial score = 1.0 (good fit)

Even if interest in Doctor is high, the financial factor pulls the total down. Accountant may rank higher.

### Example 3: Game — Cosine Similarity

**User traits** (0–10): [8, 7, 2, 4, 3, 5, 6, 7]  
(High analytical, quantitative; low creativity, social)

**Data Scientist** weights: [0.9, 0.9, 0.5, 0.4, 0.2, 0.3, 0.4, 0.7]  
→ Vectors point in similar direction → High cosine similarity

**Fashion Designer** weights: [0.3, 0.2, 0.95, 0.5, 0.5, 0.5, 0.5, 0.4]  
→ User weak in creativity, career needs high creativity → Low cosine similarity

**Result**: Data Scientist ranks higher.

---

## 8. Glossary

| Term | Meaning |
|------|---------|
| **Category** | An interest area in the quiz (Analytical, Creative, Social, etc.) |
| **Category score** | User's average interest in a category (0–1) |
| **Career weight** | How important a category/subject/trait is for a career (0–1) |
| **Cosine similarity** | A measure of how similar two vectors are in direction (0–1) |
| **Education cost tier** | low / medium / high — how expensive is the education for this career? |
| **Financial tier** | User's self-reported affordability (low / medium / high) |
| **Stream** | Academic stream: Science, Commerce, or Arts |
| **Subject marks** | User's grades in math, science, english, social_science (0–100) |
| **Trait** | A behavioral/aptitude dimension in the game (e.g., Analytical Reasoning) |
| **Trait score** | User's score on a trait (0–10 in game path) |

---

## 9. Technical Reference

### 9.1 Key Files

| File | Purpose |
|------|---------|
| `backend/apps/assessments/services.py` | Quiz scoring, `complete_assessment_flow()` |
| `backend/apps/recommendations/services.py` | `WeightedSimilarityEngine` (quiz career matching) |
| `backend/apps/game_assessment/services/__init__.py` | `run_scoring_pipeline()` (game flow) |
| `backend/apps/game_assessment/services/career_matcher.py` | Cosine similarity (game career matching) |
| `backend/apps/game_assessment/services/trait_calculator.py` | Trait score calculation from game signals |

### 9.2 API Endpoints

| Endpoint | When | Returns |
|----------|------|---------|
| `POST /api/assessments/{id}/complete/` | User finishes quiz | Career recs + stream |
| `GET /api/recommendations/{attempt_id}/` | Fetch recs for completed quiz | Top 5 careers |
| `POST /api/game/submit/` | User finishes games | Trait scores + top 3 careers |

### 9.3 Database Models

| Model | Stores |
|-------|--------|
| `AssessmentAttempt` | Quiz attempt (user, completion status) |
| `AssessmentResult` | Category scores from quiz |
| `UserResponse` | Each question → answer mapping |
| `StreamRecommendation` | Primary/secondary/tertiary stream |
| `GameSession` | Game assessment session |
| `TraitScore` | 8 trait scores per game session |
| `CareerMatchScore` | Career + score + rank per game session |

---

## Summary

1. **Quiz path**: Category scores + profile (marks, finances) → Weighted sum (60% interest, 25% academic, 15% financial) → Top 5 careers
2. **Game path**: 8 trait scores from games → Cosine similarity vs career trait weights → Top 3 careers
3. **Stream**: Derived from top career(s) in both paths
4. **No guessing**: All recommendations are computed from user data and pre-defined career profiles
5. **Graceful fallbacks**: Missing profile data = no penalty (assume best case)

For more detail on the game assessment (events, parsers, trait calculation), see [SCORING_SYSTEM.md](./SCORING_SYSTEM.md).
