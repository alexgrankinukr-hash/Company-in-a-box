import fs from "node:fs";
import path from "node:path";

// --- Types ---

export type PersonaPreset = "professional" | "startup" | "technical" | "creative";

export interface PersonaOverlay {
  name: string;
  displayName: string;
  description: string;
  content: string;
}

export interface PersonaConfig {
  preset: PersonaPreset;
  overrides?: Record<string, PersonaPreset>;
}

export interface PersonaValidationResult {
  valid: boolean;
  errors: string[];
}

export const VALID_PRESETS: PersonaPreset[] = [
  "professional",
  "startup",
  "technical",
  "creative",
];

export const PRESET_DESCRIPTIONS: Record<PersonaPreset, string> = {
  professional: "Corporate, polished, thorough",
  startup: "Fast, informal, bold",
  technical: "Precise, data-driven, no fluff",
  creative: "Expressive, storytelling, metaphor-rich",
};

const REQUIRED_SECTIONS = [
  "# ",           // Any top-level heading (# Title)
  "## Your Role",
  "## Decision Authority",
  "## Working Style",
];

// --- Functions ---

/**
 * Loads a single preset .md file from the template's presets/ directory.
 * Uses the same YAML frontmatter parsing approach as parseAgentFile.
 */
export function loadPreset(
  templateDir: string,
  presetName: PersonaPreset
): PersonaOverlay {
  const presetsDir = path.join(templateDir, "presets");
  const filePath = path.join(presetsDir, `${presetName}.md`);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Preset "${presetName}" not found at ${filePath}. Available presets: ${VALID_PRESETS.join(", ")}`
    );
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    throw new Error(`Invalid preset file format: ${filePath}. Expected YAML frontmatter.`);
  }

  const frontmatterRaw = frontmatterMatch[1];
  const content = frontmatterMatch[2].trim();

  // Simple YAML parsing (same approach as agents.ts)
  const meta: Record<string, string> = {};
  for (const line of frontmatterRaw.split("\n")) {
    const kvMatch = line.trim().match(/^(\w[\w_]*)\s*:\s*(.+)$/);
    if (kvMatch) {
      meta[kvMatch[1]] = kvMatch[2].trim().replace(/^["']|["']$/g, "");
    }
  }

  return {
    name: meta.name || presetName,
    displayName: meta.display_name || presetName,
    description: meta.description || "",
    content,
  };
}

/**
 * Scans the presets/ directory for available preset files.
 * Returns a list of PersonaOverlay objects.
 */
export function listPresets(templateDir: string): PersonaOverlay[] {
  const presetsDir = path.join(templateDir, "presets");

  if (!fs.existsSync(presetsDir)) {
    return [];
  }

  const files = fs.readdirSync(presetsDir).filter((f) => f.endsWith(".md"));
  const presets: PersonaOverlay[] = [];

  for (const file of files) {
    const presetName = file.replace(".md", "") as PersonaPreset;
    try {
      presets.push(loadPreset(templateDir, presetName));
    } catch {
      // Skip invalid preset files
    }
  }

  return presets;
}

/**
 * Appends a preset's communication style and thinking modifiers
 * to an agent's markdown body. Composition, not replacement.
 */
export function applyPresetToContent(
  agentContent: string,
  preset: PersonaOverlay
): string {
  if (!preset.content) {
    return agentContent;
  }

  return `${agentContent}

## Communication Style (${preset.displayName} preset)

${preset.content}`;
}

/**
 * Validates that an agent persona file has all required sections.
 * Returns { valid, errors[] } — errors are warnings, not fatal.
 */
export function validateAgentPersona(content: string): PersonaValidationResult {
  const errors: string[] = [];

  for (const section of REQUIRED_SECTIONS) {
    if (section === "# ") {
      // Check for any top-level heading
      if (!content.match(/^# \S.*/m)) {
        errors.push("Missing top-level heading (# Title)");
      }
    } else {
      if (!content.includes(section)) {
        errors.push(`Missing required section: "${section}"`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
