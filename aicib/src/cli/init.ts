import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import {
  configExists,
  getConfigPath,
  type AicibConfig,
} from "../core/config.js";
import {
  getTemplatePath,
  listTemplates,
} from "../core/agents.js";
import { installAgentDefinitions } from "../core/team.js";
import {
  VALID_PRESETS,
  PRESET_DESCRIPTIONS,
  validateAgentPersona,
  type PersonaPreset,
} from "../core/persona.js";

interface InitOptions {
  template: string;
  name: string;
  dir: string;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const { template, name, dir } = options;
  const projectDir = path.resolve(dir);

  console.log(
    chalk.bold(`\n  AI Company-in-a-Box\n`)
  );
  console.log(`  Initializing "${name}" with template: ${template}\n`);

  // Check if already initialized
  if (configExists(projectDir)) {
    console.log(
      chalk.yellow(
        `  Warning: aicib.config.yaml already exists in ${projectDir}`
      )
    );
    console.log(
      chalk.yellow(`  Use 'aicib config' to modify settings.\n`)
    );
    return;
  }

  // Check template exists
  const available = listTemplates();
  if (!available.includes(template)) {
    console.log(
      chalk.red(
        `  Error: Template "${template}" not found. Available: ${available.join(", ")}`
      )
    );
    return;
  }

  // Ask for personality preset
  const { selectedPreset } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedPreset",
      message: "What personality style should your AI team use?",
      choices: VALID_PRESETS.map((p) => ({
        name: `${p.charAt(0).toUpperCase() + p.slice(1)} — ${PRESET_DESCRIPTIONS[p]}${p === "professional" ? " (default)" : ""}`,
        value: p,
      })),
      default: "professional",
    },
  ]);

  const spinner = ora("  Creating project structure...").start();

  try {
    // Copy template config
    const templateDir = getTemplatePath(template);
    const templateConfigPath = path.join(templateDir, "config.yaml");
    const configPath = getConfigPath(projectDir);

    let configContent = fs.readFileSync(templateConfigPath, "utf-8");
    configContent = configContent.replace(/name:\s*"[^"]*"/, `name: "${name}"`);
    configContent = configContent.replace(
      /preset:\s*\w+/,
      `preset: ${selectedPreset}`
    );
    fs.writeFileSync(configPath, configContent, "utf-8");

    spinner.text = "  Installing agent definitions...";

    // Install agent definitions
    installAgentDefinitions(projectDir, templateDir, name);

    // Create .aicib directory for state
    const stateDir = path.join(projectDir, ".aicib");
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }

    // Create .gitignore for state directory
    const gitignorePath = path.join(stateDir, ".gitignore");
    fs.writeFileSync(gitignorePath, "state.db\nstate.db-wal\nstate.db-shm\n", "utf-8");

    // Validate installed agent personas
    spinner.text = "  Validating agent personas...";
    const agentsDir = path.join(projectDir, ".claude", "agents");
    const agentFiles = fs.readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
    const warnings: string[] = [];
    for (const file of agentFiles) {
      const content = fs.readFileSync(path.join(agentsDir, file), "utf-8");
      const result = validateAgentPersona(content);
      if (!result.valid) {
        warnings.push(`${file}: ${result.errors.join(", ")}`);
      }
    }

    spinner.succeed("  Project initialized!\n");

    // Print summary
    console.log(chalk.bold("  Created files:"));
    console.log(`    ${chalk.green("✓")} aicib.config.yaml (persona: ${selectedPreset})`);
    console.log(`    ${chalk.green("✓")} .claude/agents/ceo.md`);
    console.log(`    ${chalk.green("✓")} .claude/agents/cto.md`);
    console.log(`    ${chalk.green("✓")} .claude/agents/cfo.md`);
    console.log(`    ${chalk.green("✓")} .claude/agents/cmo.md`);
    console.log(`    ${chalk.green("✓")} .claude/agents/backend-engineer.md`);
    console.log(`    ${chalk.green("✓")} .claude/agents/frontend-engineer.md`);
    console.log(`    ${chalk.green("✓")} .claude/agents/financial-analyst.md`);
    console.log(`    ${chalk.green("✓")} .claude/agents/content-writer.md`);
    console.log(`    ${chalk.green("✓")} .aicib/ (state directory)`);

    if (warnings.length > 0) {
      console.log(chalk.yellow("\n  Persona warnings:"));
      for (const w of warnings) {
        console.log(chalk.yellow(`    ! ${w}`));
      }
    }

    console.log(chalk.bold("\n  Next steps:"));
    console.log(`    1. Review agents in ${chalk.cyan(".claude/agents/")}`);
    console.log(`    2. Edit ${chalk.cyan("aicib.config.yaml")} to customize`);
    console.log(`    3. Run ${chalk.cyan("aicib start")} to launch the team`);
    console.log(
      `    4. Run ${chalk.cyan('aicib brief "your directive"')} to give the CEO a task\n`
    );
  } catch (error) {
    spinner.fail("  Initialization failed");
    console.error(
      chalk.red(
        `\n  Error: ${error instanceof Error ? error.message : String(error)}\n`
      )
    );
    process.exit(1);
  }
}
