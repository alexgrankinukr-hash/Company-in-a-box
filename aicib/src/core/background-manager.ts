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
    [workerScript, String(jobId), projectDir, sdkSessionId],
    {
      detached: true,
      stdio: "ignore",
      env: { ...process.env }, // inherit ANTHROPIC_API_KEY etc.
    }
  );

  if (child.pid === undefined) {
    costTracker.updateBackgroundJob(jobId, {
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: "Failed to spawn worker process (pid undefined)",
    });
    throw new Error("Failed to spawn background worker process");
  }

  const pid = child.pid;
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

  // Only overwrite status if the job is still running — avoids clobbering
  // a "completed" status that the worker set just before we got here.
  const current = costTracker.getBackgroundJob(job.id);
  if (current && current.status === "running") {
    costTracker.updateBackgroundJob(job.id, {
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: reason,
    });
  }

  return true;
}
