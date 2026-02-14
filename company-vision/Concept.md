# AI Company-in-a-Box

## The Vision

**One command. An entire AI company. Running 24/7.**

AI Company-in-a-Box is an open-source orchestration layer that lets anyone spawn a hierarchical team of AI agents structured like a real company -- CEO, CTO, CFO, CMO and their sub-teams -- that autonomously executes business tasks, coordinates across departments, and only escalates to you for key decisions.

You are the founder. They are your executive team and employees. They work while you sleep.

## The Problem

Today's AI tools are single-player. You talk to one agent, one chat at a time. But running a business requires coordinated teams:

- A CTO who breaks down technical architecture and delegates to engineers
- A CFO who builds financial models, tracks burn rate, and forecasts revenue
- A CMO who develops go-to-market strategy and manages content pipelines
- A CEO who aligns all departments, sets priorities, and makes cross-functional decisions

**No tool today lets you set up this kind of autonomous, hierarchical team of AI agents that runs your business holistically.** The closest attempts are either:
- Dev-team-only simulators (MetaGPT, ChatDev) that can't handle business breadth
- Enterprise platforms (OpenAI Frontier) locked behind "Contact Sales"
- Generic frameworks (CrewAI, LangGraph) requiring weeks of engineering to configure

## The Solution

AI Company-in-a-Box provides:

1. **Pre-built Company Templates** -- Start with a SaaS startup, agency, e-commerce, or consulting firm template. Each comes with the right executive roles, department structures, and workflows pre-configured.

2. **Hierarchical Agent Teams** -- Using Claude Code's team lead + subagent architecture, we create true hierarchy: CEO acts as team lead with C-suite as teammates, each C-suite member can spawn subagents for their department work. Users can add/remove any role at any time.

3. **Role-Based Agent Personas** -- Each agent has a defined role, responsibilities, expertise area, decision-making authority, and communication style. The CFO thinks about numbers. The CTO thinks about architecture. The CMO thinks about customers.

4. **Autonomous Execution with Human Checkpoints** -- Agents work independently and coordinate with each other. You get notified only for: budget decisions above a threshold, key strategic choices, external communications, and periodic status reports.

5. **Fully Configurable** -- Every agent's model is user-selectable (Opus, Sonnet, Haiku, or any model via LiteLLM/Ollama). Add or remove agents freely: don't need a CFO? Turn it off. Want a Data Scientist under the CTO? Add one. Your company, your structure.

6. **MCP-Powered Integrations** -- Connect agents to real tools: Slack, email, Google Workspace, Notion, Linear, databases, APIs. Agents don't just plan -- they execute.

## How It Works

```
$ aicib init --template saas-startup --name "MyStartup"

Spawning AI Company: MyStartup
  CEO Agent (Opus) ................ ready
  CTO Agent (Opus) ................ ready
    Backend Engineer (Sonnet) ..... ready
    Frontend Engineer (Sonnet) .... ready
    QA Engineer (Sonnet) .......... ready
  CFO Agent (Sonnet) .............. ready
    Financial Analyst (Sonnet) .... ready
  CMO Agent (Sonnet) .............. ready
    Content Writer (Sonnet) ....... ready
    Growth Analyst (Sonnet) ....... ready

Company running. 9 agents active. All models configurable.
Dashboard: http://localhost:3000
CEO check-in scheduled: every 4 hours

$ aicib brief "Build a project management SaaS. Target freelancers.
  Budget: $500/month in API costs. Ship MVP in 2 weeks."
```

The CEO receives the brief, breaks it into departmental objectives, and delegates:
- CTO gets the technical vision and starts architectural planning
- CFO gets the budget constraints and starts tracking spend
- CMO gets the target market and starts researching positioning

Each department head then delegates to their team members. Agents coordinate through shared task boards and inter-agent messaging. You get a CEO briefing every 4 hours (or on-demand).

## The Narrative

> Greg Brockman said every moment your agents aren't running is a wasted opportunity.
> Sam Altman predicted the one-person billion-dollar company.
> We built the tool that makes both real.

This isn't about replacing humans. It's about giving every ambitious person -- solopreneurs, indie hackers, small teams -- the organizational capacity of a 20-person company, running 24/7, for the cost of API calls.

## Target Users

1. **Solopreneurs & Indie Hackers** -- Want to move fast, can't afford to hire, need AI to handle the breadth of running a business
2. **Early-Stage Startups (2-5 people)** -- Need to punch above their weight across engineering, marketing, finance, and operations
3. **Agencies & Consultants** -- Run multiple client projects simultaneously with dedicated AI teams per client
4. **Developers & Builders** -- Want to experiment with autonomous multi-agent systems for their own projects

## Why Now

- **Opus 4.6 agent teams** (Feb 5, 2026) -- First time multi-agent orchestration is natively supported in a coding tool
- **1M token context windows** -- Agents can hold entire codebases and project histories in memory
- **Context compaction** -- Agents can run for hours without hitting token limits
- **MCP ecosystem maturity** -- Hundreds of integrations available for agents to use real tools
- **Model costs dropping** -- Haiku-class models are pennies per task, making large agent teams affordable
- **Proven demand** -- OpenClaw hit 157K GitHub stars in 60 days; the appetite for autonomous AI agents is enormous

## What Makes This Different

| Feature | AI Company-in-a-Box | CrewAI | MetaGPT | Claude Code Teams | OpenAI Frontier |
|---------|---------------------|--------|---------|-------------------|-----------------|
| Hierarchical teams | Yes | Flat crews | Dev roles only | Flat (lead + workers) | Unknown |
| Business breadth | Full C-suite | Generic roles | Dev team only | Code-focused | Enterprise custom |
| Open source | Yes | Partially | Yes | No (proprietary CLI) | No |
| Model agnostic | Yes (any model) | Yes | Limited | Claude only* | OpenAI only |
| Pre-built templates | Yes | No | No | No | No |
| Self-hosted | Yes | Yes | Yes | Yes | No |
| Human checkpoints | Configurable | Manual | No | Manual | Enterprise IAM |
| Real tool execution | Via MCP | Via tools | Limited | Native | Via connectors |

*Claude Code supports other models via LiteLLM proxy

## Working Name Options

- **AI Company-in-a-Box** (descriptive, clear)
- **FounderOS** (aspirational, "operating system for founders")
- **TeamForge** (building teams)
- **HiveExec** (execution-focused)
- **AgentOrg** (organizational structure)
- **SwarmCEO** (catchy, implies leadership)

## Key Design Principles

1. **Fully configurable** -- Users choose which agents to activate, which models each uses, and what tools they have access to
2. **Add/remove agents on the fly** -- "I want a Data Scientist under CTO" or "Turn off the CFO for now"
3. **CLI-first** -- Developers are the initial audience; web dashboard comes later
4. **Ship fast, iterate fast** -- MVP in 2-3 weeks following the OpenClaw playbook
5. **Open source from day one** -- Public repo, MIT license, community contributions welcome

## Open Questions

1. Should the MVP focus on one company template (SaaS startup) or be template-agnostic from day one?
2. How to handle agent persistence across sessions (daemon mode)?
3. What's the minimum viable agent team? (CEO + 2 departments? Or full C-suite?)
4. How to demonstrate value quickly in a demo video (the "founding moment")?
