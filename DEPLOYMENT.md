# Deployment Guide

## Local Verification (Before Deploying)

Run these commands from the repository root to verify the app works locally before pushing.

### Backend

```bash
cd skilio-backend-final/skilio-backend-final/skilio-backend

# Install dependencies
python -m pip install -r requirements.txt

# Run database migrations
python -m alembic upgrade head

# Seed demo data
python scripts/seed.py

# Run tests (must all pass)
python -m pytest tests -v

# Verify the app starts (Ctrl+C to stop)
# uvicorn app.main:app --reload
```

### Frontend

```bash
cd skilio-frontend-final/skilio-frontend-final/skilio-frontend

# Install dependencies
npm install

# Production build (must succeed with no errors)
npm run build
```

---

## Railway Backend Deployment

1. Go to [railway.app](https://railway.app) and create a new project.
2. Click **"Deploy from GitHub repo"** and select this repository.
3. In the Railway project settings, set the **root directory** to:
   ```
   skilio-backend-final/skilio-backend-final/skilio-backend
   ```
4. Railway auto-detects the `Dockerfile`; the build uses it automatically.

### Railway PostgreSQL Database

1. In the same Railway project, click **"New Service" → "Database" → "PostgreSQL"**.
2. Railway injects `DATABASE_URL` automatically when both services are in the same project.
   - If Railway provides `POSTGRES_URL` instead, add `DATABASE_URL=$POSTGRES_URL` manually.
3. The URL format Railway provides:
   ```
   postgresql://user:password@hostname:5432/dbname
   ```

### Backend Environment Variables

Set these in Railway → Service → Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...` (from Railway PostgreSQL plugin) | Auto-injected if same project |
| `SECRET_KEY` | 64+ character random hex string | `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | No trailing slash |
| `DEBUG` | `false` | Required for production |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Optional — default is 30 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Optional — default is 7 |

### Post-Deploy: Migrations and Seed

After the first successful Railway deploy, open the Railway service shell and run:

```bash
python -m alembic upgrade head
python scripts/seed.py
```

Or add a `release` command in `railway.toml`:

```toml
[deploy]
releaseCommand = "python -m alembic upgrade head && python scripts/seed.py"
```

---

## Vercel Frontend Deployment

1. Go to [vercel.com](https://vercel.com) and click **"New Project"**.
2. Import this repository from GitHub.
3. Set the **root directory** to:
   ```
   skilio-frontend-final/skilio-frontend-final/skilio-frontend
   ```
4. Vercel auto-detects Vite; the build command is `npm run build` and output directory is `dist`.

### Frontend Environment Variables

Set in Vercel → Project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.up.railway.app` (no trailing slash) |

### SPA Routing

The `vercel.json` at `skilio-frontend-final/skilio-frontend-final/skilio-frontend/vercel.json` handles client-side routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This ensures deep links (e.g. `/parent/dashboard`) are served by `index.html` and handled by React Router.

---

## CORS Configuration Note

The backend `ALLOWED_ORIGINS` must exactly match the Vercel frontend URL:

```
# Correct
ALLOWED_ORIGINS=https://skilio.vercel.app

# Wrong — trailing slash breaks matching
ALLOWED_ORIGINS=https://skilio.vercel.app/
```

If you use a custom domain on Vercel, add both the Vercel URL and the custom domain:

```
ALLOWED_ORIGINS=https://skilio.vercel.app,https://www.skilio.com
```

---

## Post-Deploy Smoke Test

After both services are live, verify:

```bash
# Backend health check
curl https://your-backend.up.railway.app/health
# Expected: {"status":"ok","app":"Skilio","version":"1.0.0","database":"postgresql"}

# Registration test
curl -X POST https://your-backend.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","full_name":"Smoke Test","password":"Smoke1234!"}'
# Expected: 201 with user object

# Login test
curl -X POST https://your-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'username=demo@skilio.com&password=Demo1234!'
# Expected: 200 with access_token

# Frontend loads correctly
# Open https://your-app.vercel.app in a browser
# Expected: Login page renders
```

### Demo Credentials (after seed)

```
Email:    demo@skilio.com
Password: Demo1234!
```

---

## Rollback

### Backend Rollback (Railway)

1. In Railway → Deployments, find the last working deployment.
2. Click the three-dot menu → **"Rollback to this deployment"**.
3. If schema migration needs reverting:
   ```bash
   python -m alembic downgrade -1
   ```

### Frontend Rollback (Vercel)

1. In Vercel → Deployments, click the last known-good deployment.
2. Click **"Promote to Production"** to instantly roll back.

---

## Environment Summary

| Environment | Backend | Frontend |
|-------------|---------|----------|
| Local dev | SQLite (auto) | `npm run dev` → `http://localhost:5173` |
| Production | Railway + PostgreSQL | Vercel |
