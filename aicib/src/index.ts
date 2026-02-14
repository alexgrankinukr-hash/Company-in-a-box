#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "./cli/init.js";
import { startCommand } from "./cli/start.js";
import { briefCommand } from "./cli/brief.js";
import { statusCommand } from "./cli/status.js";
import { stopCommand } from "./cli/stop.js";
import { costCommand } from "./cli/cost.js";
import { logsCommand } from "./cli/logs.js";
import { addAgentCommand } from "./cli/add-agent.js";
import { removeAgentCommand } from "./cli/remove-agent.js";
import { configCommand } from "./cli/config.js";

const program = new Command();

program
  .name("aicib")
  .description(
    "AI Company-in-a-Box — spawn a hierarchical team of AI agents structured like a real company"
  )
  .version("0.1.0");

program
  .command("init")
  .description("Scaffold a new AI company")
  .option("-t, --template <template>", "Company template to use", "saas-startup")
  .option("-n, --name <name>", "Company name", "MyStartup")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(initCommand);

program
  .command("start")
  .description("Start all agents")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(startCommand);

program
  .command("brief <directive>")
  .description("Send a directive to the CEO")
  .option("-b, --background", "Run in background (returns immediately)")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(briefCommand);

program
  .command("status")
  .description("Show all agent statuses")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(statusCommand);

program
  .command("stop")
  .description("Gracefully stop all agents")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(stopCommand);

program
  .command("cost")
  .description("Show cost breakdown per agent")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .option("-s, --session <sessionId>", "Filter by session ID")
  .action(costCommand);

program
  .command("logs")
  .description("Show logs from background work")
  .option("--job <id>", "Show logs from a specific job ID")
  .option("--lines <n>", "Limit number of log lines")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(logsCommand);

program
  .command("add-agent")
  .description("Add an agent to a department")
  .requiredOption("-r, --role <role>", "Agent role name (e.g., data-scientist)")
  .requiredOption(
    "--department <department>",
    "Department to add to (cto, cfo, cmo)"
  )
  .option("-m, --model <model>", "Model to use", "sonnet")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(addAgentCommand);

program
  .command("remove-agent <role>")
  .description("Remove an agent")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(removeAgentCommand);

program
  .command("config")
  .description("Interactive configuration")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(configCommand);

program.parse();
