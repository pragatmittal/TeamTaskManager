# Deploy with Render (API) + Vercel (frontend)

## Before you start

1. **MongoDB Atlas** → Network Access → **Allow Access from Anywhere** (`0.0.0.0/0`).
2. Have your Atlas connection string ready (same as local `server/.env`).

---

## Part 1 — Render (backend API)

You are on **New Web Service**. Fill the form like this:

| Field | What to enter |
|-------|----------------|
| **Name** | `team-task-manager-api` (or any unique name) |
| **Language** | `Node` |
| **Branch** | `main` |
| **Region** | Oregon or Singapore (either is fine) |
| **Root Directory** | **Leave empty** (repo root, not `client`) |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (for testing) |

Do **not** use `yarn` unless you use Yarn locally — this project uses **npm**.

### Environment variables (Render → Environment)

Click **Add Environment Variable** for each:

| Key | Value |
|-----|--------|
| `MONGO_URI` | `mongodb+srv://...` (your Atlas URI) |
| `JWT_SECRET` | Long random string (e.g. 32+ characters) |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | Leave empty for now — add after Vercel (step 2) |

Then click **Deploy Web Service**.

### After deploy

1. Wait until status is **Live**.
2. Open the service → copy your public URL, e.g.  
   `https://team-task-manager-api.onrender.com`
3. Test in browser:  
   `https://YOUR-API.onrender.com/api/health`  
   You should see: `{"data":{"ok":true}}`

### Seed production database (once)

On your Mac (with `MONGO_URI` in `server/.env` pointing to Atlas):

```bash
cd TeamTaskManager
npm run seed
```

---

## Part 2 — Vercel (React frontend)

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import GitHub repo **`pragatmittal/TeamTaskManager`**.
3. Configure:

| Field | Value |
|-------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `client` (click Edit → set to `client`) |
| **Build Command** | `npm run build` (default for Vite) |
| **Output Directory** | `dist` (default) |
| **Install Command** | `npm install` |

### Environment variable (Vercel → Environment Variables)

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://YOUR-API.onrender.com/api` |

Replace `YOUR-API` with your real Render hostname. **Must end with `/api`.**

Example:

```
https://team-task-manager-api.onrender.com/api
```

4. Click **Deploy**.

### After Vercel is live

Copy your Vercel URL, e.g. `https://team-task-manager.vercel.app`

---

## Part 3 — Connect API CORS to Vercel

Back in **Render** → your API service → **Environment**:

| Key | Value |
|-----|--------|
| `CLIENT_URL` | `https://YOUR-APP.vercel.app` |

Use the exact Vercel URL, **no trailing slash**.

Save → Render will **redeploy** the API automatically.

---

## Part 4 — Test

1. Open your **Vercel** URL.
2. Log in: `admin@example.com` / `password123` (after `npm run seed`).
3. Or **Sign up** and pick Admin / Member.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Render build fails on `yarn` | Set Build Command to `npm install` |
| `Application failed to respond` on Render | Check logs; usually wrong `MONGO_URI` or Atlas IP not allowed |
| Login fails / network error on Vercel | `VITE_API_URL` must be `https://....onrender.com/api` — redeploy Vercel after changing |
| CORS error in browser console | Set `CLIENT_URL` on Render to exact Vercel URL; redeploy API |
| Slow first request on Free Render | Free tier sleeps after ~15 min idle — wait ~30s on first load |
| 404 on refresh (`/dashboard`) | `client/vercel.json` handles SPA routes — ensure it’s deployed |

---

## Summary

| Service | Hosts | Root folder |
|---------|--------|-------------|
| **Render** | Express API | `/` (repo root) |
| **Vercel** | React app | `/client` |
