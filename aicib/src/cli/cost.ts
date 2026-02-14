import path from "node:path";
import chalk from "chalk";
import { loadConfig } from "../core/config.js";
import { CostTracker } from "../core/cost-tracker.js";

interface CostOptions {
  dir: string;
  session?: string;
}

export async function costCommand(options: CostOptions): Promise<void> {
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

  console.log(chalk.bold("\n  AI Company-in-a-Box — Cost Report\n"));

  try {
    const costTracker = new CostTracker(projectDir);

    const costs = costTracker.getCostByAgent(options.session);
    const todayCost = costTracker.getTotalCostToday();
    const monthCost = costTracker.getTotalCostThisMonth();

    if (costs.length === 0) {
      console.log(chalk.yellow("  No cost data recorded yet.\n"));
      costTracker.close();
      return;
    }

    // Per-agent breakdown
    console.log(chalk.bold("  Cost by Agent:"));
    console.log(
      `    ${"Agent".padEnd(22)} ${"Input Tokens".padEnd(14)} ${"Output Tokens".padEnd(14)} ${"Cost (USD)".padEnd(12)} Calls`
    );
    console.log(`    ${"─".repeat(70)}`);

    let totalCost = 0;
    let totalInput = 0;
    let totalOutput = 0;

    for (const entry of costs) {
      console.log(
        `    ${entry.role.padEnd(22)} ${String(entry.total_input_tokens).padEnd(14)} ${String(entry.total_output_tokens).padEnd(14)} $${entry.total_cost_usd.toFixed(4).padEnd(11)} ${entry.entry_count}`
      );
      totalCost += entry.total_cost_usd;
      totalInput += entry.total_input_tokens;
      totalOutput += entry.total_output_tokens;
    }

    console.log(`    ${"─".repeat(70)}`);
    console.log(
      `    ${"Total".padEnd(22)} ${String(totalInput).padEnd(14)} ${String(totalOutput).padEnd(14)} $${totalCost.toFixed(4)}`
    );

    // Limits
    console.log(chalk.bold("\n  Spending Limits:"));
    const dailyPct = config.settings.cost_limit_daily > 0
      ? ((todayCost / config.settings.cost_limit_daily) * 100).toFixed(1)
      : "N/A";
    const monthlyPct = config.settings.cost_limit_monthly > 0
      ? ((monthCost / config.settings.cost_limit_monthly) * 100).toFixed(1)
      : "N/A";

    const dailyColor =
      todayCost > config.settings.cost_limit_daily * 0.8
        ? chalk.red
        : todayCost > config.settings.cost_limit_daily * 0.5
          ? chalk.yellow
          : chalk.green;

    const monthlyColor =
      monthCost > config.settings.cost_limit_monthly * 0.8
        ? chalk.red
        : monthCost > config.settings.cost_limit_monthly * 0.5
          ? chalk.yellow
          : chalk.green;

    console.log(
      `    Today:  ${dailyColor(`$${todayCost.toFixed(2)}`)} / $${config.settings.cost_limit_daily} (${dailyPct}%)`
    );
    console.log(
      `    Month:  ${monthlyColor(`$${monthCost.toFixed(2)}`)} / $${config.settings.cost_limit_monthly} (${monthlyPct}%)\n`
    );

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
