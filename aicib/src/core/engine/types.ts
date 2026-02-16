/**
 * Engine-agnostic type aliases for AICIB.
 *
 * This is the ONLY engine file that imports directly from the SDK package.
 * The rest of the codebase imports these aliases from here (via ./engine/index.js).
 * If we swap engine backends later, only this file needs to change.
 */

import type {
  SDKMessage,
  SDKResultMessage,
  SDKSystemMessage,
  ModelUsage,
  AgentDefinition as SDKAgentDefinition,
} from "@anthropic-ai/claude-agent-sdk";

// --- Re-exported SDK types under AICIB-owned names ---

/** Any message streamed from the engine (assistant, system, result, etc.) */
export type EngineMessage = SDKMessage;

/** The final result message with cost/usage data. */
export type EngineResultMessage = SDKResultMessage;

/** System/init messages (session_id, model, etc.) */
export type EngineSystemMessage = SDKSystemMessage;

/** Per-model token and cost breakdown. */
export type EngineModelUsage = ModelUsage;

// --- AICIB-owned types (engine-agnostic) ---

/**
 * An agent definition with a flexible `model` field.
 *
 * The SDK's AgentDefinition restricts model to 'opus'|'sonnet'|'haiku'|'inherit'.
 * Our version accepts any string (validated by the model router).
 * The SDK adapter converts back to short names before passing to query().
 */
export interface EngineAgentDefinition {
  description: string;
  prompt: string;
  tools?: string[];
  disallowedTools?: string[];
  /** Any valid model name — short ("opus") or full ("claude-opus-4-6"). */
  model?: string;
  maxTurns?: number;
}

/**
 * Options accepted by our engine's startSession / resumeSession.
 */
export interface EngineQueryOptions {
  prompt: string;
  systemPrompt?: string | { type: "preset"; preset: "claude_code"; append?: string };
  model?: string;
  cwd?: string;
  tools?: string[] | { type: "preset"; preset: "claude_code" };
  agents?: Record<string, EngineAgentDefinition>;
  permissionMode?: "default" | "acceptEdits" | "bypassPermissions" | "plan" | "dontAsk";
  allowDangerouslySkipPermissions?: boolean;
  maxBudgetUsd?: number;
  maxTurns?: number;
}

// Re-export the raw SDK types for the adapter layer only
export type { SDKAgentDefinition };
