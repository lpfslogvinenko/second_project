# Telegram Calorie Tracker (Mini App)

Express + PostgreSQL backend, React (Vite) frontend, Telegram `initData` auth, optional meal photo hook for TensorFlow.js or Vision APIs.

## Layout

- `backend/` — API, bot webhook, JWT sessions after Telegram validation
- `frontend/` — Mini App UI (deploy to Vercel)

## Local development

1. Create a Postgres database and copy `backend/.env.example` to `backend/.env` (set `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `JWT_SECRET`).
2. Install dependencies:

```bash
npm run install:all
```

3. Start API (from `backend/`):

```bash
npm run dev
```

4. Start UI (from `frontend/`, proxies `/api` to `http://localhost:4000`):

```bash
npm run dev
```

Open the Mini App from Telegram so `Telegram.WebApp.initData` is present; the UI exchanges it for a JWT via `POST /api/auth/telegram`.

## Main HTTP routes

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/telegram` | Body `{ "initData": "..." }` |
| GET | `/api/users/me` | Bearer JWT |
| PATCH | `/api/users/me` | `daily_calorie_goal`, `onboarding_completed` |
| GET | `/api/meals` | List meals |
| GET | `/api/meals/summary` | Today totals (UTC day) |
| POST | `/api/meals` | `multipart/form-data`: `description`, `calories`, optional `photo` |
| GET | `/api/streaks` | Streak stats |
| POST | `/telegram/webhook` | Bot updates (optional `TELEGRAM_WEBHOOK_SECRET`) |

Bot commands implemented in `backend/controllers/botController.js`: `/start`, `/stats`, `/goal <n>`.

## Deployment

- **Frontend (Vercel):** set root to `frontend`, build `npm run build`, output `dist`. Set `VITE_API_BASE_URL` to your public API origin (include protocol, no trailing slash).
- **Backend (Heroku):** set `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `JWT_SECRET`, `CORS_ORIGIN` (your Vercel URL). `Procfile` runs `node server.js`. Register webhook to `https://<app>.herokuapp.com/telegram/webhook` with `secret_token` matching `TELEGRAM_WEBHOOK_SECRET` if used.

Uploaded images are stored under `backend/uploads` by default; for Heroku, switch to object storage (S3, etc.) because the filesystem is ephemeral.

## AI photo recognition

Stub in `backend/utils/photoRecognition.js`. Replace `analyzeMealPhoto` with TensorFlow.js inference or a call to Google Vision / another vendor.
