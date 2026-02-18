import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import {
  configExists,
  getConfigPath,
  loadConfig,
  saveConfig,
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
  ROLE_PRESETS,
  validateAgentPersona,
  type PersonaPreset,
  type AgentPersonaConfig,
} from "../core/persona.js";
import { listRolePresets } from "../core/persona-studio.js";

interface InitOptions {
  template: string;
  name: string;
  dir: string;
  persona?: string;
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

  // Use --persona flag if provided, otherwise prompt interactively
  let selectedPreset: PersonaPreset;
  if (options.persona) {
    if (!VALID_PRESETS.includes(options.persona as PersonaPreset)) {
      console.log(
        chalk.red(
          `  Error: Invalid persona "${options.persona}". Available: ${VALID_PRESETS.join(", ")}`
        )
      );
      return;
    }
    selectedPreset = options.persona as PersonaPreset;
  } else {
    const answer = await inquirer.prompt([
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
    selectedPreset = answer.selectedPreset;
  }

  // Optional agent personalization step
  const agentPersonas: Record<string, AgentPersonaConfig> = {};
  const cSuiteRoles = ["ceo", "cto", "cfo", "cmo"];

  if (!options.persona) {
    // Only ask interactively (skip if --persona flag was used for automation)
    const { customize } = await inquirer.prompt([{
      type: "confirm",
      name: "customize",
      message: "Would you like to customize individual agent personalities?",
      default: false,
    }]);

    if (customize) {
      const templateDir = getTemplatePath(template);

      for (const role of cSuiteRoles) {
        console.log(chalk.bold(`\n  Customizing ${role.toUpperCase()}:`));

        // Display name
        const { displayName } = await inquirer.prompt([{
          type: "input",
          name: "displayName",
          message: `  Display name for ${role} (Enter to skip):`,
        }]);

        const personaConfig: AgentPersonaConfig = {};
        if (displayName.trim()) {
          personaConfig.display_name = displayName.trim();
        }

        // Role preset
        const presets = listRolePresets(templateDir, role);
        if (presets.length > 0) {
          const { rolePreset } = await inquirer.prompt([{
            type: "list",
            name: "rolePreset",
            message: `  Role preset for ${role}:`,
            choices: [
              { name: chalk.dim("Skip"), value: "__skip__" },
              ...presets.map((p) => ({
                name: `${p.displayName} — ${p.description}`,
                value: p.name,
              })),
            ],
          }]);
          if (rolePreset !== "__skip__") {
            personaConfig.role_preset = rolePreset;
          }
        }

        if (personaConfig.display_name || personaConfig.role_preset) {
          agentPersonas[role] = personaConfig;
        }
      }

      if (Object.keys(agentPersonas).length > 0) {
        console.log(chalk.green(`\n  Configured ${Object.keys(agentPersonas).length} agent persona(s).`));
        console.log(chalk.dim("  Use 'aicib agent customize' later to add traits and backgrounds.\n"));
      }
    }
  }

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

    // Merge agent personas via structured config round-trip
    if (Object.keys(agentPersonas).length > 0) {
      const cfg = loadConfig(projectDir);
      if (!cfg.persona) {
        cfg.persona = { preset: selectedPreset };
      }
      cfg.persona.agents = agentPersonas;
      saveConfig(projectDir, cfg);
    }

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

    // Org chart
    console.log(chalk.bold("\n  Your AI Company:\n"));
    console.log(`    \u{1F464} You (Human Founder)`);
    console.log(`     \u2514\u2500\u2500 \u{1F3E2} ${chalk.bold.white("CEO")} (Team Lead)`);
    console.log(`           \u251C\u2500\u2500 ${chalk.cyan("CTO")} \u2500\u2500 ${chalk.dim("Backend Engineer, Frontend Engineer")}`);
    console.log(`           \u251C\u2500\u2500 ${chalk.green("CFO")} \u2500\u2500 ${chalk.dim("Financial Analyst")}`);
    console.log(`           \u2514\u2500\u2500 ${chalk.magenta("CMO")} \u2500\u2500 ${chalk.dim("Content Writer")}`);

    // Guided first experience
    console.log(chalk.bold("\n  \u{1F680} Try your first brief:\n"));
    console.log(`    ${chalk.cyan("aicib start")}`);
    console.log(`    ${chalk.cyan(`aicib brief "Build a landing page for ${name}. Target: early adopters. MVP scope. Budget: $500/mo."`)}`);
    console.log(chalk.bold("\n  \u{1F4A1} Tips:"));
    console.log(chalk.dim("    \u2022 Each brief costs ~$0.50\u2013$3.00 depending on complexity"));
    console.log(chalk.dim("    \u2022 Set spending limits in aicib.config.yaml (current: $50/day, $500/month)"));
    console.log(chalk.dim(`    \u2022 Run ${chalk.cyan("aicib brief --background \"...\"")} to work while the team runs`));
    console.log(chalk.dim(`    \u2022 Check on progress anytime with ${chalk.cyan("aicib status")}\n`));
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
