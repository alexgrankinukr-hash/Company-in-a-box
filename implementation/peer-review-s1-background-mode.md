# Peer Review Request: Phase 1 S1 — Background Mode for AICIB

## What to Review

The "Background Mode" feature for AICIB (AI Company-in-a-Box), a CLI tool that spawns a hierarchical team of AI agents structured like a real company. Background Mode lets users send a directive to their AI CEO and get their terminal back immediately — like emailing your CEO instead of standing in their office waiting.

## Problem Solved

Previously, `aicib brief "..."` blocked the terminal until all agents finished (could be 20-60+ seconds). Background Mode adds `aicib brief --background "..."` which spawns a detached worker process, returns instantly, and lets users check progress via `aicib status` and `aicib logs`.

## Architecture

```
aicib brief --background "Build a landing page"
  │
  ├─ Validates: session exists, cost limit OK, no other background job running
  ├─ Creates background_jobs row in SQLite (WAL mode)
  ├─ Spawns detached Node.js child process (background-worker.ts)
  ├─ Prints "Brief sent. CEO is working on it." and exits
  │
  └─ Worker process (runs independently):
       ├─ Calls existing sendBrief() from agent-runner.ts
       ├─ onMessage callback writes to background_logs table (not console)
       ├─ On completion: updates background_jobs row with result + cost
       ├─ On error: updates background_jobs row with error message
       └─ Exits

User checks progress: aicib status (reads DB, checks PID liveness)
User reads full logs: aicib logs (reads background_logs table)
User cancels work: aicib stop (sends SIGTERM to worker, marks job failed)
```

## Tech Stack

- **TypeScript** (ES2022, Node16 modules)
- **SQLite** via `better-sqlite3` (WAL mode for concurrent access)
- **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) for AI agent orchestration
- **Commander.js** for CLI, **Chalk** for terminal colors
- Child process management via Node.js `child_process.spawn()`

## End-to-End Test Results (All 9 Passed)

1. `aicib start` — team boots, CEO introduces itself
2. `aicib brief --background "Write a company description"` — returned in <1 second
3. `aicib status` — showed "Background work: IN PROGRESS" with PID
4. After ~20s, `aicib status` — showed "Last background work: COMPLETED" with cost ($0.0746)
5. `aicib logs` — showed full CEO conversation including delegation to CMO subagent
6. `aicib stop` — ended cleanly
7. Double background brief — second rejected with "A background brief is already running"
8. `aicib stop` during background work — "Stopping background job #2... Background worker terminated."

## Files to Review

### NEW FILE 1: `aicib/src/core/background-worker.ts` (Standalone detached process)

```typescript
#!/usr/bin/env node

/**
 * Background worker process — runs as a detached child process.
 * Invoked as: node background-worker.js <jobId> <projectDir> <directive> <sdkSessionId>
 *
 * Calls sendBrief() against the existing SDK session, writing all agent
 * messages to the background_logs table instead of the console. On completion
 * or error, updates the background_jobs row with the outcome.
 */

import { loadConfig } from "./config.js";
import { CostTracker } from "./cost-tracker.js";
import { sendBrief, recordRunCosts, formatMessage } from "./agent-runner.js";

async function main(): Promise<void> {
  const [, , jobIdStr, projectDir, directive, sdkSessionId] = process.argv;

  if (!jobIdStr || !projectDir || !directive || !sdkSessionId) {
    process.stderr.write(
      "Usage: background-worker.js <jobId> <projectDir> <directive> <sdkSessionId>\n"
    );
    process.exit(1);
  }

  const jobId = Number(jobIdStr);
  const costTracker = new CostTracker(projectDir);

  // Record this process's PID so the CLI can check liveness / kill it
  costTracker.updateBackgroundJob(jobId, { pid: process.pid });

  let config;
  try {
    config = loadConfig(projectDir);
  } catch (error) {
    costTracker.updateBackgroundJob(jobId, {
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: `Config load failed: ${error instanceof Error ? error.message : String(error)}`,
    });
    costTracker.close();
    process.exit(1);
  }

  const startTime = Date.now();

  try {
    const result = await sendBrief(
      sdkSessionId,
      directive,
      projectDir,
      config,
      (msg) => {
        // Write every displayable message to the background_logs table
        const formatted = formatMessage(msg);
        if (formatted) {
          // Determine agent role from the message
          let role = "system";
          if (msg.type === "assistant") {
            role = msg.parent_tool_use_id ? "subagent" : "ceo";
          } else if (msg.type === "result") {
            role = "system";
          }
          costTracker.logBackgroundMessage(jobId, msg.type, role, formatted);
        }
      }
    );

    // Record costs using existing mechanism
    const activeSession = costTracker.getActiveSession();
    if (activeSession) {
      recordRunCosts(
        result,
        costTracker,
        activeSession,
        "ceo",
        config.agents.ceo?.model || "opus"
      );
    }

    // Build a short summary from the last assistant message
    const durationMs = Date.now() - startTime;
    costTracker.updateBackgroundJob(jobId, {
      status: "completed",
      completed_at: new Date().toISOString(),
      total_cost_usd: result.totalCostUsd,
      num_turns: result.numTurns,
      duration_ms: durationMs,
      result_summary: `Completed in ${result.numTurns} turns, $${result.totalCostUsd.toFixed(4)} cost`,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMsg =
      error instanceof Error ? error.message : String(error);

    costTracker.logBackgroundMessage(
      jobId,
      "error",
      "system",
      `[ERROR] ${errorMsg}`
    );

    costTracker.updateBackgroundJob(jobId, {
      status: "failed",
      completed_at: new Date().toISOString(),
      duration_ms: durationMs,
      error_message: errorMsg,
    });
  } finally {
    costTracker.close();
  }
}

main().catch((err) => {
  process.stderr.write(`Background worker fatal error: ${err}\n`);
  process.exit(1);
});
```

### NEW FILE 2: `aicib/src/core/background-manager.ts` (Spawn/kill logic)

```typescript
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CostTracker, type BackgroundJob } from "./cost-tracker.js";
import type { AicibConfig } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Checks whether a given OS process ID is still alive.
 */
export function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0); // signal 0 = existence check, doesn't actually kill
    return true;
  } catch {
    return false;
  }
}

export interface BackgroundBriefResult {
  jobId: number;
  pid: number;
}

/**
 * Creates a background_jobs row and spawns a detached worker process that
 * calls sendBrief() independently. The CLI returns immediately.
 */
export function startBackgroundBrief(
  directive: string,
  projectDir: string,
  _config: AicibConfig,
  sdkSessionId: string,
  sessionId: string,
  costTracker: CostTracker
): BackgroundBriefResult {
  // Create the DB record first
  const jobId = costTracker.createBackgroundJob(sessionId, directive);

  // Resolve the compiled worker script path (dist/core/background-worker.js)
  const workerScript = path.join(__dirname, "background-worker.js");

  // Spawn a fully detached child process
  const child = spawn(
    process.execPath, // node binary
    [workerScript, String(jobId), projectDir, directive, sdkSessionId],
    {
      detached: true,
      stdio: "ignore",
      env: { ...process.env }, // inherit environment
    }
  );

  const pid = child.pid!;
  child.unref(); // allow parent to exit without waiting for child

  // Record the PID (worker also sets it, but this is immediate)
  costTracker.updateBackgroundJob(jobId, { pid });

  return { jobId, pid };
}

/**
 * Kills a running background worker and marks the job as failed.
 */
export function killBackgroundJob(
  job: BackgroundJob,
  costTracker: CostTracker,
  reason: string = "Stopped by user"
): boolean {
  if (job.pid && isProcessRunning(job.pid)) {
    try {
      process.kill(job.pid, "SIGTERM");
    } catch {
      // Process may have already exited
    }
  }

  costTracker.updateBackgroundJob(job.id, {
    status: "failed",
    completed_at: new Date().toISOString(),
    error_message: reason,
  });

  return true;
}
```

### NEW FILE 3: `aicib/src/cli/logs.ts` (Logs command)

```typescript
import path from "node:path";
import chalk from "chalk";
import { loadConfig } from "../core/config.js";
import { CostTracker } from "../core/cost-tracker.js";
import { isProcessRunning } from "../core/background-manager.js";

interface LogsOptions {
  dir: string;
  job?: string;
  lines?: string;
}

export async function logsCommand(options: LogsOptions): Promise<void> {
  const projectDir = path.resolve(options.dir);

  try {
    loadConfig(projectDir); // validate project exists
  } catch (error) {
    console.error(
      chalk.red(
        `  Error: ${error instanceof Error ? error.message : String(error)}`
      )
    );
    process.exit(1);
  }

  const costTracker = new CostTracker(projectDir);

  try {
    let jobId: number | undefined;

    if (options.job) {
      jobId = Number(options.job);
      if (Number.isNaN(jobId)) {
        console.error(chalk.red("  Error: --job must be a number.\n"));
        costTracker.close();
        process.exit(1);
      }
    } else {
      // Find the most recent background job
      const jobs = costTracker.listBackgroundJobs();
      if (jobs.length === 0) {
        console.log(
          chalk.yellow("\n  No background jobs found.\n")
        );
        costTracker.close();
        return;
      }
      jobId = jobs[0].id;
    }

    const job = costTracker.getBackgroundJob(jobId!);
    if (!job) {
      console.error(chalk.red(`\n  Error: Job #${jobId} not found.\n`));
      costTracker.close();
      process.exit(1);
    }

    console.log(chalk.bold(`\n  AI Company-in-a-Box — Logs for Job #${job.id}\n`));
    console.log(
      chalk.dim(
        `  Directive: "${job.directive.slice(0, 80)}${job.directive.length > 80 ? "..." : ""}"`
      )
    );

    // Show job status
    const statusColor =
      job.status === "completed"
        ? chalk.green
        : job.status === "running"
          ? chalk.yellow
          : chalk.red;

    let statusLabel = statusColor(job.status.toUpperCase());
    if (job.status === "running" && job.pid) {
      const alive = isProcessRunning(job.pid);
      if (!alive) {
        statusLabel = chalk.red("FAILED") + chalk.dim(" (process not found)");
      }
    }
    console.log(chalk.dim(`  Status: `) + statusLabel);
    console.log(chalk.dim(`  Started: ${job.started_at}`));
    if (job.completed_at) {
      console.log(chalk.dim(`  Completed: ${job.completed_at}`));
    }
    console.log();

    // Fetch and display logs
    const limit = options.lines ? Number(options.lines) : undefined;
    const logs = costTracker.getBackgroundLogs(job.id, limit);

    if (logs.length === 0) {
      console.log(chalk.dim("  No log entries yet.\n"));
    } else {
      for (const log of logs) {
        const time = chalk.dim(log.timestamp.split(" ")[1] || log.timestamp);
        const role = log.agent_role
          ? chalk.cyan(`[${log.agent_role}]`)
          : "";
        console.log(`  ${time} ${role} ${log.content}`);
      }
      console.log();
    }

    // Show summary footer
    if (job.status === "completed") {
      console.log(
        chalk.dim(
          `  Cost: $${job.total_cost_usd.toFixed(4)} | Turns: ${job.num_turns} | Duration: ${(job.duration_ms / 1000).toFixed(1)}s\n`
        )
      );
    } else if (job.status === "failed" && job.error_message) {
      console.log(
        chalk.red(`  Error: ${job.error_message}\n`)
      );
    }

    costTracker.close();
  } catch (error) {
    console.error(
      chalk.red(
        `\n  Error: ${error instanceof Error ? error.message : String(error)}\n`
      )
    );
    costTracker.close();
    process.exit(1);
  }
}
```

### MODIFIED: `aicib/src/core/cost-tracker.ts` (New tables + 7 methods added)

New interfaces added:
```typescript
export interface BackgroundJob {
  id: number;
  session_id: string;
  directive: string;
  status: "running" | "completed" | "failed";
  pid: number | null;
  started_at: string;
  completed_at: string | null;
  result_summary: string | null;
  error_message: string | null;
  total_cost_usd: number;
  num_turns: number;
  duration_ms: number;
}

export interface BackgroundLog {
  id: number;
  job_id: number;
  timestamp: string;
  message_type: string;
  agent_role: string;
  content: string;
}
```

New tables in `init()`:
```sql
CREATE TABLE IF NOT EXISTS background_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  directive TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  pid INTEGER,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  result_summary TEXT,
  error_message TEXT,
  total_cost_usd REAL NOT NULL DEFAULT 0,
  num_turns INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS background_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  message_type TEXT NOT NULL,
  agent_role TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES background_jobs(id)
);

CREATE INDEX IF NOT EXISTS idx_bg_jobs_session ON background_jobs(session_id);
CREATE INDEX IF NOT EXISTS idx_bg_jobs_status ON background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_bg_logs_job ON background_logs(job_id);
```

New methods added to `CostTracker` class:
```typescript
createBackgroundJob(sessionId: string, directive: string): number
getBackgroundJob(jobId: number): BackgroundJob | null
getActiveBackgroundJob(sessionId: string): BackgroundJob | null
listBackgroundJobs(sessionId?: string): BackgroundJob[]
updateBackgroundJob(jobId: number, fields: Partial<Pick<BackgroundJob, ...>>): void
logBackgroundMessage(jobId: number, type: string, role: string, content: string): void
getBackgroundLogs(jobId: number, limit?: number): BackgroundLog[]
```

The `updateBackgroundJob` method uses dynamic SQL construction:
```typescript
updateBackgroundJob(
  jobId: number,
  fields: Partial<Pick<BackgroundJob, "status" | "pid" | "completed_at" | "result_summary" | "error_message" | "total_cost_usd" | "num_turns" | "duration_ms">>
): void {
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const [key, value] of Object.entries(fields)) {
    sets.push(`${key} = ?`);
    values.push(value);
  }
  if (sets.length === 0) return;
  values.push(jobId);
  this.db
    .prepare(`UPDATE background_jobs SET ${sets.join(", ")} WHERE id = ?`)
    .run(...values);
}
```

### MODIFIED: `aicib/src/cli/brief.ts` (Added --background flag)

Key changes:
- Added `background?: boolean` to `BriefOptions`
- Added active background job check (before both modes):
```typescript
const existingJob = costTracker.getActiveBackgroundJob(activeSession.sessionId);
if (existingJob) {
  // Reject with error — only one background job at a time
}
```
- `if (options.background)` branch spawns worker via `startBackgroundBrief()` and returns immediately
- `else` branch is unchanged foreground behavior

### MODIFIED: `aicib/src/cli/status.ts` (Background job display)

Key changes:
- Imports `isProcessRunning` from background-manager
- Added `formatTimeAgo()` helper
- After showing session, queries for active background job:
  - If running + PID alive: shows "IN PROGRESS" with directive, start time, PID
  - If running + PID dead: auto-marks as failed, shows "FAILED (worker process not found)"
  - If no active job: shows most recent completed/failed job with cost summary

### MODIFIED: `aicib/src/cli/stop.ts` (Kill background worker on stop)

Key change — before ending session:
```typescript
const activeJob = costTracker.getActiveBackgroundJob(activeSession);
if (activeJob) {
  killBackgroundJob(activeJob, costTracker, "Stopped by user");
}
```

### MODIFIED: `aicib/src/index.ts` (Wire up flag + new command)

- Added `-b, --background` option to `brief` command
- Added `logs` command with `--job` and `--lines` options

### UNCHANGED: `aicib/src/core/agent-runner.ts` (Reused as-is)

The background worker calls `sendBrief()`, `formatMessage()`, and `recordRunCosts()` directly — no changes needed to the agent runner.

## Key Design Decisions

1. **Detached child process** (not worker threads): Worker survives if the user closes their terminal. Uses `detached: true` + `child.unref()` + `stdio: 'ignore'`.
2. **SQLite for IPC**: The CLI and worker communicate exclusively through the database. No sockets, no pipes, no file locks. SQLite WAL mode handles concurrent reads/writes safely.
3. **PID liveness check**: `process.kill(pid, 0)` (signal 0) to verify the worker is still alive without killing it. Status auto-corrects if the worker crashed.
4. **One background job at a time**: Prevents race conditions on the SDK session (which is single-threaded by nature).
5. **Dynamic SQL in updateBackgroundJob**: Builds UPDATE query from the fields object. Only whitelisted fields via `Pick<>` type constraint.

## Specific Review Focus Areas

1. **Security**: The `updateBackgroundJob` dynamic SQL construction — is the `Pick<>` type constraint sufficient, or could field names be injected? (Note: keys come from a typed object, not user input.)
2. **Process management**: Is the SIGTERM + mark-as-failed approach robust enough? Should we wait for the process to actually die before marking it?
3. **Race conditions**: Both the CLI (parent) and the worker write `pid` to the same job row. The worker also sets it in case the parent's write hasn't committed yet. Is this safe with WAL mode?
4. **Error handling**: If `costTracker.close()` throws in the worker's `finally` block, the outer `.catch()` handles it — but is that reliable?
5. **Directive as process arg**: The directive text is passed as a command-line argument to the worker. Very long directives could hit OS arg length limits (~128KB on macOS/Linux). Worth addressing?
6. **Missing SIGTERM handler in worker**: The worker doesn't install a `process.on('SIGTERM')` handler. The SDK's `sendBrief()` may not clean up gracefully when killed. Is this a concern?
7. **Timestamp inconsistency**: The worker uses `new Date().toISOString()` for `completed_at` but SQLite defaults use `datetime('now')`. These produce different formats.

## What a Good Review Looks Like

Please provide:
- **Bugs**: Any actual bugs or logic errors you see
- **Security issues**: SQL injection vectors, process safety, etc.
- **Race conditions**: Concurrent access to SQLite, PID management
- **Missing error handling**: Unhandled edge cases
- **Architecture concerns**: Anything that would make Phase 2 (long autonomous task chains) harder to build on top of this
- **Code quality**: Readability, naming, duplication, TypeScript type safety
- **Suggestions**: Improvements ranked by impact
