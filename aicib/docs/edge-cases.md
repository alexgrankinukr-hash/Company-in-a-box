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

## CEO Journal / Memory (S3)

### Journal Loading — Database Error

**Scenario:** Journal database is corrupted, has schema issues, or has permission problems when CEO starts up
**Handling:** `startCEOSession()` catches the error and logs a console warning. CostTracker is always closed via `finally` block (no DB connection leak). CEO starts without journal context.
**User sees:** "Warning: Failed to load journal entries: [error details]" — then normal session startup.

### Journal Generation — API Failure

**Scenario:** Haiku model call fails during journal summary generation (network error, budget exceeded, etc.)
**Handling:** Caught in `generateJournalEntry()`, warning logged. Brief result is unaffected.
**User sees:** "Warning: Journal entry generation failed: [error details]" — brief output is already complete.

### Journal Context — Too Long

**Scenario:** 10 journal entries exceed ~6000 characters (~3000 tokens), which could bloat the CEO's context
**Handling:** `startCEOSession()` trims to 5 entries if formatted text exceeds 6000 chars
**User sees:** Nothing — handled transparently

## Personas (S2)

### Init/Start — Missing Persona Preset

**Scenario:** Preset file doesn't exist or is malformed (e.g., template was created with an older version)
**Handling:** `loadPersonaFromConfig()` catches the error. For the default "professional" preset, shows a dim note. For user-selected presets, shows a warning.
**User sees:** "Note: No persona preset loaded. Agents running with base personalities only." or "Warning: Persona preset 'creative' could not be loaded."

### Config — Override Key Typo

**Scenario:** User sets a persona override for a role that doesn't exist (e.g., `overrides: { marketing: creative }` instead of `cmo`)
**Handling:** `buildSubagentMap()` checks override keys against loaded agent roles after building the map
**User sees:** "Warning: Persona override key 'marketing' does not match any agent role. Check spelling in config."

## Cost & Budget (S4)

### Brief — Daily Cost Limit Reached

**Scenario:** Today's accumulated API costs exceed the configured daily limit
**Handling:** `brief.ts` checks `getTotalCostToday()` before sending. Hard stop if exceeded.
**User sees:** "Daily cost limit reached ($50.12 / $50). Increase the limit in aicib.config.yaml or wait until tomorrow."

### Brief — Monthly Cost Limit Reached

**Scenario:** This month's accumulated API costs exceed the configured monthly limit
**Handling:** `brief.ts` checks `isMonthlyLimitReached()` before sending. Hard stop if exceeded.
**User sees:** "Monthly cost limit reached."

### Brief — Approaching Budget Limit

**Scenario:** Costs are between 50-80% or above 80% of daily/monthly limit
**Handling:** Warning displayed but brief proceeds
**User sees:** Yellow warning at 50%+, red warning at 80%+, with dollar amounts and percentages

### Cost Display — Corrupted Data

**Scenario:** Cost value is NaN, Infinity, or negative due to database corruption
**Handling:** `formatPercent()` returns "N/A" for non-finite or negative values instead of displaying garbage like "NaN%"
**User sees:** "N/A" in the percentage column

## Session Completion & Status Tracking (S6)

### Brief — Session Ends Before Sub-Agents Finish

**Scenario:** CEO delegates to CTO/CFO/CMO via Task tool, but the session ends after only 4-5 CEO turns before sub-agents complete their work
**Handling:** `maxTurns` set to 500 for CEO sessions and 200 for sub-agents. `maxBudgetUsd` remains the real cost safety net.
**User sees:** Full delegation cycle completes — sub-agents run, CEO compiles results

### Brief — Foreground Job Fails Mid-Execution

**Scenario:** `sendBrief()` throws an error during a foreground brief after the foreground job record was already created
**Handling:** Catch block marks the foreground job as "failed" in the database with the actual error message, and sets CEO status to "error"
**User sees:** Error message in terminal. `aicib logs` shows the job as FAILED with the error details.

### Status — Runtime Agent Status

**Scenario:** User runs `aicib status` while a brief is executing
**Handling:** `status.ts` reads from `agent_status` table (updated in real-time by brief.ts / background-worker.ts via `setAgentStatus()`). Shows working/idle/error/stopped with current task description.
**User sees:** CEO shows "working" with task snippet; sub-agents show "working" when dispatched, "idle" when done

### Logs — Foreground vs Background Job Display

**Scenario:** User runs `aicib logs` after a foreground brief
**Handling:** Foreground jobs are identified by `[foreground]` prefix on directive. Prefix stripped for display.
**User sees:** "Foreground Job #N" header instead of "Background Job #N"

### Cost Recording — Unknown Model

**Scenario:** SDK returns a model ID that doesn't contain "opus", "sonnet", or "haiku" (e.g., a new model family)
**Handling:** Falls back to the default pricing tier and logs a console warning
**User sees:** "Warning: Unknown model ID 'claude-future-5' — cost may use incorrect pricing tier."
