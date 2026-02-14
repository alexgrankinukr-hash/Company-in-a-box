import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import type { PersonaPreset, PersonaConfig } from "./persona.js";
import { VALID_PRESETS } from "./persona.js";

export type ModelName = "opus" | "sonnet" | "haiku";
export type EscalationThreshold = "low" | "medium" | "high";
export type { PersonaConfig } from "./persona.js";

export interface WorkerConfig {
  model: ModelName;
  enabled?: boolean;
}

export interface AgentConfig {
  enabled: boolean;
  model: ModelName;
  check_in_interval?: string;
  workers?: Array<Record<string, WorkerConfig>>;
}

export interface CompanyConfig {
  name: string;
  template: string;
}

export interface SettingsConfig {
  cost_limit_daily: number;
  cost_limit_monthly: number;
  escalation_threshold: EscalationThreshold;
  auto_start_workers: boolean;
}

export interface AicibConfig {
  company: CompanyConfig;
  agents: Record<string, AgentConfig>;
  settings: SettingsConfig;
  persona?: PersonaConfig;
}

const DEFAULT_SETTINGS: SettingsConfig = {
  cost_limit_daily: 50,
  cost_limit_monthly: 500,
  escalation_threshold: "high",
  auto_start_workers: true,
};

const VALID_MODELS: ModelName[] = ["opus", "sonnet", "haiku"];
const VALID_THRESHOLDS: EscalationThreshold[] = ["low", "medium", "high"];

export function getConfigPath(projectDir: string): string {
  return path.join(projectDir, "aicib.config.yaml");
}

export function configExists(projectDir: string): boolean {
  return fs.existsSync(getConfigPath(projectDir));
}

export function loadConfig(projectDir: string): AicibConfig {
  const configPath = getConfigPath(projectDir);

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Config file not found at ${configPath}. Run 'aicib init' first.`
    );
  }

  const raw = fs.readFileSync(configPath, "utf-8");
  const parsed = yaml.load(raw) as Record<string, unknown>;

  return validateConfig(parsed);
}

export function saveConfig(projectDir: string, config: AicibConfig): void {
  const configPath = getConfigPath(projectDir);
  const yamlStr = yaml.dump(config, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });
  fs.writeFileSync(configPath, yamlStr, "utf-8");
}

export function validateConfig(raw: Record<string, unknown>): AicibConfig {
  const errors: string[] = [];

  // Validate company
  if (!raw.company || typeof raw.company !== "object") {
    errors.push("Missing 'company' section");
  } else {
    const company = raw.company as Record<string, unknown>;
    if (!company.name || typeof company.name !== "string") {
      errors.push("company.name must be a non-empty string");
    }
    if (!company.template || typeof company.template !== "string") {
      errors.push("company.template must be a non-empty string");
    }
  }

  // Validate agents
  if (!raw.agents || typeof raw.agents !== "object") {
    errors.push("Missing 'agents' section");
  } else {
    const agents = raw.agents as Record<string, unknown>;
    for (const [name, agentRaw] of Object.entries(agents)) {
      if (!agentRaw || typeof agentRaw !== "object") {
        errors.push(`agents.${name} must be an object`);
        continue;
      }
      const agent = agentRaw as Record<string, unknown>;

      if (
        agent.model &&
        !VALID_MODELS.includes(agent.model as ModelName)
      ) {
        errors.push(
          `agents.${name}.model must be one of: ${VALID_MODELS.join(", ")}`
        );
      }

      if (agent.workers && Array.isArray(agent.workers)) {
        for (const workerEntry of agent.workers) {
          if (typeof workerEntry === "object" && workerEntry !== null) {
            for (const [workerName, workerRaw] of Object.entries(
              workerEntry as Record<string, unknown>
            )) {
              if (workerRaw && typeof workerRaw === "object") {
                const worker = workerRaw as Record<string, unknown>;
                if (
                  worker.model &&
                  !VALID_MODELS.includes(worker.model as ModelName)
                ) {
                  errors.push(
                    `agents.${name}.workers.${workerName}.model must be one of: ${VALID_MODELS.join(", ")}`
                  );
                }
              }
            }
          }
        }
      }
    }
  }

  // Validate settings
  if (raw.settings && typeof raw.settings === "object") {
    const settings = raw.settings as Record<string, unknown>;
    if (
      settings.escalation_threshold &&
      !VALID_THRESHOLDS.includes(
        settings.escalation_threshold as EscalationThreshold
      )
    ) {
      errors.push(
        `settings.escalation_threshold must be one of: ${VALID_THRESHOLDS.join(", ")}`
      );
    }
    if (
      settings.cost_limit_daily !== undefined &&
      (typeof settings.cost_limit_daily !== "number" ||
        settings.cost_limit_daily < 0)
    ) {
      errors.push("settings.cost_limit_daily must be a non-negative number");
    }
    if (
      settings.cost_limit_monthly !== undefined &&
      (typeof settings.cost_limit_monthly !== "number" ||
        settings.cost_limit_monthly < 0)
    ) {
      errors.push("settings.cost_limit_monthly must be a non-negative number");
    }
  }

  // Validate persona (optional section)
  if (raw.persona && typeof raw.persona === "object") {
    const persona = raw.persona as Record<string, unknown>;
    if (
      persona.preset &&
      !VALID_PRESETS.includes(persona.preset as PersonaPreset)
    ) {
      errors.push(
        `persona.preset must be one of: ${VALID_PRESETS.join(", ")}`
      );
    }
    if (persona.overrides && typeof persona.overrides === "object") {
      for (const [agentRole, presetVal] of Object.entries(
        persona.overrides as Record<string, unknown>
      )) {
        if (!VALID_PRESETS.includes(presetVal as PersonaPreset)) {
          errors.push(
            `persona.overrides.${agentRole} must be one of: ${VALID_PRESETS.join(", ")}`
          );
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Config validation failed:\n  - ${errors.join("\n  - ")}`);
  }

  // Build validated config with defaults
  const company = raw.company as Record<string, unknown>;
  const settings = (raw.settings as Record<string, unknown>) || {};

  // Build persona config with default
  const rawPersona = (raw.persona as Record<string, unknown>) || {};
  const personaConfig: PersonaConfig = {
    preset: (rawPersona.preset as PersonaPreset) || "professional",
    ...(rawPersona.overrides
      ? { overrides: rawPersona.overrides as Record<string, PersonaPreset> }
      : {}),
  };

  return {
    company: {
      name: company.name as string,
      template: company.template as string,
    },
    agents: raw.agents as Record<string, AgentConfig>,
    settings: {
      cost_limit_daily:
        (settings.cost_limit_daily as number) ?? DEFAULT_SETTINGS.cost_limit_daily,
      cost_limit_monthly:
        (settings.cost_limit_monthly as number) ??
        DEFAULT_SETTINGS.cost_limit_monthly,
      escalation_threshold:
        (settings.escalation_threshold as EscalationThreshold) ??
        DEFAULT_SETTINGS.escalation_threshold,
      auto_start_workers:
        (settings.auto_start_workers as boolean) ??
        DEFAULT_SETTINGS.auto_start_workers,
    },
    persona: personaConfig,
  };
}

export function getAgentModel(
  config: AicibConfig,
  agentRole: string
): ModelName {
  // Check top-level agents
  if (config.agents[agentRole]) {
    return config.agents[agentRole].model;
  }

  // Check workers
  for (const agent of Object.values(config.agents)) {
    if (agent.workers) {
      for (const workerEntry of agent.workers) {
        for (const [workerName, workerConfig] of Object.entries(workerEntry)) {
          if (workerName === agentRole) {
            return workerConfig.model;
          }
        }
      }
    }
  }

  return "sonnet"; // default fallback
}

export function listAllAgents(
  config: AicibConfig
): Array<{ role: string; model: ModelName; department: string; enabled: boolean }> {
  const agents: Array<{
    role: string;
    model: ModelName;
    department: string;
    enabled: boolean;
  }> = [];

  for (const [role, agentConfig] of Object.entries(config.agents)) {
    agents.push({
      role,
      model: agentConfig.model,
      department: role,
      enabled: agentConfig.enabled ?? true,
    });

    if (agentConfig.workers) {
      for (const workerEntry of agentConfig.workers) {
        for (const [workerName, workerConfig] of Object.entries(workerEntry)) {
          agents.push({
            role: workerName,
            model: workerConfig.model,
            department: role,
            enabled: workerConfig.enabled ?? true,
          });
        }
      }
    }
  }

  return agents;
}
