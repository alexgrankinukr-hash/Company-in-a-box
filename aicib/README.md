<p align="center">
  <h1 align="center">aicib — AI Company-in-a-Box</h1>
  <p align="center">
    Spawn a full AI company with one command. CEO, CTO, CFO, CMO — all coordinating autonomously.
  </p>
  <p align="center">
    <a href="#quick-start">Quick Start</a> · <a href="#how-it-works">How It Works</a> · <a href="#what-your-ai-company-produces">Example Output</a> · <a href="#commands">Commands</a> · <a href="#try-these-briefs">Try These Briefs</a>
  </p>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg" alt="TypeScript"></a>
  <a href="https://claude.com/claude-code"><img src="https://img.shields.io/badge/Built%20with-Claude%20Code-blueviolet.svg" alt="Claude Code"></a>
</p>

---

> *"I got a CTO, CMO, and CFO for $1.23."*

<!-- TODO: Replace with actual demo GIF -->
<!-- ![Demo GIF](docs/assets/demo.gif) -->

## Quick Start

```bash
npx aicib init --name "MyStartup"
aicib start
aicib brief "Build an MVP landing page for our product. Target: early adopters. Budget: $500/mo."
```

**What you'll see:**

```
  ✔ Project initialized!

  Your AI Company:

    👤 You (Human Founder)
     └── 🏢 CEO (Team Lead)
           ├── CTO ── Backend Engineer, Frontend Engineer
           ├── CFO ── Financial Analyst
           └── CMO ── Content Writer

  🚀 Try your first brief:

    aicib start
    aicib brief "Build a landing page for MyStartup. Target: early adopters. MVP scope. Budget: $500/mo."
```

The CEO receives your brief, breaks it into department-level objectives, and delegates. Minutes later you have an architecture document, a marketing plan, and a financial projection — all in your project folder.

---

## How It Works

### The Delegation Flow

```
You give a BRIEF  →  CEO decomposes  →  C-suite delegates  →  Workers produce  →  CEO reports back
```

Every brief follows this cycle. You talk to the CEO. The CEO never writes code or documents — it delegates everything to department heads, who delegate to their specialists.

### The Org Chart

```
You (Human Founder)
  └── CEO (Team Lead) .......... orchestrates, delegates, reports back to you
        ├── CTO ................. architecture, tech decisions, code quality
        │     ├── Backend Engineer ... APIs, databases, server logic
        │     └── Frontend Engineer .. UI components, pages, client logic
        ├── CFO ................. financial models, pricing, unit economics
        │     └── Financial Analyst .. spreadsheets, projections, market sizing
        └── CMO ................. positioning, content strategy, launch plans
              └── Content Writer ..... blog posts, landing pages, email copy
```

Each agent has a **soul.md** personality file that defines how they think, what they're good at, and how they communicate. The CTO always lists rejected alternatives before stating a choice. The CFO always includes "napkin math." The CMO always leads with a headline.

### What Makes This Different

This isn't a chatbot. It's a **company simulation**. Agents have:

- **Distinct personalities** — the CTO sounds different from the CMO
- **Decision authority** — each agent knows what they can decide alone vs. what needs escalation
- **Communication protocols** — formal reporting chains, cross-department handoffs
- **Behavioral quirks** — the CEO rates confidence 1-5, the CFO ends every analysis with "Bottom Line:"

---

## What Your AI Company Produces

One brief. Four departments. Real deliverables saved to your project folder.

### CEO Status Report

The CEO synthesizes everything into a cross-functional status report:

> **Cost so far:** $1.23 (CEO: $0.42, CTO: $0.38, CFO: $0.21, CMO: $0.22)
>
> **Confidence: 4/5** — All departments aligned. The two open decisions (pricing model and client portal scope) are the only items preventing full confidence.

[Full example →](docs/examples/example-ceo-report.md)

### CTO Architecture Doc

The CTO produces a technical architecture with tech stack, system diagrams, and API design:

```
         +------------------+
         |   React Frontend |
         +--------+---------+
                  |
             HTTPS/REST
                  |
         +--------v---------+
         |   API Gateway    |
         |   (Express.js)   |
         +--------+---------+
                  |
    +-------------+-------------+
    |             |             |
 Project Svc  Invoice Svc  Time Track Svc
    |             |             |
    +-------------+-------------+
                  |
         +--------v---------+
         |   PostgreSQL 16  |
         +------------------+
```

[Full example →](docs/examples/example-cto-architecture.md)

### CMO Positioning Doc

The CMO defines your target audience, competitive positioning, and launch strategy:

> **The headline here is:** FreelancerPM is the only PM tool built exclusively for solo freelancers who bill by the hour.
>
> **Key differentiators:**
> 1. Invoicing is native, not bolted on
> 2. One tool replaces four ($19/mo vs. $40-$80/mo across Toggl, Notion, FreshBooks)
> 3. Built for one person, not teams
> 4. Client portal included

[Full example →](docs/examples/example-cmo-positioning.md)

### CFO Financial Projection

The CFO builds financial models with revenue projections, unit economics, and sensitivity analysis:

| Month | Total Users | MRR      | MoM Growth |
|-------|-------------|----------|------------|
| 1     | 30          | $570     | --         |
| 3     | 114         | $2,166   | +68%       |
| 6     | 269         | $5,111   | +25%       |
| 12    | 709         | $13,471  | +14%       |

> **Bottom Line:** At $19/mo with reasonable acquisition costs and industry-average churn, FreelancerPM is a viable bootstrapped SaaS that reaches profitability within 9 months on roughly $25K of total investment.

[Full example →](docs/examples/example-cfo-projection.md)

---

## Commands

| Command | Description |
|---------|-------------|
| `aicib init --name "Name"` | Scaffold a new AI company with org chart and guided setup |
| `aicib start` | Boot all agents and show the team assembling |
| `aicib brief "..."` | Send a directive to the CEO — triggers full delegation chain |
| `aicib brief --background "..."` | Send a brief and return immediately — team works in background |
| `aicib status` | Show all agents: what they're doing, what it's cost so far |
| `aicib logs` | View full conversation logs from background runs |
| `aicib stop` | Gracefully shut down all agents |
| `aicib cost` | Detailed cost breakdown per agent, per session |
| `aicib add-agent` | Add a new agent to a department |
| `aicib remove-agent` | Remove an agent from the team |
| `aicib agent` | Agent Persona Studio — customize personalities, names, backgrounds |
| `aicib agent show <role>` | View full persona detail for an agent |
| `aicib agent customize [role]` | Interactive wizard to customize agent persona |
| `aicib agent edit <role>` | Open agent soul.md in your editor |
| `aicib config` | Interactive configuration editor |

### Background Mode

Don't want to watch the agents work? Send a brief in the background:

```bash
aicib brief --background "Build a competitive analysis of the top 5 project management tools"
```

Check on progress anytime:

```bash
aicib status     # Quick overview
aicib logs       # Full conversation
```

---

## What It Costs

AICIB uses your Claude Code subscription. Here's what to expect per brief:

| Brief Type | Departments Active | Estimated Cost | Time |
|------------|-------------------|----------------|------|
| Quick analysis | 1-2 departments | $0.50 - $1.00 | 2-3 min |
| Strategy session | 3-4 departments | $1.00 - $2.00 | 5-8 min |
| Full company brief | All departments | $2.00 - $3.00 | 8-15 min |

Set spending limits in your config:

```yaml
settings:
  cost_limit_daily: 50     # Won't exceed $50/day
  cost_limit_monthly: 500  # Won't exceed $500/month
```

---

## Why AICIB?

| Feature | Raw Claude | CrewAI | MetaGPT | ChatDev | **AICIB** |
|---------|-----------|--------|---------|---------|-----------|
| Company structure | -- | Flat teams | Waterfall | Roles | **Hierarchical org chart** |
| Agent personalities | -- | Basic roles | Roles | Roles | **Deep soul.md with quirks** |
| Cost tracking | -- | -- | -- | -- | **Per-agent, per-session** |
| Background mode | -- | -- | -- | -- | **Built-in** |
| Delegation chain | -- | Sequential | Sequential | Chat | **CEO → C-suite → Workers** |
| Setup time | -- | ~30 min | ~20 min | ~15 min | **One command** |
| Auth required | API key | API key | API key | API key | **Claude Code subscription** |
| File output | -- | Varies | Varies | Code only | **Real deliverables in your folder** |

---

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

### Customizing Agent Personalities

Each agent's behavior is defined in a soul.md file at `.claude/agents/<role>.md`. You can edit these directly or use the **Agent Persona Studio**:

```bash
aicib agent customize ceo
```

The studio lets you set:
- **Display names** — give agents human names (e.g., "Sarah" for CEO)
- **Role presets** — pick personality archetypes (e.g., "The Visionary", "The Operator")
- **Personality traits** — communication style, risk tolerance, assertiveness, creativity
- **Professional background** — years of experience, industry expertise, work history

Or configure in YAML:

```yaml
persona:
  preset: startup
  agents:
    ceo:
      display_name: "Sarah"
      role_preset: the-visionary
      traits:
        communication_style: direct
        assertiveness: 4
    cto:
      display_name: "Marcus"
      role_preset: the-architect
```

---

## Try These Briefs

Copy-paste these into `aicib brief "..."` to see what your AI company can do:

### The Showstopper (all departments, ~$2-3)

```bash
aicib brief "Build a project management SaaS for freelancers called FreelancerPM. Target: solo consultants making $75K-$200K. I want a technical architecture, a go-to-market strategy with Product Hunt launch plan, and a 12-month financial projection. MVP timeline: 2 weeks. Monthly budget: $500."
```

### The Strategy Session (coordinated, ~$1.50-2)

```bash
aicib brief "Plan a Product Hunt launch for our developer tool. CTO: list the 3 most impressive technical features to demo. CMO: write the PH tagline, first comment, and maker story. CFO: estimate launch costs and expected signups."
```

### The Quick Win (fast, ~$0.50-1)

```bash
aicib brief "Analyze our pricing. We're considering $19/mo, $29/mo, or $49/mo for a B2B SaaS tool targeting freelancers. Recommend a price with unit economics to back it up."
```

---

## Project Structure

```
aicib/
├── src/
│   ├── cli/          # Command handlers (init, start, brief, status, stop, etc.)
│   ├── core/         # Engine: agent runner, config, cost tracking, session mgmt
│   └── templates/    # Company templates with agent soul.md files
├── docs/
│   ├── examples/     # Sample output from each department
│   ├── technical/    # Architecture docs, cost tracker, session data
│   └── flows/        # User-facing workflows (start → brief → stop)
├── demo/             # Demo script, briefs, and recording checklist
└── tests/            # End-to-end test suites
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup and prerequisites
- Code style guidelines
- How to modify agent personalities
- Finding good first issues

---

## Built With

- [Claude Code](https://claude.com/claude-code) — Agent Teams & Subagents
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk) — Session management & tool orchestration
- TypeScript + Commander.js — CLI framework
- SQLite (better-sqlite3) — State persistence, cost tracking, session data
- Chalk + Ora — Terminal styling

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>One command. An entire AI company. Open source.</strong>
</p>
