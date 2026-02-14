# Phase 0: Walking Skeleton — Detailed Implementation Plan

## What is Phase 0?

> **Plain English:** Phase 0 is a 3-5 day test to prove the most basic version of our product works. Think of it like a screen test before filming a movie — we need to know the core idea actually works before investing weeks of building. The "walking skeleton" means the thinnest possible version that proves the full cycle: you give a command → the CEO gets it → delegates to the team → team produces results → CEO reports back to you.

**Goal:** You type a command, the CEO receives it, breaks it into tasks for the CTO and CMO, they each produce a real document, and the CEO gives you a summary. If this works, we proceed to Phase 1 (the real MVP). If it doesn't, we know in 3-5 days instead of 3-5 weeks.

**This is a single-session effort.** No need to open multiple terminal windows. One Claude Code session handles everything.

---

## What's Changing (The Big Architecture Shift)

> **Plain English:** The current code tries to launch Claude as a separate program (like double-clicking an app). But we've discovered that Anthropic (the company that makes Claude) has a proper toolkit called the **Claude Agent SDK** — a library that lets our code talk directly to Claude from the inside, like a built-in engine instead of a bolt-on. This is much more reliable and gives us features we need: tracking costs, managing sessions, defining subagents, and streaming output.

### Current approach (broken):
```
aicib start → spawns `claude` as a separate program → sends it a text prompt → hopes for the best
aicib brief → spawns ANOTHER separate `claude` program → no connection to the first one
```

### New approach (correct):
```
aicib start → uses Claude Agent SDK inside our code → creates a CEO session with subagents defined
aicib brief → sends a message to the existing CEO session → CEO delegates via built-in subagent system
```

**Key change:** We replace the "spawn a separate program" approach with the Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`), which runs Claude as a library inside our code. This gives us:
- Real subagent support (CEO can spawn CTO, CMO, CFO as sub-agents)
- Session persistence (the CEO remembers previous conversations)
- Actual cost tracking (the SDK reports exactly how many tokens each agent used)
- Streaming output (we see agent messages in real time as they work)

---

## Prerequisites

Before starting, make sure:
1. You have an **Anthropic API key** (get one at https://console.anthropic.com)
2. Set it as an environment variable: `export ANTHROPIC_API_KEY=your-key-here`
3. The aicib project is already set up (you've run `npm install` in the aicib folder)

> **Plain English:** An API key is like a password that lets our software talk to Claude's servers. Every time our agents "think," they use this key to connect. Anthropic charges per usage, so the key is also how they know who to bill.

---

## Step-by-Step Implementation Plan

### Step 1: Install the Claude Agent SDK (15 minutes)

**What:** Add the official Claude Agent SDK package to our project.

**Why:** This replaces the "launch claude as a separate program" approach with a proper programmatic connection. Like upgrading from shouting across the room to having an intercom system.

**What to do:**
```bash
cd aicib
npm install @anthropic-ai/claude-agent-sdk
```

**Files changed:**
- `package.json` — adds `@anthropic-ai/claude-agent-sdk` to dependencies

**How to verify it worked:** Run `npm ls @anthropic-ai/claude-agent-sdk` — it should show the package version without errors.

---

### Step 2: Create the Agent Runner (Core Engine) (2-4 hours)

**What:** Build a new file called `agent-runner.ts` that knows how to start a Claude agent session, send it messages, and get responses back.

> **Plain English:** This is the "engine room" of our product. It's the code that actually talks to Claude's AI, creates the CEO agent, tells it who the CTO/CMO/CFO are, and handles the back-and-forth conversation. Every other command (`start`, `brief`, `status`, `stop`) will use this engine.

**New file:** `aicib/src/core/agent-runner.ts`

**What this file does:**

1. **`startSession(projectDir, config)`** — Creates a new CEO agent session
   - Reads the CEO's soul.md personality file
   - Reads all other agent soul.md files (CTO, CMO, CFO, engineers, etc.)
   - Calls the Claude Agent SDK's `query()` function with:
     - The CEO's personality as the system prompt
     - All other agents defined as subagents (so the CEO can delegate to them)
     - Allowed tools: Read, Write, Edit, Glob, Grep, Bash, Task (for spawning subagents), WebSearch
     - The project directory as the working directory
     - Permission mode set to `bypassPermissions` (so agents can work without asking for permission on every action)
   - Saves the session ID to the SQLite database so we can resume it later
   - Returns a session handle

2. **`sendBrief(sessionId, brief)`** — Sends a directive to the CEO
   - Resumes the existing session using the saved session ID
   - Sends the brief text as a user message
   - Streams the CEO's response messages to the terminal in real time
   - The CEO will use the Task tool to delegate work to CTO, CMO, etc. (these are subagents defined in step 1)
   - Returns when the CEO finishes responding

3. **`getSessionStatus(sessionId)`** — Checks if a session is active
   - Looks up the session in the database
   - Returns the session state

4. **`stopSession(sessionId)`** — Gracefully ends the session
   - Aborts the query (using the AbortController from the SDK)
   - Records the final cost to the database
   - Marks the session as ended

**Key design decisions:**
- Each agent (CEO, CTO, CMO, CFO) is defined as a subagent using the SDK's `agents` option
- The soul.md content becomes each agent's `prompt` field
- The soul.md frontmatter `tools` array becomes each agent's `tools` field
- The soul.md frontmatter `model` field becomes each agent's `model` field
- The CEO runs on `opus` (smartest model), C-suite on `opus`/`sonnet`, workers on `sonnet`/`haiku`
- We use `settingSources: ['project']` so agents can read the project's CLAUDE.md if one exists

**How the subagent system works:**

> **Plain English:** When the CEO gets your brief, it decides which departments need to be involved. It uses Claude's built-in "Task" tool to send work to the CTO, CMO, or CFO. Each of those agents is like a mini-Claude session with its own personality, expertise, and tools. When the CTO finishes its work, the result goes back to the CEO, who can then send it to another department or compile the final report for you.

```
You: "Build a landing page for our car dealership"
  → CEO receives brief
  → CEO uses Task tool → spawns CTO subagent: "Design the technical architecture for a landing page"
  → CEO uses Task tool → spawns CMO subagent: "Write the copy and content strategy for a car dealership landing page"
  → CTO subagent works, produces architecture.md, returns result to CEO
  → CMO subagent works, produces marketing-plan.md, returns result to CEO
  → CEO compiles everything and presents you a summary
```

---

### Step 3: Wire Up `aicib start` (1-2 hours)

**What:** Rewrite the `start` command so it actually launches the AI team using our new engine.

**File changed:** `aicib/src/cli/start.ts`

**Current behavior (broken):** Spawns `claude --print` as a child process with a text prompt. Creates a new process every time. No real team coordination.

**New behavior:**
1. Load the config file (which agents are enabled, what models they use)
2. Load all agent soul.md files from `.claude/agents/`
3. Call `startSession()` from the new agent-runner
4. Display a visual "boot sequence" in the terminal:
   - Show each agent being initialized with their role and model
   - Show the company name and session ID
   - Show cost limits
5. Print a message: "Team is ready. Use `aicib brief \"your directive\"` to give them work."
6. Keep the session running (the session ID is saved to the database)

**What you'll see in the terminal:**
```
  AI Company-in-a-Box — Starting team

  Company: MyStartup
  Session: aicib-1707741234-abc123

  Booting agents:
    ✓ Chief Executive Officer (ceo) — opus
    ✓ Chief Technology Officer (cto) — opus
    ✓ Chief Financial Officer (cfo) — sonnet
    ✓ Chief Marketing Officer (cmo) — sonnet

  Cost limits: $50/day, $500/month

  Team is ready. Use 'aicib brief "your directive"' to send work.
```

---

### Step 4: Wire Up `aicib brief` (1-2 hours)

**What:** Rewrite the `brief` command so it actually sends your directive to the CEO and shows you the team working in real time.

**File changed:** `aicib/src/cli/brief.ts`

**Current behavior (broken):** Spawns a completely new, unrelated Claude process. No connection to any running team.

**New behavior:**
1. Look up the active session from the database
2. If no session exists, print an error: "No active team. Run `aicib start` first."
3. Format the brief using the existing `buildBriefPrompt()` function
4. Call `sendBrief()` from the agent-runner
5. Stream messages to the terminal as the agents work:
   - Show the CEO receiving and analyzing the brief
   - Show when the CEO delegates to CTO, CMO, etc. (Task tool calls)
   - Show subagent results as they come back
   - Show the CEO's final summary
6. After completion, record the cost to the database
7. Show the total cost for this brief

**What you'll see in the terminal:**
```
  AI Company-in-a-Box — Briefing CEO

  Company: MyStartup
  Directive: "Build a landing page for our car dealership"

  CEO: Analyzing directive... Breaking this down into technical and marketing workstreams.

  CEO → CTO: "Design the landing page architecture — responsive, fast-loading,
              SEO-optimized. Include tech stack recommendation."

  CEO → CMO: "Develop the content strategy and copy for a car dealership landing page.
              Target audience: local car buyers aged 25-55."

  CTO: [working...] → Produced: deliverables/architecture.md
  CMO: [working...] → Produced: deliverables/marketing-plan.md

  CEO: Here's the summary of what the team produced:

  ## Status Update
  **Completed:**
  - CTO delivered technical architecture (React + Next.js, estimated 2-week build)
  - CMO delivered content strategy with 5 page sections and SEO keyword plan

  **Deliverables saved to:**
  - deliverables/architecture.md
  - deliverables/marketing-plan.md

  Cost for this brief: $1.47
```

**How the streaming works:**

> **Plain English:** "Streaming" means you see the output appearing in real time, word by word, instead of waiting for everything to finish and then seeing it all at once. Like watching someone type a message versus receiving the full message after they're done. The Claude Agent SDK gives us messages as they happen — when the CEO starts thinking, when it delegates to someone, when a subagent finishes — so we can show all of this live in your terminal.

The SDK's `query()` function returns messages one at a time as an "async generator" (a stream of events). We'll process each message type:

| Message Type | What We Show |
|-------------|-------------|
| `assistant` message from CEO | The CEO's text output (thinking, delegating, summarizing) |
| `assistant` message with `parent_tool_use_id` | A subagent (CTO/CMO/etc.) is working — show which agent and what they're producing |
| `result` message | The final result with cost info — save cost to database |

---

### Step 5: Wire Up `aicib status` (30 minutes)

**What:** Make the status command show real information about the running session.

**File changed:** `aicib/src/cli/status.ts`

**Changes:**
1. Check the database for an active session
2. Show session ID, start time, and duration
3. Show agent statuses from the database (the agent-runner updates these as agents work)
4. Show accumulated cost for the current session

This is a small change because the existing status code already reads from the database — we just need the agent-runner to actually write status updates there.

---

### Step 6: Wire Up `aicib stop` (30 minutes)

**What:** Make the stop command actually end the running session.

**File changed:** `aicib/src/cli/stop.ts`

**Changes:**
1. Look up the active session from the database
2. Call `stopSession()` from the agent-runner (uses AbortController to cancel the query)
3. Show the final cost breakdown (already implemented — just needs real data)
4. Mark the session as ended in the database

---

### Step 7: Connect Cost Tracking (1 hour)

**What:** Make the cost tracker actually record real costs from the Agent SDK.

**File changed:** `aicib/src/core/cost-tracker.ts` (minor changes)
**File changed:** `aicib/src/core/agent-runner.ts` (add cost recording)

**How it works:**

The Claude Agent SDK's `SDKResultMessage` includes:
- `total_cost_usd` — the exact cost in dollars
- `modelUsage` — per-model breakdown (how many tokens each model used)
- `usage` — total token counts

After each `brief` completes, we extract these numbers and save them to our SQLite database using the existing `costTracker.recordCost()` method. This means `aicib cost` will immediately start showing real data.

> **Plain English:** Right now, the cost tracking code exists but nothing feeds it real numbers. After this step, every time an agent does work, we'll record exactly how much it cost. So when you run `aicib cost`, you'll see real dollar amounts per agent — "the CEO cost $0.45, the CTO cost $0.38, the CMO cost $0.22" etc.

---

### Step 8: Verify the Full Loop (2-3 hours)

**What:** Test the entire cycle end-to-end and fix any issues.

> **Plain English:** This is the actual "crash test." We run the whole thing for real and see what happens. Does the CEO actually understand the brief? Does it actually delegate to the CTO and CMO? Do those agents actually produce useful files? Does the CEO actually compile a summary? Do we see it all happening live in the terminal? Does the cost tracking work?

**Test scenario:**
```bash
# 1. Initialize a test company
cd /tmp
npx aicib init --name "TestMotors" --template saas-startup

# 2. Start the team
aicib start

# 3. Give them a real brief
aicib brief "We're a used car dealership. Create a marketing plan and technical architecture for our new website. Budget is $10,000 for development."

# 4. Watch the agents work...

# 5. Check the results
aicib status
ls deliverables/

# 6. Check costs
aicib cost

# 7. Stop the team
aicib stop
```

**Success criteria (what "working" looks like):**

| Criteria | How to verify |
|----------|--------------|
| CEO receives the brief | You see the CEO analyzing and responding to your directive |
| CEO delegates to at least 2 agents | You see Task tool calls to CTO and CMO |
| Subagents produce output | Files appear in the project directory (e.g., `deliverables/*.md`) |
| CEO compiles a summary | You see a structured status report from the CEO |
| Cost tracking works | `aicib cost` shows real dollar amounts per agent |
| `aicib status` shows real state | Shows "active" session with agent information |
| `aicib stop` works | Session ends cleanly, final cost is displayed |
| Total cost is reasonable | The entire brief costs under $5 (ideally $1-3) |

**Failure criteria (when to change approach):**

| Problem | What to do |
|---------|-----------|
| Subagents don't work reliably | Try using the `agents` option with different configurations. If still broken after 1 day, switch to manual orchestration (CEO makes multiple `query()` calls instead of using Task tool) |
| Costs are too high (>$10 per brief) | Switch more agents to Haiku model. Reduce system prompt sizes. Add `maxTurns` limit. |
| Agents produce garbage output | Improve soul.md prompts. Add more specific instructions about deliverable format. |
| Sessions can't be resumed | If SDK session resume doesn't work reliably, switch to a "single long-running session" model where `start` keeps the process alive |
| The SDK itself has issues | Fall back to spawning `claude` CLI with `--output-format stream-json` flag (gets structured JSON output we can parse), which is better than the current `--print` approach |

---

## Files Summary

Here's every file that gets created or changed:

### New Files

| File | What it does |
|------|-------------|
| `aicib/src/core/agent-runner.ts` | **The main new file.** The engine that talks to Claude via the Agent SDK. Handles starting sessions, sending briefs, streaming output, and stopping sessions. ~200-300 lines. |

### Modified Files

| File | What changes |
|------|-------------|
| `aicib/package.json` | Add `@anthropic-ai/claude-agent-sdk` dependency |
| `aicib/src/cli/start.ts` | Replace child process spawn with `agentRunner.startSession()` call. Keep all the beautiful terminal output. ~50% rewrite. |
| `aicib/src/cli/brief.ts` | Replace child process spawn with `agentRunner.sendBrief()` call. Add streaming message display. ~80% rewrite. |
| `aicib/src/cli/status.ts` | Minor changes — reads from database (which now has real data). ~10% change. |
| `aicib/src/cli/stop.ts` | Replace database-only stop with `agentRunner.stopSession()` call. ~30% rewrite. |
| `aicib/src/core/cost-tracker.ts` | No structural changes — just ensure it's called correctly from agent-runner. ~5% change. |

### Unchanged Files (already working)

| File | Why no changes needed |
|------|----------------------|
| `aicib/src/index.ts` | CLI routing works perfectly |
| `aicib/src/core/config.ts` | Config system is production-ready |
| `aicib/src/core/agents.ts` | Agent definition parser works great |
| `aicib/src/cli/init.ts` | Init command works perfectly |
| `aicib/src/cli/cost.ts` | Cost display works — just needs real data |
| `aicib/src/cli/add-agent.ts` | Works perfectly |
| `aicib/src/cli/remove-agent.ts` | Works perfectly |
| `aicib/src/cli/config.ts` | Works perfectly |
| All soul.md template files | Excellent quality, ready to use |

---

## Architecture Diagram

> **Plain English:** This shows how all the pieces connect. You (the founder) type commands in the terminal. Those commands go through the CLI layer (the command-line interface). The CLI talks to the Agent Runner (our new engine). The Agent Runner talks to Claude's servers via the Agent SDK. Claude creates the CEO, who delegates to the CTO/CMO/CFO. Results flow back the same path.

```
┌─────────────────────────────────────────────────────────────┐
│  YOUR TERMINAL                                              │
│                                                             │
│  $ aicib start        → Starts CEO session with subagents   │
│  $ aicib brief "..."  → Sends directive to CEO              │
│  $ aicib status       → Shows what agents are doing         │
│  $ aicib stop         → Ends the session                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  CLI LAYER (src/cli/*.ts)                                    │
│  Handles terminal commands, formatting, colors, spinners     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  AGENT RUNNER (src/core/agent-runner.ts) ← NEW FILE          │
│                                                              │
│  startSession()  — Creates CEO session with all subagents    │
│  sendBrief()     — Sends message, streams response           │
│  stopSession()   — Aborts the query, records final cost      │
│                                                              │
│  Uses: Claude Agent SDK (@anthropic-ai/claude-agent-sdk)     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  CLAUDE AGENT SDK                                            │
│                                                              │
│  query({ prompt, options: {                                  │
│    systemPrompt: ceo-soul.md content,                        │
│    agents: {                                                 │
│      "cto": { prompt: cto-soul.md, model: "opus" },         │
│      "cmo": { prompt: cmo-soul.md, model: "sonnet" },       │
│      "cfo": { prompt: cfo-soul.md, model: "sonnet" },       │
│    },                                                        │
│    allowedTools: ["Read","Write","Edit","Task",...],          │
│    permissionMode: "bypassPermissions"                       │
│  }})                                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  CLAUDE'S SERVERS (Anthropic API)                            │
│                                                              │
│  CEO (opus) ──Task──→ CTO (opus) ──Task──→ Backend Engineer │
│              ──Task──→ CMO (sonnet) ──Task──→ Content Writer │
│              ──Task──→ CFO (sonnet) ──Task──→ Financial Analyst│
│                                                              │
│  Each agent reads/writes files in your project directory     │
└─────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  YOUR PROJECT FOLDER                                         │
│                                                              │
│  MyStartup/                                                  │
│    aicib.config.yaml     ← Company settings                  │
│    .claude/agents/       ← Agent personality files            │
│    .aicib/state.db       ← Cost tracking, session history     │
│    deliverables/         ← Documents agents produce           │
│      architecture.md                                         │
│      marketing-plan.md                                       │
│      budget-forecast.md                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Timeline Estimate

| Day | What gets done |
|-----|---------------|
| **Day 1** | Step 1 (install SDK) + Step 2 (build agent-runner core). By end of day: can programmatically start a CEO session and get a response. |
| **Day 2** | Step 3 (wire up `start`) + Step 4 (wire up `brief`). By end of day: the full command flow works — `start` → `brief` → see agents working. |
| **Day 3** | Step 5 (status) + Step 6 (stop) + Step 7 (cost tracking). By end of day: all commands work with real data. |
| **Day 4-5** | Step 8 (testing and fixing). Run the full test scenario multiple times. Fix issues. Tune prompts if agents aren't delegating well. Verify costs are reasonable. |

---

## What "Done" Looks Like

Phase 0 is complete when you can do this:

```bash
aicib init --name "TestCompany"
aicib start
aicib brief "Create a go-to-market strategy for our new SaaS product targeting small businesses"
# → Watch CEO delegate to CTO, CMO, CFO
# → See real documents appear in your project folder
# → See a compiled status report from the CEO
aicib status
# → Shows real session info and costs
aicib cost
# → Shows real dollar amounts per agent
aicib stop
# → Clean shutdown with final cost summary
```

If all of that works, Phase 0 is done and we move to Phase 1 (the real MVP with polished terminal output, beautiful formatting, and launch preparation).

---

## What Comes AFTER Phase 0

> **Plain English:** Phase 0 proves the engine works. Phase 1 makes it beautiful and launches it to the world. Here's what Phase 1 adds on top of the Phase 0 foundation:

- Polished terminal output with colors, spinners, and formatted tables
- Visual organization chart showing the team hierarchy
- Beautiful streaming output with agent-specific colors (CEO = gold, CTO = blue, CMO = green, etc.)
- Session persistence across terminal restarts
- Multiple briefs in the same session
- Polished README for GitHub
- Demo video recording
- Launch preparation

Phase 0 is the engine. Phase 1 is the car body, paint job, and showroom.

---

## Questions to Decide Before Starting

These don't block Phase 0, but would be nice to decide:

1. **Where should agent deliverables be saved?** Options:
   - `deliverables/` folder in your project (simple, visible)
   - `.aicib/deliverables/` (hidden, keeps project clean)
   - Let the CEO decide where to put them (flexible but unpredictable)

2. **How verbose should the terminal output be?** Options:
   - Show everything (all agent thinking, all delegation)
   - Show key milestones only (CEO received brief, delegated to X, X finished, here's the summary)
   - Let the user choose verbosity level with a flag

3. **Should `aicib start` stay running or return immediately?**
   - Stay running (like a server) — you'd use a separate terminal for `brief`
   - Return immediately (session saved to database) — `brief` resumes the session
   - The plan above assumes "return immediately" because it's simpler for Phase 0

---

*This plan is designed to be handed to a Claude Code session. Copy the relevant step and tell Claude Code: "Implement Step X as described in this plan." It has enough detail to work autonomously.*
