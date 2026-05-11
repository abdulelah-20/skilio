# Testing Guide

## Backend Tests

### Setup

```bash
cd skilio-backend-final/skilio-backend-final/skilio-backend
python -m pip install -r requirements.txt
```

### Run All Tests

```bash
python -m pytest tests -v
```

### Run with Coverage

```bash
pip install pytest-cov
python -m pytest tests -v --cov=app --cov-report=term-missing
```

### Run a Single File

```bash
python -m pytest tests/test_auth.py -v
python -m pytest tests/test_content.py -v
```

### Run a Single Test

```bash
python -m pytest tests/test_auth.py::TestLogin::test_login_success -v
```

---

## Frontend Build Verification

```bash
cd skilio-frontend-final/skilio-frontend-final/skilio-frontend
npm install
npm run build
```

A successful build produces a `dist/` directory. If TypeScript or Vite reports errors, the build exits non-zero.

---

## Test Coverage Summary

### Authentication (`test_auth.py`)

| Class | Tests | What is covered |
|-------|-------|-----------------|
| TestRegister | 6 | Success, duplicate email (409), weak/short password (422), invalid email (422), blank name (422) |
| TestLogin | 4 | Success + token shape, wrong password (401), unknown email (401) |
| TestMe | 3 | Authenticated, unauthenticated (401), invalid token (401) |
| TestChildren | 5 | Create, age bounds validation, list, cross-owner 404 |
| TestHealth | 1 | `/health` returns 200 |

### Content & Scenarios (`test_content.py`)

| Class | Tests | What is covered |
|-------|-------|-----------------|
| TestModules | 4 | Unauthenticated 401, list modules, module detail with lessons, 404 not found |
| TestLessons | 3 | Unauthenticated 401, lesson detail with entry_node_id, 404 not found |
| TestScenarios | 7 | Start attempt, resume (idempotent), get current state, advance choice, complete scenario, **invalid choice rejected (400)**, history audit trail |
| TestChildProgress | 4 | Progress list, badges list, dashboard summary, attempts list |
| TestChildManagement | 5 | Update name, update age, soft-delete (204), deleted child returns 404, cross-parent 404 |

**Total: 42 tests across 2 files.**

---

## Manual Smoke Test Checklist

Run through this checklist after every deployment:

### Authentication
- [ ] Register a new account at `/register`
- [ ] Login redirects to parent dashboard
- [ ] Invalid credentials show error message
- [ ] Refreshing the page keeps the user logged in (refresh token works)

### Parent Flow
- [ ] Parent dashboard lists children
- [ ] Create a new child profile with name and age
- [ ] Child appears in the list immediately
- [ ] Click child card → child detail page shows XP, modules, badges
- [ ] Update child name — persists after refresh
- [ ] Navigate to module browser — all 3 modules appear

### Kid Flow
- [ ] Select a child → see the module/lesson browser
- [ ] Click a lesson → scenario player loads with a question
- [ ] Make a choice → feedback text appears
- [ ] Make all choices → completion screen shows XP earned
- [ ] Return to module browser — lesson shows as completed
- [ ] XP total updated on child dashboard

### Scenario Integrity
- [ ] Starting the same lesson again resumes the in-progress attempt (no duplicate)
- [ ] Completing a lesson awards XP to the child
- [ ] History tab on parent dashboard shows the choices made

### Badges
- [ ] Completing a lesson awards "First Step" badge (first completion)
- [ ] Badge appears on child detail page

### Error States
- [ ] Accessing a protected route without login redirects to `/login`
- [ ] API returns 401 without Authorization header

---

## CI/CD Explanation

Two GitHub Actions workflows run on every push and pull request:

### `backend-ci.yml`
1. Checks out the repository.
2. Sets up Python 3.11.
3. Installs `requirements.txt`.
4. Runs `alembic upgrade head` (migrations on SQLite CI DB).
5. Runs `python scripts/seed.py` (seeds demo data).
6. Runs `python -m pytest tests -v`.

All steps must pass for the workflow to succeed. Pull requests are blocked from merging if this fails.

### `frontend-ci.yml`
1. Checks out the repository.
2. Sets up Node.js 20.
3. Runs `npm install`.
4. Runs `npm run build` (TypeScript compile + Vite bundle).

A successful build means the frontend can be deployed to Vercel.

---

## Screenshots / Proof Checklist

Take and include these screenshots in your submission:

- [ ] `screenshots/01-login.png` — Login page
- [ ] `screenshots/02-parent-dashboard.png` — Parent dashboard with child cards
- [ ] `screenshots/03-add-child.png` — Add child form
- [ ] `screenshots/04-module-browser.png` — Module selection grid
- [ ] `screenshots/05-lesson-list.png` — Lesson list for a module
- [ ] `screenshots/06-scenario-player.png` — Scenario question with choices
- [ ] `screenshots/07-completion-screen.png` — Scenario completion with XP
- [ ] `screenshots/08-child-detail.png` — Child detail showing progress + badges
- [ ] `screenshots/09-pytest-results.png` — Terminal showing all 42 tests passing
- [ ] `screenshots/10-frontend-build.png` — Terminal showing `npm run build` success
- [ ] `screenshots/11-github-actions.png` — GitHub Actions showing both CI workflows green
