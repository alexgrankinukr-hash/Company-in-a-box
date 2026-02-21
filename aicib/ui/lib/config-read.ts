import fs from "node:fs";
import path from "node:path";
import { getProjectDir } from "@/lib/config";

export interface CompanyConfig {
  name: string;
  template: string;
}

export interface AppSettingsConfig {
  costLimitDaily: number;
  costLimitMonthly: number;
}

export interface AgentConfig {
  role: string;
  model: string;
  department: string;
  enabled: boolean;
  displayName?: string;
}

export interface AppConfigSnapshot {
  company: CompanyConfig;
  settings: AppSettingsConfig;
  agents: AgentConfig[];
  projectDir: string;
  exists: boolean;
  raw: string;
}

function stripQuotes(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function extractBlock(raw: string, key: string, indent = 2): string {
  const spaces = " ".repeat(indent);
  const pattern = new RegExp(
    `^${key}:\\s*\\n((?:${spaces}.*\\n?)*)`,
    "m"
  );
  return raw.match(pattern)?.[1] ?? "";
}

function parseCompany(raw: string): CompanyConfig {
  const companyBlock = extractBlock(raw, "company", 2);

  const blockName = companyBlock.match(/^\s*name:\s*(.+)$/m)?.[1];
  const blockTemplate = companyBlock.match(/^\s*template:\s*(.+)$/m)?.[1];

  const topLevelName = raw.match(/^name:\s*(.+)$/m)?.[1];
  const topLevelTemplate = raw.match(/^template:\s*(.+)$/m)?.[1];

  return {
    name: stripQuotes(blockName || topLevelName || "AICIB"),
    template: stripQuotes(blockTemplate || topLevelTemplate || "saas-startup"),
  };
}

function parseSettings(raw: string): AppSettingsConfig {
  const daily = raw.match(/cost_limit_daily:\s*(\d+\.?\d*)/)?.[1];
  const monthly = raw.match(/cost_limit_monthly:\s*(\d+\.?\d*)/)?.[1];

  return {
    costLimitDaily: daily ? Number.parseFloat(daily) : 50,
    costLimitMonthly: monthly ? Number.parseFloat(monthly) : 500,
  };
}

function parsePersonaDisplayNames(raw: string): Map<string, string> {
  const map = new Map<string, string>();
  const personaBlock = extractBlock(raw, "persona", 2);
  if (!personaBlock) return map;

  const agentsBlock = personaBlock.match(/\s{2}agents:\s*\n((?:\s{4}.*\n?)*)/m)?.[1] ?? "";
  if (!agentsBlock) return map;

  const roleMatches = agentsBlock.matchAll(
    /^\s{4}([a-zA-Z0-9_-]+):\s*\n((?:\s{6}.*\n?)*)/gm
  );

  for (const roleMatch of roleMatches) {
    const role = roleMatch[1];
    const roleBlock = roleMatch[2] ?? "";
    const display = roleBlock.match(/\s{6}display_name:\s*(.+)$/m)?.[1];
    if (display) {
      map.set(role, stripQuotes(display));
    }
  }

  return map;
}

function parseAgents(raw: string): AgentConfig[] {
  const agentsBlock = extractBlock(raw, "agents", 2);
  if (!agentsBlock) return [];

  const personaNames = parsePersonaDisplayNames(raw);
  const agents: AgentConfig[] = [];

  const execMatches = agentsBlock.matchAll(
    /^\s{2}([a-zA-Z0-9_-]+):\s*\n((?:\s{4}.*\n?)*)/gm
  );

  for (const execMatch of execMatches) {
    const role = execMatch[1];
    const block = execMatch[2] || "";

    const model = stripQuotes(block.match(/^\s{4}model:\s*(.+)$/m)?.[1] || "sonnet");
    const enabledText = block.match(/^\s{4}enabled:\s*(true|false)$/m)?.[1];
    const enabled = enabledText ? enabledText === "true" : true;

    agents.push({
      role,
      model,
      enabled,
      department: role,
      displayName: personaNames.get(role),
    });

    const workersBlock = block.match(/^\s{4}workers:\s*\n((?:\s{6}.*\n?)*)/m)?.[1] ?? "";
    if (!workersBlock) continue;

    const workerMatches = workersBlock.matchAll(
      /^\s{6}-\s+([a-zA-Z0-9_-]+):\s*\n((?:\s{8}.*\n?)*)/gm
    );

    for (const workerMatch of workerMatches) {
      const workerRole = workerMatch[1];
      const workerBlock = workerMatch[2] || "";
      const workerModel = stripQuotes(
        workerBlock.match(/^\s{8}model:\s*(.+)$/m)?.[1] || "sonnet"
      );

      agents.push({
        role: workerRole,
        model: workerModel,
        enabled: true,
        department: role,
        displayName: personaNames.get(workerRole),
      });
    }
  }

  return agents;
}

export function readAppConfig(): AppConfigSnapshot {
  const projectDir = getProjectDir();
  const configPath = path.join(projectDir, "aicib.config.yaml");

  if (!fs.existsSync(configPath)) {
    return {
      company: { name: "AICIB", template: "saas-startup" },
      settings: { costLimitDaily: 50, costLimitMonthly: 500 },
      agents: [],
      projectDir,
      exists: false,
      raw: "",
    };
  }

  const raw = fs.readFileSync(configPath, "utf-8");

  return {
    company: parseCompany(raw),
    settings: parseSettings(raw),
    agents: parseAgents(raw),
    projectDir,
    exists: true,
    raw,
  };
}
