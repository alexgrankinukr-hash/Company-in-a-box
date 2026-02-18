# AI Company-in-a-Box: Implementation Roadmap

## Executive Summary

This roadmap translates the 25-section requirements document into a phased implementation plan optimized for parallel execution across 4-5 concurrent Claude Code sessions. We have an existing TypeScript codebase (`aicib/src/`) with CLI scaffolding, config system, team management, cost tracking, and a SaaS Startup template with 8 agent definitions already built.

> **Plain English:** We already have the skeleton of the product partially built. This document lays out exactly what to build, in what order, across 5 phases. You can speed things up by running multiple Claude Code windows at the same time — each one building a different piece.

**Total estimated effort:** 28-35 person-weeks
**With 5 parallel sessions:** 6-9 calendar weeks for the full vision
**MVP critical path:** 2-3 weeks

---

## Quick Glossary — Technical Terms You'll See Throughout

These terms come up repeatedly. Bookmark this section and refer back as needed.

| Term | What it means in plain English |
|------|-------------------------------|
| **AICIB** | Short for "AI Company-in-a-Box" — the name of our product/tool. When users type `aicib` in their terminal, it launches the product. Like how typing `spotify` opens Spotify. |
| **CLI** (Command Line Interface) | The black/dark terminal window where you type text commands. Instead of clicking buttons in a graphical app, you type commands like `aicib start`. Our product starts as a CLI tool — no graphical interface yet. |
| **TypeScript / Node.js** | The programming language and platform our product is written in. TypeScript is a popular language for building tools and web apps. Node.js is what runs it on your computer. You don't need to know these — Claude Code writes all the code. |
| **YAML** (`.yaml` files) | A simple text format for configuration files. Think of it like a settings file — but written in a way that's easy for both humans and computers to read. Example: `model: opus` or `cost_limit_daily: 50`. Our product uses YAML files to define which agents exist, what models they use, etc. |
| **soul.md** | A text file (written in Markdown) that defines an agent's personality, expertise, and behavior rules. Like a character sheet in a role-playing game. Each agent (CEO, CTO, CMO, etc.) has their own soul.md file that tells them who they are and how to act. |
| **npm / npx** | npm is the app store for JavaScript tools. `npx` lets you run a tool without installing it permanently. When someone types `npx aicib init`, it downloads and runs our tool instantly — zero setup required. This is how most developer tools are distributed. |
| **SQLite** | A tiny database that lives as a single file on your computer. No servers needed, no setup. We use it to store agent states, cost tracking, task history, etc. Think of it as a spreadsheet that the software reads and writes to automatically. |
| **MCP** (Model Context Protocol) | A universal standard that lets AI agents connect to external tools like Slack, GitHub, email, Google Docs, etc. Think of it like USB — a universal plug that works with any device. MCP lets any AI agent talk to any tool. |
| **API** (Application Programming Interface) | A way for software to talk to other software. When we say "API costs," we mean the fees charged by Anthropic (Claude's maker) every time our agents think and respond. Each agent response costs a tiny amount of money. |
| **Token** | The unit AI models use to measure text. Roughly 1 token = 3/4 of a word. When we say "token budget," it's like giving each department a spending allowance — measured in how much AI thinking they can do. |
| **Git / GitHub** | Git tracks changes to code (like "Track Changes" in Word). GitHub is the website where open-source projects live. We'll publish our code there so anyone can download, use, and contribute to it. |
| **Markdown** (`.md` files) | A simple text format that can include headings, bold text, links, tables, etc. This document you're reading is written in Markdown. Agents produce their deliverables (reports, plans, docs) as Markdown files. |
| **Walking Skeleton** | A software term for the thinnest possible version that proves the whole system works end-to-end. Not pretty, not complete — just proof that the core idea actually functions. Like a "proof of concept" demo. |
| **MVP** (Minimum Viable Product) | The smallest version of the product that's useful enough to launch publicly. Not the full vision — just enough to impress people and prove demand exists. |
| **Open Source** | Software whose code is publicly available for anyone to see, use, modify, and share. It's free to use. We make money later through premium features, hosting, etc. — not by selling the core tool. |
| **Daemon Mode** | When a program runs silently in the background 24/7, like a background service. Versus "session mode" where you start it, use it, and stop it. MVP will be session-based; 24/7 comes later. |
| **Vector Database / Semantic Search** | A special kind of database that understands meaning, not just exact words. If you search "marketing budget," it can also find documents about "advertising spend" because it understands they mean similar things. We use Qdrant for this in Phase 4. |
| **LiteLLM / Ollama** | Tools that let you use AI models from different companies (not just Claude). LiteLLM is a universal adapter. Ollama lets you run AI models on your own computer for free (but slower). Both are Phase 2 features. |
| **RBAC** (Role-Based Access Control) | A security system where what you can do depends on your role. The CEO agent gets different permissions than a Content Writer agent. Like how in a real company, not everyone has the CEO's access level. |
| **Composio** | A service that provides 300+ pre-built MCP connections to tools like Slack, Gmail, HubSpot, etc. Instead of building each connection ourselves, Composio gives us a shortcut to connect agents to real tools. |

---

## What Already Exists

The `aicib/` directory contains working foundations:

> **Plain English:** We already have a partially built product. Think of it like a house where the foundation and framing are done, but we still need walls, plumbing, and paint. Here's what's ready:

| Component | Status | What it does |
|-----------|--------|-------------|
| CLI entry point (9 commands) | Scaffolded | The main program that accepts commands like `aicib start`, `aicib stop`, `aicib brief`, etc. "Scaffolded" means the structure exists but commands need to be connected to real functionality. |
| YAML config system | Working | Reads the settings file that defines your company — which agents exist, what AI models they use, spending limits, etc. Already validates that settings are correct. |
| Team management & agent spawning | Working | The code that creates and manages the team of AI agents. "Spawning" means starting up new agents — like hiring new employees who immediately start working. |
| Cost tracker | Working | Tracks how much each agent costs in API fees. Records spending per agent, per session, per day/month. |
| Agent definition loader | Working | Reads the soul.md personality files for each agent and prepares them for use. |
| SaaS Startup template | Complete | A pre-built company configuration with CEO, CTO, CFO, CMO and their teams. Ready to use out of the box. |
| 8 agent soul.md files | Complete | Personality/expertise files for: CEO, CTO, CFO, CMO, Backend Engineer, Frontend Engineer, Financial Analyst, Content Writer. |
| Dependencies installed | Ready | Third-party tools our code uses: `commander` (handles CLI commands), `js-yaml` (reads YAML files), `better-sqlite3` (database), `chalk` (colored terminal text), `ora` (loading spinners). |

---

## Phase 0: Walking Skeleton (3-5 Days) — COMPLETE

> **Status:** Phase 0A + 0B implemented. Core engine integrated with Claude Agent SDK. CLI commands wired up. Cost tracking and session persistence working. Phase 0C (end-to-end testing with real briefs) validated during Phase 1 S1 testing.

> **Why this matters:** Before we build anything fancy, we need to prove the most basic version works. Can we actually get multiple AI agents to talk to each other and produce real work? If this doesn't work, we need to know NOW — not after weeks of building. This phase is like a crash test before manufacturing.

**Goal:** Prove the core loop works end-to-end before investing in anything else.

**The core loop** (the fundamental cycle our entire product is built on):
```
Founder gives BRIEF -> CEO decomposes -> C-SUITE delegates -> AGENTS produce DELIVERABLES -> CEO reports back
```

> **In human terms:** You tell the CEO what you want. The CEO breaks it into tasks for different departments. Department heads assign work to their team. Team members produce actual documents. The CEO collects everything and gives you a summary. Just like a real company.

**Success criteria:** A human types `aicib brief "Build a landing page"`, the CEO agent receives it, delegates to CTO and CMO agents, they each produce a markdown deliverable in the project directory, and the CEO compiles a status report.

**Failure criteria:** If Claude Code's TeamCreate/Task tools cannot reliably handle hierarchical delegation after 3 days of iteration, pivot the orchestration approach.

> **What "pivot the orchestration approach" means:** Claude Code has a built-in way to make AI agents work as teams (called TeamCreate). If that doesn't work well enough for our needs, we'd switch to a different framework called LangGraph — a more flexible (but harder to set up) system for coordinating AI agents. Think of it like: if one project management tool doesn't work for your team, you switch to another one.

### What to build:

| Task | Details |
|------|---------|
| Wire up `aicib start` | Make the "start" command actually launch the AI team. Right now the command exists but doesn't do anything yet — we need to connect it to the real agent-spawning code. |
| Wire up `aicib brief` | Make the "brief" command actually deliver your message to the CEO agent and trigger the delegation chain. |
| Verify inter-agent delegation | Confirm that when the CEO delegates to CTO and CMO, they actually receive the work and produce output files you can see in your project folder. |
| Wire up `aicib status` | Make the "status" command show what each agent is doing in real time — who's working, who's idle, what tasks are active. |
| Wire up `aicib stop` | Make the "stop" command cleanly shut down all agents (like closing all apps before shutting down your computer). |

**Single session. No parallelization. This is the technical risk gate.**

> **What "technical risk gate" means:** This is the point where we find out if the core technology works. Everything else depends on this. If this fails, we change our approach. If it succeeds, we go full speed into Phase 1. Never skip this step.

---

## Phase 1: MVP — "The Founding Moment" (Weeks 1-3) — ALL SUB-PHASES COMPLETE

**Goal:** Ship a working product to GitHub that makes people say "I need to try this."

> **What "ship to GitHub" means:** Publish our code publicly so anyone in the world can download and use it. GitHub is where developers discover new tools — it's like launching on the App Store, but for developer tools. Getting "stars" on GitHub (people bookmarking your project) is the main metric for open-source success.

**Success metric:** Working `npx aicib init && aicib start && aicib brief "..."` that produces real deliverables from a coordinated AI team.

> **Reading those commands:** `npx aicib init` = set up a new company. `aicib start` = boot up all the agents. `aicib brief "..."` = give them instructions. The `&&` just means "then do the next thing." So it's: set up, start, give instructions.

### What ships in MVP:

- `npx aicib init --name "MyStartup"` — sets up a new company folder with all the agent personality files, pre-configured from the SaaS Startup template
- `aicib start` — boots all agents and shows you a visual organization chart in the terminal (like watching your team assemble)
- `aicib brief "..."` — sends your directive to the CEO, who delegates to the team in real time (you watch it happen)
- `aicib status` — shows a formatted table: every agent, what they're working on, how much they've cost
- `aicib stop` — gracefully shuts everything down and shows you the total session cost
- `aicib cost` — detailed cost breakdown per agent (who's expensive, who's efficient)
- `aicib add-agent` / `aicib remove-agent` — add or remove team members on the fly
- 1 template (SaaS Startup) with 6-9 agents with polished soul.md personality files
- Real deliverables saved to your project folder (architecture docs, marketing plans, financial models — actual files you can open and read)
- Visible inter-agent communication — you watch the CEO delegate to the CTO, the CTO break down technical work, the CMO plan content
- Cost tracking per agent per session
- Beautiful terminal output with color-coded agent messages (each agent gets their own color)
- **CEO memory across sessions** — after each conversation, the system auto-generates a structured summary (what was discussed, what was decided, what files were created, what it cost) and stores it as a journal entry in SQLite. When the CEO "wakes up" in a new session, the last 2-4 weeks of journal entries are injected into its context — like the CEO reading their own notes before your meeting. Keyword search lets the CEO look up older sessions by topic.
- **Background mode (basic)** — `aicib brief --background "Build a landing page"` sends the directive and returns immediately. The CEO and team work in the background while you do other things. Check progress with `aicib status`. When the work is done, the system notifies you ("CEO has completed your directive"). Think of it like sending an email to your CEO vs. standing in their office waiting.

### What does NOT ship in MVP:

> **Why we cut these:** Every successful AI tool launched with the absolute minimum. CrewAI, MetaGPT, AutoGen, bolt.new — all launched without most of these features and still went viral. The goal is to prove the core concept works and get people excited. Everything below comes in later phases.

- No web dashboard — the terminal IS the interface for now
- No MCP integrations yet — agents produce files but don't connect to email/GitHub/etc. (Slack comes in Phase 2 as the first external integration)
- No 24/7 daemon mode — background mode returns control to you, but doesn't run forever. Full always-on comes later.
- No Board of Directors — the advisory board feature comes in Phase 4
- ~~No HR system~~ — **DONE (Phase 2 Wave 3).** Hiring, onboarding (4-phase ramp), reviews, promotions, improvement plans, state management, firing. See `docs/flows/hr.md`.
- No multiple templates — one great template beats five mediocre ones
- No multi-model support — Claude only for now (other AI models come in Phase 2)
- No multi-user support — single founder, single user
- No Telegram — terminal and file output only for now (Slack integration comes in Phase 2; Telegram in Phase 4)
- No vector database / semantic search — basic file search only for now
- No semantic/vector search for memory — keyword search only for now. AI-powered "find that conversation about X" comes in Phase 4

### Parallel Sessions — Phase 1

> **How parallel sessions work:** You open 5 separate terminal windows, each running its own Claude Code conversation. Each session works on a different part of the product simultaneously — like having 5 contractors working on different rooms of a house at the same time. At the end of each week, you do one session to merge all the work together.

| Session | Workstream | What it means |
|---------|-----------|---------------|
| **S1** | Core Engine + Background Mode | **COMPLETE.** Background Mode fully implemented and end-to-end verified. `aicib brief --background` spawns a detached worker process, logs to SQLite, returns instantly. `aicib status` shows job progress. `aicib logs` shows full conversation. `aicib stop` kills running workers. Double-brief rejection and graceful kill both tested. Files: `background-worker.ts`, `background-manager.ts`, `logs.ts` (new); `brief.ts`, `status.ts`, `stop.ts`, `cost-tracker.ts`, `index.ts` (modified). |
| **S2** | Agent Identity & Personas | **COMPLETE.** Persona preset system implemented. 4 presets (professional, startup, technical, creative) apply tone/style overlays to agent soul.md content. Per-agent overrides let you mix styles (e.g., CTO gets "technical" while CMO gets "creative"). Interactive preset picker in `aicib init`, persona menu in `aicib config`. All 8 agent soul.md files expanded with deep personality content (inner monologue, behavioral quirks, signature moves, key phrases). Files: `persona.ts` (new), 4 preset `.md` files (new); `agents.ts`, `config.ts`, `agent-runner.ts`, `init.ts`, `config.ts` (CLI) (modified). |
| **S3** | CEO Memory System + Communication & Output | **COMPLETE.** CEO journal system auto-generates session summaries via Haiku after each brief, stored in `ceo_journal` SQLite table. Recent entries injected into CEO context on startup (with token trimming). Color-coded terminal output — each agent role has a distinct color (CEO=magenta, CTO=blue, CFO=green, CMO=yellow). Unicode org chart rendered on `aicib start` and `aicib status`. New `aicib journal` command to view/search past session summaries. Files: `output-formatter.ts`, `org-chart.ts`, `journal.ts` (new); `cost-tracker.ts`, `agent-runner.ts`, `brief.ts`, `start.ts`, `status.ts`, `index.ts` (modified). |
| **S4** | Financial + CLI Polish | **COMPLETE.** `aicib cost` rewritten with formatted tables showing per-agent/per-model cost breakdown, spending limit bars, and `--history` flag for 7-day trends. Budget alerts in `aicib brief`: yellow warning at 50%, red at 80%, hard stop at limit (daily and monthly). Shared UI helpers extracted to `ui.ts` (tables, colors, formatting, time-ago). `aicib status` redesigned as a polished dashboard with org chart, agent table, and background job status. Post-review fixes applied: DB connection leak fixed (try/finally), silent catch replaced with warnings, unknown model warning added, formatPercent edge case guard, removed redundant `allowDangerouslySkipPermissions` from journal generation. Files: `ui.ts` (new); `cost.ts`, `status.ts`, `brief.ts`, `logs.ts`, `cost-tracker.ts`, `agent-runner.ts` (modified). |
| **S5** | Template + Demo Prep | **COMPLETE.** All 8 agent soul.md files deeply fleshed out with distinct personalities, decision-making patterns, inner monologues, behavioral quirks, and sample deliverable snippets. Comprehensive README created with quick start guide, org chart diagram, example outputs per department, command reference, cost estimates, competitor comparison table, configuration guide, and project structure. Template config finalized with all agent configs, worker definitions, and persona defaults. Files: `README.md` (new); 8 agent `.md` files, `config.yaml` (template) (modified). |
| **S6** | Bug Fixes: Session Completion + Status Tracking + Logs | **COMPLETE.** Three critical bugs fixed from first end-to-end testing. **Bug 1 — Session ends too early:** Added `maxTurns: 500` for CEO sessions and `maxTurns: 200` for sub-agents so the SDK doesn't terminate sessions after 4-5 turns. Budget limit remains the real safety net. **Bug 2 — Status always shows "idle":** Wired `setAgentStatus()` calls into both foreground (`brief.ts`) and background (`background-worker.ts`) paths. CEO set to "working" at start, sub-agent statuses tracked via `task_notification` SDK messages, all set to "idle" on completion. `status.ts` now shows runtime status (working/idle/error/stopped) with current task description instead of just enabled/disabled. `output-formatter.ts` now handles `task_notification` and `tool_progress` messages for visible sub-agent activity. **Bug 3 — Foreground logs not saved:** Added `createForegroundJob()` to cost-tracker. Foreground briefs now save every message to the database (same pattern as background worker). `logs.ts` detects foreground jobs by `[foreground]` prefix and shows "Foreground Job #N" vs "Background Job #N". Files modified: `agent-runner.ts`, `output-formatter.ts`, `cost-tracker.ts`, `brief.ts`, `background-worker.ts`, `status.ts`, `logs.ts`. |

### Integration Points (End of Each Week)

> **What "integration" means here:** At the end of each week, all 5 sessions need to merge their work together and make sure everything plays nicely. Like assembling a puzzle — each session builds pieces, then we connect them.

- **End of Week 1:** S1 delivers working agent spawn + lifecycle. S2-S5 integrate against it.
- **End of Week 2:** Full loop works — brief goes in, deliverables come out. S5 begins recording demo.
- **End of Week 3:** Polish, bug fixes, README, demo video. Ship to GitHub.

### The Demo Video Script (120 seconds)

> **Why this matters so much:** This 2-minute video will be the single most important marketing asset. bolt.new's founders spent 12 hours crafting one tweet. Open Interpreter went viral from a single GIF. The demo video needs to give people a "holy crap, that actually works" moment.

1. `npx aicib init --name "FreelancerPM"` — company folder appears, agents are configured (5 sec)
2. `aicib start` — agents boot up one by one with an animated org chart in the terminal (10 sec)
3. `aicib brief "Build a project management SaaS for freelancers. Target: solo consultants. MVP in 2 weeks. Budget: $500/month."` — CEO reads the brief, thinks, then starts delegating to each department (30 sec)
4. Show inter-agent messages flowing between departments — CEO to CTO, CTO to engineers, CEO to CMO, etc. (20 sec)
5. Show deliverable files appearing in the project folder — architecture.md, marketing-plan.md, budget.md (20 sec)
6. `aicib status` — formatted table showing all agents, their tasks, total cost: $1.23 (10 sec)
7. CEO delivers a cross-functional status report summarizing what everyone produced (15 sec)
8. End card: "One command. An entire AI company. Open source." (10 sec)

---

## Phase 2: Organizational Intelligence (Weeks 4-7)

**Goal:** Make agents smart — autonomous decision-making, task management, knowledge accumulation, long-running autonomous projects, **Slack as the first interface outside the terminal**, and the beginning of real "company" behavior.

> **What changes:** In Phase 1, agents do what they're told and the CEO remembers past sessions. In Phase 2, they start thinking for themselves — knowing when to ask for permission, managing their own task lists, learning from past work, running multi-hour projects end-to-end, and getting "onboarded" like real employees. **Plus, you can now talk to your AI company through Slack instead of the terminal** — each department gets a channel, and you message the CEO just like you'd message a real employee. This is where the product starts feeling like a real company, not just a fancy chatbot.

**Success metric:** Agents can autonomously break down work, manage tasks, accumulate learnings, run multi-step projects over hours without human intervention, escalate appropriately, **and you can interact with the whole company through Slack**.

### Features

> **About the # column:** Each feature has a unique number used throughout this document and the dependency graph. Features originally planned have their original numbers; features added later were assigned numbers 28-31. The table is sorted by Wave (see execution plan below) — features you build first are at the top.

| # | Feature | What it does | Complexity |
|---|---------|-------------|-----------|
| 3 | Agent Skills System | Structured capabilities that agents can have. A "skill" is a combination of a prompt template + the tools needed + the knowledge required. Like job skills on a resume — but executable. | Large (1.5 weeks) |
| 5 | Autonomy & Decision-Making Matrix | A rules table that defines what each agent can decide on their own vs. what needs approval. Example: the CMO can write a blog post without asking, but needs CEO approval to commit to a partnership. | Large (1.5 weeks) |
| 6 | Task/Project Management System | A built-in task board (like Trello) where agents create, assign, track, and complete tasks. Includes priority levels and review chains (junior work gets reviewed by seniors). | Large (1.5 weeks) |
| 18 | Slack Bot (first interface outside the terminal) | Your AI company lives inside Slack. Each department gets a channel (#ceo, #engineering, #marketing, #finance). You message the CEO channel with a brief, and agents post their work in their department channels — like watching real employees collaborate. You can send briefs, receive reports, and watch delegation happen in real time. Uses a free Slack workspace. This is the fastest way to interact with your company outside the terminal, and it's incredibly natural — you already know how Slack works. Think of it as your AI company "moving into" your Slack workspace. | Medium (1-1.5 weeks) |
| 24 | Error Handling & Escalation Protocol | What happens when things go wrong. A 6-step chain: retry → ask a colleague → escalate to manager → escalate to department head → escalate to CEO → escalate to human founder. | Small (0.5 weeks) |
| 29 | Multi-Model Support | Let agents use AI models from different companies — not just Claude. Uses LiteLLM (a universal adapter that talks to 100+ model providers) so the founder can assign any model to any agent. Example: CEO on Claude Opus (best reasoning), workers on a cheaper model, or a local model via Ollama (free, runs on your own computer). Think of it like hiring employees with different skill levels at different salary rates — you pick who gets the expensive brain vs. the budget brain. | Medium (1 week) |
| 7 | Knowledge Management | A company wiki that agents build and reference. Includes: shared knowledge base, personal journals (each agent keeps notes), and a decision log (why did we decide X?). Uses SQLite for fast search. Builds on the CEO journal/memory from Phase 1 — extends it to all agents and adds the shared wiki. | Large (1.5 weeks) |
| 9 | HR System (basics) | Agent lifecycle management — hiring new agents (adding them to the team), onboarding (they gradually gain more autonomy as they prove themselves), and performance reviews. | Medium (1 week) |
| 28 | Long Autonomous Task Chains | The ability to give the CEO a big project ("build me a car sales website") and have the team work on it for hours autonomously. The CEO plans the project, breaks it into phases, delegates phase by phase, reviews results after each phase, requests fixes if needed, and only pings the founder when the full project is complete. Think of it like giving your CEO a brief on Monday morning and getting a finished deliverable by end of day — without checking in every 10 minutes. Builds on background mode from Phase 1. | Large (1.5 weeks) |
| 30 | Cost Tracking Upgrade | Two improvements to the money tracking system. **First:** stop using hardcoded prices — instead, use the actual cost reported by each model provider's API (so if Anthropic changes their prices, our numbers update automatically). **Second:** add a configurable pricing table in the config file so the founder can set custom rates for any model (needed for local models that are free, or new providers whose prices we don't know yet). Also adds `cost_limit_daily: 0` documentation so founders know how to run with unlimited budget. Without this upgrade, adding new models in the multi-model feature would show wrong costs or $0. | Small (0.5 weeks) |
| 31 | Agent Engine Abstraction Layer | When building multi-model support, create a thin interface layer between AICIB's core code and the Agent SDK. This way, AICIB's code talks to our own functions instead of directly to SDK functions. If we ever need to switch engines (e.g., to Pi, raw API, or something new), we only change the adapter — not the entire codebase. Think of it like a universal power adapter: our code uses one plug, the adapter converts to whatever engine we need. Low risk, high optionality — takes a few days, saves weeks if we ever need to switch. See `implementation/Research-Pi-vs-AgentSDK.md` for full analysis. | Small (0.5 weeks) |
| 33 | Slack Interaction Improvements | Make the Slack experience feel like chatting with real teammates, not just sending formal briefs. **Conversational mode:** CEO (and other agents) can just chat when you message them casually, and only switch into "brief/task mode" when you give them actual work — with a confirmation like "Want me to work on this with the team?" before kicking off delegation. **Department channel responses:** All department channels respond to messages (not just #ceo). Message #engineering and the CTO replies; message #finance and the CFO replies. **Agent @mentions:** Tag a specific agent like @CTO in a department channel for a direct conversation. **Custom agent names:** Users can set display names for agents (e.g., "CEO John") in the config file. Discovered during real-world Slack testing — the Slack bot works technically but doesn't feel natural without these improvements. | Medium (1-1.5 weeks) |

### Phase 2 Dependency & Parallelism Diagram

> **IMPORTANT: Single-directory execution.** All sessions work in the same project folder — no separate git branches. This means two sessions CANNOT safely edit the same file at the same time. If Session 1 edits `agent-runner.ts` and Session 2 also edits `agent-runner.ts` at the same time, one will overwrite the other's work.
>
> **The rule:** Two sessions can only run in parallel if they touch COMPLETELY DIFFERENT files. Since `agent-runner.ts` is modified by 10 of 11 features, `config.ts` by 9, and `cost-tracker.ts` by 7, we must be much more careful about what runs at the same time.
>
> **The strategy:** We use a 4-wave approach: a short prep wave to make the shared files "safe" for future features, then 3 waves that maximize parallelism while respecting file ownership.

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║              PHASE 2 — SINGLE-DIRECTORY EXECUTION PLAN                         ║
║                                                                                ║
║  All Phase 1 work is COMPLETE. All sessions work in the SAME folder.           ║
║  Rule: No two sessions can edit the same file at the same time.                ║
║                                                                                ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║  WAVE 0 — PREP (half day, 1 session) ✅ COMPLETE                               ║
║  ─────────────────────────────────────                                          ║
║  Refactored the 3 shared "bottleneck" files so future features can plug        ║
║  in without stepping on each other:                                            ║
║                                                                                ║
║    agent-runner.ts  → Added "context providers" + "message handlers"           ║
║                       hook system. Each feature registers a function            ║
║                       that adds its context or taps into messages.             ║
║                       Features don't edit agent-runner — they register.        ║
║                                                                                ║
║    config.ts        → Added extensible config system.                          ║
║                       Each feature defines its own config section in           ║
║                       a separate file. The main config merges them.            ║
║                                                                                ║
║    cost-tracker.ts  → Added "table registry" pattern.                          ║
║                       Each feature registers its own DB tables.                ║
║                       No one edits the main initDb() function.                 ║
║                                                                                ║
║  Peer-reviewed by Cursor + Codex. 5 fixes applied:                            ║
║    - Reserved key guard on config extensions (company/agents/etc.)             ║
║    - Duplicate registration prevention on all 4 registries                     ║
║    - Shallow-merge defaults for partial YAML extension sections                ║
║    - Unknown YAML keys preserved through round-trips                           ║
║    - Message handler errors logged instead of silently swallowed               ║
║                                                                                ║
║  Think of this like installing a breaker panel with labeled empty slots        ║
║  before electricians start. Each electrician just plugs into their slot.       ║
║                                                                                ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║  WAVE 1 (2 parallel sessions, ~2 weeks) ✅ COMPLETE                             ║
║  ──────────────────────────────────────                                         ║
║  These two features touch COMPLETELY DIFFERENT parts of the codebase:          ║
║                                                                                ║
║    Session 1:  #29 Multi-Model → #31 Abstraction → #30 Cost Upgrade  ✅        ║
║                Creates: core/model-router.ts, core/engine/*.ts                 ║
║                Modifies: agent-runner.ts (SDK call layer — LOW level)           ║
║                          cost-tracker.ts (pricing constants)                   ║
║                                                                                ║
║    Session 2:  #18 Slack Bot  ✅                                                ║
║                Creates: integrations/slack/*.ts, cli/slack.ts                  ║
║                Modifies: index.ts (CLI), cost-tracker.ts (new method)          ║
║                                                                                ║
║    WHY SAFE: Session 1 rewrites the low-level engine layer.                    ║
║    Session 2 builds an entirely new integration in a new folder.               ║
║    They don't touch any of the same files.                                     ║
║                                                                                ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║  WAVE 2 (3 parallel sessions, ~2 weeks) ✅ COMPLETE                            ║
║  ──────────────────────────────────────                                         ║
║  WHY WAIT: Wave 1's engine abstraction (#31) changes how agent-runner.ts       ║
║  works internally. These features need to build on the stable new              ║
║  foundation, not the old one that's about to be rewritten.                     ║
║                                                                                ║
║    Session 3:  #5 Autonomy Matrix + #24 Error Handling + #3 Skills  ✅          ║
║                Creates: core/autonomy-matrix.ts, core/escalation.ts,           ║
║                         core/skills.ts, core/intelligence-register.ts          ║
║                Modifies: agents.ts (add fields), template soul.md files        ║
║                Registers: context providers + config sections + DB tables      ║
║                Peer-reviewed: Cursor + Codex + Claude. 8 fixes applied.        ║
║                                                                                ║
║    Session 4:  #6 Task/Project Management  ✅                                   ║
║                Creates: core/task-manager.ts, cli/tasks.ts                     ║
║                Modifies: nothing that Session 3 touches                        ║
║                Registers: context providers + config sections + DB tables      ║
║                                                                                ║
║    Session 8:  #33 Slack Interaction Improvements  ✅                           ║
║                Creates: integrations/slack/chat-handler.ts                     ║
║                Modifies: integrations/slack/daemon.ts (add channel             ║
║                  listeners), message-bridge.ts (chat vs brief routing)         ║
║                NEEDS: #18 Slack Bot (from Wave 1 — already done)              ║
║                Peer-reviewed: Cursor + Codex. 9 fixes applied.                ║
║                                                                                ║
║    WHY SAFE: Session 3 owns agent intelligence (agents.ts, soul.md).           ║
║    Session 4 owns work tracking (task-manager.ts, cli/tasks.ts).              ║
║    Session 8 owns Slack interaction (integrations/slack/*.ts).                 ║
║    All three touch completely different files.                                 ║
║                                                                                ║
║    WHY GROUPED: #5 Autonomy, #24 Escalation, and #3 Skills all modify         ║
║    the same files (agents.ts, soul.md templates). Keeping them in ONE          ║
║    session means one agent has full context of all changes — no conflicts.     ║
║                                                                                ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║  WAVE 3 (3 parallel sessions, ~1.5 weeks) — starts after Wave 2               ║
║  Session 5: ✅ COMPLETE                                                        ║
║  ──────────────────────────────────────                                         ║
║  These features each create MOSTLY NEW FILES in new directories.               ║
║  They use the hook system to register with the core — minimal shared edits.    ║
║                                                                                ║
║    Session 5:  #7 Knowledge Management  ✅                                     ║
║                NEEDS: #5 Autonomy (from Session 3)                             ║
║                Creates: core/knowledge.ts, core/knowledge-register.ts,         ║
║                         cli/knowledge.ts                                       ║
║                                                                                ║
║    Session 6:  #28 Long Autonomous Task Chains  ✅                              ║
║                NEEDS: #6 Task Management (from Session 4)                      ║
║                Creates: core/project-planner.ts, core/project-register.ts,     ║
║                         cli/project.ts                                         ║
║                Modifies: background-worker.ts, background-manager.ts,          ║
║                          cli/brief.ts, index.ts                                ║
║                Peer-reviewed: Cursor + Codex. 6 fixes applied.                 ║
║                                                                                ║
║    Session 7:  #9 HR System  ✅                                                 ║
║                NEEDS: #5 Autonomy (from Session 3)                             ║
║                Creates: core/hr.ts, core/hr-register.ts, cli/hr.ts            ║
║                                                                                ║
║    WHY SAFE: Each creates its own new files. Session 6 is the only one         ║
║    that modifies existing files (background-worker.ts) — and Sessions 5        ║
║    and 7 don't touch those files at all.                                       ║
║                                                                                ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║  DEPENDENCY ARROWS (what must finish before what):                              ║
║                                                                                ║
║  Feature dependencies:                                                         ║
║    #5 ──→ #7      (Autonomy before Knowledge Management)                      ║
║    #5 ──→ #9      (Autonomy before HR System)                                 ║
║    #6 ──→ #28     (Task Management before Long Task Chains)                   ║
║    #29 ─→ #31     (Multi-Model before Abstraction Layer)                      ║
║    #29 ─→ #30     (Multi-Model before Cost Tracking Upgrade)                  ║
║                                                                                ║
║  File-safety constraints (single-directory):                                   ║
║    Wave 0 ──→ everything (prep must finish first)                             ║
║    Wave 1 ──→ Wave 2 (engine rewrite must stabilize before new features)      ║
║    Wave 2 ──→ Wave 3 (agent intelligence + tasks must exist first)            ║
║    Within each wave, parallel sessions touch DIFFERENT files only              ║
║                                                                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

### Optimal Execution Timeline

> **How to read this timeline:** Each row is a time period. Sessions listed on the same row run at the same time in separate terminal windows. All sessions work in the same project folder. The key constraint is that no two sessions modify the same file at the same time.

| When | Sessions | What's happening | Parallel? |
|------|----------|-----------------|-----------|
| **Day 1** (half day) | Wave 0: Prep session | **COMPLETE.** Refactored the 3 bottleneck files (`agent-runner.ts`, `config.ts`, `cost-tracker.ts`) with plugin/hook system. Peer-reviewed by Cursor + Codex, 5 fixes applied (reserved key guard, duplicate prevention, default merging, round-trip safety, error logging). | No — solo |
| **Week 4** | Wave 1: Sessions 1 + 2 | **COMPLETE.** Session 1: engine abstraction + multi-model + cost upgrade. Session 2: Slack bot (8 new files, CLI commands, peer-reviewed with 14 fixes). | **Yes — 2 parallel** |
| **Weeks 5-6** | Wave 2: Sessions 3 + 4 + 8 | **Session 3: COMPLETE + peer-reviewed.** #5 Autonomy + #24 Escalation + #3 Skills (agent intelligence). 4 new files + `intelligence-register.ts`, 3 context providers, 1 DB table. Peer-reviewed by Cursor + Codex + Claude: 8 fixes applied. **Session 4: COMPLETE + peer-reviewed.** #6 Task Management. 3 new files: `task-manager.ts`, `task-register.ts`, `cli/tasks.ts`. 3 DB tables, context provider, message handler. Peer-reviewed by Claude + Cursor + Codex: 12 fixes applied (BFS cycle, missing hook imports, fresh-project crash, FK enforcement, NL matchAll, empty title guard, limit=0 guard). **Session 8: COMPLETE + peer-reviewed.** #33 Slack Interaction Improvements. 1 new file: `chat-handler.ts` (hybrid classification, CEO/department/agent chat, @mentions, brief confirmation buttons, SessionLock). Modified `daemon.ts` (inbound routing for all channels, action handlers) and `message-bridge.ts` (outbound per-agent usernames, status suppression). Peer-reviewed by Cursor + Codex: 9 fixes applied — 2 high (chat prefix false positives, @mention regex failure on punctuation), 3 medium (button value overflow, double CEO chat after timeout, chat_enabled inconsistency), 4 low (session ID fallback, classifier cost recording, SessionLock docs, try/finally on resume). **Safe:** all three touch completely different files. | **Yes — 3 parallel** |
| **Week 7** | Wave 3: Sessions 5 + 6 + 7 | **Session 5: COMPLETE + peer-reviewed.** #7 Knowledge Management. 3 new files: `knowledge.ts` (KnowledgeManager class, CRUD for wiki/journals/decisions/archives, search, context formatters), `knowledge-register.ts` (side-effect registration: config extension + 5 DB tables + context provider + message handler with KNOWLEDGE:: markers and NL patterns), `cli/knowledge.ts` (11 CLI commands: dashboard, wiki list/show/create/history, decisions list/show, journals, archives list/show, search). Peer-reviewed by Claude + Cursor + Codex: 19 findings, 8 fixed (index name collision, archive NaN sort, `as any` typing, non-null assertions, updateArticle transaction, archive regex empty fields, context provider error logging, SearchOptions shadow rename), 5 won't-fix-v1, 3 intentional, 1 invalid, 2 partially valid. **Session 6: COMPLETE + peer-reviewed.** #28 Long Autonomous Task Chains. 3 new files: `project-planner.ts`, `project-register.ts`, `cli/project.ts`. Peer-reviewed by Cursor + Codex: 6 fixes applied. **Session 7: COMPLETE + peer-reviewed.** #9 HR System — full agent lifecycle (hire, onboard, review, promote/demote, improvement plans, state, fire). 3 new files: `core/hr.ts`, `core/hr-register.ts`, `cli/hr.ts`. 4 DB tables, context provider, message handler with HR:: markers + NL fallbacks. Peer-reviewed by Claude + Cursor + Codex: 9 fixes applied (dashboard dead code + dup DB, NaN score validation, --from auto-resolution, mentor passthrough, --resolve role check, NL complete→completeOnboarding, exclude fired/archived from review-due, unused import, redundant slice). **Safe:** each creates its own new files, minimal overlap. | **Yes — 3 parallel** |
| **Week 7 end** | Final integration + test | One session verifies all 11 features work together. Fix any interactions. | No — solo |

### Session Details — Phase 2

> **What changed from the original plan:** We're working in a single directory (no git branches), so we can't have 5 sessions all editing the same files simultaneously. The new plan uses 4 waves with at most 2-3 parallel sessions per wave, carefully ensuring parallel sessions touch different files. A prep step creates "plugin slots" in the shared files so features can register themselves without editing shared code. This is slower than 5-way parallel (about 4 weeks vs. 3) but it's the fastest safe approach for single-directory work.

**Wave 0 — Prep (half day, 1 session) — COMPLETE:**

| What | Status |
|------|--------|
| "Context provider" + "message handler" hook system in `agent-runner.ts` | Done. Features register functions to inject prompt context or tap into message streams. Duplicate name guard + error logging. |
| Extensible config system in `config.ts` | Done. Features register config sections with defaults + optional validators. Reserved key guard, duplicate key guard, default merging, unknown key round-trip preservation. |
| Table registry in `cost-tracker.ts` | Done. Features register DB tables created during init. Duplicate name guard. |
| Peer review fixes (Cursor + Codex) | Done. 5 of 14 findings fixed; 9 deferred as over-engineering or not applicable. |

**Wave 1 — Engine + Slack (2 parallel sessions, ~2 weeks) — COMPLETE:**

| Session | Features | New files created | Shared files modified | Estimated time |
|---------|----------|-------------------|----------------------|----------------|
| **1** | #29 Multi-Model → #31 Abstraction → #30 Cost Upgrade | `core/model-router.ts`, `core/engine/engine-interface.ts`, `core/engine/sdk-adapter.ts`, `core/engine/types.ts`, `core/engine/index.ts` | `agent-runner.ts` (SDK call layer), `config.ts` (model validation), `cost-tracker.ts` (pricing) | 2 weeks |
| **2** | #18 Slack Bot | `integrations/slack/types.ts`, `integrations/slack/register.ts`, `integrations/slack/state.ts`, `integrations/slack/channel-mapper.ts`, `integrations/slack/message-formatter.ts`, `integrations/slack/message-bridge.ts`, `integrations/slack/daemon.ts`, `cli/slack.ts` | `index.ts` (CLI commands), `cost-tracker.ts` (new method) | 1-1.5 weeks |

**Wave 2 — Agent Intelligence + Tasks + Slack Chat (3 parallel sessions, ~2 weeks) — COMPLETE:**

| Session | Features | New files created | Shared files modified | Estimated time |
|---------|----------|-------------------|----------------------|----------------|
| **3** | #5 Autonomy + #24 Escalation + #3 Skills | `core/autonomy-matrix.ts`, `core/escalation.ts`, `core/skills.ts`, `core/intelligence-register.ts` | `agents.ts` (new fields), all soul.md template files | 2 weeks ✅ |
| **4** | #6 Task/Project Management | `core/task-manager.ts`, `core/task-register.ts`, `cli/tasks.ts` | Uses hook system only — no direct shared file edits | 1.5 weeks ✅ |
| **8** | #33 Slack Interaction Improvements | `integrations/slack/chat-handler.ts` | `integrations/slack/daemon.ts`, `message-bridge.ts` | 1-1.5 weeks ✅ |

> **Why #5, #24, and #3 are grouped in one session:** All three need to modify `agents.ts` (adding decision authority, escalation rules, and skills to agent definitions) and all agent soul.md template files. Keeping them in one session means one Claude Code agent has full context of all those changes — zero risk of one overwriting the other.
>
> **Why Session 8 is safe in parallel:** It only touches files in `integrations/slack/` — completely separate from the core files Sessions 3 and 4 work on. It builds on the Slack bot (#18) already completed in Wave 1.

**Wave 3 — Knowledge + Long Tasks + HR (3 parallel sessions, ~1.5 weeks):**

| Session | Features | BLOCKED BY | New files created | Estimated time |
|---------|----------|------------|-------------------|----------------|
| **5** | #7 Knowledge Management | #5 Autonomy (Session 3) | `core/knowledge.ts`, `core/knowledge-register.ts`, `cli/knowledge.ts` | 1.5 weeks ✅ |
| **6** | #28 Long Autonomous Task Chains | #6 Task Mgmt (Session 4) | `core/project-planner.ts`, `core/project-register.ts`, `cli/project.ts` | 1.5 weeks ✅ |
| **7** | #9 HR System | #5 Autonomy (Session 3) | `core/hr.ts`, `core/hr-register.ts`, `cli/hr.ts` | 1 week ✅ |

> **Why 3 parallel sessions are safe here:** Session 5 creates `knowledge.ts`. Session 7 creates `hr.ts`. These are completely separate new files. Session 6 modifies `background-worker.ts` and `background-manager.ts` — files that Sessions 5 and 7 don't touch. The only shared touchpoint is registering hooks, which each session does independently.

### Integration Points — Phase 2

> **Why integration is lighter with the hook system:** Because the prep step created a plugin architecture, most features just create their own files and register with the core. The main shared files (`agent-runner.ts`, `config.ts`, `cost-tracker.ts`) stay mostly untouched after Wave 0. This means there's no big scary merge — just verification that everything works together.

- **After Wave 0:** **COMPLETE.** Hook system compiles clean (`tsc --noEmit` zero errors). Peer-reviewed and hardened. Existing functionality unchanged (no extensions registered yet — guards are purely defensive).
- **After Wave 1, Session 1:** Engine abstraction + multi-model + cost upgrade implemented and builds clean. Peer-reviewed by Claude (self), Cursor, and Codex — 14 findings across 3 reviewers, 7 fixed (dead exports removed, API surface cleaned, heuristics tightened to `startsWith`, `resetEngine()` added, imports organized, comments added), 5 won't-fix (over-engineering), 2 deferred (column rename + cost source flag to Phase 3). See commit `cb04ddc`.
- **After Wave 1, Session 2:** Slack integration (#18) implemented and builds clean. 8 new files in `integrations/slack/`, CLI commands in `cli/slack.ts`, `cost-tracker.ts` extended with `getBackgroundLogsSince()`. Peer-reviewed by Claude/Cursor/Codex — 14 consensus fixes applied (bold/italic conversion order, Slack token preservation, thread scoping per-brief, monthly budget check parity, shared state module, daemon import path, log polling SQL optimization, department-based log routing, silent catch logging, unused table removed, health check on connect). See docs: `docs/technical/slack-integration.md`, `docs/flows/slack.md`.
- **After Wave 2, Session 3:** Agent Intelligence (#5 + #24 + #3) implemented and builds clean. 4 new files: `autonomy-matrix.ts` (5 autonomy levels, config + validation), `escalation.ts` (up-to-6-step chain from org structure, DB helpers), `skills.ts` (14 built-in skills, resolution, formatting), `intelligence-register.ts` (side-effect registration of 3 config extensions + 1 DB table + 3 context providers). Modified: `agents.ts` (3 new frontmatter fields), `index.ts` (1 import), all 8 soul.md template files. Core files NOT touched — all integration via hook APIs. Peer-reviewed by Cursor + Codex + Claude: 12 valid findings, 1 invalid, 1 already fixed. 8 code fixes applied (critical: skills scalar normalization; warnings: human_founder dedup, preloaded agents optimization, mutable default copy; suggestions: top-level type guards + array element checks on all 3 validators, non-null assertion removal, excess override warning). 4 documentation items added. 4 won't-fix with rationale. See docs: `docs/technical/agent-intelligence.md`, `docs/edge-cases.md`.
- **After Wave 2, Session 4:** Task Management (#6) implemented and builds clean. 3 new files: `task-manager.ts` (TaskManager class, CRUD, blockers, subtasks, context scoring, priority algorithm), `task-register.ts` (hook registration: config extension + 3 DB tables + context provider + message handler with TASK:: markers and NL patterns), `cli/tasks.ts` (6 CLI commands: list, show, create, update, comment, board). Context provider injects role-aware task board into agent prompts. Message handler parses structured `TASK::CREATE/UPDATE/COMMENT` markers and natural language fallback patterns. Peer-reviewed by Claude + Cursor + Codex: 12 fixes applied — 2 critical (BFS cycle detection direction, background-worker/daemon missing hook imports), 2 high (duplicate comments, fresh-project crash), 5 medium (column whitelist, regex order, NL matchAll, foreign keys, Slack daemon imports), 3 low (empty title guard, max_context_tasks zero, catch logging).
- **After Wave 2, Session 8:** Slack Interaction Improvements (#33) implemented and builds clean. 1 new file: `chat-handler.ts` (~805 lines) providing hybrid message classification (`classifyHeuristic()` free heuristic → `classifyWithAI()` Haiku ~$0.001 → confirmation buttons with 30s timeout), CEO chat via resumed SDK sessions, department/agent chat via per-agent SDK sessions, @mention resolution (custom display names, lookahead regex), brief confirmation flow with Block Kit buttons, and `SessionLock` mutex for concurrent access protection. `ChatQueue` enables parallel per-agent queues. Modified `daemon.ts` (inbound routing for CEO + department channels, action handlers for brief confirmation/rejection) and `message-bridge.ts` (outbound per-agent display names via `chat:write.customize`, status message suppression). New DB table: `slack_chat_sessions`. Peer-reviewed by Cursor (11 findings) + Codex (6 findings): 9 fixes applied — 2 high (chat prefix false positives via `startsWithWord()` + reordered classification, @mention `\b` regex failure on punctuation names replaced with lookahead), 3 medium (button value 2000-char overflow fixed by storing only `threadTs`, double CEO chat after timeout guarded, `chat_enabled` toggle enforced on department channels), 4 low (session ID fallback from result, AI classifier cost recording as `"ceo-classifier"`, SessionLock non-reentrant documentation, try/finally on resume-path `updateChatSession`). 6 findings confirmed invalid, 2 won't-fix. See docs: `docs/technical/slack-integration.md`, `docs/flows/slack.md`, `docs/edge-cases.md`.
- **After Wave 2 (full):** **COMPLETE.** All three sessions done and peer-reviewed. Autonomy rules, escalation, skills, task management, and Slack chat all register correctly through the hook system. All interactions verified via `npm run build` — zero errors.
- **After Wave 3, Session 5:** Knowledge Management (#7) implemented and builds clean. 3 new files: `knowledge.ts` (KnowledgeManager class — wiki CRUD with versioning, agent journals, decision log with status tracking, project archives, unified search across all 4 tables, context formatters for wiki/decisions/archives), `knowledge-register.ts` (side-effect registration: config extension with 6 validated fields, 5 DB tables via registerTable, context provider `company-knowledge` injecting wiki + decisions + archives into agent prompts, message handler `knowledge-actions` parsing KNOWLEDGE::WIKI_CREATE/WIKI_UPDATE/JOURNAL/DECISION/ARCHIVE markers plus NL fallback patterns for "learned that/about" and "decided to/that" with 500ms debounce), `cli/knowledge.ts` (11 commands: dashboard, wiki list/show/create/history, decisions list/show, journals with agent/type filters, archives list/show, unified search). Modified: `index.ts` (side-effect import + CLI wiring), `background-worker.ts` and `daemon.ts` (hook import). Peer-reviewed by Claude + Cursor + Codex: 19 unique findings (after dedup), 8 fixed — critical: `idx_journal_created`/`idx_journal_session` renamed to `idx_agent_journal_*` to avoid collision with `ceo_journal` indexes in cost-tracker.ts (SQLite index names are DB-global); high: archive search NaN sort fixed via `started_at` fallback, `updateArticle` snapshot+update wrapped in `db.transaction()`, non-null assertions on `recordDecision`/`archiveProject` replaced with null-check-throw matching `createArticle` pattern; medium: KNOWLEDGE::ARCHIVE regex `([^"]+)` → `([^"]*)` for optional deliverables/lessons fields, context provider catch block now logs via `console.warn`; low: `as any` → `as JournalEntryType` on 2 lines, `SearchOptions` → `SearchCLIOptions` to avoid shadowing core export. 5 won't-fix-v1 (strict field ordering, quotes in content, greedy NL regex, process exit before debounce, dropped updates on DB failure — all match existing patterns in task-register.ts). 3 intentional (formatJournalForContext kept for future sub-agent context, agent attribution always "ceo" due to hook API, duplicate table DDL per project convention). 1 invalid (concurrent session DB concern — AICIB is one session per process). See docs: `docs/technical/knowledge-management.md`, `docs/flows/knowledge.md`, `docs/edge-cases.md`.
- **After Wave 3, Session 6:** Long Autonomous Task Chains (#28) implemented and builds clean. 3 new files: `project-planner.ts` (ProjectPlanner class: DB schema for projects + phases, CRUD, plan parser, prompt builders for planning/execution/review/summary, prior context injection), `project-register.ts` (hook registration: config extension `projects:` with 7 settings, 2 DB tables with indexes, context provider for active project status, message handler for PROJECT::PAUSE/SKIP_PHASE markers), `cli/project.ts` (3 CLI commands: `project status` with phase-by-phase progress, `project list` with table view, `project cancel` with worker kill). Modified: `background-worker.ts` (new `runProjectLoop()` orchestration — planning→execution→review→verdict loop with SIGTERM handling, cost limit checks, retry logic), `background-manager.ts` (new `startBackgroundProject()` function), `cli/brief.ts` (`-p` flag triggers project mode), `index.ts` (CLI registration). Peer-reviewed by Cursor + Codex: 6 fixes applied — cost under-counting on failed phase after max retries (F1), orphaned "executing" phase when sendBrief throws (F2), worker doesn't check for external cancellation (F3), project cancel uses wrong session ID (F4), clarifying comment on paused→completed job mapping (F5), UNIQUE constraint on (project_id, phase_number) (F6). 8 findings deferred (per-phase budget enforcement, review/summary LLM cost tracking, duplicate DDL, execution_model config, separate reviewer model, one session per phase, DB columns for markers, resume command).
- **After Wave 3, Session 7:** HR System (#9) implemented and builds clean. 3 new files: `hr.ts` (HRManager class: 4 DB tables, event logging, onboarding 4-phase ramp with 3 speeds, performance reviews with weighted scoring, promotions/demotions, improvement plans with lifecycle, agent state management, firing, context formatting with token safety), `hr-register.ts` (hook registration: config extension with 5 validated fields, 4 DB tables, context provider, message handler with 8 HR:: marker patterns + 2 NL fallbacks, 500ms debounced action queue), `cli/hr.ts` (10 CLI commands: dashboard, list, onboard, advance, review, reviews, promote, demote, improve, state, history). Peer-reviewed by Claude + Cursor + Codex: ~25 findings across all reviewers, 9 fixed (3 HIGH: dashboard dead code + dup DB connection, NaN score propagation, hardcoded --from level; 3 MEDIUM: mentor dropped in hire handler, --resolve ignores role, NL complete does single advance; 3 LOW: exclude fired/archived from review-due, unused import, redundant slice), 7 won't-fix with rationale, 4 tracked for later. See docs: `docs/technical/hr-system.md`, `docs/flows/hr.md`, `docs/edge-cases.md`.
- **After Wave 3 (full):** Final integration. All 11 features working together end-to-end. Test the full flow: send a brief, watch autonomy rules kick in, tasks get created, knowledge base gets updated, Slack shows activity. Budget a full day.

### Integration Points — Phase 3

- **After Wave 0, Session 1:** Agent Persona Studio (#35) implemented and builds clean. 1 new file: `persona-studio.ts` (loadRolePreset, listRolePresets, compileTraits, compileBackground, applyDisplayName, applyPersonaStudio — 6 exported functions). 1 new CLI file: `cli/agent.ts` (5 commands: dashboard, list, show, edit, customize). 25 role preset .md files across 8 roles. Modified: `persona.ts` (types: PersonalityTraits, AgentPersonaConfig, RolePreset, AgentBackground + constants: ROLE_PRESETS, VALID_COMMUNICATION_STYLES, etc.), `config.ts` (full persona.agents validation + agents field in PersonaConfig), `agents.ts` (applyPersonaStudio integration in loadAgentDefinitions), `agent-runner.ts` (loadPersonaFromConfig returns agentPersonas/templateDir, buildSubagentMap passes them through, display names in subagent descriptions), `init.ts` (interactive persona customization + loadConfig/saveConfig round-trip), `config.ts CLI` (studio menu option + persona display in view), `index.ts` (agent command registration). Peer-reviewed by Claude + Cursor + Codex: 19 findings across 3 reviewers, 7 valid fixes applied — regex safety in applyDisplayName (split/rejoin), brittle YAML injection replaced with config round-trip, empty catch blocks → console.warn, $EDITOR argument splitting, dynamic→static fs import, role_preset validation relaxed to slug format, non-object traits rejection. 7 invalid (misconceptions about regex /g flag, local-tool threat models, inquirer v9 types, optional chaining safety, design-intentional naming). 5 won't-fix (cosmetic). See docs: `docs/technical/persona-system.md`, `docs/flows/agent-persona-studio.md`, `docs/edge-cases.md`. See commit `f56d6ce`.

---

## Phase 2.5: Web UI Dashboard (Waves A + A.5 COMPLETE — Waves B-D deferred to Phase 3.5)

**Goal:** Add a visual web dashboard that runs locally alongside the CLI. Type `aicib ui` and a webpage opens in your browser showing your entire AI company visually — org charts, cost charts, task boards, agent profiles, and more. Like going from DOS to Windows.

> **Architecture:** The dashboard is a Next.js app living in `aicib/ui/` that reads directly from the same SQLite database (`.aicib/state.db`) the CLI uses. No cloud servers, no login page, no database migration. Just a visual window into the same data.

> **Full details:** See `implementation/Phase-2.5-Web-UI-Plan.md` for the complete plan.

> **Strategy change:** Waves B-D (the remaining UI work) are deferred until after Phase 3. The reasoning: building core functionality first (scheduler, MCP integrations, safety controls, persona studio backend, templates) is more valuable than building web pages for features that already have CLI and Slack interfaces. All Phase 3 features can be tested via terminal commands and Slack. Once Phase 3 is complete, the Web UI gets built on top of ALL features at once (Phase 3.5) — which is actually more efficient than building UI incrementally and coming back to add more pages later. The **backend** parts of the Agent Persona Studio (#35) and Template expansion (#20) move into Phase 3 so they're available through the CLI even before the Web UI exists.

**Summary:**

| Wave | Sessions | What gets built | Status |
|------|----------|----------------|--------|
| **A: Foundation** | 1 session | Next.js 16 + Turbopack, layout shell, `aicib ui` command, home dashboard with KPI cards, SSE live updates | **COMPLETE** |
| **A.5: Setup Wizard** | 1 session | First-run setup wizard: create company, configure team, set budget, launch — all from the browser | **COMPLETE** |
| **B-D: Deferred** | 10 sessions | Cost dashboards, Task Kanban, Activity feed, Agent Persona Studio UI, Knowledge wiki, Org chart, HR profiles, Settings panel, Project pipeline, Polish | **DEFERRED → Phase 3.5** |

**What's live now:** The basic dashboard works — KPI cards, agent grid, activity feed, SSE live updates, setup wizard, and brief submission. Enough to monitor your company visually while we build the core functionality.

---

## Phase 3: Real Company Behavior (Weeks 8-13)

**Goal:** Make the AI company act like a real company — agents connect to real tools, scheduled events happen automatically, reports generate on their own, safety guardrails protect external actions, and users can fully customize their agents' personalities and backgrounds. This is where we pull ahead of every competitor.

> **Why Phase 3 is next (skipping Web UI Waves B-D):** The Web UI foundation is built (Phase 2.5 Waves A + A.5) — the basic dashboard, setup wizard, and live updates all work. But building more UI pages right now would slow down core feature development. Every Phase 3 feature can be tested through the CLI and Slack, which already work great. Once all the core functionality is built, we'll come back and build the full Web UI on top of everything at once (Phase 3.5) — that's actually more efficient than adding pages one at a time. Some features may need tweaking after UI testing, but that's minor rework compared to getting stuck on UI for 5 weeks.

> **What moved here from Phase 2.5:** The **backend** parts of Agent Persona Studio (#35), Template expansion (#20), and Communication Routing Rules (#37) move into Phase 3. These are config files, CLI commands, and template files — they don't need a web interface. The web UI for these features (sliders, editors, settings panels) gets built later in Phase 3.5.

> **What's new:** Six features were identified in a gap analysis against the Company Vision & Requirements document — features described in the vision that were missing from the roadmap: Agent Persona Studio (#35), Agent Scheduler (#36), Communication Routing Rules (#37), Trust Evolution (#38), Review Chain Configuration (#39).

**Success metric:** Agents use real external tools (GitHub, email, calendars), scheduled events run without human prompting (daily standups, weekly reports), safety rules block unauthorized external actions, the founder gets automated briefings on a configurable schedule, and users can customize every agent's name, personality, background, and traits through the CLI.

### Features

> **Priority ordering:** Features are listed in order of impact. The most important features — the ones that make the product dramatically more useful — come first. Features at the bottom are valuable but less transformative.

| # | Feature | What it does | Complexity |
|---|---------|-------------|-----------|
| 35 | Agent Persona Studio (backend) ✅ | **COMPLETE.** Three-tier agent customization system — backend and CLI. **Tier 1 — Role-specific presets:** 25 personality presets across 8 roles (CEO: The Visionary, The Operator, The Diplomat, The Disruptor; CTO: The Architect, The Pragmatist, The Innovator; CFO: The Strategist, The Controller, The Growth-Oriented; CMO: The Growth Hacker, The Brand Builder, The Performance Marketer; plus presets for Backend Engineer, Frontend Engineer, Financial Analyst, Content Writer). **Tier 2 — Mix & Match Traits:** 6 configurable personality dimensions — communication style, decision-making, risk tolerance, assertiveness (1-5), creativity (1-5), conflict approach. Traits compile to natural language in soul.md. **Tier 3 — Full Editor:** `aicib agent edit ceo` opens soul.md in `$VISUAL`/`$EDITOR` (handles editors with args like `code --wait`). **Agent naming:** `display_name` modifies `# Title` heading. **Background config:** industry experience, years, specialized knowledge, work history — per agent. **Enhanced init:** setup wizard includes persona customization with config round-trip via loadConfig/saveConfig. **CLI commands:** `aicib agent list/show/edit/customize`. **Peer-reviewed** by Claude, Cursor, and Codex — 7 fixes applied (regex safety, YAML injection, editor arg splitting, empty catch blocks, validation hardening). See commit `f56d6ce`. | Large (1.5 weeks) |
| 20 | Template Expansion ✅ | **COMPLETE.** Two-layer template system: Structure Templates (Minimal, Lean Startup, Full C-Suite, Custom) × Industry Templates (SaaS, Marketing Agency, E-commerce, Consulting Firm). These combine — "Full C-Suite + Marketing Agency" gives a complete agency management team. Ships with 3-4 industry templates beyond SaaS Startup, each with role-specific soul.md files, industry knowledge, and recommended integrations. Community template packaging and sharing format. Tested via `aicib init --template <name>`. Peer-reviewed (Cursor + Codex) with 5 fixes applied: path traversal protection, user-template-only import, legacy detection filter, dynamic org chart, dead import removal. | Medium (1 week) |
| 37 | Communication Routing Rules | **Moved from Phase 2.5.** Configurable communication modes: **Strict Hierarchy** (all cross-department talk goes through department heads — CTO talks to CMO, not a developer to a marketer directly), **Open + CC Manager** (anyone can message anyone but managers get CC'd — the default for most real companies), **Open Communication** (no restrictions), **Custom Rules** (per department pair or per agent pair). Set during `aicib init` or changed anytime via `aicib config`. Affects how agents route messages and who gets notified. | Small (0.5 weeks) |
| 36 | Agent Scheduler / Cron System | **NEW.** The engine that makes agents run on schedules. Without this, the CEO can't send you a morning briefing automatically, departments can't have daily standups, and reports can't generate themselves. This is the foundation for "runs while you sleep." Configurable per agent: every morning at 9am, every Monday, every 4 hours, etc. Also enables trigger-based activation — agents wake up in response to events (webhook, new task, external notification). Think of it like setting alarms for your employees — they show up and do their job at the scheduled time without you having to ping them. Tested via `aicib schedule list`, `aicib schedule create`, and watching agents activate on time. | Large (1.5 weeks) |
| 15 | MCP Integration Framework | The "plug-in" system that connects agents to real tools. Uses Composio (a service providing 300+ pre-built connections) so the CMO can post to social media, the CTO can manage GitHub, the CFO can track expenses in QuickBooks, the Sales team can update CRM, etc. **Note:** Slack was already connected in Phase 2 as the first integration. This phase builds the general framework for any tool and adds many more. Includes per-agent capability configuration — which agents can use which tools, matching the vision's tiered capability system (web search for all, code execution for engineering, browser automation opt-in, etc.). Tested via `aicib integrations add <tool>` and giving agents briefs that require the tool. | Large (1.5 weeks) |
| 14 | External Actions & Safeguards | Rules for what agents can do outside the system. Category-based approval: social media posts need CMO review then auto-publish, code deployments need CTO review then owner approval for production, customer emails need department head review, spending over $X needs founder approval. Each category has its own approval chain. Without this, connecting agents to real tools (MCP) would be dangerous — you'd have no control over what they do. This is the safety net that makes MCP integration safe to use. Tested via CLI approval prompts and Slack approval buttons. | Medium (1 week) |
| 38 | Trust Evolution System | **NEW.** Agents earn more autonomy over time as they prove reliable. Week 1: all social media posts require owner approval. Month 2: CMO-approved posts can auto-publish. Month 6: social media manager can auto-publish routine posts (CMO notified). The system tracks each agent's external action history — how many actions, how many were approved vs. rejected, success rate — and recommends trust level changes to the owner. Like a real company where new employees start with more oversight and earn more independence as they prove themselves. Builds on the autonomy matrix from Phase 2. Tested via `aicib hr list` showing trust levels and `aicib config` to adjust. | Medium (1 week) |
| 11 | Notification System | Alerts delivered to you based on urgency. Critical issues (system errors, budget exceeded, blocked deals) interrupt you immediately via push notification. High-priority items (decisions needing approval, CEO escalations) arrive within 15 minutes. Medium items (task completions, status updates) get batched into hourly/daily digests. Low-priority (routine agent activity) stays on the dashboard only. Configurable: quiet hours, per-department preferences, which urgency levels trigger push notifications. Delivery via Slack DM, email, or future Telegram. | Medium (1 week) |
| 12 | Reporting Suite | Automated reports that generate on a schedule (requires #36 Agent Scheduler). CEO daily briefing every morning. Weekly department performance summaries. Monthly financial burn-rate reports from CFO. Sprint reviews from CTO. Marketing performance reports from CMO. Sales pipeline reports from CSO. Each report follows a template, is authored by the responsible agent, and delivered to the owner via Slack or saved as a file. Custom reports can be defined with specific metrics, frequency, and responsible agent. Tested via `aicib report daily` and scheduled report delivery to Slack. | Large (1.5 weeks) |
| 13 | Company Events | Simulated corporate events that run on a schedule (requires #36 Agent Scheduler). Daily/weekly department standups where team members share progress and blockers. Monthly all-hands where the CEO briefs the entire company. Sprint planning where engineering + product define the next sprint. Quarterly business reviews with the full C-suite. 1-on-1s between managers and direct reports. Each event has: participants, agenda (auto-generated from current context), discussion format (async, structured rounds, free-form), output (meeting minutes, action items auto-converted to tasks), and follow-up tracking. Tested via `aicib events list` and meeting minutes output. | Medium (1 week) |
| 39 | Review Chain Configuration | **NEW.** Configurable multi-layer quality control for agent deliverables. Different deliverable types get different review chains: internal documents = self-review only, code/technical work = self + peer review, marketing content for publishing = self + peer + department head + owner, strategic plans = department head + C-suite + CEO + owner. The owner customizes these rules: which layers apply to which deliverable types, and can change them at any time. Builds on the task reviewer field from Phase 2. Tested via `aicib config` and observing review chains in `aicib tasks`. | Small (0.5 weeks) |
| 34 | Automated Performance Reviews | Managers automatically review their direct reports' completed work. When an engineer finishes a task, the CTO evaluates the deliverable and generates scores. The CEO periodically reviews department heads based on their team's output. Reviews follow the org chart: engineers reviewed by CTO, CTO reviewed by CEO, CEO reviewed by founder (manual). Integrates task completion events with the HR review system — no manual score entry needed for routine work. The founder only reviews the CEO; everything else cascades automatically. Tested via `aicib hr reviews` after completing tasks. | Medium (1-1.5 weeks) |
| 23 | Data Export/Import + Template Sharing | Ability to back up your entire company (all agent configs, soul.md files, knowledge, task history, decision logs) and restore it elsewhere. Selective export (only specific departments, only configurations, only knowledge). Anonymized export for publishing as community templates — strips proprietary information, keeps org structure, persona configs, skill assignments, and workflow automations. Import a full company package into a new instance, or merge specific components from one company into another. Also supports the community template marketplace from Phase 5. Tested via `aicib export` and `aicib import`. | Medium (1 week) |

### Parallel Sessions — Phase 3

> **Wave structure:** Phase 3 uses three waves. Wave 0 builds the persona/template/routing features that don't depend on anything new. Wave 1 builds the scheduler and MCP framework. Wave 2 builds everything that runs on schedules. All features are tested via CLI + Slack — no web UI needed.

| When | Sessions | What's being built |
|------|----------|-------------------|
| **Wave 0** (Weeks 8-9) | 3 parallel sessions | **S1:** #35 Agent Persona Studio backend — **✅ COMPLETE.** 25 role presets, 6-dimension trait system, display names, backgrounds, enhanced init wizard, `aicib agent` CLI commands. Peer-reviewed and merged. **S2:** #20 Template Expansion — **✅ COMPLETE.** Two-layer structure×industry composition, template registry, template packager (export/import with path traversal protection), legacy compat, dynamic org chart, peer-reviewed. **S3:** #37 Communication Routing Rules + #39 Review Chain Configuration (both are config-driven features that touch different files; routing modifies agent-runner message flow, review chains modify task-manager). |
| **Wave 1** (Weeks 10-11) | 3 parallel sessions | **S4:** #36 Agent Scheduler (the foundation — scheduled + trigger-based activation, cron system, `aicib schedule` commands). **S5:** #15 MCP Integration Framework (large, independent, touches integration files only — Composio gateway, per-agent capability config, `aicib integrations` commands). **S6:** #14 External Safeguards + #38 Trust Evolution (naturally paired — safeguards define the rules, trust evolution adjusts them over time). |
| **Wave 2** (Weeks 12-13) | 3 parallel sessions | **S7:** #12 Reporting Suite + #34 Automated Performance Reviews (both generate scheduled content — reports and reviews). **S8:** #11 Notification System + #13 Company Events (notifications deliver event outputs; events generate notifications). **S9:** #23 Data Export/Import + Template Sharing (independent, touches new files only). |

---

## Phase 3.5: Web UI — Full Dashboard (Weeks 14-17)

**Goal:** Build the complete web dashboard on top of ALL the core functionality from Phases 1-3. Now that agents have personas, scheduled automation, MCP integrations, safety controls, reports, events, and everything else — the Web UI gets built once, covering everything, instead of being built incrementally and revisited multiple times.

> **Why this is efficient:** Building UI after all the backend features exist means: (1) every page can be designed with the final data model, (2) no throwaway UI for features that later changed, (3) one design pass covers everything, (4) the API routes are designed holistically. It's like furnishing a house after all the rooms are built, rather than furnishing each room while construction is still happening around you.

> **What already exists:** Phase 2.5 Waves A + A.5 built the foundation — Next.js 16 + shadcn/ui + Tailwind v4, layout shell, `aicib ui` command, home dashboard with KPI cards, SSE live updates, setup wizard, and brief submission bar. This phase builds all the feature-specific pages on top of that foundation.

**Success metric:** Every CLI and Slack feature has a visual equivalent in the Web UI. A non-technical founder could manage their entire AI company without touching the terminal.

### Features (from deferred Phase 2.5 Waves B-D, expanded for Phase 3 features)

| Wave | Sessions | What gets built |
|------|----------|----------------|
| **B: Dashboards & Activity** | 3 sessions | Cost dashboard with per-agent/per-model charts and budget visualizations. Task Kanban board (drag-and-drop columns: backlog → in-progress → review → done). Activity feed with real-time streaming. CEO journal viewer with search. |
| **C: Agent Management** | 4 sessions | **Agent Persona Studio UI** — the crown jewel: role-specific preset picker with preview, trait sliders (communication style, risk tolerance, assertiveness, etc.) with live soul.md preview, full soul.md editor with syntax highlighting, agent naming and background configuration form. Knowledge wiki browser with article editor and version history. Org chart visualization (interactive, shows hierarchy and communication paths). HR profiles with onboarding progress, review history, and trust level indicators. |
| **D: Configuration & Polish** | 3 sessions | Settings panel with autonomy matrix editor, communication routing configuration (strict/open/custom picker), notification preferences, scheduling configuration (cron builder UI), MCP integration manager (add/remove/configure tool connections). Enhanced setup wizard (add persona selection, background config, communication mode, scheduling preferences to the existing 4-step flow). Project pipeline view (Gantt-style phase visualization for long autonomous projects). UI polish pass — responsive design, loading states, error boundaries, accessibility. |

### Parallel Sessions — Phase 3.5

| When | Sessions | What's being built |
|------|----------|-------------------|
| **Wave B** (Week 14) | 3 parallel sessions | **S1:** Cost dashboard + budget visualizations. **S2:** Task Kanban board. **S3:** Activity feed + Journal viewer. |
| **Wave C** (Weeks 15-16) | 4 parallel sessions | **S4:** Agent Persona Studio UI (preset picker, trait sliders, soul.md editor, naming/background form). **S5:** Knowledge wiki browser + article editor. **S6:** Org chart visualization + HR profiles. **S7:** Schedule viewer + Report templates page. |
| **Wave D** (Week 17) | 3 parallel sessions | **S8:** Settings panel (autonomy matrix, routing config, notification prefs, scheduling config, MCP manager). **S9:** Enhanced setup wizard + Project pipeline view. **S10:** UI polish pass (responsive, loading states, error boundaries, accessibility audit). |

---

## Phase 4: Scale & Differentiation (Weeks 18-21)

**Goal:** The features that make the product robust for real-world use and differentiate it from everything else — Board of Directors (unique to us), Telegram as a second messaging platform, smart semantic search, proper security, audit trails, multi-user access, and internal communication channels for the Web UI chat interface.

> **What changes:** By Phase 4, you have a fully functional AI company with scheduled events, real tool integrations, and safety controls. Phase 4 makes it *production-grade* — encrypted secrets, full audit trails, and multi-user access so you can share the dashboard with a co-founder. It also adds the Board of Directors, which is our most unique feature — no other product has an advisory panel of expert AI agents who critique and vote on decisions. The internal channel system gives the Web UI its own Slack-like chat interface, independent of external Slack.

> **What moved here:** Board of Directors (#8) was originally Phase 3 but moved here because MCP integrations, scheduled automation, and safety controls are more impactful to ship first. The Board is impressive but niche — most users will benefit more from agents that can actually send emails and create GitHub issues. ~~Web UI~~ was originally Phase 4 but was pulled forward to Phase 2.5 — the core dashboard is already built.

**Success metric:** The system is secure, auditable, supports multiple human users, has a unique Board of Directors feature, and the Web UI has its own built-in chat interface.

### Features

| # | Feature | What it does | Complexity |
|---|---------|-------------|-----------|
| 8 | Board of Directors | **Moved from Phase 3.** An advisory panel of expert AI agents separate from the operational hierarchy. Each board member has a background profile (e.g., "Former CSO at Ford with 25 years in automotive sales"), an advising style (Harsh Critic, Supportive Mentor, Data-Driven Analyst, Creative Visionary, Risk Manager, Experienced Operator), and industry focus. Three progressive operating modes: **Stage 1 Reactive** (you ask them questions in #board-room, they respond independently then discuss each other's responses), **Stage 2 Proactive** (they gain read access to C-suite channels and chime in when they see something noteworthy), **Stage 3 Voting** (for specific decisions, board members vote with reasoning, results tallied as advisory or binding). Four meeting formats: async, structured rounds, free-form discussion, agenda-driven. Uses the same three-tier persona system as regular agents. | Large (1.5 weeks) |
| 40 | Internal Communication Channel System | **NEW.** A built-in messaging system inside the product itself, independent of Slack. Default channels: #general, #announcements, #c-suite, #engineering, #marketing, #sales, #finance, #product, #hr, #operations, #board-room. Dynamic project channels (created per project, archived on completion). Direct messages between any agents. All messages stored in SQLite. This gives the Web UI chat interface something to display — a channel list sidebar, message thread view, and context panel. Without this, the Web UI's chat tab would be empty unless Slack is connected. Supports all 7 message types from the vision: standard, task assignment, escalation, decision request, status update, notification, report. | Large (1.5 weeks) |
| 17 | Telegram Bot | Talk to your AI company through Telegram. Send briefs, receive reports, approve decisions — all from your phone via a Telegram chat. Maps company channels to Telegram groups. Bot commands: /status, /tasks, /brief, /ask, /approve, /budget, /report. Second messaging platform after Slack. | Medium (1 week) |
| 41 | Multi-User Access Control | **NEW.** Support for multiple human users within one company, each with a defined role. Owner (full control), Admin (manage agents, can't change billing), Department Head (manage agents in their department, approve department-level decisions), Viewer (read-only dashboards and reports). Human users appear in the org chart alongside AI agents. The Web UI gets a simple login/session system (local accounts, no cloud auth yet — that's Phase 5). Needed before you can share the dashboard URL with a co-founder or team member. | Medium (1 week) |
| 7+ | Knowledge Management (semantic search) | Upgrade the knowledge system to understand meaning, not just exact words. Uses Qdrant (a vector database — a special database that understands meaning, so searching "marketing spend" also finds docs about "advertising budget"). Replaces keyword-only search with AI-powered semantic search across all company knowledge — wiki, journals, decisions, archives. | Large (1-1.5 weeks) |
| 21 | Security & Vault | Encrypted storage for sensitive data (API keys, passwords, tokens for MCP integrations, social media credentials, etc.). Role-based access: secrets are assigned to departments or specific roles by the owner. Agents only see secrets relevant to their role and current task. An agent requesting access to a secret they're not assigned generates an approval request. All secret access is logged in the audit trail. Currently Slack tokens are stored in plaintext SQLite — this feature fixes that. | Medium (1 week) |
| 22+ | Audit Trail with AI summaries | A complete record of everything every agent ever did — every action, state change, external action, secret access, approval, escalation, budget event, and config change. Timestamps, agent identification, action context, and results. Append-only (entries cannot be modified or deleted). On top of the raw audit trail: AI-generated daily digests, weekly summaries, and monthly reports. Search and drill-down from any summary to the detailed log entries behind it. Exportable in JSON/CSV for compliance. | Medium (1 week) |
| 32 | Agent Engine Evaluation | With real users and real data, evaluate whether the Agent SDK abstraction layer should be swapped to a different engine. Questions to answer: Is the 12-second startup delay hurting user experience? Are users asking for non-Claude models? Is the proprietary license causing adoption friction? Are API costs too high without multi-model routing? If yes to any, the abstraction layer from Phase 2 makes switching straightforward. Pi's architecture or a custom engine could be the migration target. See `implementation/Research-Pi-vs-AgentSDK.md`. | Small (0.5 weeks) |

### Parallel Sessions — Phase 4

| Session | Workstream |
|---------|-----------|
| **S1** | Board of Directors (#8) — advisory body, board member persona system, 3 progressive operating modes, 4 meeting formats, voting mechanics, #board-room channel |
| **S2** | Internal Communication System (#40) + Web UI chat interface — built-in channels, message persistence, channel membership, DMs, Web UI chat tab with channel sidebar |
| **S3** | Telegram Bot (#17) + Multi-User Access Control (#41) — Telegram channel mapping and bot commands are medium-sized; multi-user adds login/sessions/roles to the Web UI. Both touch different files. |
| **S4** | Security Vault (#21) + Audit Trail (#22+) — naturally paired. Vault stores secrets, audit trail logs access to them. Both are about security and compliance. |
| **S5** | Semantic Search (#7+) + Engine Evaluation (#32) — Qdrant vector DB upgrade to knowledge system. Engine eval is a small research/assessment task that runs alongside. |

---

## Phase 5: Monetization & Enterprise (Weeks 22+)

**Goal:** Turn the open-source tool into a business — cloud-hosted version, billing, enterprise features.

> **Business model recap:** The core product stays free and open source forever. We make money from: (1) a hosted/managed version so people don't have to run it themselves, (2) premium features for teams and enterprises, (3) a marketplace where community members sell templates/skills, and (4) enterprise contracts with big companies.

| Feature | What it means |
|---------|--------------|
| Cloud hosting | We run the product for you on our servers. You just log in through a website — no installation, no terminal, no technical setup. Like Gmail vs. running your own email server. |
| Authentication & multi-tenancy | User accounts, login systems, and the ability to keep different companies completely separate on the same platform. "Multi-tenancy" = multiple customers sharing one system but unable to see each other's data. |
| Billing system | Accepting payments. Usage-based pricing (pay for what you use), team plans, and possibly free tiers. |
| SSO & enterprise auth | "Single Sign-On" — big companies want employees to log in with their corporate credentials (like their Google Workspace or Microsoft account) instead of creating new passwords. SAML and OIDC are the technical standards for this. |
| Advanced analytics | Dashboards showing: which agents are most productive, ROI of AI spend, usage trends over time. |
| Agent marketplace | A store where the community can publish and sell custom agents, skills, templates, and industry knowledge packs. |
| API / SDK | Tools for developers to build their own products on top of ours. "API" = a way for other software to talk to our system. "SDK" = a toolkit that makes building on our platform easier. |

---

## Technology Stack

> **What "technology stack" means:** The set of tools and technologies we use to build the product. Like a recipe listing ingredients — these are the "ingredients" that make up our software. You don't need to understand each one deeply, but here's what they are and why we chose them.

| Layer | Choice | Why (in plain English) |
|-------|--------|----------------------|
| **Programming Language** | TypeScript / Node.js | Our code is already written in TypeScript. It's one of the most popular languages, which means lots of developers can contribute. Claude Code also uses it natively. |
| **How agents work together** | Claude Code Teams (TeamCreate + Task) | Claude Code already has a built-in way to make AI agents collaborate. Our code already uses this. It's the fastest way to get the MVP working. If it turns out to have limitations, we can switch to LangGraph (a more powerful but more complex framework) later. |
| **Agent personalities** | Markdown soul.md files with YAML headers | Simple text files that define who each agent is. Inspired by OpenClaw's system (188K GitHub stars). Easy to read, edit, and share. We already have 8 of these written. |
| **Terminal interface tools** | Commander.js + Chalk + Ora | Three tools that make the terminal experience nice. Commander handles commands (`aicib start`), Chalk adds colors, Ora adds loading spinners. All already installed. We'll add Ink later for even richer terminal interfaces. |
| **Database** | SQLite | A tiny, fast database that stores everything locally — no servers needed. Perfect for a tool that runs on your computer. Already installed in our project. |
| **Smart search** (Phase 4) | Qdrant | A database that understands meaning, not just keywords. Open source, fast, and can keep different companies' data separate. Added later when we need intelligent search. |
| **Tool connections** (Phase 3) | Composio gateway → then direct MCP servers | Composio gives us instant access to 300+ tools (Slack, email, GitHub, etc.). We start with that, then build direct connections for the most important tools. |
| **Web dashboard** (Phase 2.5) | Next.js 16 + shadcn/ui + Tailwind v4 | Already built in Phase 2.5 Wave A. Next.js is a popular framework for building web apps. shadcn/ui provides beautiful pre-built components. Tailwind makes styling fast. Reads directly from the same SQLite database the CLI uses. |
| **How users install it** | npm (`npx aicib init`) | The standard way to distribute JavaScript tools. Users type one command and it works — no downloading, no setup wizards. |
| **Legal license** | MIT | The most permissive open-source license. Anyone can use, modify, and distribute our code for any purpose. This maximizes adoption and is what most successful open-source projects use. |

---

## Launch Strategy

Based on research into Open Interpreter (57K stars), bolt.new ($40M ARR), Cursor ($500M ARR), and OpenClaw (188K stars):

> **Key insight from research:** Every viral AI tool launched with a single, jaw-dropping demo — not a polished product. Open Interpreter went viral from one tweet with a GIF. bolt.new went from $0 to $4M annual revenue on day one from a single tweet thread (that the founders spent 12 hours writing). The demo IS the launch.

### Pre-Launch (1 week before)
- 10-20 beta testers actively using the product
- Discord server with basic channels live (Discord = a chat platform popular with developer communities)
- CONTRIBUTING.md and `good-first-issue` labels ready (these help newcomers know how they can help improve the project)
- README is a marketing page: architecture diagram, quick-start (2 commands), demo GIF

### Launch Day (Tuesday, 10am ET)
1. **GitHub:** Push repo, make public
2. **Twitter/X:** Single, carefully crafted tweet (spend serious time on this — bolt.new spent 12 hours on theirs). Format: Problem -> demo GIF -> "open source" -> GitHub link
3. **Hacker News:** "Show HN: AI Company-in-a-Box — spawn a hierarchical AI team that runs your business (open source)" (Hacker News = the #1 website where developers discover new tools. A viral HN post can generate thousands of stars overnight.)
4. **Be in every comment thread** personally for 72 hours

### Day 2-3
- Reddit posts to r/artificial, r/LocalLLaMA, r/startups, r/SideProject, r/selfhosted (different angles per subreddit)
- "24 hours later" follow-up tweet with metrics

### Week 2
- YouTube tutorial video (5-10 minutes)
- Blog post with technical deep-dive

### Week 3
- Product Hunt launch (with star count as social proof)

### Positioning
**"The open-source alternative to what OpenAI and Anthropic both just launched — but for your entire business, not just code."**

> **Why this positioning works:** Research shows the most viral open-source projects always position as "the free/open alternative to [expensive/closed thing]." OpenAI Frontier requires "Contact Sales." Claude Code Teams is developer-only. We're the accessible, free, open version that works for any business.

This positions against:
- OpenAI Frontier ("Contact Sales")
- Claude Code Teams (developer-only, two-level hierarchy)
- CrewAI (generic framework, no pre-built company structure)
- MetaGPT/ChatDev (dev teams only, no business breadth)

### The Viral Hook
"I got a CTO, CMO, and CFO to work on my startup for $1.23."

The cost tracking feature is not just a feature — it is a marketing weapon. Every user who shares their cost stat promotes the product.

---

## Dependency Graph (Simplified)

> **What this diagram shows:** Which features must be built before other features. Arrows mean "this must exist first." You can't build the roof before the walls, and you can't build the walls before the foundation. This diagram shows the "building order" for all 25 features.

```
LAYER 0: Foundation (must be built first — everything depends on this)
  [25] Persistence (database/storage) ──┐
                                        ├──> [1] Core Orchestration (agent management)
                                        │
LAYER 1: Core (the essential systems that enable everything above)
  [1] ──> [2] Agent Identity (personality system)
  [1] ──> [4] Communication System (how agents talk)
  [1] ──> [10] Token Budget (cost tracking)
  [1] ──> [21] Security (access control)
  [1] ──> [22] Audit Trail (activity logging)
  [1] ──> [26] CEO Memory (session journals + context injection) ← Phase 1
  [1] ──> [27] Background Mode (async brief execution) ← Phase 1

LAYER 2: Intelligence (makes agents smart, not just functional)
  [2,4] ──> [5] Autonomy Matrix (who can decide what)
  [4,10] ──> [6] Task Management (internal task board)
  [2,1] ──> [3] Skills System (agent capabilities)
  [1,4] ──> [24] Error Handling (what happens when things break)
  [26,27,6] ──> [28] Long Autonomous Task Chains (multi-hour projects) ← Phase 2
  [10] ──> [29] Multi-Model Support (LiteLLM + model routing) ← Phase 2
  [10,29] ──> [30] Cost Tracking Upgrade (API-reported costs + configurable pricing) ← Phase 2
  [29] ──> [31] Agent Engine Abstraction Layer (thin interface for future engine flexibility) ← Phase 2
  [31] ──> [32] Agent Engine Evaluation (assess switching based on real user data) ← Phase 4

LAYER 2.5: First External Interface + Agent Customization
  [4] ──> [18] Slack Bot (Phase 2 — first interface outside the terminal)
  [18] ──> [33] Slack Interaction Improvements (chat mode, dept channels, agent names) ← Phase 2 Wave 2
  [2] ──> [35] Agent Persona Studio (3-tier customization: presets, traits, soul.md editor) ← Phase 3 Wave 0
  [5] ──> [37] Communication Routing Rules (strict hierarchy, open+CC, custom) ← Phase 3 Wave 0

LAYER 3: Automation & Real-World Actions (makes the company run itself)
  [27,28] ──> [36] Agent Scheduler / Cron System (scheduled + trigger-based activation) ← NEW Phase 3
  [3,5] ──> [15] MCP Integration (connecting to real tools via Composio) ← Phase 3
  [5,15] ──> [14] External Safeguards (safety rules for real-world actions) ← Phase 3
  [5,14] ──> [38] Trust Evolution (agents earn more autonomy over time) ← NEW Phase 3
  [6] ──> [39] Review Chain Configuration (multi-layer quality control) ← NEW Phase 3

LAYER 4: Organization & Delivery (makes it feel like a real company)
  [5,10] ──> [9] HR System (hiring, reviews, lifecycle) ← Phase 2
  [9,6,36] ──> [34] Automated Performance Reviews (task-triggered manager reviews) ← Phase 3
  [4,5] ──> [7] Knowledge Management (company wiki/memory) ← Phase 2
  [36,4,5,6] ──> [11] Notifications (alerts and digests) ← Phase 3
  [36,6,7,9,10] ──> [12] Reporting (automated scheduled reports) ← Phase 3
  [36,4,6] ──> [13] Company Events (meetings and standups on schedules) ← Phase 3
  [25,7] ──> [23] Data Export/Import (backup and portability) ← Phase 3

LAYER 5: Differentiation & Scale (unique features + production readiness)
  [4,5,35] ──> [8] Board of Directors (advisory panel — moved to Phase 4)
  [4] ──> [40] Internal Communication Channel System (built-in Slack-like channels) ← NEW Phase 4
  [4,11] ──> [17] Telegram Bot ← Phase 4
  [1] ──> [41] Multi-User Access Control (Owner, Admin, Dept Head, Viewer) ← NEW Phase 4
  [2,3,7] ──> [20] Template System (community sharing/marketplace) ← Phase 3 Wave 0

LAYER 6: Interfaces (how you interact with the system)
  [ALL] ──> [16] Web UI (foundation in Phase 2.5, full dashboard in Phase 3.5)
```

---

## Risk Mitigation

> **Why think about risks now:** The biggest mistakes in ambitious projects come from not planning for what could go wrong. Here are the main risks and how we handle each one.

| Risk | What could go wrong | How we prevent it |
|------|-------------------|-------------------|
| Core technology doesn't work | Claude Code Teams might not handle multi-level delegation reliably (CEO → CTO → Engineer) | Phase 0 (the walking skeleton) tests this in 3-5 days. If it fails, we switch to LangGraph before wasting weeks. This is why we don't skip Phase 0. |
| Costs are too high | When 9 AI agents talk to each other, API fees could add up fast and make the product impractical | We track costs from day 1. We use cheaper AI models (Haiku) for simple tasks and expensive ones (Opus) only for strategic decisions. Target: under $5 per full company session. |
| All agents sound the same | If the CTO and CMO both write generic-sounding responses, the "wow factor" disappears | Invest heavily in soul.md quality. Test by reading agent outputs without names — can you tell who wrote it? If not, the personas need work. |
| Building too much too fast | The communication system could become an entire Slack clone, or the HR system could become an entire HRIS | Always build the simplest version first. Basic channels + DMs before routing rules. Basic task list before priority queues. Add complexity only when needed. |
| Web dashboard delays everything | A proper web interface takes 3-4 weeks and could push the whole timeline | **MITIGATED.** Web UI was pulled forward to Phase 2.5 and Wave A is already complete. The wave-based approach (A: foundation, B: dashboards, C: persona studio, D: config) means each wave ships incrementally. Slack integration in Phase 2 also gives a real interface. Both terminal and Slack work while the Web UI is being expanded. |
| Agent customization is too shallow | If users can't customize their agents beyond model selection, the product feels generic — agents are "our" employees, not "their" employees | Phase 2.5 Wave C introduces the Agent Persona Studio: custom naming, role-specific personality presets, background/experience configuration, trait sliders, and a soul.md editor in the browser. This mirrors the three-tier system from the vision document and makes every company feel unique. |
| No scheduled agent activation | Without cron-like scheduling, agents only work when the founder tells them to — undermining the "runs while you sleep" promise | Phase 3 introduces the Agent Scheduler (#36) as the first feature, enabling scheduled activations (morning briefings, weekly standups, automated reports). This is the foundation that events, reports, and notifications all build on. |
| Security vulnerabilities | Research found 43% of MCP implementations (tool connections) have security flaws | We'll audit all tool connections, isolate each one in containers (sandboxed environments), and limit what each agent can access based on their role. |

---

## Cost Estimates (API Usage)

> **What these costs mean:** Every time an AI agent "thinks" (reads your input and generates a response), it costs money in API fees paid to Anthropic (Claude's maker). The costs below are estimates based on current Claude pricing. This is the main ongoing cost of running the product.

| Scenario | Agents | Duration | Estimated Cost |
|----------|--------|----------|---------------|
| Quick brief (5 min) | 4 (CEO + C-suite) | 5 min | $0.50-1.50 |
| Full strategy session | 6-9 agents | 30 min | $3-8 |
| Day of autonomous work | 9 agents on schedule | 8 hours | $15-40 |
| Monthly with daily check-ins | 9 agents | 30 days | $200-600 |

**Model routing strategy for cost control:**

> **How "model routing" works:** Not every task needs the most expensive AI model. It's like not every job needs a senior executive. We assign the right "brain" to the right task:

- **CEO:** Opus (the most powerful/expensive model — for strategic decisions that need the best reasoning)
- **C-Suite heads:** Opus for planning, Sonnet (mid-tier) for execution
- **Individual contributors:** Sonnet for 90% of tasks, Haiku (fastest/cheapest) for simple/repetitive tasks
- **Expected result:** 60-70% cost reduction compared to using the most expensive model for everything

---

## Open Decisions

**Resolved decisions (from Phase 1-2 implementation):**
1. ~~**Product name:**~~ Using `aicib` for now. Can rebrand later.
2. ~~**Installation method:**~~ `npx aicib init` confirmed.
3. ~~**Agent communication visibility:**~~ Full delegation visible in terminal with color-coded agent messages. Slack shows per-department activity.
4. ~~**Deliverable format:**~~ Markdown files in project directory. Both human-readable and terminal-displayable.
5. ~~**Model selection:**~~ Users choose per-agent models (opus/sonnet/haiku). Smart defaults set by template.
6. ~~**Cost tracking detail level:**~~ Per agent per session. Per-task tracking deferred.

**New open decisions (for Phase 2.5-3):**
1. **Agent naming convention:** Should custom names be required during setup, or optional with role-title as default? ("CEO Sarah" vs just "CEO")
2. **Persona preset depth:** How many role-specific presets per role? Vision says 3-5. Should we ship with 3 per C-suite role and 2 per worker role, or invest in the full 5?
3. **Communication routing default:** Should new companies default to "Open + CC Manager" (most common in real companies) or "Strict Hierarchy" (simplest to understand)?
4. **Agent scheduler scope:** Should scheduled activation be simple cron-style ("every day at 9am") or also support complex rules ("every Monday, but skip holidays")?
5. **Template expansion priority:** Which 2-3 industry templates should we build after SaaS Startup? Top candidates: Marketing Agency, E-commerce Store, Consulting Firm.
6. **Board of Directors timing:** Should we pull Board of Directors into Phase 3 if we finish Phase 3 early, or keep it strictly in Phase 4?

---

## How to Execute This Roadmap

> **This section is specifically about how YOU (the founder) will work with Claude Code to build everything.**

Each phase should be executed in separate Claude Code sessions. For each phase:

1. **Open 4-5 terminal windows** (each one becomes a separate Claude Code conversation)
2. **In each, start a Claude Code session** focused on one workstream (e.g., "You're working on the Core Engine")
3. **Share this roadmap document and the requirements document** with each session so they know the full picture
4. **Define clear boundaries** between workstreams before coding starts (e.g., "Session 1 owns the database, Session 2 owns the personality system — here's how they connect")
5. **At the end of each week**, do one integration session to merge all the work together and make sure everything plays nicely

**The single most important thing:** Ship the demo. Every decision should be measured against: "Does this make the demo better, or does it just make the architecture cleaner?" In Phase 1, always choose the demo.

> **Your role as founder:** You don't need to understand the code. Your job is to: (1) decide the product vision (you've already done this brilliantly in the requirements doc), (2) make the open decisions listed above, (3) launch the parallel sessions and point them to the right workstream, (4) review the demo and provide feedback on whether it "feels right," and (5) execute the launch strategy. Claude Code does the engineering.

---

*This roadmap is a living document. Update it as implementation reveals new information.*
