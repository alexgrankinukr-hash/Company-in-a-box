# Agent Runner — Claude Agent SDK Integration

## What It Does

The agent runner (`src/core/agent-runner.ts`) is the core engine that connects AICIB to Claude's AI via the official Claude Agent SDK. It replaces the old approach of spawning `claude --print` as a child process.

It handles: creating CEO sessions, defining C-suite subagents, sending briefs, streaming responses, and extracting cost data.

## How It Works

### Session Lifecycle

```
aicib start
  → startCEOSession() creates new SDK session
  → CEO agent initialized with system prompt from soul.md
  → C-suite (CTO, CMO, CFO) registered as subagents
  → Session ID saved to SQLite for later resume
  → CEO introduces itself, confirms team structure

aicib brief "directive"
  → sendBrief() resumes existing session via SDK session ID
  → Directive formatted and sent to CEO
  → CEO delegates to subagents via Task tool
  → Subagents produce deliverables
  → Cost recorded to database

aicib stop
  → Session marked as ended in database
  → SDK session data cleared
```

### Soul.md to SDK Mapping

The agent runner reads soul.md files (via `agents.ts`) and converts them to SDK `AgentDefinition` objects:

| Soul.md Field | SDK Field | Notes |
|--------------|-----------|-------|
| `content` (markdown body) | `prompt` | Agent's full personality/instructions |
| `frontmatter.title` | `description` | Used in agent description string |
| `frontmatter.tools` | `tools` | Filtered — `SendMessage` and `TeamCreate` removed (don't exist in SDK) |
| `frontmatter.model` | `model` | Config.yaml overrides soul.md default |

Only C-suite agents (where `reports_to === "ceo"`) become direct subagents. Workers (backend-engineer, content-writer, etc.) are spawned by department heads during execution.

### Key Functions

| Function | Purpose |
|----------|---------|
| `buildSubagentMap(projectDir, config)` | Reads soul.md files, filters to C-suite, builds SDK agent definitions |
| `startCEOSession(projectDir, config, onMessage?)` | Creates new CEO session with subagents, streams messages |
| `sendBrief(sdkSessionId, directive, projectDir, config, onMessage?)` | Resumes session, sends directive, streams responses |
| `recordRunCosts(result, costTracker, sessionId, agentRole, model)` | Saves token usage and cost to SQLite |
| `formatMessage(message)` | Converts SDK messages to terminal-friendly strings |

### SDK Configuration

The CEO session is configured with:
- `systemPrompt`: Claude Code preset + CEO soul.md content appended
- `tools`: Claude Code preset (full tool access)
- `agents`: C-suite subagents built from soul.md files
- `permissionMode`: `bypassPermissions` (agents work autonomously)
- `maxBudgetUsd`: Daily cost limit from config

### Session Persistence

Sessions are persisted via SQLite so `brief` can resume a session started by `start`:

1. `start` calls `startCEOSession()` → gets SDK session ID
2. SDK session ID saved to `session_data` table via `costTracker.saveSDKSessionId()`
3. `brief` calls `costTracker.getActiveSDKSessionId()` → retrieves SDK session ID
4. `brief` calls `sendBrief()` with `resume: sdkSessionId`

## Background Mode

The agent runner's `sendBrief()` function is also used by the background worker process (`background-worker.ts`). In background mode:

1. `brief.ts` checks for stale jobs (PID dead but status still `running`) and auto-heals them before proceeding
2. `brief.ts` calls `startBackgroundBrief()` in `background-manager.ts`
3. The manager creates a `background_jobs` DB record (including the directive text) and spawns a detached child process with only `jobId`, `projectDir`, and `sdkSessionId` as args
4. The worker reads its directive from the `background_jobs` DB row (avoids OS arg-length limits and `ps aux` leakage)
5. The worker calls `sendBrief()` with an `onMessage` callback that writes to `background_logs` instead of the console
6. Costs are recorded using the job's own `session_id` (immutable on the DB row) — not `getActiveSession()`, which can return null if the session ends while the worker is finishing
7. On completion/error, the worker updates the job record and exits
8. `killBackgroundJob()` re-reads the job status before overwriting — if the worker already marked it `completed`, the kill does not clobber it to `failed`

This means `sendBrief()` and `formatMessage()` are shared between foreground and background execution — the only difference is where the output goes (console vs. database).

## Key Files

- `src/core/agent-runner.ts` — The SDK bridge (this module)
- `src/core/cost-tracker.ts` — SQLite persistence (sessions, costs, session_data, background_jobs, background_logs tables)
- `src/core/background-worker.ts` — Detached worker process for background brief execution
- `src/core/background-manager.ts` — Spawn/kill logic for background workers
- `src/core/agents.ts` — Soul.md parser (consumed by agent-runner)
- `src/core/team.ts` — Team state creation, agent directory helpers
- `src/cli/start.ts` — CLI command that calls `startCEOSession()`
- `src/cli/brief.ts` — CLI command that calls `sendBrief()` (foreground) or `startBackgroundBrief()` (background)
- `src/cli/logs.ts` — CLI command that reads background_logs from the database
- `src/cli/status.ts` — Shows background job progress alongside session status
- `src/cli/stop.ts` — Kills running background workers before ending session

## Edge Cases

- **No CEO soul.md**: Throws error "CEO agent definition not found. Run 'aicib init' first."
- **Disabled agents**: Agents with `enabled: false` in config are excluded from subagent map
- **SDK tools mismatch**: `SendMessage` and `TeamCreate` from soul.md are silently filtered out
- **Cost recording**: Currently records all costs under "ceo" role. Per-subagent cost breakdown deferred to Phase 1.
