# Direction

AI-powered career discovery for Class 9–10 students. Clean architecture, Django REST backend, Next.js frontend.

## Structure

```
notByChance/
├── backend/          # Django + DRF
│   ├── apps/
│   │   ├── users/       # Auth, profiles
│   │   ├── assessments/ # Questions, attempts, scoring
│   │   ├── careers/     # Career DB, weights
│   │   ├── recommendations/ # Matching engine
│   │   ├── reports/     # PDF generation
│   │   └── common/      # Shared models
│   ├── config/          # Settings, URLs
│   └── manage.py
└── frontend/         # Next.js 14 + TypeScript
    └── src/
        ├── app/         # Pages
        ├── features/    # Auth, assessment, careers, reports
        ├── components/
        └── lib/
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

For PostgreSQL, set env vars (or use `.env` from `.env.example`):

```bash
export DB_NAME=career_discovery
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_HOST=localhost
export DB_PORT=5432
export SECRET_KEY=your-secret-key
```

For quick local dev without PostgreSQL, omit `DB_HOST` – SQLite will be used automatically.

```bash
python manage.py migrate
python manage.py createsuperuser  # optional, for admin access
python manage.py seed_data
python manage.py runserver
```

- API: http://localhost:8000/api/
- Admin: http://localhost:8000/admin/
- Swagger: http://localhost:8000/api/docs/swagger/

### Frontend

```bash
cd frontend
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

```bash
npm run dev
```

App: http://localhost:3000

### Mobile Testing

To test on your phone (same Wi‑Fi as your Mac):

1. **Backend** – run on all interfaces:

   ```bash
   cd backend
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Frontend** – run with mobile binding:

   ```bash
   cd frontend
   npm run dev:mobile
   ```

3. On your phone, open `http://<YOUR_MAC_IP>:3000` (e.g. `http://192.168.1.100:3000`).

The app will auto-detect the host and call the API on the same IP at port 8000.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | No | Register |
| POST | `/api/auth/login/` | No | Login (JWT) |
| POST | `/api/auth/refresh/` | No | Refresh token |
| GET | `/api/auth/profile/` | Yes | Profile |
| GET | `/api/dashboard/` | Yes | Dashboard |
| GET | `/api/questions/` | Yes | List questions |
| POST | `/api/assessment/start/` | Yes | Start assessment |
| POST | `/api/assessment/<id>/submit/` | Yes | Submit answers |
| GET | `/api/assessment/<id>/result/` | Yes | Get result |
| GET | `/api/careers/` | Yes | List careers |
| GET | `/api/careers/<slug>/` | Yes | Career detail |
| GET | `/api/recommendations/<attempt_id>/` | Yes | Recommendations |
| GET | `/api/reports/<attempt_id>/pdf/` | Yes | Download PDF |

## Database Schema (Key Models)

- **User** – email, role (student/admin)
- **Profile** – grade, school, parent_email
- **Category** – Analytical, Creative, Social, etc.
- **Question** – text, category, order
- **AnswerOption** – text, score
- **AssessmentAttempt** – user, is_complete
- **UserResponse** – attempt, question, answer_option
- **AssessmentResult** – category_scores JSON
- **Career** – name, stream, description
- **CareerCategoryWeight** – career, category, weight
- **StreamRecommendation** – primary/secondary/tertiary stream

## Recommendation Algorithm

1. Compute normalized category scores (0–1) from user responses
2. Cosine-like similarity: user vector × career weight vector
3. Rank careers by compatibility %
4. Modular design: swap `BaseRecommendationEngine` for AI later

## Production

- `DJANGO_ENV=production`
- Set `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, DB credentials
- `python manage.py collectstatic`
- Use gunicorn/uwsgi + nginx

## Future

- LLM career explanation generator
- AI chatbot advisor
- Parent dashboard
- School SaaS analytics
- Multi-language support
