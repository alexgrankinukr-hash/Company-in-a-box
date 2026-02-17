# Phase 2.5: Web UI Dashboard — Implementation Plan

## Executive Summary

**What this is:** A visual web dashboard for your AI company. Instead of typing CLI commands and reading text tables, you open a webpage in your browser and see everything visually — org charts, cost charts, task boards, agent profiles, and a chat-like activity feed. Like going from DOS to Windows.

**Key architecture decision:** This is a **local dashboard** that runs on your computer alongside the CLI. It reads from the same SQLite database (the `.aicib/state.db` filing cabinet) that the CLI already uses. No cloud servers, no login page, no database migration needed. Just type `aicib ui` and a webpage opens in your browser.

**Why now (between Phase 2 and Phase 3):** You've built 46 CLI commands across 10 feature areas, all storing data in 22 SQLite tables. That's too much to manage from a terminal. Adding a visual dashboard now means:
1. You can test and monitor everything visually as you build Phase 3+
2. New Phase 3 features (Board of Directors, Reports, Events) are naturally visual and should have UI from day one
3. The product becomes demo-ready for non-technical users

**Tech stack (simplified for local use):**

| Layer | Choice | Plain English |
|-------|--------|---------------|
| Framework | Next.js 15 + App Router | The webpage builder — like a smarter version of making websites |
| UI Components | shadcn/ui + Radix UI | Pre-made buttons, tables, forms, etc. — like LEGO blocks for web pages |
| Styling | Tailwind CSS | A way to make things look good without writing lots of custom styling |
| Charts | Tremor | Pre-made dashboard components — KPI cards, charts, progress bars |
| Org Chart | React Flow + dagre | Interactive diagrams — click, zoom, drag nodes around |
| Database | Same SQLite via better-sqlite3 | Reads the SAME data the CLI already writes — zero migration |
| Real-time | Server-Sent Events (SSE) | Lightweight way to push live updates to the browser |
| Launch command | `aicib ui` | Starts the web server and opens your browser to `localhost:3000` |

**What we DON'T need yet (saves weeks):**
- No PostgreSQL, no Redis (use existing SQLite)
- No authentication/login (it's your local machine)
- No WebSocket server (SSE is simpler and sufficient)
- No separate backend (Next.js API routes handle everything)
- No cloud deployment (runs locally alongside Claude Code)

**Where the UI code lives:** `aicib/ui/` — a Next.js app inside the existing project. Its API routes import directly from `aicib/src/core/` to reuse all existing business logic (cost tracking, task management, HR, knowledge, etc.).

**Estimated effort:** 4 waves, 8 sessions, ~3-4 weeks with parallel execution.

---

## Architecture

```
Your Browser (localhost:3000)
     │
     │  HTTP requests + Server-Sent Events
     │
     ▼
┌─────────────────────────────────┐
│     Next.js App (aicib/ui/)     │
│                                 │
│  app/                           │
│   ├── page.tsx         (home/dashboard)
│   ├── agents/          (org chart + profiles)
│   ├── tasks/           (kanban board)
│   ├── costs/           (cost dashboard)
│   ├── hr/              (HR dashboard)
│   ├── knowledge/       (wiki + decisions)
│   ├── journal/         (session history)
│   ├── projects/        (project pipeline)
│   ├── settings/        (configuration)
│   ├── activity/        (live feed)
│   └── api/             (API routes)
│       ├── agents/      → imports from ../../src/core/
│       ├── tasks/       → imports from ../../src/core/
│       ├── costs/       → imports from ../../src/core/
│       ├── hr/          → imports from ../../src/core/
│       ├── knowledge/   → imports from ../../src/core/
│       ├── config/      → imports from ../../src/core/
│       ├── brief/       → imports from ../../src/core/
│       ├── stream/      → SSE endpoint for live updates
│       └── projects/    → imports from ../../src/core/
│                                 │
└───────────────┬─────────────────┘
                │
                │  Direct SQLite access (same database)
                │
                ▼
┌─────────────────────────────────┐
│  .aicib/state.db (SQLite)       │
│                                 │
│  22 existing tables:            │
│  cost_entries, sessions,        │
│  agent_status, tasks,           │
│  hr_events, wiki_articles,      │
│  projects, slack_state, etc.    │
│                                 │
│  (Same database the CLI uses)   │
└─────────────────────────────────┘
```

**How it connects to the existing CLI:**
- The UI reads from the same SQLite database — when the CLI writes data, the UI sees it instantly
- The UI can also WRITE to the database (creating tasks, updating settings) using the same core functions
- The `aicib ui` command starts the Next.js server on port 3000
- CLI commands continue to work alongside the UI — they're two windows into the same data
- SSE (Server-Sent Events) polls the database for changes and pushes live updates to the browser

**Layout design:**

```
┌──────────────────────────────────────────────────────────────┐
│  AICIB  │  🔍 Search (Cmd+K)                    [Status: ●] │
├─────────┼────────────────────────────────────────────────────┤
│         │                                                    │
│ 📊 Home │    Main Content Area                               │
│         │                                                    │
│ 💬 Brief│    Changes based on which sidebar item             │
│         │    is selected. Each page shows a                  │
│ 👥 Team │    different view of your AI company.              │
│         │                                                    │
│ ✅ Tasks│                                                    │
│         │                                                    │
│ 💰 Costs│                                                    │
│         │                                                    │
│ 👤 HR   │                                                    │
│         │                                                    │
│ 📚 Wiki │                                                    │
│         │                                                    │
│ 📋 Logs │                                                    │
│         │                                                    │
│ 🏗 Proj │                                                    │
│         │                                                    │
│ ⚙ Setup│                                                    │
│         │                                                    │
├─────────┼────────────────────────────────────────────────────┤
│  v0.1   │  Brief input: [Type a directive...]  [Send ▶]     │
└─────────┴────────────────────────────────────────────────────┘
```

---

## Wave A: Foundation + Home Dashboard (1 session, ~3-4 days)

### Session 1: Project Setup + Layout + Home Page

**Goal:** Get the Next.js app running with the sidebar layout, basic routing, SQLite API layer, and a home dashboard showing key metrics at a glance.

**What gets built:**

1. **Project scaffolding**
   - Initialize Next.js 15 app in `aicib/ui/`
   - Install: shadcn/ui, Tailwind CSS, Tremor, React Flow, better-sqlite3
   - Configure TypeScript paths to import from `../src/core/`
   - Add `aicib ui` CLI command to `src/index.ts` (starts Next.js dev server, opens browser)

2. **Layout shell**
   - Sidebar navigation (shadcn/ui Sidebar component)
   - Top bar with breadcrumbs and status indicator
   - Dark mode support (toggle in top bar)
   - Responsive: sidebar collapses on small screens
   - Bottom bar with brief input field (persistent across all pages)

3. **SQLite API layer**
   - Shared database connection helper (`ui/lib/db.ts`) — opens `.aicib/state.db`
   - Project directory detection (reads from same config the CLI uses)
   - Connection pooling with WAL mode for concurrent reads

4. **Home dashboard page** (`/`)
   - **KPI cards (Tremor):** Active agents, Tasks in progress, Today's cost, Session count
   - **Agent status grid:** Card per agent showing role, model, status (idle/working/error), current task
   - **Recent activity feed:** Last 20 log entries from `background_logs` table
   - **Quick actions:** "Send Brief" button, "View Tasks" link, "Open Settings" link

5. **SSE endpoint** (`/api/stream`)
   - Server-Sent Events endpoint that polls SQLite every 2 seconds
   - Pushes: agent status changes, new log entries, cost updates, task changes
   - Browser reconnects automatically if connection drops

**Files created:**
```
aicib/ui/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json          (shadcn/ui config)
├── app/
│   ├── layout.tsx           (root layout with sidebar)
│   ├── page.tsx             (home dashboard)
│   ├── globals.css
│   └── api/
│       ├── status/route.ts  (agent status, system info)
│       ├── stream/route.ts  (SSE live updates)
│       └── brief/route.ts   (submit briefs)
├── components/
│   ├── sidebar.tsx
│   ├── topbar.tsx
│   ├── brief-input.tsx
│   ├── kpi-card.tsx
│   ├── agent-status-card.tsx
│   └── activity-feed.tsx
└── lib/
    ├── db.ts                (SQLite connection)
    ├── config.ts            (project detection)
    └── sse.ts               (SSE client helper)
```

**Files modified:**
```
aicib/src/index.ts           (add `aicib ui` command)
aicib/src/cli/ui.ts          (new — starts Next.js server)
aicib/package.json           (add ui scripts)
```

**Data sources queried:**
| UI Element | SQLite Table | Existing core function |
|------------|-------------|----------------------|
| Agent status cards | `agent_status` | `getAgentStatuses()` from cost-tracker |
| KPI: today's cost | `cost_entries` | `getTodayCost()` from cost-tracker |
| KPI: active tasks | `tasks` | `getTaskSummary()` from task-manager |
| Activity feed | `background_logs` | `getBackgroundLogsSince()` from cost-tracker |
| Session info | `sessions` | session queries from cost-tracker |

---

## Wave A.5: Setup Wizard (1 session, ~2-3 days)

### Session 1b: First-Run Setup + Company Creation from the Browser

**Why this is needed:** Wave A built the dashboard, but it assumes the user already ran `aicib init` and `aicib start` from the terminal. Without a browser-based setup flow, non-technical users can't get started. This session adds a "Create Your AI Company" wizard so the entire experience — from zero to running dashboard — happens in the browser.

**Goal:** When a user opens `localhost:3000` with no existing project, they see a guided setup wizard instead of an empty dashboard. The wizard creates the config, initializes the database, starts the agents, and lands the user on a live dashboard — all without touching the terminal.

**What gets built:**

1. **Auto-redirect middleware** (`middleware.ts`)
   - On every page load, check if `aicib.config.yaml` exists in the project directory
   - If no config → redirect to `/setup`
   - If config exists but no active session → show "Start Company" prompt on dashboard
   - If config + active session → normal dashboard

2. **Setup wizard page** (`/setup`) — 4-step flow
   - **Step 1 — Company Info:** Company name input, template selector (SaaS Startup shown as a card with description; more templates later). Clean, centered layout.
   - **Step 2 — Team Builder:** Visual grid of default agents for the selected template (CEO, CTO, CFO, CMO + their workers). Each agent card shows role, description, model dropdown (haiku/sonnet/opus with price hints). Toggle to enable/disable agents. "Add Worker" button per department.
   - **Step 3 — Budget:** Daily cost limit slider/input ($1–$500, default $50). Monthly cost limit slider/input ($10–$5000, default $500). Visual preview: "At these settings, you can run approximately X briefs per day."
   - **Step 4 — Review & Launch:** Summary of all choices. "Create & Start Company" button. Shows what will happen: creates config file, initializes database, starts agent session.

3. **API routes for setup**
   - `POST /api/setup/init` — Creates `aicib.config.yaml` and `.aicib/` directory with `state.db`. Equivalent of `aicib init`. Accepts: company name, template, agent config overrides, budget settings. Returns success + config summary.
   - `POST /api/setup/start` — Starts the agent session. Equivalent of `aicib start`. Spawns `aicib start -d <projectDir>` as subprocess (same pattern as the brief API). Returns session ID.
   - `GET /api/setup/status` — Returns whether config exists, whether DB exists, whether a session is active. Used by the middleware and the wizard to know what step the user is on.
   - `GET /api/setup/templates` — Returns available templates with their descriptions and default agent configs. Initially just "saas-startup" but extensible.

4. **Dashboard "no session" state**
   - When config exists but no active session: dashboard shows a prominent "Start Your Company" card at the top with a one-click start button
   - When session becomes active: card disappears, KPI cards and agent grid populate

5. **`aicib ui` update** — If no config exists in the project directory, still launch the dev server (don't error out). The setup wizard handles the first-run case.

**Key design decisions:**
- The wizard writes `aicib.config.yaml` directly (same YAML format as `aicib init` produces) — not a different format
- Starting the company shells out to `aicib start` as a subprocess (same as the brief API) — avoids importing core modules into the UI
- The wizard is mobile-friendly (centered card layout, large touch targets) since users might demo on tablets
- Template selection is visual (cards with icons/descriptions) not a dropdown

**Files created:**
```
aicib/ui/
├── middleware.ts                    # Auto-redirect to /setup if no config
├── app/setup/
│   └── page.tsx                    # Setup wizard (multi-step form)
├── components/
│   ├── setup-wizard.tsx            # Wizard container with step navigation
│   ├── step-company.tsx            # Step 1: company name + template
│   ├── step-team.tsx               # Step 2: agent configuration
│   ├── step-budget.tsx             # Step 3: cost limits
│   └── step-review.tsx             # Step 4: review + launch
├── app/api/setup/
│   ├── init/route.ts               # POST — create config + DB
│   ├── start/route.ts              # POST — start agent session
│   ├── status/route.ts             # GET — check setup state
│   └── templates/route.ts          # GET — available templates
```

**Files modified:**
```
aicib/ui/app/page.tsx               # Add "no session" start card
aicib/src/cli/ui-launcher.ts        # Don't require config to exist
```

**Data flow:**
```
User opens localhost:3000
       │
       ▼
  middleware.ts checks:
  config exists? ──No──→ redirect to /setup
       │
      Yes
       │
       ▼
  Dashboard loads normally
  (session check happens client-side)
```

**Verification:**
1. Delete `aicib.config.yaml` → open `localhost:3000` → redirected to `/setup`
2. Complete wizard → config file created, DB initialized, session started
3. Redirected to dashboard → KPI cards populated, agents showing
4. Close browser, reopen → goes straight to dashboard (config exists)
5. Run `aicib status` in terminal → confirms same session the wizard started

---

## Wave B: Core Dashboards (3 parallel sessions, ~1 week)

### Session 2: Cost Dashboard

**Goal:** Replace `aicib cost` text tables with visual charts, budget gauges, and per-agent drill-down.

**Pages:** `/costs`

**What gets built:**

1. **Cost overview** (Tremor components)
   - Total spend KPI card (today, this week, this month)
   - Spending trend line chart (7-day history, same data as `aicib cost --history`)
   - Per-agent cost breakdown (bar chart — which agents are most expensive)
   - Per-model cost breakdown (pie chart — opus vs sonnet vs haiku split)

2. **Budget gauges**
   - Daily spending limit: progress bar with color zones (green/yellow/red)
   - Monthly spending limit: same treatment
   - Visual alert banners when approaching limits (50%, 80%, 100%)

3. **Per-agent drill-down**
   - Click an agent's bar → slide-out panel showing:
     - Input/output token counts
     - Cost per session
     - Cost over time (sparkline)
     - Number of API calls

4. **Cost table** (enhanced version of current CLI table)
   - Sortable columns: Agent, Input Tokens, Output Tokens, Cost, Calls
   - Filter by date range, agent, model
   - Export to CSV button

**Data sources:**
| UI Element | SQLite Table |
|------------|-------------|
| All cost data | `cost_entries` |
| Budget limits | `aicib.config.yaml` (via config loader) |
| Agent names | `aicib.config.yaml` |

**New files:** `app/costs/page.tsx`, `components/cost-chart.tsx`, `components/budget-gauge.tsx`, `components/cost-table.tsx`, `api/costs/route.ts`

---

### Session 3: Task Board

**Goal:** Replace `aicib tasks` CLI with a visual Kanban board with drag-and-drop.

**Pages:** `/tasks`, `/tasks/[id]`

**What gets built:**

1. **Kanban board** (main view)
   - Columns: Backlog → To Do → In Progress → In Review → Done
   - Task cards showing: title, priority badge, assignee avatar, department tag, deadline
   - Drag-and-drop between columns (updates task status in DB)
   - Color-coded priority: critical=red, high=orange, medium=blue, low=gray

2. **Task creation form**
   - Modal/sheet with fields: title, description, department (dropdown), assignee (dropdown), priority (radio), deadline (date picker), parent task (for subtasks)
   - Form validation with Zod

3. **Task detail panel** (slide-out)
   - Click a task card → right panel shows full details
   - Status, priority, assignee, department, deadline
   - Description (markdown rendered)
   - Subtask list with checkboxes
   - Blocker list with links to blocking tasks
   - Comment thread with "Add comment" input
   - Activity log (status changes, assignment changes)

4. **Filters and views**
   - Filter pills: department, assignee, priority, overdue, blocked
   - Toggle between Kanban and List view
   - Search box for task titles

5. **Blocker visualization**
   - Blocked tasks show a red border and lock icon
   - Hover to see what's blocking them

**Data sources:**
| UI Element | SQLite Table |
|------------|-------------|
| Task cards | `tasks` |
| Blockers | `task_blockers` |
| Comments | `task_comments` |

**New files:** `app/tasks/page.tsx`, `app/tasks/[id]/page.tsx`, `components/kanban-board.tsx`, `components/task-card.tsx`, `components/task-detail.tsx`, `components/task-form.tsx`, `api/tasks/route.ts`, `api/tasks/[id]/route.ts`

---

### Session 4: Activity Feed + Journal + Brief Input

**Goal:** Replace terminal text streams with a chat-like activity view and replace `aicib journal` with a visual timeline.

**Pages:** `/activity`, `/journal`

**What gets built:**

1. **Activity feed** (`/activity`) — the "live view" of your AI company
   - Chat-like message list showing agent output in real time
   - Each message shows: agent avatar/color, agent name, timestamp, content
   - Messages grouped by brief/session
   - Auto-scroll to latest, with "jump to bottom" button
   - Filter by agent, by session, by date
   - SSE connection for live updates during active briefs

2. **Brief input** (persistent bottom bar, all pages)
   - Text input field with "Send" button
   - Foreground/Background toggle (like `--background` flag)
   - Project mode checkbox (like `-p` flag)
   - Shows "CEO is working..." indicator when brief is active
   - Brief history dropdown (recent directives)

3. **Journal timeline** (`/journal`)
   - Timeline view of all CEO journal entries
   - Each entry shows: date, directive, summary, deliverables, cost, duration
   - Expandable entries (click to see full details + key decisions + next steps)
   - Search box (same as `aicib journal --search`)
   - Filter by date range

4. **Background job panel** (slide-out from top bar)
   - List of active/completed background jobs
   - Each shows: job ID, status, directive, start time, cost so far
   - "View Logs" link → opens activity feed filtered to that job
   - "Cancel" button for running jobs

**Data sources:**
| UI Element | SQLite Table |
|------------|-------------|
| Activity feed | `background_logs` |
| Journal entries | `ceo_journal` |
| Background jobs | `background_jobs` |
| Brief submission | calls `sendBrief()` from agent-runner |

**New files:** `app/activity/page.tsx`, `app/journal/page.tsx`, `components/message-list.tsx`, `components/message-bubble.tsx`, `components/brief-input.tsx` (enhanced), `components/journal-entry.tsx`, `components/job-panel.tsx`, `api/journal/route.ts`, `api/jobs/route.ts`

---

## Wave C: Management Views (3 parallel sessions, ~1 week)

### Session 5: HR Dashboard

**Goal:** Replace `aicib hr` CLI commands with visual profile cards, review scorecards, and onboarding progress.

**Pages:** `/hr`, `/hr/[agent]`

**What gets built:**

1. **HR overview** (`/hr`)
   - Agent roster grid: one card per agent showing photo/avatar, name, role, department, autonomy level, status (active/paused/onboarding), review score
   - Summary stats: total agents, onboarding, reviews due, recent events
   - Recent HR events feed (last 20 events as a timeline)

2. **Agent profile** (`/hr/[agent]`)
   - Header: role, department, model, autonomy level badge
   - **Onboarding progress:** 4-step stepper (Research → Mentored → Supervised → Full Autonomy) with current step highlighted, mentor info, dates
   - **Performance reviews:** Radar chart showing 4 dimensions (task completion, quality, efficiency, collaboration), overall score badge, recommendation tag
   - **Review history:** Table of past reviews with scores and trends (sparklines)
   - **Improvement plans:** Card showing active plans with goals, deadline, status
   - **HR timeline:** Full event history (hired, onboarded, reviewed, promoted, etc.) as a vertical timeline

3. **Quick actions**
   - "Advance Onboarding" button
   - "Create Review" form (4 sliders 0-100, summary text area, recommendation dropdown)
   - "Promote/Demote" with level selector
   - "Create Improvement Plan" form

**Data sources:**
| UI Element | SQLite Table |
|------------|-------------|
| Agent roster | `agent_status` + config |
| Onboarding | `hr_onboarding` |
| Reviews | `hr_reviews` |
| Events | `hr_events` |
| Improvement plans | `hr_improvement_plans` |

**New files:** `app/hr/page.tsx`, `app/hr/[agent]/page.tsx`, `components/agent-profile-card.tsx`, `components/onboarding-stepper.tsx`, `components/review-scorecard.tsx`, `components/hr-timeline.tsx`, `components/review-form.tsx`, `api/hr/route.ts`, `api/hr/[agent]/route.ts`

---

### Session 6: Knowledge Wiki

**Goal:** Replace `aicib knowledge` CLI with a rich wiki interface, decision log, and search.

**Pages:** `/knowledge`, `/knowledge/wiki/[slug]`, `/knowledge/decisions`, `/knowledge/journals`

**What gets built:**

1. **Knowledge home** (`/knowledge`)
   - Section tabs: Wiki | Decisions | Journals | Archives
   - Search bar (unified cross-type search, same as `aicib knowledge search`)
   - Quick stats: article count, decision count, journal entries, archive count

2. **Wiki** (`/knowledge/wiki`)
   - Article list grouped by section (overview, products, policies, brand, customers, competitors, general)
   - Click article → full content view with rendered markdown
   - "Edit" button → markdown editor with live preview
   - "Create Article" form (slug, title, section, content)
   - Version history sidebar → shows diffs between versions

3. **Decision log** (`/knowledge/decisions`)
   - Card list of decisions
   - Each card: title, decided by, department, status badge (active/superseded/reversed), date
   - Click → detail view showing options considered, reasoning, outcome

4. **Agent journals** (`/knowledge/journals`)
   - Feed of learning entries
   - Filter by agent, by type (task_outcome, lesson, pattern, mistake, reflection)
   - Each entry: agent avatar, type badge, title, date, expandable content

5. **Project archives** (`/knowledge/archives`)
   - Grid of completed/cancelled projects
   - Each card: title, status, dates, deliverable count
   - Click → detail view with deliverables list and lessons learned

**Data sources:**
| UI Element | SQLite Table |
|------------|-------------|
| Wiki articles | `wiki_articles`, `wiki_article_versions` |
| Decisions | `decision_log` |
| Journals | `agent_journals` |
| Archives | `project_archives` |

**New files:** `app/knowledge/page.tsx`, `app/knowledge/wiki/page.tsx`, `app/knowledge/wiki/[slug]/page.tsx`, `app/knowledge/decisions/page.tsx`, `app/knowledge/journals/page.tsx`, `app/knowledge/archives/page.tsx`, `components/wiki-editor.tsx`, `components/decision-card.tsx`, `components/journal-feed.tsx`, `api/knowledge/route.ts`, `api/knowledge/wiki/route.ts`, `api/knowledge/decisions/route.ts`

---

### Session 7: Org Chart + Agent Profiles

**Goal:** Replace the Unicode org chart with an interactive visual diagram and create consolidated agent profile pages.

**Pages:** `/team`, `/team/[agent]`

**What gets built:**

1. **Interactive org chart** (`/team`) — React Flow
   - Visual hierarchy: CEO at top → C-Suite → Workers
   - Each node is a custom card showing: agent name, role, status indicator (green=working, gray=idle, red=error), model badge, current task snippet
   - Click a node → navigates to agent profile
   - Zoom and pan controls
   - Auto-layout with dagre (automatic tree positioning)
   - Live status updates via SSE (nodes change color as agents work)
   - Connection lines show reporting structure (who reports to whom)

2. **Agent profile** (`/team/[agent]`) — consolidated view
   - **Header:** Name, role, department, model, autonomy level badge, status
   - **Intelligence panel:**
     - Autonomy level meter (visual slider showing restricted → full)
     - Skills list with proficiency bars
     - Escalation chain diagram (mini flow chart: who this agent escalates to)
   - **Performance panel:**
     - Latest review scorecard (radar chart)
     - Onboarding status (if applicable)
     - Cost this session / this month
   - **Activity panel:**
     - Recent task list (assigned tasks with status)
     - Recent messages (last 10 log entries from this agent)
   - **Configuration panel:**
     - Model assignment (display, with "change" link to settings)
     - Persona style
     - Custom overrides

3. **Agent comparison view** (optional)
   - Side-by-side comparison of 2-3 agents
   - Useful for understanding team composition

**Data sources:**
| UI Element | SQLite Table |
|------------|-------------|
| Org chart structure | config YAML (agents + reports_to) |
| Status indicators | `agent_status` |
| Intelligence | config YAML + soul.md frontmatter |
| Performance | `hr_reviews`, `cost_entries` |
| Tasks | `tasks` |
| Activity | `background_logs` |

**New files:** `app/team/page.tsx`, `app/team/[agent]/page.tsx`, `components/org-chart.tsx`, `components/agent-node.tsx` (custom React Flow node), `components/autonomy-meter.tsx`, `components/skills-grid.tsx`, `components/escalation-chain.tsx`, `api/agents/route.ts`, `api/agents/[agent]/route.ts`

---

## Wave D: Configuration + Projects (2 parallel sessions, ~3-4 days)

### Session 8: Settings Panel

**Goal:** Replace YAML file editing with visual forms for all configuration.

**Pages:** `/settings`, `/settings/agents`, `/settings/budgets`, `/settings/features`

**What gets built:**

1. **Company settings** (`/settings`)
   - Company name, description
   - Persona preset selector (visual cards: Professional, Startup, Technical, Creative — with descriptions and preview)
   - Global defaults

2. **Agent configuration** (`/settings/agents`)
   - Table of all agents with inline editing
   - Per-agent: model dropdown (haiku/sonnet/opus with price comparison), enabled toggle, autonomy level selector
   - Per-agent persona override dropdown
   - Per-agent skills checkboxes
   - Model presets: "Budget-Friendly", "Balanced", "All-In" — one-click buttons
   - **Cost estimate:** shows estimated cost per brief based on model selections

3. **Budget settings** (`/settings/budgets`)
   - Daily cost limit: number input with slider
   - Monthly cost limit: number input with slider
   - Current spending preview (how much of the budget is used)
   - Alert thresholds (50%, 80% — customizable)

4. **Feature toggles** (`/settings/features`)
   - Tasks: enabled toggle, max_context_tasks slider, auto_assign toggle
   - Knowledge: enabled toggle, max_wiki_context_chars slider, wiki_edit_roles checkboxes
   - HR: enabled toggle, review_cadence dropdown, onboarding_ramp dropdown
   - Projects: enabled toggle, max_phases slider, phase_budget slider
   - Slack: connection status, setup wizard link

5. **Slack setup wizard** (if not connected)
   - Step-by-step guide with embedded instructions
   - Token input fields with real-time validation
   - Channel preview before creation
   - "Connect" button that runs the setup

**How settings are saved:**
- Form submissions call API routes
- API routes read/write `aicib.config.yaml` using the existing config system
- Changes take effect on next `aicib start` (some settings take effect immediately)
- UI shows "restart required" badge for settings that need a restart

**New files:** `app/settings/page.tsx`, `app/settings/agents/page.tsx`, `app/settings/budgets/page.tsx`, `app/settings/features/page.tsx`, `components/model-selector.tsx`, `components/persona-picker.tsx`, `components/budget-slider.tsx`, `components/slack-wizard.tsx`, `api/config/route.ts`

---

### Session 9: Project Pipeline + Polish

**Goal:** Replace `aicib project status` with a visual pipeline view, and polish the overall UI.

**Pages:** `/projects`, `/projects/[id]`

**What gets built:**

1. **Project list** (`/projects`)
   - Card grid of all projects
   - Each card: title, status badge, phase progress bar, total cost, created date
   - "Start New Project" button (opens brief input in project mode)

2. **Project detail** (`/projects/[id]`)
   - **Pipeline view:** Horizontal stepper showing all phases
     - Each phase: title, status (pending/executing/reviewing/completed/failed/skipped)
     - Color-coded: green=done, blue=active, yellow=reviewing, red=failed, gray=pending
     - Click a phase → expand to show: objective, acceptance criteria, cost, duration, retry count
   - **Cost accumulation chart:** Line chart showing cumulative cost across phases
   - **Phase logs:** Expandable log view per phase
   - **Cancel/Pause buttons:** With confirmation dialogs

3. **UI polish** (cross-cutting)
   - Loading states on all pages (skeleton screens)
   - Error handling (friendly error messages, retry buttons)
   - Empty states (helpful messages when no data yet — e.g., "No tasks yet. Send a brief to get started!")
   - Mobile responsiveness pass (stack layout on small screens)
   - Keyboard shortcut: Cmd+K for command palette (navigate between pages)

**Data sources:**
| UI Element | SQLite Table |
|------------|-------------|
| Project list | `projects` |
| Phase pipeline | `project_phases` |
| Phase costs | `cost_entries` (filtered by session) |

**New files:** `app/projects/page.tsx`, `app/projects/[id]/page.tsx`, `components/phase-pipeline.tsx`, `components/project-card.tsx`, `components/command-palette.tsx`, `api/projects/route.ts`, `api/projects/[id]/route.ts`

---

## Execution Timeline

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║           PHASE 2.5 — WEB UI DASHBOARD                          ║
║                                                                  ║
║  All sessions work in the same project folder (aicib/).          ║
║  UI code lives in aicib/ui/ — separate from CLI source.         ║
║  API routes import from ../src/core/ for shared logic.          ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  WAVE A — FOUNDATION (1 session, ~3-4 days) ✅ COMPLETE          ║
║  ─────────────────────────────────                               ║
║    Session 1:  Project Setup + Layout + Home Dashboard ✅        ║
║                Next.js 16 + Turbopack, shadcn/ui, Tailwind v4,  ║
║                sidebar, routing, SQLite API layer, `aicib ui`,   ║
║                home page with KPI cards + activity feed,         ║
║                SSE endpoint for live updates. 37 new UI files.   ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  WAVE A.5 — SETUP WIZARD (1 session, ~2-3 days) ✅ COMPLETE      ║
║  ──────────────────────────────────────────                      ║
║    Session 1b: First-Run Setup + Company Creation ✅             ║
║                Auto-redirect if no config, 4-step wizard         ║
║                (company → team → budget → launch),               ║
║                /api/setup/ routes, "Start Company" card.         ║
║                10 new UI files + 4 modified files.               ║
║    Peer-reviewed by Cursor + Codex. 8 fixes applied:            ║
║      - Config existence guard after init                         ║
║      - Template/persona allowlist validation                     ║
║      - Regex escaping for role names                             ║
║      - Budget $0 truthiness fix                                  ║
║      - DB connection leak fix (try/finally)                      ║
║      - Start button error feedback                               ║
║      - Shared agent color utility (deduplicated)                 ║
║      - Removed projectDir from status API response               ║
║    Post-review fixes (user testing):                             ║
║      - Fixed YAML parser regex (agents showed wrong models)      ║
║      - Simplified Team Builder (model-only, no toggles)          ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  WAVE B — CORE DASHBOARDS (3 parallel sessions, ~1 week)        ║
║  ─────────────────────────────────────────────                   ║
║    Session 2:  Cost Dashboard                                    ║
║                Charts, budget gauges, per-agent drill-down.      ║
║                Files: app/costs/, components/cost-*, api/costs/  ║
║                                                                  ║
║    Session 3:  Task Board                                        ║
║                Kanban with drag-and-drop, task forms, blockers.  ║
║                Files: app/tasks/, components/kanban-*, api/tasks/║
║                                                                  ║
║    Session 4:  Activity Feed + Journal + Brief Input             ║
║                Chat-like feed, journal timeline, job panel.      ║
║                Files: app/activity/, app/journal/, api/journal/  ║
║                                                                  ║
║    WHY SAFE: Each session creates pages in different app/        ║
║    subdirectories with their own components and API routes.      ║
║    Only shared files are the layout (from Wave A) and lib/.     ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  WAVE C — MANAGEMENT VIEWS (3 parallel sessions, ~1 week)       ║
║  ─────────────────────────────────────────────                   ║
║    Session 5:  HR Dashboard                                      ║
║                Agent profiles, reviews, onboarding, timeline.    ║
║                Files: app/hr/, components/agent-*, api/hr/       ║
║                                                                  ║
║    Session 6:  Knowledge Wiki                                    ║
║                Wiki editor, decisions, journals, archives.       ║
║                Files: app/knowledge/, components/wiki-*, api/k./ ║
║                                                                  ║
║    Session 7:  Org Chart + Agent Intelligence Profiles           ║
║                React Flow org chart, autonomy meters, skills.    ║
║                Files: app/team/, components/org-*, api/agents/   ║
║                                                                  ║
║    WHY SAFE: Same as Wave B — completely different directories.  ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  WAVE D — CONFIG + POLISH (2 parallel sessions, ~3-4 days)      ║
║  ─────────────────────────────────────────────                   ║
║    Session 8:  Settings Panel                                    ║
║                Model config, budgets, feature toggles, Slack.    ║
║                Files: app/settings/, components/settings-*       ║
║                                                                  ║
║    Session 9:  Project Pipeline + UI Polish                      ║
║                Project views, loading states, error handling,    ║
║                empty states, mobile pass, Cmd+K palette.         ║
║                Files: app/projects/, components/project-*        ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  DEPENDENCY ARROWS:                                              ║
║    Wave A ✅ ──→ Wave A.5 ✅ (need layout before wizard)         ║
║    Wave A.5 ✅ ──→ Wave B (need working project to test)         ║
║    Wave A.5 ✅ ──→ Wave C (same reason)                          ║
║    Wave B ──→ Wave D (core pages should exist before settings)   ║
║    Wave C ──→ Wave D (same reason)                               ║
║    Within each wave, sessions are fully parallel (different dirs)║
║                                                                  ║
║  ESTIMATED TOTAL: 3-4 weeks with parallel execution              ║
║  (Wave A ✅, A.5 ✅, then B+C parallel, then D)                 ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Impact on Future Phases

### Phase 3 Features — Now Include UI From Day One

When building Phase 3 features, each session should create both the backend logic AND the corresponding UI page. The pattern:
1. Create core logic files (same as before)
2. Create CLI commands (same as before)
3. **NEW: Also create `app/<feature>/page.tsx` + API routes + components**

| Phase 3 Feature | Backend (same as planned) | New UI Page |
|----------------|--------------------------|-------------|
| #8 Board of Directors | `core/board.ts`, `cli/board.ts` | `/board` — meeting view, voting interface, advisor cards |
| #11 Notifications | `core/notifications.ts` | Notification bell in top bar, notification center page |
| #12 Reporting Suite | `core/reports.ts`, `cli/reports.ts` | `/reports` — CEO briefings, department performance charts |
| #13 Company Events | `core/events.ts`, `cli/events.ts` | `/events` — calendar view, meeting minutes |
| #14 External Safeguards | `core/safeguards.ts` | `/settings/safeguards` — approval rules config |
| #15 MCP Integration | `core/mcp-framework.ts` | `/settings/integrations` — tool marketplace grid |
| #20 Templates | `core/templates.ts`, `cli/templates.ts` | `/templates` — template gallery with previews |
| #34 Auto Reviews | `core/auto-reviews.ts` | Shows in existing HR dashboard (auto-generated review cards) |

### Phase 4 Updates

With Phase 2.5 done, Phase 4's Web UI feature (#16) is **already built**. Phase 4 becomes:

| Original | New |
|----------|-----|
| #16 Web UI (XL, 3-4 weeks) | **DONE in Phase 2.5** |
| #17 Telegram Bot | Same as planned |
| Knowledge semantic search | Same as planned |
| #21 Security & Vault | Same, plus UI page in settings |
| #22 Audit Trail | Same, plus UI page for audit log viewer |
| #32 Engine Evaluation | Same as planned |

This removes the biggest item from Phase 4, freeing up weeks.

### Phase 5 Cloud Migration

When Phase 5 arrives (cloud/SaaS), the UI is already built. The migration:
1. Replace SQLite → PostgreSQL (change `lib/db.ts`)
2. Add authentication (NextAuth.js wrapping the existing routes)
3. Add Redis for SSE → proper pub/sub
4. Deploy to Vercel/Railway
5. Add multi-tenancy (org/user scoping on all queries)

The UI pages, components, and layouts stay the same. Only the data layer changes.

---

## Design Principles

To keep the UI polished and consistent:

1. **Linear/Notion aesthetic** — Clean, minimal, information-dense. No gratuitous gradients or decorations. Let the content speak.
2. **Dark mode first** — Most developer tools default to dark. Support light mode as secondary.
3. **Consistent component usage** — shadcn/ui for all forms, buttons, dialogs. Tremor for all charts and KPI cards. React Flow only for the org chart.
4. **Agent identity** — Each agent gets a consistent color and avatar across all pages. CEO=purple, CTO=blue, CFO=green, CMO=amber. Same color mapping as the CLI terminal output.
5. **Data density over whitespace** — Show useful information, not padding. Users want to see their company at a glance, not scroll through empty space.
6. **Keyboard-first** — Cmd+K command palette, keyboard shortcuts for common actions. Power users should rarely need the mouse.

---

## Summary

| Wave | Sessions | Parallel? | Duration | What You Get |
|------|----------|-----------|----------|-------------|
| **A** | 1 session | No | 3-4 days | Working webapp with layout, home dashboard, live updates, `aicib ui` command — **COMPLETE** |
| **A.5** | 1 session | No | 2-3 days | Setup wizard: create company, configure team, set budget, launch — all from the browser — **COMPLETE** (peer-reviewed) |
| **B** | 3 sessions | Yes | ~1 week | Cost charts, task Kanban, activity feed, journal timeline, brief input |
| **C** | 3 sessions | Yes | ~1 week | HR profiles, knowledge wiki, interactive org chart, agent profiles |
| **D** | 2 sessions | Yes | 3-4 days | Settings panel, project pipeline, polish, mobile, Cmd+K |
| **Total** | **10 sessions** | | **~3-4 weeks** | **Full visual dashboard for every feature built so far** |

After Phase 2.5, you'll be able to:
- Open `localhost:3000` and see your entire AI company visually
- Send briefs from a text box instead of typing CLI commands
- Watch agents work in real time on a chat-like activity feed
- View costs as charts instead of text tables
- Manage tasks on a Kanban board with drag-and-drop
- Review HR profiles with visual scorecards
- Browse the company wiki with a proper editor
- Configure everything through forms instead of editing YAML
- Monitor projects with visual pipeline views
- **Still use every CLI command** — the terminal and UI are two windows into the same data
