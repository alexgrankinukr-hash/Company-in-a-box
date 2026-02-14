# Implementation Prompt

Copy everything below the line into a new Claude Code conversation to start building.

---

## PROMPT START

I'm building an open-source tool called **AI Company-in-a-Box** -- a CLI that lets anyone spawn a hierarchical team of AI agents structured like a real company (CEO, CTO, CFO, CMO + their workers) that autonomously executes business tasks, coordinates across departments, and only escalates to the human founder for key decisions.

This is a 2-3 week MVP sprint. I need to ship fast -- OpenClaw was built in 2 weeks, and I want the same pace. Open source, MIT license, public GitHub repo from day one.

### What We're Building

A TypeScript npm package (`aicib`) that:
1. Provides a CLI to scaffold and run an "AI company"
2. Uses Claude Code's native agent teams (TeamCreate) + subagents (Task tool) to create hierarchy
3. Lets users configure which agents exist, what models they use, and what tools they have
4. Ships with a pre-built "SaaS Startup" company template as the default

### Architecture (Already Decided)

**Hierarchy via Claude Code primitives:**
```
Human Founder (you)
  └── CEO (Team Lead via TeamCreate)
        ├── CTO (Teammate) ──spawns──> Backend Engineer (Subagent via Task tool)
        │                   ──spawns──> Frontend Engineer (Subagent via Task tool)
        ├── CFO (Teammate) ──spawns──> Financial Analyst (Subagent via Task tool)
        └── CMO (Teammate) ──spawns──> Content Writer (Subagent via Task tool)
```

- CEO is the team lead (created via TeamCreate)
- CTO, CFO, CMO are teammates with their own context windows
- Each C-suite agent uses the Task tool to spawn worker subagents for their department
- Workers do focused tasks and return results to their department head
- Department heads coordinate via shared task list and messaging
- CEO orchestrates cross-functional work and escalates to the human founder

**Tech stack:**
- TypeScript monorepo
- npm package distributed via `npx aicib init`
- Commander.js for CLI
- YAML config file (`aicib.config.yaml`) for company structure, models, agent toggles
- Custom agent definitions in `.claude/agents/` directory (Markdown + YAML frontmatter)
- SQLite for state persistence (agent status, cost tracking, session metadata)

### Agent Definitions (SaaS Startup Template)

Each agent is a `.claude/agents/` Markdown file. All models are user-configurable. Defaults:

| Role | Default Model | Reports To | Spawns |
|------|--------------|-----------|--------|
| CEO | Opus | Human Founder | -- (team lead) |
| CTO | Opus | CEO (teammate) | Backend Engineer, Frontend Engineer |
| CFO | Sonnet | CEO (teammate) | Financial Analyst |
| CMO | Sonnet | CEO (teammate) | Content Writer |
| Backend Engineer | Sonnet | CTO (subagent) | -- |
| Frontend Engineer | Sonnet | CTO (subagent) | -- |
| Financial Analyst | Sonnet | CFO (subagent) | -- |
| Content Writer | Sonnet | CMO (subagent) | -- |

Each agent persona needs:
- Clear role and responsibilities
- What decisions they can make autonomously vs. what to escalate
- How they communicate with other agents (task list, messages)
- Their expertise domain and thinking style
- What tools they have access to

### CLI Commands to Build

```bash
aicib init [--template saas-startup] [--name "MyCompany"]  # Scaffold a new company
aicib start                                                  # Start all agents
aicib brief "your directive here"                           # Send a brief to the CEO
aicib status                                                # Show all agent status
aicib add-agent --role "Data Scientist" --department cto    # Add agent to a department
aicib remove-agent "Content Writer"                         # Remove an agent
aicib config                                                # Interactive config (models, toggles)
aicib stop                                                  # Gracefully stop all agents
aicib cost                                                  # Show cost breakdown per agent
```

### Config File Format

```yaml
# aicib.config.yaml
company:
  name: "MyStartup"
  template: "saas-startup"

agents:
  ceo:
    enabled: true
    model: opus
    check_in_interval: "4h"  # How often CEO reports to founder
  cto:
    enabled: true
    model: opus
    workers:
      - backend-engineer:
          model: sonnet
      - frontend-engineer:
          model: sonnet
  cfo:
    enabled: true
    model: sonnet
    workers:
      - financial-analyst:
          model: sonnet
  cmo:
    enabled: true
    model: sonnet
    workers:
      - content-writer:
          model: sonnet

settings:
  cost_limit_daily: 50        # USD, auto-pause agents when reached
  cost_limit_monthly: 500
  escalation_threshold: "high" # low/medium/high -- what gets escalated to human
  auto_start_workers: true     # Workers spawn on demand or at startup
```

### Key Design Principles

1. **Fully configurable** -- Users choose which agents exist, which models each uses, and what tools they have
2. **Add/remove agents on the fly** -- Dynamic team composition
3. **CLI-first** -- Developers are the initial audience
4. **Ship fast** -- Working MVP in 2-3 weeks. Don't over-engineer. Simple > perfect
5. **Open source from day one** -- MIT license
6. **Security-first** -- Scoped permissions per agent, spending limits, human checkpoints for external actions

### What To Build First (Priority Order)

1. **Agent persona definitions** -- Write the `.claude/agents/` files for all 8 roles. These are the heart of the product. Each needs a compelling, well-defined persona that makes the agent actually useful in its role.

2. **Config system** -- YAML parser, config validation, model/agent toggle logic

3. **CLI scaffolding** -- `aicib init` creates the project structure with config + agent files

4. **Team orchestration** -- `aicib start` creates the team (TeamCreate), spawns teammates, configures the CEO to manage the team

5. **Brief command** -- `aicib brief` sends a directive to the CEO and shows the response

6. **Status + cost tracking** -- `aicib status` and `aicib cost` for visibility

7. **Add/remove agents** -- Dynamic team modification

### Project Structure

```
aicib/
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE (MIT)
├── src/
│   ├── index.ts              # CLI entry point
│   ├── cli/
│   │   ├── init.ts           # aicib init command
│   │   ├── start.ts          # aicib start command
│   │   ├── brief.ts          # aicib brief command
│   │   ├── status.ts         # aicib status command
│   │   ├── config.ts         # aicib config command
│   │   ├── add-agent.ts      # aicib add-agent command
│   │   ├── remove-agent.ts   # aicib remove-agent command
│   │   ├── stop.ts           # aicib stop command
│   │   └── cost.ts           # aicib cost command
│   ├── core/
│   │   ├── config.ts         # Config loading, validation, defaults
│   │   ├── team.ts           # Team creation, agent lifecycle
│   │   ├── agents.ts         # Agent definition management
│   │   └── cost-tracker.ts   # Token/cost tracking per agent
│   └── templates/
│       └── saas-startup/
│           ├── config.yaml    # Default config for this template
│           └── agents/
│               ├── ceo.md
│               ├── cto.md
│               ├── cfo.md
│               ├── cmo.md
│               ├── backend-engineer.md
│               ├── frontend-engineer.md
│               ├── financial-analyst.md
│               └── content-writer.md
├── tests/
└── dist/
```

### Context: Why This Exists

Both OpenAI (Frontier) and Anthropic (Opus 4.6 Agent Teams) shipped competing multi-agent products on Feb 5, 2026 -- the same day. This validates the market. But:
- OpenAI Frontier is enterprise-only ("Contact Sales")
- Claude Agent Teams are code-focused and flat
- CrewAI costs $60K/year for enterprise
- Nobody has built the open-source, accessible, full-business-breadth version

The AI agent market is $7.6B in 2025 growing to $52.6B by 2030. OpenClaw (single personal agent) hit 157K GitHub stars in 60 days. We're building the team version.

### What NOT to Do

- Don't over-engineer. Simple working code > perfect architecture
- Don't build a web dashboard yet (Phase 2)
- Don't build MCP integrations yet (Phase 2)
- Don't build cloud deployment yet (Phase 3)
- Don't add authentication, billing, or multi-tenancy yet
- Don't spend time on tests for the initial sprint -- ship first, test after launch
- Don't use Haiku as default for any agent -- Sonnet minimum for workers, Opus for execs

Start by building the agent persona definitions, then the config system, then the CLI. Let's go.

## PROMPT END
