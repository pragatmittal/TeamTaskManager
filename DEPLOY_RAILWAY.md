# Deploy Team Task Manager on Railway

You need **two Railway services** from the same GitHub repo: one for the **API** and one for the **React frontend**.

## 1. MongoDB Atlas (network access)

In [MongoDB Atlas](https://cloud.mongodb.com) → **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).

Railway uses dynamic IPs; this is required for the API to connect.

## 2. Create a Railway project

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. **New Project** → **Deploy from GitHub repo** → choose `pragatmittal/TeamTaskManager`.

## 3. Service A — API (backend)

1. Open the service Railway created → **Settings**.
2. **Root Directory:** leave empty (repo root `/`).
3. **Start Command:** `npm start` (or use `railway.toml` at root).
4. **Variables** → add:

   | Variable        | Value |
   |-----------------|-------|
   | `MONGO_URI`     | Your Atlas connection string |
   | `JWT_SECRET`    | Long random string |
   | `JWT_EXPIRES_IN`| `7d` |
   | `CLIENT_URL`    | Leave empty for now; set after frontend is deployed |

5. **Settings** → **Networking** → **Generate Domain** (e.g. `https://team-task-manager-api.up.railway.app`).
6. Copy this URL — you need it for the frontend.

7. Optional: run seed once locally against Atlas, or from Railway **Shell** (if available):
   ```bash
   npm run seed
   ```

## 4. Service B — Frontend

1. In the same Railway project: **+ New** → **GitHub Repo** → same repo `TeamTaskManager`.
2. **Settings** → **Root Directory:** `client`
3. **Variables** (set **before** redeploy / build):

   | Variable         | Value |
   |------------------|-------|
   | `VITE_API_URL`   | `https://YOUR-API-DOMAIN.up.railway.app/api` |

   Replace with your real API domain from step 3.

4. **Networking** → **Generate Domain** for the frontend (e.g. `https://team-task-manager.up.railway.app`).

5. Trigger **Redeploy** so Vite rebuilds with `VITE_API_URL`.

## 5. Link API CORS to frontend

Go back to the **API** service → **Variables** → set:

```
CLIENT_URL=https://YOUR-FRONTEND-DOMAIN.up.railway.app
```

Redeploy the API service.

## 6. Test

1. Open your **frontend** Railway URL.
2. Log in: `admin@example.com` / `password123` (after seeding).
3. Or sign up with Admin / Member on `/signup`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API won’t start | Check `MONGO_URI`, Atlas IP allowlist |
| Frontend loads but login fails | `VITE_API_URL` must end with `/api` and match API domain; redeploy frontend |
| CORS error in browser | Set `CLIENT_URL` on API to exact frontend URL (no trailing slash) |
| Empty database | Run `npm run seed` with `MONGO_URI` pointing at Atlas |

## Local vs production

| | Local | Railway |
|---|--------|---------|
| API | `http://localhost:5001` | `https://…-api.up.railway.app` |
| App | `http://localhost:5173` | `https://…up.railway.app` |
| API URL in client | Vite proxy `/api` | `VITE_API_URL` env var |
