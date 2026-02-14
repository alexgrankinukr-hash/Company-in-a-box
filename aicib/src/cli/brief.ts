import path from "node:path";
import chalk from "chalk";
import { loadConfig } from "../core/config.js";
import { CostTracker } from "../core/cost-tracker.js";
import {
  sendBrief,
  recordRunCosts,
  generateJournalEntry,
} from "../core/agent-runner.js";
import { formatMessageWithColor } from "../core/output-formatter.js";
import {
  startBackgroundBrief,
  isProcessRunning,
} from "../core/background-manager.js";
import { header, formatUSD, costColor, formatPercent } from "./ui.js";

interface BriefOptions {
  dir: string;
  background?: boolean;
}

export async function briefCommand(
  directive: string,
  options: BriefOptions
): Promise<void> {
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

  console.log(header("Briefing CEO"));
  console.log(chalk.dim(`  Company: ${config.company.name}`));
  console.log(chalk.dim(`  Directive: "${directive}"\n`));

  const costTracker = new CostTracker(projectDir);

  try {
    // Retrieve active SDK session ID
    const activeSession = costTracker.getActiveSDKSessionId();
    if (!activeSession) {
      console.error(
        chalk.red("  Error: No active session found.")
      );
      console.error(
        chalk.yellow("  Run 'aicib start' first to launch the team.\n")
      );
      costTracker.close();
      process.exit(1);
    }

    // Check daily cost limit before proceeding
    const todayCost = costTracker.getTotalCostToday();
    if (config.settings.cost_limit_daily > 0 && todayCost >= config.settings.cost_limit_daily) {
      console.error(
        chalk.red(
          `  Error: Daily cost limit reached ($${todayCost.toFixed(2)} / $${config.settings.cost_limit_daily})`
        )
      );
      console.error(
        chalk.yellow(
          "  Increase the limit in aicib.config.yaml or wait until tomorrow.\n"
        )
      );
      costTracker.close();
      process.exit(1);
    }

    // Check monthly cost limit before proceeding
    const monthCost = costTracker.getTotalCostThisMonth();
    if (config.settings.cost_limit_monthly > 0 && monthCost >= config.settings.cost_limit_monthly) {
      console.error(
        chalk.red(
          `  Error: Monthly cost limit reached (${formatUSD(monthCost, 2)} / $${config.settings.cost_limit_monthly})`
        )
      );
      console.error(
        chalk.yellow(
          "  Increase the monthly limit in aicib.config.yaml or wait until next month.\n"
        )
      );
      costTracker.close();
      process.exit(1);
    }

    // Budget proximity warnings (not hard stops — just heads-up)
    const dailyRatio = config.settings.cost_limit_daily > 0
      ? todayCost / config.settings.cost_limit_daily
      : 0;
    const monthlyRatio = config.settings.cost_limit_monthly > 0
      ? monthCost / config.settings.cost_limit_monthly
      : 0;

    if (dailyRatio >= 0.8) {
      console.log(
        costColor(todayCost, config.settings.cost_limit_daily)(
          `  Warning: ${formatPercent(todayCost, config.settings.cost_limit_daily)} of daily budget used (${formatUSD(todayCost, 2)} / $${config.settings.cost_limit_daily})`
        )
      );
    }
    if (monthlyRatio >= 0.8) {
      console.log(
        costColor(monthCost, config.settings.cost_limit_monthly)(
          `  Warning: ${formatPercent(monthCost, config.settings.cost_limit_monthly)} of monthly budget used (${formatUSD(monthCost, 2)} / $${config.settings.cost_limit_monthly})`
        )
      );
    }
    if (dailyRatio >= 0.8 || monthlyRatio >= 0.8) {
      console.log();
    }

    // Check for already-running background job
    const existingJob = costTracker.getActiveBackgroundJob(
      activeSession.sessionId
    );
    if (existingJob) {
      // Auto-heal: if DB says "running" but the process is dead, mark as failed
      const alive = existingJob.pid ? isProcessRunning(existingJob.pid) : false;
      if (!alive) {
        costTracker.updateBackgroundJob(existingJob.id, {
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: "Worker process crashed (auto-healed by brief)",
        });
        console.log(
          chalk.yellow(
            `  Stale job #${existingJob.id} auto-healed (worker had crashed).\n`
          )
        );
      } else {
        console.error(
          chalk.red("  Error: A background brief is already running.")
        );
        console.error(
          chalk.yellow(
            `  Job #${existingJob.id}: "${existingJob.directive.slice(0, 60)}..."`
          )
        );
        console.error(
          chalk.yellow(
            "  Wait for it to finish or run 'aicib stop' to cancel.\n"
          )
        );
        costTracker.close();
        process.exit(1);
      }
    }

    if (options.background) {
      // --- Background mode: spawn worker and return immediately ---
      const { jobId, pid } = startBackgroundBrief(
        directive,
        projectDir,
        config,
        activeSession.sdkSessionId,
        activeSession.sessionId,
        costTracker
      );

      console.log(chalk.green("  Brief sent. CEO is working on it.\n"));
      console.log(chalk.dim(`  Job #${jobId} | PID ${pid}`));
      console.log(
        chalk.dim("  Check progress: aicib status")
      );
      console.log(
        chalk.dim("  View full logs:  aicib logs\n")
      );
    } else {
      // --- Foreground mode: existing blocking behavior ---
      console.log(
        chalk.dim(`  Resuming session: ${activeSession.sdkSessionId}\n`)
      );

      const result = await sendBrief(
        activeSession.sdkSessionId,
        directive,
        projectDir,
        config,
        (msg) => {
          const formatted = formatMessageWithColor(msg);
          if (formatted) {
            console.log(`  ${formatted}`);
          }
        }
      );

      // Record costs
      recordRunCosts(
        result,
        costTracker,
        activeSession.sessionId,
        "ceo",
        config.agents.ceo?.model || "opus"
      );

      // Generate journal entry (best-effort, uses Haiku)
      await generateJournalEntry(
        activeSession.sdkSessionId,
        directive,
        result,
        projectDir,
        costTracker,
        activeSession.sessionId
      );

      console.log(
        chalk.dim(
          `\n  Cost: ${formatUSD(result.totalCostUsd)} | Turns: ${result.numTurns} | Duration: ${(result.durationMs / 1000).toFixed(1)}s\n`
        )
      );
    }
  } catch (error) {
    console.error(
      chalk.red(
        `\n  Error: ${error instanceof Error ? error.message : String(error)}\n`
      )
    );
    process.exit(1);
  } finally {
    costTracker.close();
  }
}
