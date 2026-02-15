#!/usr/bin/env node

/**
 * Background worker process — runs as a detached child process.
 * Invoked as: node background-worker.js <jobId> <projectDir> <sdkSessionId>
 *
 * Reads the directive from the background_jobs DB row (avoids OS arg-length
 * limits and leaking text into `ps aux`). Calls sendBrief() against the
 * existing SDK session, writing all agent messages to the background_logs
 * table instead of the console. On completion or error, updates the
 * background_jobs row with the outcome.
 */

import { loadConfig } from "./config.js";
import { CostTracker } from "./cost-tracker.js";
import type { SDKSystemMessage } from "@anthropic-ai/claude-agent-sdk";
import { sendBrief, recordRunCosts, generateJournalEntry, formatMessagePlain } from "./agent-runner.js";

async function main(): Promise<void> {
  const [, , jobIdStr, projectDir, sdkSessionId] = process.argv;

  if (!jobIdStr || !projectDir || !sdkSessionId) {
    process.stderr.write(
      "Usage: background-worker.js <jobId> <projectDir> <sdkSessionId>\n"
    );
    process.exit(1);
  }

  const jobId = Number(jobIdStr);
  const costTracker = new CostTracker(projectDir);

  // Read directive from DB — avoids OS arg-length limits
  const job = costTracker.getBackgroundJob(jobId);
  if (!job) {
    process.stderr.write(`Job #${jobId} not found in database\n`);
    costTracker.close();
    process.exit(1);
  }
  const directive = job.directive;

  // Record this process's PID so the CLI can check liveness / kill it
  costTracker.updateBackgroundJob(jobId, { pid: process.pid });

  // Set CEO status to working
  costTracker.setAgentStatus("ceo", "working", directive.slice(0, 100));

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
        const formatted = formatMessagePlain(msg);
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

        // Track sub-agent status from task_notification messages
        if (
          msg.type === "system" &&
          "subtype" in msg &&
          ((msg as SDKSystemMessage).subtype as string) === "task_notification"
        ) {
          const taskMsg = msg as SDKSystemMessage & {
            taskName?: string;
            taskStatus?: string;
            agentName?: string;
          };
          const agent = (
            taskMsg.agentName ||
            taskMsg.taskName ||
            "subagent"
          ).toLowerCase();
          const status = taskMsg.taskStatus || "working";
          const taskLabel =
            status === "completed" || status === "done"
              ? "idle"
              : "working";
          costTracker.setAgentStatus(agent, taskLabel);
        }
      }
    );

    // Record costs using the job's own session_id (immutable, never null)
    recordRunCosts(
      result,
      costTracker,
      job.session_id,
      "ceo",
      config.agents.ceo?.model || "opus"
    );

    // Generate journal entry (best-effort)
    const durationMs = Date.now() - startTime;
    try {
      await generateJournalEntry(
        sdkSessionId,
        directive,
        result,
        projectDir,
        costTracker,
        job.session_id
      );
      costTracker.logBackgroundMessage(
        jobId,
        "info",
        "system",
        "[JOURNAL] Session summary saved"
      );
    } catch {
      // Journal generation is best-effort
      costTracker.logBackgroundMessage(jobId, "warning", "system", "[JOURNAL] Failed to generate summary");
    }

    // Mark CEO as idle after successful completion
    costTracker.setAgentStatus("ceo", "idle");

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

    // Mark CEO as error on failure
    try { costTracker.setAgentStatus("ceo", "error"); } catch { /* best-effort */ }

    costTracker.updateBackgroundJob(jobId, {
      status: "failed",
      completed_at: new Date().toISOString(),
      duration_ms: durationMs,
      error_message: errorMsg,
    });
  } finally {
    try { costTracker.close(); } catch { /* best-effort */ }
  }
}

main().catch((err) => {
  process.stderr.write(`Background worker fatal error: ${err}\n`);
  process.exit(1);
});
