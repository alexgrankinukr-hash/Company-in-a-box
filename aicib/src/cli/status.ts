import path from "node:path";
import chalk from "chalk";
import { loadConfig, listAllAgents } from "../core/config.js";
import { CostTracker } from "../core/cost-tracker.js";
import { getTeamStatusSummary } from "../core/team.js";
import { isProcessRunning } from "../core/background-manager.js";

interface StatusOptions {
  dir: string;
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export async function statusCommand(options: StatusOptions): Promise<void> {
  const projectDir = path.resolve(options.dir);

  let config;
  try {
    config = loadConfig(projectDir);
  } catch (error) {
    console.error(
      chalk.red(
        `  Error: ${error instanceof Error ? error.message : String(error)}`
      )
    );
    process.exit(1);
  }

  console.log(chalk.bold("\n  AI Company-in-a-Box — Status\n"));

  try {
    const costTracker = new CostTracker(projectDir);
    const summary = getTeamStatusSummary(costTracker, config);
    console.log(summary);

    // Show active SDK session indicator
    const activeSDKSession = costTracker.getActiveSDKSessionId();
    if (activeSDKSession) {
      console.log(
        chalk.bold("  Session: ") +
          chalk.green("ACTIVE") +
          chalk.dim(` (${activeSDKSession.sdkSessionId})`)
      );
      console.log();

      // Show background job status
      const activeJob = costTracker.getActiveBackgroundJob(
        activeSDKSession.sessionId
      );

      if (activeJob) {
        // Check if the worker process is actually still alive
        const alive = activeJob.pid ? isProcessRunning(activeJob.pid) : false;

        if (alive) {
          console.log(
            chalk.bold("  Background work: ") +
              chalk.yellow("IN PROGRESS")
          );
          console.log(
            chalk.dim(
              `    Directive: "${activeJob.directive.slice(0, 70)}${activeJob.directive.length > 70 ? "..." : ""}"`
            )
          );
          console.log(
            chalk.dim(
              `    Started: ${formatTimeAgo(activeJob.started_at)} | Job #${activeJob.id} | PID ${activeJob.pid}`
            )
          );
        } else {
          // Process died but DB still says running — mark as failed
          costTracker.updateBackgroundJob(activeJob.id, {
            status: "failed",
            completed_at: new Date().toISOString(),
            error_message: "Worker process not found (crashed or killed externally)",
          });
          console.log(
            chalk.bold("  Background work: ") +
              chalk.red("FAILED") +
              chalk.dim(" (worker process not found)")
          );
          console.log(
            chalk.dim(
              `    Directive: "${activeJob.directive.slice(0, 70)}${activeJob.directive.length > 70 ? "..." : ""}"`
            )
          );
        }
        console.log();
      } else {
        // Show most recent completed/failed job
        const recentJobs = costTracker.listBackgroundJobs(
          activeSDKSession.sessionId
        );
        const lastJob = recentJobs[0];

        if (lastJob) {
          if (lastJob.status === "completed") {
            console.log(
              chalk.bold("  Last background work: ") +
                chalk.green("COMPLETED")
            );
            console.log(
              chalk.dim(
                `    Directive: "${lastJob.directive.slice(0, 70)}${lastJob.directive.length > 70 ? "..." : ""}"`
              )
            );
            console.log(
              chalk.dim(
                `    Cost: $${lastJob.total_cost_usd.toFixed(4)} | Turns: ${lastJob.num_turns} | ${formatTimeAgo(lastJob.completed_at!)}`
              )
            );
          } else if (lastJob.status === "failed") {
            console.log(
              chalk.bold("  Last background work: ") +
                chalk.red("FAILED")
            );
            console.log(
              chalk.dim(
                `    Directive: "${lastJob.directive.slice(0, 70)}${lastJob.directive.length > 70 ? "..." : ""}"`
              )
            );
            console.log(
              chalk.dim(
                `    Error: ${lastJob.error_message || "Unknown error"}`
              )
            );
          }
          console.log();
        }
      }
    }

    // Show configured agents
    const allAgents = listAllAgents(config);
    console.log(chalk.bold("  Configured agents:"));

    for (const agent of allAgents) {
      const enabledStr = agent.enabled
        ? chalk.green("enabled")
        : chalk.red("disabled");
      const dept =
        agent.department !== agent.role
          ? chalk.dim(` (${agent.department} dept)`)
          : "";
      console.log(
        `    ${agent.role.padEnd(22)} ${agent.model.padEnd(8)} ${enabledStr}${dept}`
      );
    }
    console.log();

    costTracker.close();
  } catch (error) {
    // If no state DB exists yet, just show config
    const allAgents = listAllAgents(config);
    console.log(`  Company: ${config.company.name}`);
    console.log(`  Template: ${config.company.template}\n`);
    console.log(chalk.bold("  Configured agents:"));

    for (const agent of allAgents) {
      const enabledStr = agent.enabled
        ? chalk.green("enabled")
        : chalk.red("disabled");
      console.log(
        `    ${agent.role.padEnd(22)} ${agent.model.padEnd(8)} ${enabledStr}`
      );
    }

    console.log(
      chalk.yellow("\n  No active session. Run 'aicib start' to launch.\n")
    );
  }
}
