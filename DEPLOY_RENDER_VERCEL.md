# Deploy on Render (API) + Vercel (frontend)

## Before you start

1. **MongoDB Atlas** → Network Access → **Allow Access from Anywhere** (`0.0.0.0/0`).
2. Repo on GitHub: `pragatmittal/TeamTaskManager`.

---

## Part 1 — Render (backend API)

In Render: **New** → **Web Service** → connect `TeamTaskManager`.

Fill the form **exactly** like this:

| Field | Value |
|-------|--------|
| **Name** | `team-task-manager-api` (or any name) |
| **Region** | Oregon (or same region you prefer) |
| **Branch** | `main` |
| **Root Directory** | *(leave empty)* |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (ok for demos; cold starts after idle) |

### Environment variables (Render → Environment)

| Key | Value |
|-----|--------|
| `MONGO_URI` | Your Atlas connection string |
| `JWT_SECRET` | Long random string (e.g. 32+ chars) |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | Leave empty until Vercel is deployed, then set to your Vercel URL (see below) |

Click **Deploy Web Service**.

When deploy succeeds, open the service URL, e.g.:

`https://team-task-manager-api.onrender.com`

Test API: `https://YOUR-API.onrender.com/api/health` → should return `{"data":{"ok":true}}`.

Copy your API base URL: `https://YOUR-API.onrender.com`

### Seed the database (once)

On your computer (with `server/.env` using the same `MONGO_URI`):

```bash
npm run seed
```

---

## Part 2 — Vercel (React frontend)

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import `pragatmittal/TeamTaskManager`.
3. Configure:

| Field | Value |
|-------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `client` ← click Edit, set to `client` |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `dist` (default) |

### Environment variables (Vercel → Settings → Environment Variables)

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://YOUR-API.onrender.com/api` |

Use your **real** Render URL and include `/api` at the end.

4. **Deploy**.

Copy your Vercel URL, e.g. `https://team-task-manager.vercel.app`

---

## Part 3 — Connect API CORS to Vercel

Back in **Render** → your API service → **Environment**:

| Key | Value |
|-----|--------|
| `CLIENT_URL` | `https://YOUR-APP.vercel.app` |

No trailing slash. Save → Render will **redeploy** the API.

---

## Part 4 — Test

1. Open your **Vercel** URL.
2. Login: `admin@example.com` / `password123` (after seed).
3. Or **Sign up** and pick Admin / Member.

---

## Quick reference

| | URL |
|---|-----|
| Frontend | `https://….vercel.app` |
| API | `https://….onrender.com` |
| Health check | `https://….onrender.com/api/health` |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Render build fails | Build = `npm install` only (not `yarn`) |
| `Application failed to respond` | Check Render logs; verify `MONGO_URI` and Atlas IP allowlist |
| Login fails on Vercel | `VITE_API_URL` must be `https://xxx.onrender.com/api` then **redeploy** Vercel |
| CORS error | `CLIENT_URL` on Render must match Vercel URL exactly |
| 404 on refresh (Vercel routes) | `vercel.json` in repo handles SPA rewrites |
| Slow first request | Render free tier sleeps after ~15 min idle |

## Local development (unchanged)

```bash
npm run dev
```

Uses Vite proxy to `/api` — no `VITE_API_URL` needed locally.
