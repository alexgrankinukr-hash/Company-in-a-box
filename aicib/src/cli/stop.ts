import path from "node:path";
import chalk from "chalk";
import { loadConfig } from "../core/config.js";
import { CostTracker } from "../core/cost-tracker.js";
import { killBackgroundJob } from "../core/background-manager.js";

interface StopOptions {
  dir: string;
}

export async function stopCommand(options: StopOptions): Promise<void> {
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

  console.log(chalk.bold("\n  AI Company-in-a-Box — Stopping team\n"));

  try {
    const costTracker = new CostTracker(projectDir);
    const activeSession = costTracker.getActiveSession();

    if (!activeSession) {
      console.log(chalk.yellow("  No active session found.\n"));
      costTracker.close();
      return;
    }

    // Kill any running background job first
    const activeJob = costTracker.getActiveBackgroundJob(activeSession);
    if (activeJob) {
      console.log(
        chalk.yellow(`  Stopping background job #${activeJob.id}...`)
      );
      killBackgroundJob(activeJob, costTracker, "Stopped by user");
      console.log(chalk.green("  Background worker terminated."));
    }

    // Mark all agents as stopped
    const statuses = costTracker.getAgentStatuses();
    for (const agent of statuses) {
      costTracker.setAgentStatus(agent.agent_role, "stopped");
    }

    // Clear SDK session data
    costTracker.clearSDKSessionData(activeSession);

    // End the session
    costTracker.endSession(activeSession);

    console.log(`  Session ${chalk.dim(activeSession)} ended.`);
    console.log(
      chalk.green("  All agents marked as stopped.\n")
    );

    // Show final cost summary
    const costs = costTracker.getCostByAgent(activeSession);
    if (costs.length > 0) {
      console.log(chalk.bold("  Final cost breakdown:"));
      let total = 0;
      for (const cost of costs) {
        console.log(
          `    ${cost.role.padEnd(22)} $${cost.total_cost_usd.toFixed(4)}`
        );
        total += cost.total_cost_usd;
      }
      console.log(
        `    ${"─".repeat(30)}\n    ${"Total".padEnd(22)} $${total.toFixed(4)}\n`
      );
    }

    costTracker.close();
  } catch (error) {
    console.error(
      chalk.red(
        `  Error: ${error instanceof Error ? error.message : String(error)}\n`
      )
    );
    process.exit(1);
  }
}
