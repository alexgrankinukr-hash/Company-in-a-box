# Technical Feasibility & Architecture

## 1. Foundation: Claude Code Agent Teams

### Current Architecture

Claude Code Agent Teams (experimental, Feb 5, 2026) provides the base layer:

| Component | Role |
|-----------|------|
| **Team Lead** | Main Claude Code session that creates the team and coordinates |
| **Teammates** | Separate Claude Code instances working on assigned tasks |
| **Task List** | Shared work items stored at `~/.claude/tasks/{team-name}/` |
| **Mailbox** | Inter-agent messaging system |

### What Works Well
- Teammates run in parallel (each in its own tmux pane or in-process)
- Shared task list with dependencies (pending -> in_progress -> completed)
- Direct messaging and broadcast between agents
- File locking prevents race conditions on task claims
- Plan approval mode for risky tasks (read-only until lead approves)
- Quality gates via hooks (TeammateIdle, TaskCompleted)
- Context compaction enables longer sessions (~95% capacity auto-trigger)

### Architecture: Team Lead + Subagent Hierarchy

Claude Code provides two mechanisms that together enable hierarchical teams:

**1. Agent Teams (TeamCreate):** One lead + multiple teammates. Teammates communicate via shared task list and messaging. The lead coordinates.

**2. Subagents (Task tool):** Any agent (including teammates) can spawn subagents to handle specific work. Subagents run in their own context, return results, and terminate.

This gives us a natural hierarchy:

```
Human Founder (you)
  └── CEO (Team Lead)
        ├── CTO (Teammate) ──spawns──> Backend Engineer (Subagent)
        │                   ──spawns──> Frontend Engineer (Subagent)
        │                   ──spawns──> QA Engineer (Subagent)
        ├── CFO (Teammate) ──spawns──> Financial Analyst (Subagent)
        └── CMO (Teammate) ──spawns──> Content Writer (Subagent)
                            ──spawns──> Growth Analyst (Subagent)
```

**How this works in practice:**
- CEO is the team lead, created via TeamCreate
- CTO, CFO, CMO are teammates with their own context windows
- Each C-suite agent uses the Task tool to spawn worker subagents for their department
- Workers do focused tasks and return results to their department head
- Department heads coordinate with each other via the shared task list and messaging
- CEO orchestrates cross-functional work and escalates to the human founder

**Key advantage:** This uses Claude Code's native primitives (teams + subagents) without needing a custom orchestration layer. The hierarchy is emergent from the agent prompts and how they use the Task tool.

### What We Build On Top

Our orchestration layer is thin -- it mainly handles:
- **Agent configuration:** Define which roles exist, their models, tools, and personas (YAML config)
- **Agent lifecycle:** Start/stop/add/remove agents dynamically
- **Cost tracking:** Per-agent and per-department spending limits
- **Human interface:** CLI commands to brief the CEO, check status, adjust the team
- **Templates:** Pre-built company structures users can start from

---

## 2. Custom Agent Definitions

Claude Code supports custom subagents as Markdown files with YAML frontmatter:

```markdown
---
name: cto-agent
description: Chief Technology Officer - manages technical strategy and engineering team
tools: Read, Glob, Grep, Bash, Edit, Write, Task, WebSearch
model: opus
maxTurns: 50
permissionMode: delegate
memory: project
---

You are the CTO of {company_name}. Your responsibilities:
- Define technical architecture and technology choices
- Break down product requirements into engineering tasks
- Delegate implementation work to your engineering team
- Review code quality and architectural decisions
- Report progress to the CEO and flag technical risks

Your engineering team: {engineer_list}
Current sprint goals: {sprint_goals}
Technical constraints: {constraints}
```

### Agent Configuration Options

| Field | What It Controls |
|-------|-----------------|
| `name` | Unique identifier (lowercase, hyphens) |
| `description` | When this agent should be invoked |
| `tools` | Allowlist of available tools |
| `model` | `opus`, `sonnet`, `haiku`, or `inherit` |
| `maxTurns` | Max API round-trips before stopping |
| `permissionMode` | `default`, `delegate`, `dontAsk`, `plan`, etc. |
| `memory` | Persistent memory scope (`user`, `project`, `local`) |
| `skills` | Pre-loaded skill modules |
| `mcpServers` | Connected external tools |
| `hooks` | Lifecycle event handlers |

### Persistent Memory

Each agent can maintain memory across sessions:
- Stored at `~/.claude/agent-memory/<name>/MEMORY.md`
- First 200 lines injected into system prompt
- Perfect for: agent personality, learned preferences, project context, past decisions

---

## 3. Model Flexibility

### Model Selection (Fully Configurable)

Every agent's model is user-configurable. Defaults in templates use Opus for executives and Sonnet for workers, but users can change any agent to any model:

| Agent Role | Default Model | User Can Change To |
|-----------|--------------|-------------------|
| CEO | Opus 4.6 | Any (Opus recommended for complex reasoning) |
| CTO | Opus 4.6 | Sonnet if budget-conscious |
| CFO | Sonnet 4.5 | Opus for complex financial modeling |
| CMO | Sonnet 4.5 | Opus for strategy-heavy work |
| Engineers | Sonnet 4.5 | Opus for architecture, Haiku for simple tasks |
| Analysts | Sonnet 4.5 | Haiku if doing routine data processing |
| QA | Sonnet 4.5 | Haiku for simple validation |

**Important:** Haiku works for simple, well-scoped tasks but struggles with complex code generation and nuanced reasoning. Default to Sonnet for workers; let users downgrade to Haiku if they want to optimize cost. Never force Haiku as a default -- quality matters more than saving pennies.

### Estimated Cost per Agent-Hour

| Model | Input Cost | Output Cost | Est. Agent-Hour |
|-------|-----------|-------------|-----------------|
| Opus 4.6 | $5/M tokens | $25/M tokens | $2-8/hour |
| Sonnet 4.5 | $3/M tokens | $15/M tokens | $1-4/hour |
| Haiku 4.5 | $0.25/M tokens | $1.25/M tokens | $0.10-0.50/hour |

### Full Company Cost Estimate (9 agents, 8 hours/day)

| Scenario | Monthly Cost |
|----------|-------------|
| All Opus | $3,000-15,000 |
| Mixed (recommended) | $500-2,000 |
| All Haiku | $50-200 |
| With prompt caching (95% reduction) | $100-500 |

### Non-Anthropic Model Support

**Via LiteLLM Proxy:**
```bash
pip install 'litellm[proxy]'
litellm --config /path/to/config.yaml
export ANTHROPIC_BASE_URL=https://litellm-server:4000
```

Supported: OpenAI GPT-4o/o1/o3, Google Gemini, Azure OpenAI, AWS Bedrock, Groq, Together AI, Deepseek, and 100+ providers.

**Via Ollama (local/free):**
```bash
export ANTHROPIC_BASE_URL="http://localhost:11434"
```

Supports: qwen3-coder, glm-4.7, llama models, and any Ollama-compatible model.

**Caveat**: Quality degrades significantly with smaller models. Agent teams require strong instruction-following and tool-use capabilities.

---

## 4. MCP Integrations (How Agents Do Real Work)

MCP (Model Context Protocol) is how agents connect to external services:

### Pre-Built MCP Servers Available

| Category | Services |
|----------|---------|
| Communication | Slack, Discord, Email (Gmail), Microsoft Teams |
| Project Management | Linear, Jira, Asana, Notion, Trello |
| Development | GitHub, GitLab, Sentry |
| Data | PostgreSQL, MySQL, MongoDB, Supabase |
| Design | Figma |
| Finance | (custom MCP servers needed) |
| CRM | Salesforce (via API) |
| Documents | Google Workspace, Confluence |

### Configuration Per Agent

```yaml
# In agent frontmatter
mcpServers:
  - slack
  - linear
  - name: company-db
    command: "/path/to/db-server"
    args: ["--config", "config.json"]
```

### Important Limitation
- **MCP tools are NOT available in background subagents**
- Background agents auto-deny MCP tool calls
- This means agents need to run in foreground for external integrations

---

## 5. Long-Running Task Challenges

### Current Limitations

| Challenge | Current State | Workaround |
|-----------|--------------|------------|
| Session persistence | No resume with in-process teammates | Spawn new teammates on restart |
| Rate limits | 5-hour rolling window + 7-day ceiling | Budget agent activity, use sleep cycles |
| Token consumption | ~7x higher with agent teams in plan mode | Context compaction, model mixing |
| Task tracking | Teammates sometimes fail to mark tasks done | TaskCompleted hooks for validation |
| Daemon mode | No built-in continuous operation | External process manager (systemd, pm2) |
| MCP in background | Not supported | Run agents in foreground |

### Architecture for Persistence

Our orchestration layer needs:

1. **State Store** -- SQLite or file-based persistence for:
   - Agent definitions and hierarchy
   - Task queues and status
   - Inter-agent message history
   - Cost tracking per agent
   - Session metadata for resume

2. **Process Manager** -- Manages agent lifecycles:
   - Start/stop/restart individual agents
   - Health checks and auto-restart on crash
   - Graceful shutdown with state saving
   - Sleep/wake scheduling (agents don't need to run 24/7)

3. **Message Router** -- Handles hierarchical communication:
   - CEO -> CTO messages route correctly
   - CTO -> Engineer messages route within department
   - Cross-department messages route through department heads
   - Human founder receives only escalations

4. **Cost Controller** -- Prevents runaway spending:
   - Per-agent token budgets
   - Per-department daily limits
   - Global spending cap with alerts at 50%, 75%, 90%
   - Auto-sleep agents when approaching limits

---

## 6. Opus 4.6 Capabilities That Enable This

| Feature | How It Helps |
|---------|-------------|
| **1M token context** | Agents can hold entire project context in memory |
| **Adaptive thinking** | Agents use heavy reasoning only when needed, fast execution otherwise |
| **Context compaction** | Agents run for hours without hitting token limits |
| **Effort controls** | Low/medium/high/max -- tune cost vs intelligence per agent |
| **Agent teams** | Native multi-agent support we build on top of |
| **128K output** | Agents can generate comprehensive documents in one turn |

---

## 7. Recommended Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Orchestration** | TypeScript/Node.js | Claude Code ecosystem is TS. Fast iteration |
| **Agent definitions** | Markdown + YAML | Native `.claude/agents/` format |
| **State store** | SQLite (local) / PostgreSQL (cloud) | Simple, reliable, embeddable |
| **Process management** | Node.js child processes + pm2 | Cross-platform, well-understood |
| **Message queue** | File-based (local) / Redis (cloud) | Start simple, scale later |
| **Dashboard** | React + Vite | Real-time agent monitoring |
| **CLI** | Commander.js | Standard Node.js CLI framework |
| **Package distribution** | npm | `npx aicib init` for zero-install experience |
| **Cloud version** | Railway or Fly.io | Deploy agent companies to the cloud |

---

## 8. Technical Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  HUMAN FOUNDER                       │
│              (Dashboard / CLI / Slack)                │
└──────────────────────┬──────────────────────────────┘
                       │ Escalations & Briefings
                       ▼
┌─────────────────────────────────────────────────────┐
│              ORCHESTRATION DAEMON                     │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐ │
│  │ State    │ │ Message  │ │ Cost   │ │ Process  │ │
│  │ Store    │ │ Router   │ │ Control│ │ Manager  │ │
│  └──────────┘ └──────────┘ └────────┘ └──────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  CTO Team    │ │  CFO Team    │ │  CMO Team    │
│  (Lead: CTO) │ │  (Lead: CFO) │ │  (Lead: CMO) │
│  ┌────────┐  │ │  ┌────────┐  │ │  ┌────────┐  │
│  │Backend │  │ │  │Finance │  │ │  │Content │  │
│  │Engineer│  │ │  │Analyst │  │ │  │Writer  │  │
│  └────────┘  │ │  └────────┘  │ │  └────────┘  │
│  ┌────────┐  │ │              │ │  ┌────────┐  │
│  │Frontend│  │ │              │ │  │Growth  │  │
│  │Engineer│  │ │              │ │  │Analyst │  │
│  └────────┘  │ │              │ │  └────────┘  │
│  ┌────────┐  │ │              │ │              │
│  │  QA    │  │ │              │ │              │
│  └────────┘  │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## Sources

- [Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams)
- [Claude Code Custom Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Model Configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code MCP Integration](https://code.claude.com/docs/en/mcp)
- [Claude Code LLM Gateway](https://code.claude.com/docs/en/llm-gateway)
- [Anthropic Opus 4.6 Announcement](https://www.anthropic.com/news/claude-opus-4-6)
- [Anthropic Compaction Docs](https://platform.claude.com/docs/en/build-with-claude/compaction)
- [LiteLLM Claude Code Integration](https://docs.litellm.ai/docs/tutorials/claude_non_anthropic_models)
- [Ollama Claude Code Integration](https://docs.ollama.com/integrations/claude-code)
- [Google ADK Multi-Agent Docs](https://google.github.io/adk-docs/agents/multi-agents/)
- [Claude Code Costs](https://code.claude.com/docs/en/costs)
- [TrueFoundry Claude Code Limits](https://www.truefoundry.com/blog/claude-code-limits-explained)
