import chalk, { type ChalkInstance } from "chalk";
import type {
  SDKMessage,
  SDKResultMessage,
  SDKSystemMessage,
} from "@anthropic-ai/claude-agent-sdk";

/**
 * Deterministic color scheme per agent role.
 * CEO = magenta (unique, stands out)
 * Department heads = bold primary colors
 * Workers = lighter shade of their head's color
 */
const AGENT_COLORS: Record<string, ChalkInstance> = {
  ceo: chalk.magenta.bold,
  cto: chalk.blue.bold,
  cfo: chalk.green.bold,
  cmo: chalk.yellow.bold,
  "backend-engineer": chalk.cyan,
  "frontend-engineer": chalk.blueBright,
  "financial-analyst": chalk.greenBright,
  "content-writer": chalk.yellowBright,
  system: chalk.gray,
  subagent: chalk.white,
};

/**
 * Returns the chalk color function for a given agent role.
 * Falls back to white for unknown roles.
 */
export function getAgentColor(role: string): ChalkInstance {
  return AGENT_COLORS[role] || AGENT_COLORS.subagent;
}

/**
 * Returns a colored `[ROLE]` prefix tag for terminal display.
 */
export function formatAgentTag(role: string): string {
  const color = getAgentColor(role);
  return color(`[${role.toUpperCase()}]`);
}

/**
 * Determines the agent role from an SDK message.
 */
function getMessageRole(message: SDKMessage): string {
  if (message.type === "assistant") {
    return message.parent_tool_use_id ? "subagent" : "ceo";
  }
  if (message.type === "system") return "system";
  if (message.type === "result") return "system";
  return "system";
}

/**
 * Enhanced message formatter that applies color based on agent role.
 * Drop-in replacement for the plain-text formatMessage() from agent-runner.ts.
 */
export function formatMessageWithColor(
  message: SDKMessage,
  agentRole?: string
): string | null {
  if (message.type === "assistant") {
    const content = message.message?.content;
    if (!content) return null;

    const texts: string[] = [];
    for (const block of content) {
      if ("text" in block && block.text) {
        texts.push(block.text);
      } else if ("name" in block) {
        texts.push(`[Tool: ${(block as { name: string }).name}]`);
      }
    }
    if (texts.length > 0) {
      const role = agentRole || getMessageRole(message);
      const tag = formatAgentTag(role);
      return `${tag} ${texts.join("\n")}`;
    }
  }

  if (message.type === "system" && "subtype" in message) {
    const sysMsg = message as SDKSystemMessage;
    if (sysMsg.subtype === "init") {
      const tag = formatAgentTag("system");
      return `${tag} Session: ${sysMsg.session_id} | Model: ${sysMsg.model}`;
    }
  }

  if (message.type === "result") {
    const resultMsg = message as SDKResultMessage;
    const tag = formatAgentTag("system");
    return `${tag} Cost: $${resultMsg.total_cost_usd.toFixed(4)} | Turns: ${resultMsg.num_turns} | Duration: ${(resultMsg.duration_ms / 1000).toFixed(1)}s`;
  }

  return null;
}
