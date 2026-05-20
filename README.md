# Team Task Manager

Production-style full-stack app for teams to manage projects and tasks with **JWT auth** and **role-based access control** (admin vs member). The API enforces permissions; the UI mirrors them for clarity.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT (`Authorization: Bearer`), bcryptjs, express-validator  
- **Frontend:** React (Vite), Tailwind CSS, React Router v6, Axios, react-hot-toast  
- **Tooling:** ESLint, Prettier, Nodemon, Concurrently

## Prerequisites

- Node.js 18+  
- A running MongoDB instance (local or Atlas)

## Setup

1. **Clone / open this folder** in your editor.

2. **Backend environment**

   ```bash
   cp server/.env.example server/.env
   ```

   Edit `server/.env` and set `MONGO_URI` and a strong `JWT_SECRET`.

3. **Install dependencies**

   ```bash
   npm install
   cd client && npm install && cd ..
   ```

4. **Seed sample data** (optional but useful for demos)

   ```bash
   npm run seed
   ```

   The script prints admin and member credentials.

5. **Run app (API + Vite)**

   From the repository root:

   ```bash
   npm run dev
   ```

   - API: `http://localhost:5000`  
   - Client: `http://localhost:5173` (proxies `/api` to the server)

## API conventions

- Success: `{ "data": ... }`  
- Errors: `{ "error": "...", "details": ["..."] }` (when applicable)  
- Protected routes expect: `Authorization: Bearer <token>`  
- Passwords are never returned on user objects.

## Default seed accounts

After `npm run seed` the database includes **10 projects**, **20 tasks**, and **50 members** (plus 1 admin):

| Role   | Email               | Password     |
|--------|---------------------|--------------|
| Admin  | `admin@example.com` | `password123` |
| Member | `member@example.com`| `password123` |
| Members 2–50 | `member2@example.com` … `member50@example.com` | `password123` |

Change these in production.

## Sign up with a role

On **Sign up** (`/signup`), choose **Account type**:

- **Admin** — create/edit/delete projects, manage members, create and assign tasks, full dashboard.
- **Member** — view projects you’re added to, see assigned tasks, update status on your own tasks.

New accounts default to **Member** if no role is sent.

## Scripts

| Command          | Description                          |
|------------------|--------------------------------------|
| `npm run dev`    | API (nodemon) + client (Vite)        |
| `npm run server` | API only                             |
| `npm run client` | Client only                          |
| `npm run seed`   | Reset DB and insert demo data        |
| `npm run lint`   | ESLint                               |
| `npm run format` | Prettier write                       |

## Project layout

- `server/` — Express app, models, controllers, routes, middleware, seed  
- `client/` — Vite + React SPA  

## Push to GitHub

`server/.env` is **not** committed (secrets stay local). `server/seed.js` **is** committed — anyone cloning the repo can run `npm run seed` to load demo data.

```bash
gh auth login
gh repo create TeamTaskManager --public --source=. --remote=origin --push
```

If the repo already exists on your account, set the remote and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/TeamTaskManager.git
git push -u origin main
```

## License

MIT
