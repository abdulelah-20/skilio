# Skilio Presentation Assets — SVG Screenshots

Polished SVG slide assets for the Skilio final project PowerPoint presentation.
Each file is 1600×900 px (16:9). All assets are self-contained SVGs with no external dependencies.

---

## File Index

| File | PPT Slide | Suggested Slide Title | What it Proves |
|---|---|---|---|
| `01-title-hero.svg` | Slide 1 | Skilio — Scenario-Based Life Skills | Project identity, scope, tech stack overview |
| `02-project-overview-flow.svg` | Slide 2 | How Skilio Works — User Journey | End-to-end flow: login → hero → world → scenario → XP → parent review |
| `03-kid-character-builder.svg` | Slide 3 | Kid Mode — Build Your Hero | Character builder UI, avatar selection, colour picker, name input |
| `04-kid-world-selection.svg` | Slide 4 | Kid Mode — Choose Your World | 3 story worlds with progress bars, lesson dots, start/continue buttons |
| `05-lesson-path.svg` | Slide 5 | Kid Mode — Lesson Path | Lesson progress map with completed/active/locked states and XP bar |
| `06-scenario-player.svg` | Slide 6 | Scenario Engine — Make a Choice | Scenario node with NPC dialogue, 3 choice options, XP reward indicator |
| `07-completion-reward.svg` | Slide 7 | Scenario Complete — Earn Your Reward | Completion screen with XP earned, badge awarded, level progress bar |
| `08-parent-dashboard.svg` | Slide 8 | Parent Mode — Track Your Children | SaaS dashboard with child cards, per-module progress, recent activity |
| `09-api-swagger-proof.svg` | Slide 9 | API Proof — 27 Endpoints | Mock FastAPI Swagger UI with all 7 routers and endpoint detail |
| `10-architecture-diagram.svg` | Slide 10 | System Architecture | 5-layer stack diagram: Browser → Proxy → FastAPI → ORM → DB |
| `11-database-dag.svg` | Slide 11 | Data Model — 13 Entities | Full ERD with self-referential scenario DAG highlighted |
| `12-auth-flow.svg` | Slide 12 | Authentication &amp; Security Flow | JWT flow, bcrypt, httpOnly cookie, token rotation, reuse detection |
| `13-testing-ci.svg` | Slide 13 | Testing — 42/42 Tests Passed | GitHub Actions CI panel with pytest output and test breakdown |
| `14-security-owasp.svg` | Slide 14 | Security — OWASP Top 10 Mapping | 6 OWASP categories addressed with implementation details |
| `15-deployment-architecture.svg` | Slide 15 | Deployment — Vercel + Railway | Full deployment stack: Vercel CDN → Railway FastAPI → Railway PostgreSQL |
| `16-roadmap-summary.svg` | Slide 16 | Roadmap — Built, In Progress, Planned | 3-column roadmap: what was delivered, what is active, what comes next |

---

## How to Use in PowerPoint

1. Open PowerPoint and go to the target slide.
2. Click **Insert → Pictures → This Device**.
3. Select the SVG file from `presentation-assets/screenshots-svg/`.
4. PowerPoint will import the SVG as a scalable vector graphic — resize freely without quality loss.
5. To use as a full-slide background, right-click the image → **Size and Position** → set width 33.87 cm / height 19.05 cm (standard 16:9) and position at 0,0.

Alternatively, in Google Slides: **Insert → Image → Upload from computer**.

---

## Known Limitations

- These are **SVG mockups / presentation assets**, not live screenshots from the running application.
- UI content is illustrative — labels, XP numbers, and badge counts are representative examples.
- The scenario text in `06-scenario-player.svg` is a sample scenario, not necessarily word-for-word from the seeded data.
- Fonts render using system fonts (`'Segoe UI'`, `Arial`, `'Courier New'`). Appearance may vary slightly across operating systems.
- For live screenshots of the actual running app, start the backend and frontend locally and capture with a browser screenshot tool.

---

## Asset Design Spec

| Property | Value |
|---|---|
| Dimensions | 1600 × 900 px (16:9) |
| Format | SVG 1.1 |
| External dependencies | None |
| Font stack | 'Segoe UI', Arial, sans-serif / 'Courier New' for code |
| Kid Mode palette | Dark purple/navy (`#0f0a2e`) backgrounds, gradient cards |
| Parent/Technical palette | Dark SaaS (`#0d1117`, `#161b22`), clean cards |
| Accent colours | Violet `#7c3aed`, Teal `#06b6d4`, Green `#10b981`, Gold `#f59e0b` |
