# Skilio User Guide

Skilio is a scenario-based life skills and safety learning platform for children aged 4–17. Parents manage child profiles and track every decision in real time. Children navigate interactive story worlds and earn XP for making safe choices.

---

## Demo Credentials

Use these to explore a pre-seeded account with children and completed lessons:

| Field | Value |
|-------|-------|
| Email | `demo@skilio.com` |
| Password | `Demo1234!` |

The demo account includes two children (Elif, age 8 and Kerem, age 11) and three learning worlds (Outer Space, Deep Sea, Enchanted Forest).

---

## Parent Flow

### 1. Register / Login

1. Visit the app URL.
2. Click **Register** to create a new parent account.
   - Enter your email, full name, and a password (min 8 characters, must include a number).
3. After registering, you are redirected to the **Parent Dashboard**.
4. On subsequent visits, use **Login** with your email and password.

### 2. Parent Dashboard

The dashboard shows all child profiles you have created. Each card displays:
- Child's name and avatar
- Total XP earned
- Number of completed lessons

Click a child card to view their full detail page.

### 3. Add a Child

1. Click **"Add Child"** on the dashboard.
2. Enter the child's display name and age (4–17).
3. Optionally upload or paste an avatar URL.
4. Click **Save** — the child appears on your dashboard immediately.

### 4. Child Detail Page

Shows everything about one child:
- **XP total** and progress bar
- **Module progress**: how many lessons completed per world
- **Badge collection**: which badges have been earned
- **Attempt history**: every lesson played, with the choices made

### 5. Manage Children

- **Edit**: Click the edit icon on a child card to update their name or age.
- **Delete**: Soft-deletes the profile (history is preserved). Deleted children no longer appear on the dashboard.

---

## Kid Flow

### Switching to a Child's View

1. From the Parent Dashboard, click a child's card.
2. Click **"Play as [child name]"** (or the equivalent button in your version).
3. The interface switches to the kid-friendly world selection screen.

### World Selection

Three learning worlds are available:

| World | Age Range | Theme |
|-------|-----------|-------|
| 🌌 Outer Space | 5–12 | Safe paths, asking for help |
| 🌊 The Deep Sea | 6–14 | Trusting helpers, stranger awareness |
| 🌲 Enchanted Forest | 7–15 | Shortcuts vs. safety, fire emergency |

Click a world to see its lessons.

---

## Scenario Player

### Starting a Lesson

1. Click a lesson card from the lesson list.
2. The scenario player loads with the first story beat — a narrative question with 2–3 choices.

### Making Choices

- Read the story text carefully.
- Click one of the choice buttons.
- Feedback appears briefly explaining why the choice was good or not ideal.
- The story advances to the next beat.

### Completing a Lesson

- When the story reaches an end, a **Completion Screen** appears.
- **Correct (safe) path** → full XP reward (e.g. 60–75 XP).
- **Unsafe path** → reduced XP (partial reward) with a learning message.
- XP is added to the child's total automatically.

### Resuming a Lesson

If you close the app mid-lesson, your progress is saved. Starting the same lesson again resumes exactly where you left off.

---

## Rewards and Progress

### XP (Experience Points)

Each lesson awards XP based on the path chosen:
- Safe/correct path: full XP (varies by lesson: 60–75 XP)
- Unsafe path: reduced XP (approximately 1/5 of the full reward, minimum 10 XP)

XP accumulates on the child's profile and is visible on the parent dashboard.

### Badges

Badges are awarded automatically when a child hits specific milestones:

| Badge | Trigger |
|-------|---------|
| First Step | Complete your first lesson |
| Safety Explorer | Complete 3 different lessons |
| World Champion | Complete all lessons in a module |
| XP Pioneer | Earn 100 XP total |
| Safe Choice Champion | Make 10 safe choices across all lessons |

Badges appear on the child's detail page as they are earned.

---

## Troubleshooting

### Login fails with "Incorrect email or password"
- Double-check your email is typed correctly (no trailing spaces).
- Passwords are case-sensitive.
- If you've forgotten your password, register a new account (no password reset in MVP).

### "Rate limit exceeded" error
- You've made too many login attempts in 1 minute. Wait 60 seconds and try again.

### Scenario choices are not saving
- Check your internet connection — choices require an active API call.
- Refresh the page; the scenario will resume from the last saved node.

### Child not appearing after creation
- Refresh the parent dashboard.
- Check you are logged in to the correct parent account.

### Frontend shows blank page
- Hard-refresh the browser (`Ctrl+Shift+R` / `Cmd+Shift+R`).
- Ensure `VITE_API_URL` is correctly set to the backend URL (no trailing slash).

### API returns CORS error
- The backend `ALLOWED_ORIGINS` must match the exact frontend URL (no trailing slash).
- Contact your deployment administrator to update the `ALLOWED_ORIGINS` environment variable.

### "Account is deactivated" on login
- Your account was deactivated. Contact the platform administrator.
