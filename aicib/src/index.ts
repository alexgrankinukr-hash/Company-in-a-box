#!/usr/bin/env node

// Side-effect imports: register config extensions + database tables
// before any config loading or CostTracker construction.
import "./integrations/slack/register.js";
import "./core/task-register.js";
import "./core/intelligence-register.js";
import "./core/hr-register.js";

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
import { journalCommand } from "./cli/journal.js";
import { slackConnectCommand, slackDisconnectCommand, slackStatusCommand } from "./cli/slack.js";
import {
  tasksCommand,
  tasksListCommand,
  tasksCreateCommand,
  tasksShowCommand,
  tasksUpdateCommand,
  tasksReviewCommand,
} from "./cli/tasks.js";
import {
  hrCommand,
  hrListCommand,
  hrOnboardCommand,
  hrAdvanceCommand,
  hrReviewCommand,
  hrReviewsCommand,
  hrPromoteCommand,
  hrDemoteCommand,
  hrImproveCommand,
  hrStateCommand,
  hrHistoryCommand,
} from "./cli/hr.js";

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
  .option("--history", "Show daily cost history for the last 7 days")
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
  .command("journal")
  .description("View CEO session history and journal entries")
  .option("--search <keyword>", "Search entries by keyword")
  .option("--limit <n>", "Number of entries to show (default: 10)")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(journalCommand);

program
  .command("config")
  .description("Interactive configuration")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(configCommand);

// --- Slack integration ---
const slack = program.command("slack").description("Manage Slack integration");
slack
  .command("connect")
  .description("Connect your AI company to Slack")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(slackConnectCommand);
slack
  .command("disconnect")
  .description("Disconnect Slack integration")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(slackDisconnectCommand);
slack
  .command("status")
  .description("Show Slack connection status")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(slackStatusCommand);

// --- Task management ---
const tasks = program.command("tasks").description("Manage company tasks and projects");
tasks
  .command("list")
  .description("List all tasks with optional filters")
  .option("--status <status>", "Filter by status (backlog,todo,in_progress,in_review,done,cancelled)")
  .option("--department <dept>", "Filter by department")
  .option("--assigned <agent>", "Filter by assigned agent")
  .option("--priority <priority>", "Filter by priority (critical,high,medium,low)")
  .option("--overdue", "Show only overdue tasks")
  .option("--blocked", "Show only blocked tasks")
  .option("--limit <n>", "Max tasks to show", "50")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(tasksListCommand);
tasks
  .command("create")
  .description("Create a new task")
  .option("--title <title>", "Task title")
  .option("--description <desc>", "Task description")
  .option("--department <dept>", "Department (engineering, finance, marketing)")
  .option("--assign <agent>", "Assign to an agent")
  .option("--priority <priority>", "Priority (critical, high, medium, low)", "medium")
  .option("--parent <id>", "Parent task ID (for subtasks)")
  .option("--deadline <datetime>", "Deadline (ISO 8601)")
  .option("-i, --interactive", "Interactive creation with prompts")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(tasksCreateCommand);
tasks
  .command("show <id>")
  .description("Show full task details")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(tasksShowCommand);
tasks
  .command("update <id>")
  .description("Update a task")
  .option("--status <status>", "New status")
  .option("--assign <agent>", "Reassign to agent")
  .option("--priority <priority>", "Change priority")
  .option("--comment <text>", "Add a comment")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(tasksUpdateCommand);
tasks
  .command("review")
  .description("Review tasks awaiting approval")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(tasksReviewCommand);
// Default action: show dashboard when bare `aicib tasks` is run
tasks
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(tasksCommand);

// --- HR management ---
const hr = program.command("hr").description("HR system: onboarding, reviews, improvement plans");
hr.command("list")
  .description("List HR events")
  .option("--type <type>", "Filter by event type")
  .option("--agent <agent>", "Filter by agent role")
  .option("--limit <n>", "Max events to show", "50")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(hrListCommand);
hr.command("onboard <role>")
  .description("Start or view onboarding for an agent")
  .option("--speed <speed>", "Ramp speed (instant, standard, extended)")
  .option("--mentor <mentor>", "Mentor agent role")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(hrOnboardCommand);
hr.command("advance <role>")
  .description("Advance agent to next onboarding phase")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(hrAdvanceCommand);
hr.command("review <role>")
  .description("Create a performance review")
  .option("--task <score>", "Task completion score (0-100)")
  .option("--quality <score>", "Quality score (0-100)")
  .option("--efficiency <score>", "Efficiency score (0-100)")
  .option("--collaboration <score>", "Collaboration score (0-100)")
  .option("--summary <text>", "Review summary")
  .option("--rec <recommendation>", "Recommendation (maintain, promote, demote, improve, terminate)")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(hrReviewCommand);
hr.command("reviews [role]")
  .description("List performance reviews for an agent")
  .option("--limit <n>", "Max reviews to show", "10")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(hrReviewsCommand);
hr.command("promote <role>")
  .description("Record agent promotion")
  .requiredOption("--to <level>", "Target autonomy level")
  .option("--from <level>", "Current autonomy level (auto-resolved if omitted)")
  .option("--reason <text>", "Reason for promotion")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(hrPromoteCommand);
hr.command("demote <role>")
  .description("Record agent demotion")
  .requiredOption("--to <level>", "Target autonomy level")
  .option("--from <level>", "Current autonomy level (auto-resolved if omitted)")
  .option("--reason <text>", "Reason for demotion")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(hrDemoteCommand);
hr.command("improve <role>")
  .description("Create or manage improvement plan")
  .option("--goals <goals>", "Semicolon-separated goals")
  .option("--deadline <date>", "Deadline (ISO 8601)")
  .option("--resolve <planId>", "Resolve an existing plan by ID")
  .option("--outcome <outcome>", "Plan outcome (return_to_normal, reassign, reconfigure, terminate)")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(hrImproveCommand);
hr.command("state <role>")
  .description("View or change agent HR state")
  .option("--set <state>", "New state (active, idle, paused, hibernated, stopped, archived)")
  .option("--reason <text>", "Reason for state change")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(hrStateCommand);
hr.command("history <role>")
  .description("Full event history for an agent")
  .option("--limit <n>", "Max events to show", "25")
  .option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(hrHistoryCommand);
// Default action: show dashboard when bare `aicib hr` is run
hr.option("-d, --dir <dir>", "Project directory", process.cwd())
  .action(hrCommand);

program.parse();
