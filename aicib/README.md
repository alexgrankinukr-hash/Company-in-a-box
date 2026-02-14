# aicib — AI Company-in-a-Box

Spawn a hierarchical team of AI agents structured like a real company. CEO, CTO, CFO, CMO + their workers — all coordinating autonomously, escalating to you for key decisions.

## Quick Start

```bash
npx aicib init --name "MyStartup"
npx aicib start
npx aicib brief "Build an MVP landing page for our product"
```

## What It Does

aicib creates a team of AI agents organized like a company:

```
You (Human Founder)
  └── CEO (Team Lead)
        ├── CTO ──> Backend Engineer, Frontend Engineer
        ├── CFO ──> Financial Analyst
        └── CMO ──> Content Writer
```

- **CEO** orchestrates cross-functional work and reports to you
- **CTO** handles all technical decisions, spawns engineers for implementation
- **CFO** manages financial analysis and business metrics
- **CMO** drives marketing, content, and growth strategy
- **Workers** execute focused tasks and report to their department head

## Commands

| Command | Description |
|---------|-------------|
| `aicib init` | Scaffold a new AI company |
| `aicib start` | Start all agents |
| `aicib brief "..."` | Send a directive to the CEO |
| `aicib status` | Show all agent statuses |
| `aicib stop` | Gracefully stop all agents |
| `aicib cost` | Show cost breakdown per agent |
| `aicib add-agent` | Add an agent to a department |
| `aicib remove-agent` | Remove an agent |
| `aicib config` | Interactive configuration |

## Configuration

Edit `aicib.config.yaml` in your project root:

```yaml
company:
  name: "MyStartup"
  template: "saas-startup"

agents:
  ceo:
    enabled: true
    model: opus
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
  cost_limit_daily: 50
  cost_limit_monthly: 500
  escalation_threshold: high
  auto_start_workers: true
```

## Built With

- [Claude Code](https://claude.com/claude-code) Agent Teams & Subagents
- TypeScript + Commander.js
- SQLite for state persistence

## License

MIT
