# Kids Mode Flow

## How parent login works

1. Parent navigates to `/login` and enters their credentials.
2. `useLogin` calls `POST /api/auth/login` then `GET /api/auth/me`.
3. On success, the JWT access token is stored **in-memory** (Zustand `authStore`).
4. The parent is redirected to `/dashboard` (the Parent Portal).

## How Kids Mode is entered

### From the Parent Dashboard
Each child card on `/dashboard` has a **"▶ Play as [name]"** button.
Clicking it:
1. Writes the child's `ChildSummary` into `kidsStore.selectedChild` (localStorage-persisted).
2. Navigates to `/kids`.

### Route guard
`KidsRoute` (`src/components/kids/KidsRoute.tsx`) wraps all `/kids/*` routes.  
It checks two conditions in order:
- Is there a JWT token? If not → `/login`.
- Is there a `selectedChild`? If not → `/dashboard`.

### Kids index redirect (`/kids`)
`KidsIndex` checks whether the child already has a hero configured:
- No hero or empty hero name → `/kids/hero-builder` (Character Builder).
- Hero exists → `/kids/worlds` (World Selection).

## Full Kids Mode flow

```
/dashboard  →  [Play as Elif]
     ↓
/kids  →  KidsIndex checks hero
     ↓ (first time)
/kids/hero-builder  →  Pick Nova/Marina/Leaf/Blaze + colour + name
     ↓  [Start my adventure!]
/kids/worlds  →  World Selection (3 world cards with progress)
     ↓  [Choose a world]
/kids/worlds/:moduleId  →  World Missions list + character speech bubble
     ↓  [▶ Play]
/kids/play/:moduleId/:lessonId  →  Kids Mission Player (full-screen, themed)
     ↓  (mission complete)
[More missions] → /kids/worlds/:moduleId
[← Exit]        → /kids/worlds/:moduleId
[← Portal]      → /dashboard
```

## Components added/changed

### New files
| File | Purpose |
|---|---|
| `src/store/kidsStore.ts` | Zustand store for selectedChild, hero, heroColor, heroName |
| `src/components/kids/KidsRoute.tsx` | Route guard: auth + selectedChild |
| `src/components/kids/KidsShell.tsx` | Layout wrapper (dark background) for all /kids pages |
| `src/pages/kids/KidsIndex.tsx` | Redirect logic: hero-builder vs worlds |
| `src/pages/kids/worldThemes.ts` | Theme definitions for Outer Space / Deep Sea / Enchanted Forest |
| `src/pages/kids/CharacterBuilderPage.tsx` | Pick hero, colour, hero name |
| `src/pages/kids/WorldSelectionPage.tsx` | 3 world cards with XP + progress |
| `src/pages/kids/WorldMissionsPage.tsx` | Themed missions list + character greeting |
| `src/pages/kids/KidsMissionPlayerPage.tsx` | Full-screen kids scenario player |

### Modified files
| File | Change |
|---|---|
| `src/router.tsx` | Added `/kids/*` route group under `KidsRoute` + `KidsShell` |
| `src/pages/parent/Dashboard.tsx` | Added `▶ Play as [name]` button to each child card |
| `src/store/authStore.ts` | Fixed `isLoading: true → false` (initial bug: spinner looped forever) |

## Where hero/progress is saved

| Data | Storage |
|---|---|
| `selectedChild` | `localStorage` via Zustand `persist` (key: `skilio-kids`) |
| `hero`, `heroColor`, `heroName` | `localStorage` via Zustand `persist` (key: `skilio-kids`) |
| XP and lesson progress | **Backend** — `POST /api/scenarios/attempts` + `POST .../choose` update `child.total_xp` and `Progress` records in the database |
| Attempt history | **Backend** — readable via `GET /api/children/:id/attempts` |

Hero settings use localStorage as a **temporary frontend fallback** — the backend does not store hero type or hero name. To persist these server-side, a `PATCH /api/children/:id` call with `avatar_url` could be repurposed, or a new `hero_settings` field added to the Child model.

## Manual test checklist

1. Log in as `demo@skilio.com` / `Demo1234!` → see **Parent Portal** (sidebar, child cards).
2. Click **"▶ Play as Elif"** → redirected to `/kids`.
3. Character Builder appears (dark purple, star background).
4. Select **Nova** → pick a colour → type a hero name → click **Start my adventure!**.
5. World Selection appears with **Outer Space, The Deep Sea, Enchanted Forest** cards.
6. Click **Enchanted Forest** → see green forest theme, Leo the Lion greeting, mission list.
7. Click **▶ Play** on a mission → Kids Mission Player opens.
8. Read the story prompt, click a choice → see feedback toast and next node.
9. Complete the mission → celebration screen with XP count.
10. Click **More missions** → back to world missions.
11. Click **← Portal** → back to `/dashboard` (Parent Portal intact).
12. Run `npm run build` in the frontend directory → build must pass with zero errors.

## Limitations

- Hero type, hero colour, and hero name are stored in **localStorage only** (not synced to backend).
  Clearing browser storage will reset the hero on the next session.
- The `KidsRoute` requires a parent-level JWT token. There is no separate child login.
  Kids Mode is entered by a parent selecting a child profile from the Parent Dashboard.
- The `useModules(selectedChild.age)` age filter may return fewer worlds if the child's age
  is outside a module's `age_min`–`age_max` range. Seed data covers ages 5–15.
