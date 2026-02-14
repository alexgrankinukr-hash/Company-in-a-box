# Edge Cases

Track edge cases discovered during implementation.

## Agent Runner / SDK Integration

### Start — Double Start Prevention

**Scenario:** User runs `aicib start` when a session is already active
**Handling:** Checks `getActiveSDKSessionId()` before creating a new session. If active, blocks with message.
**User sees:** "Team already running! Use 'aicib brief' to send directives, or 'aicib stop' to end the session."

### Brief — No Active Session

**Scenario:** User runs `aicib brief` without running `aicib start` first
**Handling:** `getActiveSDKSessionId()` returns null, command exits with error
**User sees:** "No active session found. Run 'aicib start' first to launch the team."

### Brief — Daily Cost Limit Reached

**Scenario:** Accumulated API costs for today exceed the configured daily limit
**Handling:** Checks `getTotalCostToday()` against `config.settings.cost_limit_daily` before sending brief
**User sees:** "Daily cost limit reached ($X.XX / $50). Increase the limit in aicib.config.yaml or wait until tomorrow."

### Start — Missing CEO Agent Definition

**Scenario:** CEO soul.md file is missing from `.claude/agents/` directory
**Handling:** `startCEOSession()` throws error when `agents.get("ceo")` returns undefined
**User sees:** "CEO agent definition not found. Run 'aicib init' first."

### Agent Runner — SDK Tool Mismatch

**Scenario:** Soul.md files reference `SendMessage` and `TeamCreate` tools which don't exist in the Agent SDK
**Handling:** `EXCLUDED_TOOLS` set filters these out silently during `buildSubagentMap()`
**User sees:** Nothing — this is handled transparently

### Stop — No Active Session

**Scenario:** User runs `aicib stop` when no session is running
**Handling:** `getActiveSession()` returns null, command exits gracefully
**User sees:** "No active session found."

### Agent Runner — Disabled Agents

**Scenario:** Agent has `enabled: false` in config.yaml
**Handling:** `buildSubagentMap()` checks `agentConfig.enabled` and skips disabled agents
**User sees:** Disabled agents don't appear in the CEO's available team

## Background Mode

### Brief — Double Background Brief Prevention

**Scenario:** User runs `aicib brief --background "task"` while another background job is already running
**Handling:** `getActiveBackgroundJob(sessionId)` checks for jobs with status `running`. If found and PID is alive, blocks with error.
**User sees:** "A background brief is already running. Job #2: 'test directive one...' Wait for it to finish or run 'aicib stop' to cancel."

### Brief — Stale Crashed Job Auto-Heal

**Scenario:** A previous background worker crashed (or was killed with `kill -9`), but the DB still shows `status = "running"`. User runs `aicib brief` again.
**Handling:** `brief.ts` checks PID liveness on any job marked `running`. If the PID is dead, auto-marks the job as `failed` with message "Worker process crashed (auto-healed by brief)" and proceeds with the new brief.
**User sees:** "Stale job #N auto-healed (worker had crashed)." followed by normal brief execution.

### Status — Worker Process Crashed

**Scenario:** Background worker process crashed or was killed externally, but DB still shows status `running`
**Handling:** `isProcessRunning(pid)` checks if the PID is still alive. If not, auto-updates job to `failed` with error message.
**User sees:** "Background work: FAILED (worker process not found)"

### Stop — Background Job Running During Stop

**Scenario:** User runs `aicib stop` while a background job is still running
**Handling:** `killBackgroundJob()` sends SIGTERM to the worker process. Re-reads the job's current status from DB before updating — only marks as `failed` if the job is still `running`. If the worker finished just before the kill, the `completed` status is preserved.
**User sees:** "Stopping background job #2... Background worker terminated."

### Stop — Race: Worker Completes Just Before Kill

**Scenario:** Worker finishes and marks job as `completed` at the exact moment `aicib stop` calls `killBackgroundJob()`
**Handling:** `killBackgroundJob()` re-reads job status from DB before writing. Sees `completed`, skips the update. The SIGTERM is harmless (process already exited).
**User sees:** Job shows as COMPLETED in `aicib status` / `aicib logs`, not incorrectly overwritten to FAILED.

### Background Worker — Config Load Failure

**Scenario:** Worker process can't load `aicib.config.yaml` (file deleted or corrupted after spawning)
**Handling:** Worker catches the error, marks job as `failed` with "Config load failed" message, exits
**User sees:** Job shows as FAILED in `aicib status` and `aicib logs`

### Background Worker — SDK Error (Cost Limit, API Key, etc.)

**Scenario:** `sendBrief()` throws during background execution (cost limit hit, API error, etc.)
**Handling:** Worker catches the error, logs it to `background_logs`, marks job as `failed` with error message
**User sees:** Error details in `aicib logs` and `aicib status`

### Background Worker — Job Not Found in DB

**Scenario:** Worker starts but its job ID doesn't exist in the database (e.g., DB was reset between spawn and worker startup)
**Handling:** Worker checks `getBackgroundJob(jobId)` immediately on startup. If null, writes error to stderr and exits with code 1.
**User sees:** Job never appears in `aicib status`. Worker process exits silently.

### Background Manager — Spawn Failure (PID Undefined)

**Scenario:** `spawn()` fails (bad path, permissions issue). `child.pid` is `undefined`.
**Handling:** Manager checks `child.pid === undefined` after spawn. If so, marks job as `failed` with "Failed to spawn worker process (pid undefined)" and throws an error.
**User sees:** Error message from `brief.ts`'s catch block.

### Logs — Invalid --lines Value

**Scenario:** User runs `aicib logs --lines abc` or `aicib logs --lines -5`
**Handling:** Validates parsed number is a positive integer. Rejects NaN, negative, zero, and fractional values.
**User sees:** "Error: --lines must be a positive integer."
