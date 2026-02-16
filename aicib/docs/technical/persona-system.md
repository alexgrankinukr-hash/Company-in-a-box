# Persona System (Phase 1 S2)

## What It Does

Gives each AI agent a distinct personality style. A "preset" applies a communication tone across the whole company, and per-agent overrides let you mix and match (e.g., CTO gets "technical" while CMO gets "creative").

## How It Works

### Preset Files

Four presets live in each template's `presets/` directory:

| Preset | Style |
|--------|-------|
| `professional` | Formal, data-driven, structured |
| `startup` | Fast, informal, bias-to-action |
| `technical` | Precise, terse, spec-like |
| `creative` | Storytelling, metaphors, expressive |

Each preset is a Markdown file with YAML frontmatter:
```yaml
---
name: startup
display_name: Startup Culture
description: Fast-moving and informal
---
## Style Guidelines
- Use first names...
```

### Application Flow

```
aicib.config.yaml → persona.preset: "startup"
                   → persona.overrides: { cmo: "creative" }
                          ↓
loadPersonaFromConfig(config)
   → loadPreset(templateDir, "startup")       → base preset
   → loadPreset(templateDir, "creative")      → CMO override
                          ↓
loadAgentDefinitions(agentsDir, preset, overrides)
   → for each agent:
        applyPresetToContent(agent.content, preset)
        → appends "## Tone & Phrasing (Startup preset)" section
   → CMO gets creative instead of startup
                          ↓
buildSubagentMap() → SDK AgentDefinition objects with personality-enriched prompts
```

The preset is **appended** to each agent's soul.md content — it doesn't replace anything. The agent's base personality stays intact; the preset adds communication style guidelines.

### Config

```yaml
persona:
  preset: professional        # applies to all agents
  overrides:
    cmo: creative             # CMO gets a different style
    cto: technical            # CTO gets a different style
```

### User-Facing Commands

- `aicib init` — asks "What personality style should your AI team use?" during setup
- `aicib config` → "Agent personas" menu — change preset, set per-agent overrides, view current settings

### Validation

- `validateAgentPersona(content)` checks soul.md files have required sections: `# Title`, `## Your Role`, `## Decision Authority`, `## Working Style`
- `loadPersonaFromConfig()` warns if a preset can't be loaded but doesn't block execution
- Override keys that don't match any agent role get a warning (catches typos in config)

## Key Files

- `src/core/persona.ts` — `loadPreset()`, `listPresets()`, `applyPresetToContent()`, `validateAgentPersona()`
- `src/core/agents.ts` — `loadAgentDefinitions()` applies persona overlays
- `src/core/agent-runner.ts` — `loadPersonaFromConfig()` bridges config to persona system
- `src/core/config.ts` — `PersonaConfig` type, validation
- `src/cli/init.ts` — interactive preset picker
- `src/cli/config.ts` — personas menu
- `src/templates/saas-startup/presets/*.md` — preset files

## Related

- Linear: COM-8
- Agent soul.md files: `src/templates/saas-startup/agents/*.md`
