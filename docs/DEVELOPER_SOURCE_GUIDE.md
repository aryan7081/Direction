# Developer source guide

This document orients a new engineer to the **Outcave** codebase: how the monorepo is laid out, how the backend and frontend interact, and where to change behavior for assessments, auth, careers, and reports. Read this once end-to-end, then use the file paths as a map while you work.

For **recommendation math** (quiz vs game, cosine vs weighted sums), see [RECOMMENDATION_LOGIC.md](./RECOMMENDATION_LOGIC.md). For **end-to-end game scoring** (event payloads, trait model, pipeline steps), see [SCORING_SYSTEM.md](./SCORING_SYSTEM.md). This guide focuses on **code structure and runtime flows**.

---

## 1. High-level architecture

| Layer | Technology | Location |
| -------- | ----------- | -------- |
| API | Django 4 + Django REST Framework | `backend/` |
| Auth | JWT (Simple JWT) + Google OAuth | `backend/apps/users/` |
| Frontend | Next.js 14 (App Router) + TypeScript + MUI + TanStack Query | `frontend/` |
| DB | PostgreSQL when `DB_HOST` or `DATABASE_URL` is set; else SQLite in dev | `backend/config/settings/` |

**Request shape:** Browser → Next.js (may **rewrite** `/api/*` to the Django backend) → DRF views → services / models → JSON.

**Two product surfaces:**

1. **Quiz assessment** — Traditional flow: questions from DB, `AssessmentAttempt`, profile-aware recommendations.
2. **Game assessment** — Interactive flow: `GameSession`, event log, scenario questions derived from the **same** 30-item MCQ bank, trait scoring, paid PDF/report optional.

Both paths share **canonical item definitions** in `backend/apps/assessments/content/mcq_items.py`.

---

## 2. Repository layout

```
outcave/   # repository root (your clone folder may differ)
├── backend/
│   ├── config/                 # Django project: settings, root urls, WSGI
│   │   ├── settings/           # base.py + development.py / production.py
│   │   ├── urls.py             # Mounts /api/... to apps
│   │   └── schema_urls.py      # OpenAPI/Swagger (drf-spectacular)
│   ├── manage.py
│   └── apps/
│       ├── common/             # Shared models, visitor tracking API
│       ├── users/              # User model, JWT, Google auth
│       ├── assessments/        # Quiz: Question, Attempt, scoring service
│       ├── careers/            # Career catalogue, category/subject weights
│       ├── recommendations/  # Engines for quiz recommendations
│       ├── reports/            # Quiz PDF: `/api/reports/<attempt_id>/pdf/`
│       └── game_assessment/    # Sessions, events, scoring pipeline, payments, PDFs
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js routes (pages)
│   │   ├── features/           # Domain modules (auth, assessment, game-assessment, …)
│   │   ├── components/         # Shared UI (Providers, loaders, …)
│   │   ├── stores/             # Global client state (e.g. auth)
│   │   ├── lib/                # API client (axios), helpers
│   │   └── theme/              # MUI theme
│   └── next.config.js          # Rewrites /api → backend; COOP headers for Google
├── docs/
│   ├── RECOMMENDATION_LOGIC.md    # Quiz recommendation blend / ranks
│   ├── SCORING_SYSTEM.md          # Game assessment scoring (deep dive)
│   └── DEVELOPER_SOURCE_GUIDE.md  # (this file)
└── README.md                   # Quick start, env vars, deployment notes
```

---

## 3. Backend deep dive

### 3.1 Settings and entrypoints

- **`backend/config/settings/__init__.py`** — Chooses `development` vs `production` via `DJANGO_ENV`.
- **`base.py`** — `INSTALLED_APPS`, middleware, DRF/Spectacular, base `AUTH_USER_MODEL`, etc.
- **`development.py` / `production.py`** — `DEBUG`, database, `CORS_ALLOWED_ORIGINS` (localhost, private LAN regexes, named deploy/tunnel hosts where configured), security flags.

**Database (development):** PostgreSQL is used if **`DB_HOST`** or **`DATABASE_URL`** is set; otherwise SQLite at `backend/db.sqlite3`. Production expects PostgreSQL via env (see root **README.md**).

`ROOT_URLCONF` is `config.urls`: everything user-facing is under **`/api/`** (except Django admin).

### 3.2 URL routing (`backend/config/urls.py`)

| Prefix | App | Purpose |
|--------|-----|---------|
| `/api/visitors/track/` | `common` | Visitor tracking (`VisitorTrackView`) |
| `/api/auth/...` | `users` | `register/`, `login/`, `google/`, `refresh/`, `profile/` |
| `/api/` (assessment) | `assessments` | `dashboard/`, `questions/`, `assessment/start/`, `assessment/<id>/submit/`, `assessment/<id>/result/` |
| `/api/careers/...` | `careers` | List + detail by slug |
| `/api/recommendations/<attempt_id>/` | `recommendations` | Quiz-path recommendations |
| `/api/reports/<attempt_id>/pdf/` | `reports` | Quiz-attempt PDF (not the game report) |
| `/api/game/...` | `game_assessment` | See below |

**`game_assessment` paths (all under `/api/`):** `game/content/`, `game/start/`, `game/log-event/`, `game/submit/`, `game/save-progress/`, `game/create-account/`, `game/results/<session_id>/`, `game/dashboard/`, `game/resume/`, `game/report/<session_id>/teaser/`, `game/report/<session_id>/` (full HTML report), `game/report/<session_id>/pdf/`, `game/payment/create-order/`, `game/payment/verify/`.

Inspect **`apps/*/urls.py`** for HTTP methods and view classes.

### 3.3 `apps.users`

- Custom **`User`** model (email-based), serializers, `GoogleAuthView` (accepts Google credential; can link **`session_id`** for game flow).
- JWT: access/refresh in localStorage on the client; refresh endpoint is standard Simple JWT.

### 3.4 `apps.assessments` (quiz path)

**Models** (`models.py`):

- **`Category`** — Includes legacy interest slugs (`analytical`, `creative`, …) and section categories (`riasec-interests`, `work-traits`, `work-personality`).
- **`Question`** — `text`, `category`, `order`, **`metadata`** (JSON: code, format, section hints for UI).
- **`AnswerOption`** — `score` (legacy Likert) + **`category_weights`** (JSON: multi-signal weights per canonical slug for MCQ items).
- **`AssessmentAttempt`**, **`UserResponse`**, **`AssessmentResult`** — One attempt per user flow; results store computed category scores.

**Scoring** (`services.py` — `AssessmentScoringService`):

- Aggregates **`category_weights`** from selected options into per-category totals, normalizes to **0–1**.
- Feeds **`recommendations`** (see that app) with profile/academic/financial blend as documented in `RECOMMENDATION_LOGIC.md`.

**API** (`views.py` + `urls.py`):

- **`GET /api/questions/`** — Lists questions for the authenticated user’s quiz UI (`serializers` expose options with `category_weights` where needed).
- Start/submit/result endpoints operate on **`attempt_id`**.

**Seeding** (`management/commands/seed_data.py`):

- Rebuilds categories and **replaces all `Question` rows** from **`MCQ_ITEMS`** in `content/mcq_items.py` (30 items). Run after pulling MCQ changes:  
  `python manage.py seed_data`

### 3.5 Canonical MCQ content (`apps/assessments/content/mcq_items.py`)

- **`MCQ_ITEMS`** — List of dicts: RIASEC + traits + personality prompts, each with **`section_category_slug`**, **`metadata`**, and **`options`** as `(label, { slug: weight })` maps.
- **Single source of truth** for:
  - DB questions (via `seed_data`)
  - Game scenario payloads (via `game_assessment.content.scenarios`)

When you add or edit questions, update **`mcq_items.py`** and re-run **`seed_data`** (note: it deletes existing questions; cascades apply to related rows).

### 3.6 `apps.game_assessment`

**Models** (`models.py`):

- **`GameSession`** — UUID PK; **`user`** nullable until guest signs in; `is_complete`, `pending_email`.
- **`GameEventLog`** — `game_name` (`logic` | `risk` | `planner` | `scenario`), `event_type`, **`payload`**, `timestamp`.
- **`TraitScore`**, **`CareerMatchScore`** — Outputs of scoring; links to **`careers.Career`**.
- **`ReportOrder`** (and related) — Payment gating for full report/PDF.

**Content** (`content/`):

- **`scenarios.py`** — Builds **`SCENARIO_QUESTIONS`** from **`MCQ_ITEMS`**: maps each option’s interest weights into **8 trait signals** for `parse_scenario_events`. **`get_scenario_questions()`** strips weights for the API (id, prompt, option id/text only).
- **`logic_game.py`**, **`risk_game.py`**, **`planner_game.py`** — Legacy mini-games; the live **`GameEngine`** sets **`GAME_PHASES = ['scenario']`**, so the default user path is intro → scenario → (optional **save_progress**) → processing. **`LogicGame` / `RiskSimulator` / `PlannerGame`** components remain in the tree for legacy phases or old sessions; the backend content serializers may still expose related fields for compatibility.

**Services pipeline** (`services/__init__.py` — **`run_scoring_pipeline`**):

1. Load all **`GameEventLog`** rows for the session.
2. **`event_parser`** — `parse_*_events` → signal dicts per game type.
3. **`trait_calculator`** — Combine signals into raw trait scores.
4. **`normalizer`** — Scale to comparable ranges.
5. **`career_matcher`** — Match normalized trait vector to careers (**`GameCareerTraitWeight`** in DB).
6. Persist **`TraitScore`** + **`CareerMatchScore`**; mark session complete.

**Views** (`views.py`) — Representative responsibilities:

- **`GameContentView`** — Returns bundled content (scenario questions from `get_scenario_questions()`, plus any legacy structures the serializer still includes).
- **`StartSessionView`** — Creates **`GameSession`** (guest allowed).
- **`LogEventView`** — Batches client events into **`GameEventLog`**.
- **`SaveProgressView`** / **`CreateAccountFromSessionView`** — Email/account flows tied to a session (see views for current product use).
- **`SubmitSessionView`** — Runs **`run_scoring_pipeline`**.
- **`SessionResultView`** — Scores + payload for a completed session.
- **`ResumeSessionView`** — Authenticated; returns `resume_phase` and **`scenario_answer_index`** (count of scenario answers) for mid-flow resume.
- **`GameDashboardView`** — Aggregated game-side dashboard data for the user.
- **Report teaser / full report / PDF** — Check permissions and **`ReportOrder`** status.
- **Razorpay** — `CreatePaymentOrderView`, `VerifyPaymentView`; if **`RAZORPAY_KEY_ID`** is empty in dev, the API may unlock the report without payment (see view messaging).

**Serializers** (`serializers.py`) — Validate event payloads, session submission, payment callbacks.

### 3.7 `apps.careers` and `apps.recommendations`

- **`Career`**, **`CareerCategoryWeight`**, **`CareerSubjectWeight`**, **`StreamRecommendation`**, etc. — Populated heavily in **`seed_data`**.
- **`recommendations`** — Engine classes and views used by the **quiz** path to rank careers; game path uses **`game_assessment.services.career_matcher`** instead.

### 3.8 `apps.common`

- **`VisitorTrackingMiddleware`** + **`VisitorTrackView`** — Lightweight analytics hook.

### 3.9 Auth and permissions (mental model)

- **Quiz** endpoints typically require **JWT** (`IsAuthenticated`).
- **Game** allows **anonymous session start**; guest answers are tied to **`GameSession`**. **Save progress / Google** links the session to a **`User`** (see `users` Google view + game serializers).
- Always check **`permission_classes`** on the specific DRF view you touch.

---

## 4. Frontend deep dive

### 4.1 Runtime providers (`src/components/Providers.tsx`)

- **TanStack Query** — Server state, caching.
- **MUI ThemeProvider** + **CssBaseline**.
- **`trackVisitor()`** on mount.

### 4.2 API client (`src/lib/api.ts`)

- Axios instance; on each request in the browser, **`getApiBase()`** sets **`baseURL`** to:
  - **`NEXT_PUBLIC_API_URL_TUNNEL`** when the page hostname contains **`trycloudflare.com`** (Cloudflare Tunnel / mobile-style access).
  - **`'/api'`** when the host is **`vercel.app`**, **`outcave.in`**, or **`www.outcave.in`** — same-origin; **`next.config.js`** rewrites `/api/*` to the backend (see `NEXT_PUBLIC_API_URL` at build time for the rewrite target).
  - **`NEXT_PUBLIC_API_URL`** when set (typical local dev: `http://localhost:8000/api`).
  - Otherwise **`${window.location.protocol}//${window.location.hostname}:8000/api`** (e.g. phone on Wi‑Fi hitting the dev server on your machine).
- During SSR, Axios still uses **`DEFAULT_API_BASE`** from env or `http://localhost:8000/api` (browser overrides per request as above).
- Request interceptor: attaches **`Authorization: Bearer`** from **`localStorage`** (`access`).
- Response interceptor: on **401**, **`POST ${getApiBase()}/auth/refresh/`** once with `refresh`, then retries the original request.

### 4.3 Auth store (`src/stores/authStore.ts`)

- Zustand + **persist** with **`partialize: ({ user })`** — only **`user`** is persisted to the named store; **`access`/`refresh`** are written directly to **`localStorage`** inside **`setAuth`** / **`logout`** so the axios client and refresh flow stay consistent.

### 4.4 Next.js App Router (`src/app/`)

| Route | Typical purpose |
|-------|------------------|
| `page.tsx` | Marketing / landing |
| `login`, `register`, `forgot-password` | Auth forms |
| `dashboard/page.tsx` | Post-login hub; lists attempts / resume links |
| `assessment/page.tsx` | **Quiz** (`AssessmentPage`); wraps Suspense if using search params |
| `game-assessment/page.tsx` | **Game** shell (`GameEngine`) |
| `report/page.tsx` | Report / payment flow (session query param) |
| `careers`, `careers/[slug]` | Career browser |
| `result/page.tsx` | Quiz result redirect target |

**`layout.tsx`** — Root layout, fonts, **`Providers`**.

### 4.5 Feature modules (`src/features/`)

| Feature | Role |
|---------|------|
| **`auth/`** | Login/register forms, **`GoogleSignInButton`**, `ProtectedRoute` |
| **`assessment/`** | Quiz: `AssessmentPage`, `ResultPage`, API wrappers |
| **`game-assessment/`** | `GameEngine`, `ScenarioSection`, progress, processing, **`store.ts`** (Zustand: `phase`, `eventQueue`, `scenarioStartIndex`, …), `api.ts` |
| **`career-report/`** | Game report UI: teaser, full **`CareerReportPage`**, chart/breakdown components, `api.ts` for game report endpoints |
| **`dashboard/`** | Dashboard cards, resume URLs |
| **`careers/`** | List + detail pages |
| **`profile/`** | `ProfileForm` + `api` for **`/api/auth/profile/`** (embedded in dashboard/settings flows; no dedicated `app/profile` route required) |
| **`reports/`** | Quiz PDF download helper — **`/api/reports/<attempt_id>/pdf/`** (distinct from game report PDF) |
| **`visitors/`** | `trackVisitor` → **`/api/visitors/track/`** |

### 4.6 Game assessment client flow (summary)

1. **`GameEngine`** loads **`fetchGameContent`**, may **`reset`** store, handles **`resumeSessionId`** from URL.
2. **Intro** → user starts → **`startGameSession`** → `phase = 'scenario'`.
3. **`ScenarioSection`** renders questions; each answer **`pushEvent`** to the Zustand queue; **`GameEngine`**’s **`flushEvents`** drains the queue and calls **`logEvents`** (`POST .../game/log-event/`) before auth gates, phase changes, and submit.
4. **Guest gate** — After **N** answers (default **5**), if not authenticated, **`flushEvents`**, set **`scenarioStartIndex`**, `phase = 'save_progress'`.
5. **`SaveProgressScreen`** → Google → **`googleAuth`** with **`sessionId`** → JWT stored → back to **`scenario`** at **`scenarioStartIndex`**.
6. After last question → **`advancePhase`** → **`processing`** → **`submitSession`** → navigate to **`/report`**.

Align with actual code in:

- `features/game-assessment/components/GameEngine.tsx`
- `ScenarioSection.tsx`
- `store.ts`
- `api.ts`

### 4.7 Quiz client flow (summary)

- **`AssessmentPage`** loads questions, submits answers per **`attempt`**, uses URL/search params for resume where implemented.
- Types for API shapes live in **`features/assessment/`** or shared **`types`**.

### 4.8 Production API routing

- **`next.config.js`** — Builds `rewrites()` from **`NEXT_PUBLIC_API_URL`**: strips a trailing `/api`, then maps **`/api/:path*`** → **`${base}/api/:path*`** (two rules cover trailing slash variants). Local default target is `http://localhost:8000/api` when env is unset.

---

## 5. How the two assessments stay in sync

```text
mcq_items.py  ───►  seed_data (Question + AnswerOption in DB)
      │
      └──►  scenarios.py (scenario_questions + weight → trait mapping)
```

- **Quiz UI** reads from **`GET /api/questions/`** (DB).
- **Game UI** reads from **`GET /api/game/content/`** (built from same MCQ list).
- Changing copy or weights: edit **`mcq_items.py`**, run **`seed_data`**, redeploy backend; game content is regenerated on server import—no separate game seed file required for the 30 items.

---

## 6. Common tasks for new developers

| Task | Where to look |
|------|----------------|
| Add/reword a question | `backend/apps/assessments/content/mcq_items.py` → `seed_data` |
| Change guest sign-in gate timing | `ScenarioSection` `authGateAfterCount` / `GameEngine` props |
| Change trait scoring from scenarios | `game_assessment/content/scenarios.py` + `services/event_parser.py` |
| Change career matching (game) | `game_assessment/services/career_matcher.py` + DB weights |
| Change quiz recommendation blend | `recommendations/` + `RECOMMENDATION_LOGIC.md` |
| New API route | App `views.py` + `urls.py` + frontend `features/*/api.ts` |
| Env vars | `backend/.env` (see **`backend/.env.example`**), `frontend/.env.local` (and **`.env`** for some `NEXT_PUBLIC_*` — see **README**); game payments: **`RAZORPAY_KEY_ID`**, **`RAZORPAY_KEY_SECRET`** |

---

## 7. Prerequisites and quality

**Toolchain (align with root README):** Python **3.11+**, Node **18.17+** (Next.js 14 minimum; **20 LTS** recommended), PostgreSQL **14+** optional locally (SQLite OK without `DB_HOST` / `DATABASE_URL`).

- Backend: Django’s **`TestCase`** in each app’s `tests/` (add if missing for your feature).
- Frontend: **`npm run lint`**, **`npx tsc --noEmit`** before PRs.
- Manual smoke: **`python manage.py runserver`** (use **`0.0.0.0:8000`** for device testing per README), **`npm run dev`** or **`npm run dev:mobile`**, complete one guest game session + one authenticated quiz path.

---

## 8. Glossary

| Term | Meaning |
|------|---------|
| **Attempt** | Quiz run (`AssessmentAttempt`) |
| **Session** | Game run (`GameSession`, UUID) |
| **category_weights** | Per-option contribution map onto **Category** slugs for scoring |
| **Phase** | Game UI step: `intro`, `scenario`, `save_progress`, `processing`, … |
| **RIASEC** | Holland interest types; encoded in MCQ metadata and weights |

---

## 9. Suggested reading order

1. Root **`README.md`** — run backend + frontend locally, env vars, mobile tunnel notes.
2. This document — map directories to responsibilities.
3. **`docs/RECOMMENDATION_LOGIC.md`** — quiz recommendation blend and ranks.
4. **`docs/SCORING_SYSTEM.md`** — game events → traits → careers (when you touch **`game_assessment`** scoring or content).
5. Trace one **game** request: `GameEngine` → `features/game-assessment/api.ts` → `game_assessment/views.py` → `run_scoring_pipeline`.
6. Trace **quiz**: `AssessmentPage` → `assessments/views.py` → `AssessmentScoringService`.

You now have enough context to navigate the codebase deliberately: start from the route or API you care about, jump to the listed module, and follow imports inward.
