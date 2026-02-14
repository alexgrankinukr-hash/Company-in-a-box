import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import { loadConfig } from "../core/config.js";
import { loadAgentDefinitions } from "../core/agents.js";
import { getAgentsDir, createTeamState } from "../core/team.js";
import {
  startCEOSession,
  recordRunCosts,
  formatMessage,
} from "../core/agent-runner.js";

interface StartOptions {
  dir: string;
}

export async function startCommand(options: StartOptions): Promise<void> {
  const projectDir = path.resolve(options.dir);

  console.log(chalk.bold("\n  AI Company-in-a-Box — Starting team\n"));

  let config;
  try {
    config = loadConfig(projectDir);
  } catch (error) {
    console.error(
      chalk.red(
        `  Error: ${error instanceof Error ? error.message : String(error)}`
      )
    );
    console.error(chalk.yellow(`  Run 'aicib init' first.\n`));
    process.exit(1);
  }

  // Verify agent definitions exist
  const agentsDir = getAgentsDir(projectDir);
  const agents = loadAgentDefinitions(agentsDir);

  if (agents.size === 0) {
    console.error(
      chalk.red("  Error: No agent definitions found in .claude/agents/")
    );
    console.error(chalk.yellow("  Run 'aicib init' to create them.\n"));
    process.exit(1);
  }

  const spinner = ora("  Initializing team state...").start();

  try {
    const teamState = createTeamState(projectDir, config);

    // Check for existing active session (prevent double-start)
    const existingSession =
      teamState.costTracker.getActiveSDKSessionId();
    if (existingSession) {
      spinner.fail("  Team already running!");
      console.log(
        chalk.yellow(
          `\n  Active session: ${chalk.dim(existingSession.sdkSessionId)}`
        )
      );
      console.log(
        chalk.yellow(
          "  Use 'aicib brief' to send directives, or 'aicib stop' to end the session.\n"
        )
      );
      teamState.costTracker.close();
      return;
    }

    // Set initial statuses
    for (const [role] of agents) {
      teamState.costTracker.setAgentStatus(role, "starting");
    }

    spinner.text = "  Starting CEO session via SDK...";

    // Print team info
    spinner.succeed("  Team configuration ready!\n");

    console.log(chalk.bold("  Team: ") + config.company.name);
    console.log(chalk.bold("  Session: ") + teamState.sessionId);
    console.log(chalk.bold("  Agents:"));

    for (const [role, agent] of agents) {
      const agentConfig = config.agents[role];
      const model = agentConfig?.model || agent.frontmatter.model;
      console.log(
        `    ${chalk.green("→")} ${agent.frontmatter.title} (${role}) — ${model}`
      );
    }

    console.log(
      chalk.bold("\n  Cost limits: ") +
        `$${config.settings.cost_limit_daily}/day, $${config.settings.cost_limit_monthly}/month`
    );

    console.log(chalk.bold("\n  Launching CEO...\n"));

    // Start the CEO session using the Agent SDK
    const result = await startCEOSession(projectDir, config, (msg) => {
      const formatted = formatMessage(msg);
      if (formatted) {
        console.log(`  ${formatted}`);
      }
    });

    // Save the SDK session ID so `brief` can resume it later
    teamState.costTracker.saveSDKSessionId(
      teamState.sessionId,
      result.sessionId,
      projectDir,
      config.company.name
    );

    // Record costs
    recordRunCosts(
      result,
      teamState.costTracker,
      teamState.sessionId,
      "ceo",
      config.agents.ceo?.model || "opus"
    );

    // Update agent statuses
    for (const [role] of agents) {
      teamState.costTracker.setAgentStatus(role, "idle");
    }

    console.log(chalk.green("\n  Team is ready!"));
    console.log(
      chalk.dim(
        `  SDK Session: ${result.sessionId}`
      )
    );
    console.log(
      chalk.dim(
        `  Cost: $${result.totalCostUsd.toFixed(4)} | Turns: ${result.numTurns}`
      )
    );
    console.log(
      chalk.bold("\n  Use 'aicib brief \"your directive\"' to send directives.\n")
    );

    teamState.costTracker.close();
  } catch (error) {
    spinner.fail("  Failed to start team");
    console.error(
      chalk.red(
        `\n  Error: ${error instanceof Error ? error.message : String(error)}\n`
      )
    );
    process.exit(1);
  }
}
