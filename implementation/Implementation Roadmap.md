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

## Phase 1: MVP — "The Founding Moment" (Weeks 1-3) — S1 COMPLETE

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
- No Board of Directors — the advisory board feature comes in Phase 3
- No HR system — no simulated hiring/firing/reviews yet
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
| **S2** | Agent Identity & Personas | The personality system. Reads soul.md files, lets users pick from pre-built personality presets or customize their own. Makes the CEO sound like a CEO and the CTO sound like a CTO. Can be built independently because it doesn't need the engine to be tested. |
| **S3** | CEO Memory System + Communication & Output | Builds the CEO's "journal" — automatic session summaries stored in SQLite, injected into context when the CEO starts a new session. Also handles what you SEE in the terminal: color-coded messages from each agent, the organization chart rendering, how agent conversations are displayed, and how deliverables (documents) are saved to your project folder. |
| **S4** | Financial + CLI Polish | The money tracking side — how much each agent costs, budget alerts ("you're approaching your daily limit"), plus making the terminal interface look professional with spinners, colors, and formatted tables. |
| **S5** | Template + Demo Prep | Polish the SaaS Startup template so it's impressive. Write high-quality personality files for all 8 agents. Create the README (the first page people see on GitHub). Record the demo video that will make people want to try it. |

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

## Phase 2: Organizational Intelligence (Weeks 4-6)

**Goal:** Make agents smart — autonomous decision-making, task management, knowledge accumulation, long-running autonomous projects, **Slack as the first interface outside the terminal**, and the beginning of real "company" behavior.

> **What changes:** In Phase 1, agents do what they're told and the CEO remembers past sessions. In Phase 2, they start thinking for themselves — knowing when to ask for permission, managing their own task lists, learning from past work, running multi-hour projects end-to-end, and getting "onboarded" like real employees. **Plus, you can now talk to your AI company through Slack instead of the terminal** — each department gets a channel, and you message the CEO just like you'd message a real employee. This is where the product starts feeling like a real company, not just a fancy chatbot.

**Success metric:** Agents can autonomously break down work, manage tasks, accumulate learnings, run multi-step projects over hours without human intervention, escalate appropriately, **and you can interact with the whole company through Slack**.

### Features

| # | Feature | What it does | Complexity |
|---|---------|-------------|-----------|
| 5 | Autonomy & Decision-Making Matrix | A rules table that defines what each agent can decide on their own vs. what needs approval. Example: the CMO can write a blog post without asking, but needs CEO approval to commit to a partnership. | Large (1.5 weeks) |
| 6 | Task/Project Management System | A built-in task board (like Trello) where agents create, assign, track, and complete tasks. Includes priority levels and review chains (junior work gets reviewed by seniors). | Large (1.5 weeks) |
| 3 | Agent Skills System | Structured capabilities that agents can have. A "skill" is a combination of a prompt template + the tools needed + the knowledge required. Like job skills on a resume — but executable. | Large (1.5 weeks) |
| 7 | Knowledge Management | A company wiki that agents build and reference. Includes: shared knowledge base, personal journals (each agent keeps notes), and a decision log (why did we decide X?). Uses SQLite for fast search. Builds on the CEO journal/memory from Phase 1 — extends it to all agents and adds the shared wiki. | Large (1.5 weeks) |
| NEW | Long Autonomous Task Chains | The ability to give the CEO a big project ("build me a car sales website") and have the team work on it for hours autonomously. The CEO plans the project, breaks it into phases, delegates phase by phase, reviews results after each phase, requests fixes if needed, and only pings the founder when the full project is complete. Think of it like giving your CEO a brief on Monday morning and getting a finished deliverable by end of day — without checking in every 10 minutes. Builds on background mode from Phase 1. | Large (1.5 weeks) |
| 24 | Error Handling & Escalation Protocol | What happens when things go wrong. A 6-step chain: retry → ask a colleague → escalate to manager → escalate to department head → escalate to CEO → escalate to human founder. | Small (0.5 weeks) |
| 9 | HR System (basics) | Agent lifecycle management — hiring new agents (adding them to the team), onboarding (they gradually gain more autonomy as they prove themselves), and performance reviews. | Medium (1 week) |
| NEW | Slack Bot (first interface outside the terminal) | Your AI company lives inside Slack. Each department gets a channel (#ceo, #engineering, #marketing, #finance). You message the CEO channel with a brief, and agents post their work in their department channels — like watching real employees collaborate. You can send briefs, receive reports, and watch delegation happen in real time. Uses a free Slack workspace. This is the fastest way to interact with your company outside the terminal, and it's incredibly natural — you already know how Slack works. Think of it as your AI company "moving into" your Slack workspace. | Medium (1-1.5 weeks) |

### Parallel Sessions — Phase 2

| Session | Workstream | What needs to exist first |
|---------|-----------|--------------------------|
| **S1** | Autonomy matrix + escalation rules | Needs the core engine, agent identities, and communication from Phase 1 |
| **S2** | Task management system — the internal task board with priorities and review workflows | Needs the core engine + communication system |
| **S3** | Skills + knowledge management — the wiki, journals, decision log, and skill definitions. Extends the CEO journal/memory system from Phase 1 to all agents. | Needs agent identity system + CEO memory from Phase 1 |
| **S4** | Long autonomous task chains — multi-phase project execution where CEO plans → delegates → reviews → iterates → delivers. Also builds on background mode from Phase 1. Plus HR system basics. | Needs background mode + core engine from Phase 1 |
| **S5** | Slack Bot + community setup — build the Slack integration so the founder can interact with their AI company through Slack channels instead of the terminal. Also set up GitHub Issues, Discord, contributing guide. | Needs communication system from Phase 1. Slack API setup is independent. |

---

## Phase 3: Advanced Systems (Weeks 7-9)

**Goal:** The differentiating features that make us unique — Board of Directors, connecting to real tools via MCP, company events, reports, and safety controls for external actions.

> **Why Phase 3 matters:** This is where we pull ahead of competitors. No other product has a Board of Directors feature, company-wide events, or the depth of organizational simulation we're building. Slack integration was already added in Phase 2 — this phase expands the MCP framework to connect agents to many more real-world tools (GitHub, email, calendars, etc.).

**Success metric:** The system behaves like a real company — board meetings with advisors, department reports, agents using real tools (sending Slack messages, creating GitHub issues), and safety guardrails on external actions.

### Features

| # | Feature | What it does | Complexity |
|---|---------|-------------|-----------|
| 8 | Board of Directors | An advisory panel of expert AI agents who review big decisions. Three modes: reactive (you ask them), proactive (they watch and chime in), and voting (they vote on proposals). Like a real board of directors. | Large (1.5 weeks) |
| 11 | Notification System | Alerts delivered to you based on urgency. Critical issues interrupt you immediately; routine updates get batched into daily digests. Configurable quiet hours, per-department preferences. | Medium (1 week) |
| 12 | Reporting Suite | Automated reports: CEO daily briefings, department performance summaries, financial burn-rate reports, KPI dashboards. The system writes its own status reports like a real company does. | Large (1.5 weeks) |
| 13 | Company Events | Simulated meetings: daily standups, weekly department syncs, monthly all-hands, quarterly strategy reviews. Agents attend, discuss, and produce meeting minutes with action items. | Medium (1 week) |
| 14 | External Actions & Safeguards | Rules for what agents can do outside the system. Category-based approval: social media posts need CMO approval, code deployments need CTO approval, spending over $X needs founder approval. Trust levels increase over time as agents prove reliable. | Medium (1 week) |
| 15 | MCP Integration Framework | The "plug-in" system that connects agents to real tools. Uses Composio (a service providing 300+ pre-built connections) so the CMO can post to social media, the CTO can manage GitHub, the CFO can track expenses in QuickBooks, etc. **Note:** Slack was already connected in Phase 2 as the first integration. This phase builds the general framework and adds many more tools. | Large (1.5 weeks) |
| 20 | Template System | A way to package and share company configurations. Users or community members can create templates for different business types (e-commerce, agency, consulting) and share them. | Medium (1 week) |
| 23 | Data Export/Import | Ability to back up your entire company (all agent configs, knowledge, history) and restore it elsewhere. Also allows publishing anonymized templates to the community marketplace. | Medium (1 week) |

### Parallel Sessions — Phase 3

| Session | Workstream |
|---------|-----------|
| **S1** | Board of Directors — the advisory body, meeting mechanics, 3 operating modes, voting system |
| **S2** | Notifications + Reporting — urgency levels, daily digests, CEO briefings, automated department reports |
| **S3** | Events + Templates — simulated company meetings, standup formats, and the template packaging system for community sharing |
| **S4** | MCP Integration Framework — the marketplace where agents browse available tools, request access, and connect to real services like Slack, GitHub, email via Composio |
| **S5** | External safeguards + data portability — approval rules for external actions, trust level tracking, and full company export/import |

---

## Phase 4: Interfaces & Scale (Weeks 10-13)

**Goal:** Web dashboard, Telegram integration, and production polish.

> **What changes:** You've been interacting with your AI company through the terminal and Slack (added in Phase 2). Phase 4 adds a proper web dashboard (a visual interface in your browser) with org charts, cost graphs, and a real-time activity feed. It also adds Telegram as another messaging option. This is where non-technical users can start using the product comfortably without any terminal at all.

**Success metric:** Non-CLI users can interact with their AI company through a full web dashboard or messaging apps.

### Features

| # | Feature | What it does | Complexity |
|---|---------|-------------|-----------|
| 16 | Web UI / Dashboard | A website (running on your computer) that shows your AI company visually — org chart, chat channels, task boards, cost graphs, reports. Like a Slack-meets-Notion interface for your AI team. | XL (3-4 weeks) |
| 17 | Telegram Bot | Talk to your AI company through Telegram. Send briefs, receive reports, approve decisions — all from your phone via a Telegram chat. | Medium (1 week) |
| ~~18~~ | ~~Slack Bot~~ | **Moved to Phase 2.** Slack integration ships much earlier because it's the fastest and most natural way to interact with your AI company outside the terminal. | — |
| 7+ | Knowledge Management (semantic search) | Upgrade the knowledge system to understand meaning, not just exact words. Uses Qdrant (a vector database) so when you search "marketing spend," it also finds docs about "advertising budget." | Large (1-1.5 weeks) |
| 21 | Security & Vault | Encrypted storage for sensitive data (API keys, passwords, tokens). Role-based access so agents only see what they're authorized to see — like how not every employee has the company credit card. | Medium (1 week) |
| 22+ | Audit Trail with AI summaries | A complete record of everything every agent ever did, with AI-generated daily/weekly/monthly summaries. Like having a secretary who takes notes on every meeting and action. | Medium (1 week) |

### Parallel Sessions — Phase 4

| Session | Workstream |
|---------|-----------|
| **S1** | Web UI — the chat interface (channel list on the left, messages in the middle, context panel on the right — like Slack) |
| **S2** | Web UI — the dashboard views (home page, KPI metrics, org chart visualization, task board, reports, settings) |
| **S3** | Telegram Bot — mapping company channels to Telegram chats, bot commands, receiving notifications, approving decisions inline |
| **S4** | Security & Vault — encrypted storage for API keys and secrets, role-based access control, plus trust-level tracking (Slack Bot was already built in Phase 2) |
| **S5** | Smart search (Qdrant vector database), AI-generated audit summaries, and making sure everything works together smoothly (integration testing) |

---

## Phase 5: Monetization & Enterprise (Weeks 14+)

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
| **Web dashboard** (Phase 4) | React + Vite | The most popular tools for building web interfaces. React is used by Facebook, Airbnb, Netflix. Vite makes development fast. |
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
  [1] ──> [26] CEO Memory (session journals + context injection) ← NEW Phase 1
  [1] ──> [27] Background Mode (async brief execution) ← NEW Phase 1

LAYER 2: Intelligence (makes agents smart, not just functional)
  [2,4] ──> [5] Autonomy Matrix (who can decide what)
  [4,10] ──> [6] Task Management (internal task board)
  [2,1] ──> [3] Skills System (agent capabilities)
  [1,4] ──> [24] Error Handling (what happens when things break)
  [26,27,6] ──> [28] Long Autonomous Task Chains (multi-hour projects) ← NEW Phase 2

LAYER 3: Organization (makes it feel like a real company)
  [5,10] ──> [9] HR System (hiring, reviews, lifecycle)
  [4,5] ──> [7] Knowledge Management (company wiki/memory)
  [4,5] ──> [8] Board of Directors (advisory panel)
  [5,22] ──> [14] External Safeguards (safety rules for real-world actions)

LAYER 4: Delivery (how information reaches you)
  [4,5,6] ──> [11] Notifications (alerts and digests)
  [6,7,9,10] ──> [12] Reporting (automated reports)
  [4,6] ──> [13] Company Events (meetings and standups)
  [3,14,21] ──> [15] MCP Integration (connecting to real tools)

LAYER 2.5: First External Interface (pulled forward from Phase 4)
  [4] ──> [18] Slack Bot (moved to Phase 2 — first interface outside the terminal)

LAYER 5: Interfaces (how you interact with the system)
  [ALL] ──> [16] Web UI (dashboard in your browser)
  [4,11] ──> [17] Telegram Bot
  [2,3,7] ──> [20] Template System (shareable company configs)
  [25,7] ──> [23] Data Export/Import (backup and portability)
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
| Web dashboard delays everything | A proper web interface takes 3-4 weeks and could push the whole timeline | That's why it's Phase 4, not Phase 1. Every successful AI tool launched without a web UI. The terminal demo is actually MORE shareable (GIFs are perfect for Twitter/HN). **Slack integration in Phase 2 gives us a real interface much sooner** — it takes days instead of weeks and lets the founder interact with the company naturally while we build the full dashboard later. |
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

These should be decided before or during Phase 1:

1. **Product name:** Is `aicib` the final command name? Other options: `founderai`, `teamforge`, `hiveexec`. The command name is what users type every time they use the product.
2. **Installation method:** Current plan is `npx aicib init` (instant, no permanent install). Is this the right first impression?
3. **Agent communication visibility:** How much of the agents' internal conversations should the user see? Everything (could be overwhelming)? Summaries only? Just escalations and final deliverables?
4. **Deliverable format:** Should agents produce Markdown files (human-readable text documents)? Structured data that the terminal can display? Both?
5. **Model selection:** Should the MVP let users choose which AI model each agent uses, or just ship with smart defaults and no choices?
6. **Cost tracking detail level:** Track costs per agent per session? Or per agent per task? The latter is more useful but harder to build.

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
