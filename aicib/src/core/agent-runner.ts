import { query } from "@anthropic-ai/claude-agent-sdk";
import type {
  SDKMessage,
  SDKResultMessage,
  SDKSystemMessage,
  AgentDefinition as SDKAgentDefinition,
} from "@anthropic-ai/claude-agent-sdk";
import { loadAgentDefinitions, getTemplatePath } from "./agents.js";
import { getAgentsDir } from "./team.js";
import { CostTracker } from "./cost-tracker.js";
import type { AicibConfig } from "./config.js";
import type { PersonaOverlay } from "./persona.js";
import { loadPreset } from "./persona.js";

// Tools from soul.md that don't exist in the SDK — filter these out
const EXCLUDED_TOOLS = new Set(["SendMessage", "TeamCreate"]);

/**
 * Loads the persona preset and per-agent overrides from config.
 * Returns { preset, overrides } ready to pass to loadAgentDefinitions.
 */
function loadPersonaFromConfig(
  config: AicibConfig
): { preset?: PersonaOverlay; overrides?: Map<string, PersonaOverlay> } {
  const presetName = config.persona?.preset || "professional";
  const templateDir = getTemplatePath(config.company.template);

  let preset: PersonaOverlay | undefined;
  try {
    preset = loadPreset(templateDir, presetName);
  } catch {
    // Preset file missing or invalid — warn but don't block execution.
    // This keeps backward compatibility with old templates that lack presets.
    if (presetName !== "professional") {
      // Only warn if user explicitly chose a non-default preset
      console.warn(
        `  Warning: Persona preset "${presetName}" could not be loaded. Agents will run without personality overlay.`
      );
    }
  }

  let overrides: Map<string, PersonaOverlay> | undefined;
  if (config.persona?.overrides) {
    overrides = new Map();
    for (const [role, overridePresetName] of Object.entries(config.persona.overrides)) {
      try {
        overrides.set(role, loadPreset(templateDir, overridePresetName));
      } catch {
        console.warn(
          `  Warning: Persona override for "${role}" ("${overridePresetName}") could not be loaded. Skipping.`
        );
      }
    }
  }

  return { preset, overrides };
}

export interface SessionResult {
  sessionId: string;
  totalCostUsd: number;
  inputTokens: number;
  outputTokens: number;
  numTurns: number;
  durationMs: number;
}

/**
 * Reads all soul.md files, filters to C-suite only (reports_to === "ceo"),
 * and converts each into SDK's AgentDefinition format.
 */
export function buildSubagentMap(
  projectDir: string,
  config: AicibConfig,
  preloaded?: { preset?: PersonaOverlay; overrides?: Map<string, PersonaOverlay> }
): Record<string, SDKAgentDefinition> {
  const agentsDir = getAgentsDir(projectDir);
  const { preset, overrides } = preloaded || loadPersonaFromConfig(config);
  const agents = loadAgentDefinitions(agentsDir, preset, overrides);
  const subagents: Record<string, SDKAgentDefinition> = {};

  for (const [role, agent] of agents) {
    // Only include C-suite (reports_to === "ceo"), skip CEO itself and workers
    if (agent.frontmatter.reports_to !== "ceo") continue;

    // Check if this agent is enabled in config
    const agentConfig = config.agents[role];
    if (agentConfig && agentConfig.enabled === false) continue;

    // Filter out tools that don't exist in the SDK
    const tools = (agent.frontmatter.tools || []).filter(
      (t) => !EXCLUDED_TOOLS.has(t)
    );

    // Model from config overrides soul.md default
    const model = (agentConfig?.model || agent.frontmatter.model) as
      | "opus"
      | "sonnet"
      | "haiku";

    subagents[role] = {
      description: `${agent.frontmatter.title} — head of ${agent.frontmatter.department} department. ${agent.frontmatter.spawns?.length ? `Manages: ${agent.frontmatter.spawns.join(", ")}` : ""}`,
      prompt: agent.content,
      tools,
      model,
    };
  }

  return subagents;
}

/**
 * Creates a new CEO session with subagents. Streams messages via onMessage.
 * Returns session ID, cost, and usage data.
 */
export async function startCEOSession(
  projectDir: string,
  config: AicibConfig,
  onMessage?: (msg: SDKMessage) => void
): Promise<SessionResult> {
  const agentsDir = getAgentsDir(projectDir);
  const personaData = loadPersonaFromConfig(config);
  const agents = loadAgentDefinitions(agentsDir, personaData.preset, personaData.overrides);
  const ceoAgent = agents.get("ceo");

  if (!ceoAgent) {
    throw new Error("CEO agent definition not found. Run 'aicib init' first.");
  }

  const subagents = buildSubagentMap(projectDir, config, personaData);
  const ceoModel = config.agents.ceo?.model || ceoAgent.frontmatter.model;

  // Build the team description for the CEO's system prompt
  const teamDescription = Object.entries(subagents)
    .map(([role, def]) => `- **${role}**: ${def.description}`)
    .join("\n");

  const ceoAppendPrompt = `${ceoAgent.content}

## Your Team (Available via Task tool)

You have the following department heads. Delegate work to them using the Task tool:
${teamDescription}

## Company: ${config.company.name}
## Cost Limits: $${config.settings.cost_limit_daily}/day, $${config.settings.cost_limit_monthly}/month

IMPORTANT: You MUST delegate work to your department heads using the Task tool. Do NOT do implementation work (writing code, creating files, etc.) directly. Your job is to coordinate, plan, and delegate.`;

  const startPrompt = `You are the CEO of ${config.company.name}. Your team is now active.

Briefly introduce yourself, confirm your team structure (list each department head and what they handle), and state that you are ready for directives from the human founder.

Keep it concise — 3-5 sentences max.`;

  let sessionId = "";
  let result: SessionResult = {
    sessionId: "",
    totalCostUsd: 0,
    inputTokens: 0,
    outputTokens: 0,
    numTurns: 0,
    durationMs: 0,
  };

  const queryStream = query({
    prompt: startPrompt,
    options: {
      systemPrompt: {
        type: "preset",
        preset: "claude_code",
        append: ceoAppendPrompt,
      },
      model: ceoModel,
      cwd: projectDir,
      tools: { type: "preset", preset: "claude_code" },
      agents: subagents,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      maxBudgetUsd: config.settings.cost_limit_daily,
    },
  });

  for await (const message of queryStream) {
    // Capture session ID from system init message
    if (message.type === "system" && "subtype" in message) {
      const sysMsg = message as SDKSystemMessage;
      if (sysMsg.subtype === "init") {
        sessionId = sysMsg.session_id;
      }
    }

    if (onMessage) {
      onMessage(message);
    }

    // Capture result data from the final message
    if (message.type === "result") {
      const resultMsg = message as SDKResultMessage;
      result = {
        sessionId: sessionId || resultMsg.session_id,
        totalCostUsd: resultMsg.total_cost_usd,
        inputTokens: resultMsg.usage.input_tokens,
        outputTokens: resultMsg.usage.output_tokens,
        numTurns: resultMsg.num_turns,
        durationMs: resultMsg.duration_ms,
      };
    }
  }

  return result;
}

/**
 * Resumes an existing CEO session and sends a brief/directive.
 */
export async function sendBrief(
  sdkSessionId: string,
  directive: string,
  projectDir: string,
  config: AicibConfig,
  onMessage?: (msg: SDKMessage) => void
): Promise<SessionResult> {
  const agentsDir = getAgentsDir(projectDir);
  const personaData = loadPersonaFromConfig(config);
  const agents = loadAgentDefinitions(agentsDir, personaData.preset, personaData.overrides);
  const ceoAgent = agents.get("ceo");

  if (!ceoAgent) {
    throw new Error("CEO agent definition not found.");
  }

  const subagents = buildSubagentMap(projectDir, config, personaData);
  const ceoModel = config.agents.ceo?.model || ceoAgent.frontmatter.model;

  const briefPrompt = `DIRECTIVE FROM HUMAN FOUNDER:

${directive}

---
Process this directive according to your CEO role. Decompose into department-level objectives and delegate to your team using the Task tool. Report back with your plan before executing.`;

  let sessionId = sdkSessionId;
  let result: SessionResult = {
    sessionId: sdkSessionId,
    totalCostUsd: 0,
    inputTokens: 0,
    outputTokens: 0,
    numTurns: 0,
    durationMs: 0,
  };

  const queryStream = query({
    prompt: briefPrompt,
    options: {
      resume: sdkSessionId,
      model: ceoModel,
      cwd: projectDir,
      tools: { type: "preset", preset: "claude_code" },
      agents: subagents,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      maxBudgetUsd: config.settings.cost_limit_daily,
    },
  });

  for await (const message of queryStream) {
    if (
      message.type === "system" &&
      "subtype" in message &&
      (message as SDKSystemMessage).subtype === "init"
    ) {
      sessionId = message.session_id;
    }

    if (onMessage) {
      onMessage(message);
    }

    if (message.type === "result") {
      const resultMsg = message as SDKResultMessage;
      result = {
        sessionId: sessionId || resultMsg.session_id,
        totalCostUsd: resultMsg.total_cost_usd,
        inputTokens: resultMsg.usage.input_tokens,
        outputTokens: resultMsg.usage.output_tokens,
        numTurns: resultMsg.num_turns,
        durationMs: resultMsg.duration_ms,
      };
    }
  }

  return result;
}

/**
 * Records run costs from a SessionResult into the cost tracker database.
 */
export function recordRunCosts(
  result: SessionResult,
  costTracker: CostTracker,
  sessionId: string,
  agentRole: string = "ceo",
  model: string = "opus"
): void {
  costTracker.recordCost(
    agentRole,
    sessionId,
    model,
    result.inputTokens,
    result.outputTokens
  );
}

/**
 * Formats an SDK message for terminal display. Returns null for messages
 * that shouldn't be displayed (tool progress, replays, etc.)
 */
export function formatMessage(message: SDKMessage): string | null {
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
      const prefix = message.parent_tool_use_id ? "[SUBAGENT]" : "[CEO]";
      return `${prefix} ${texts.join("\n")}`;
    }
  }

  if (message.type === "system" && "subtype" in message) {
    const sysMsg = message as SDKSystemMessage;
    if (sysMsg.subtype === "init") {
      return `[SYSTEM] Session: ${sysMsg.session_id} | Model: ${sysMsg.model}`;
    }
  }

  if (message.type === "result") {
    const resultMsg = message as SDKResultMessage;
    return `[RESULT] Cost: $${resultMsg.total_cost_usd.toFixed(4)} | Turns: ${resultMsg.num_turns} | Duration: ${(resultMsg.duration_ms / 1000).toFixed(1)}s`;
  }

  return null;
}
