# Research: Pi Engine vs Agent SDK — Should AICIB Switch?

> **Date:** February 15, 2026
> **Research by:** 3 Opus agents (pi-researcher, sdk-researcher, computeruse-researcher)
> **Decision:** Stay on Agent SDK. Build abstraction layer in Phase 2. Evaluate switching in Phase 4+.

---

## What We Compared

| | Agent SDK (what AICIB uses) | Pi Engine (what OpenClaw uses) |
|---|---|---|
| **Made by** | Anthropic (official) | Mario Zechner (independent, open source) |
| **What it does** | Wraps Claude Code as a library you can build on | Talks directly to LLM APIs — a custom engine from scratch |
| **AI models** | Claude only | Any model — Claude, GPT, Gemini, DeepSeek, local models |
| **License** | Proprietary (Anthropic controls terms) | MIT (fully open, no restrictions) |
| **Sub-agents** | Built-in Task tool spawns sub-agents | None built-in — must build yourself or use extensions |
| **Turn limits** | `maxTurns` parameter (we set 500 CEO / 200 sub-agents) | No turn limits at all — runs until the AI says "done" |
| **Version** | v0.2.42 (released Feb 13, 2026) | Part of pi-mono repo, actively maintained |
| **Startup speed** | ~12 second delay per query | Fast — direct API calls |
| **Auth** | Claude Code subscription (no API key needed) | Requires API keys per provider |

---

## Key Findings

### 1. The Agent SDK Is NOT Legacy

- Actively maintained — multiple releases per month
- Central to Anthropic's strategy (renamed from "Code SDK" to "Agent SDK" to signal broader vision)
- Apple integrated it into Xcode 26.3 (Feb 2026)
- Spotify, GitHub, and Microsoft all use it
- Computer-use and tools/MCP are complementary approaches — every major company has both
- AICIB's tool-based approach is the mainstream approach for business workflows

### 2. Pi's Architecture Has Real Advantages

- **Multi-model support**: CEO could use Opus ($$$), workers could use Haiku ($). Could cut costs 60-70%.
- **No vendor lock-in**: MIT license, works with any AI provider
- **Faster**: No 12-second startup delay
- **Lighter**: ~9 MB vs the Agent SDK's heavier Claude Code binary
- **Full control**: You see and control every LLM call — no black boxes

### 3. But Switching Would Be Expensive

- No built-in sub-agents — would need to rebuild CEO→CTO/CFO/CMO delegation from scratch
- Requires API keys — users can't use Claude Code subscription (friction for non-technical users)
- Session persistence, tool execution, compaction — all handled by Agent SDK today, would need rebuilding
- Weeks of work with no immediate user-facing benefit

### 4. Computer-Use Is Not a Threat to Our Approach

- ALL major companies (Anthropic, OpenAI, Google) have both tool-based AND computer-control capabilities
- They ALL recommend tools/MCP for structured business workflows
- Computer-use is for filling gaps where no API exists (legacy websites, random desktop apps)
- For AICIB's use cases (writing docs, plans, financial models): tool-based execution is faster, cheaper, more reliable, and more secure than screen-clicking
- MCP (Model Context Protocol) is becoming the universal standard — donated to Linux Foundation, adopted by everyone

### 5. OpenClaw vs AICIB — Different Products

- OpenClaw = personal AI assistant you message on WhatsApp/Telegram/Slack
- AICIB = structured AI company with roles, departments, and workflows
- OpenClaw's 145K stars come from the product concept, not the engine choice
- AICIB needs to be compelling first. Architecture optimization comes after product-market fit.

---

## What Pi Does That We Should Learn From

| Pi Feature | Relevance to AICIB | When to Consider |
|---|---|---|
| Multi-model routing | Let CEO use Opus, workers use cheaper models — big cost savings | Phase 2 (already on roadmap) |
| No turn limits | Pi runs until the AI says "done" — no artificial ceiling | Already addressed (set high: 500/200) |
| Heartbeat/daemon mode | OpenClaw runs 24/7, checks in every 30 minutes | Phase 2 (long autonomous tasks) |
| Extension system | Pi has hot-reloadable TypeScript extensions | Phase 3 (MCP integration framework) |
| Tree-structured sessions | Branch conversations, rewind, fork — powerful for complex projects | Phase 4+ (nice to have) |
| Provider-agnostic LLM layer | Unified interface across 8+ providers with 300+ model catalog | Phase 2 (multi-model support) |

---

## The Decision: A Phased Approach

### Now (Phase 1): Stay on Agent SDK
- It works. Three bugs fixed, builds clean, demo-ready.
- Sub-agents, session persistence, tool execution all provided for free.
- No rebuilding needed.

### Phase 2 (Weeks 4-6): Build an Abstraction Layer
- When implementing multi-model support, create a thin interface between AICIB's core and the Agent SDK
- This means AICIB code talks to our own functions, not directly to SDK functions
- If we ever need to switch engines, we change only the adapter — not the entire codebase
- Think of it like a universal power adapter: our code (AICIB) uses one plug, the adapter converts to whatever engine (SDK, Pi, raw API) we need
- **This is a low-risk, high-optionality move** — takes a few days, saves weeks if we ever need to switch

### Phase 4+ (Weeks 10+): Evaluate Based on Real User Data
- By then we'll have real users and real data to answer:
  - Is the 12-second startup delay hurting user experience?
  - Are users asking for non-Claude models?
  - Is the proprietary license causing adoption friction?
  - Are API costs too high without multi-model routing?
- If yes to any of those, the abstraction layer makes switching straightforward
- Pi's architecture (or something inspired by it) could be the migration target

---

## Detailed Research Reports

The three research agents produced comprehensive reports covering:

### Pi Engine Internals (pi-researcher)
- Core agent loop: receive message → stream to LLM → check for tool calls → feed results back → repeat until done
- 4 core tools only: read, write, edit, bash
- LLM abstraction (`pi-ai`): identified that ALL providers speak one of just 4 wire protocols
- 300+ model definitions auto-generated from models.dev and OpenRouter
- Tree-structured JSONL sessions with branching and compaction
- No built-in sub-agents (deliberate choice — uses bash/tmux/extensions instead)

### Agent SDK Limitations (sdk-researcher)
- Known issues: 12s startup delay (#1 complaint), token limit complaints, occasional breaking changes
- maxTurns: no default limit, but Anthropic recommends setting one. Hard cap at 1000.
- NOT legacy: renamed to "Agent SDK" (Sep 2025), integrated into Apple Xcode, adopted by enterprise
- Lock-in risk is real: Claude-only, proprietary license, ecosystem lock-in strategy
- Mitigated by: MCP portability, Agent Skills cross-platform standard, AWS Bedrock/Google Vertex access

### Computer-Use & Industry Trends (computeruse-researcher)
- Anthropic Computer Use: screen-based control, 61.4% on OSWorld benchmark
- OpenAI Operator: merged into ChatGPT Agent, available to Pro/Plus/Team users
- Google: Gemini Computer Use model, predicts 40% of enterprise apps will embed agents by end of 2026
- OpenClaw daemon mode: heartbeat system checks in every 30 minutes, runs 24/7 on cloud VMs
- MCP vs computer-use: complementary, not competing. MCP for structured workflows, computer-use for gaps.
- Security: prompt injection is #1 vulnerability (73% of production deployments affected). AICIB's tool-based approach is inherently safer.
- Market: agentic AI projected to grow from $7.8B to $52B+ by 2030

---

## Sources

### Pi Engine
- [Pi Monorepo (GitHub)](https://github.com/badlogic/pi-mono)
- [Mario Zechner's blog on building Pi](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)
- [Armin Ronacher's Pi deep dive](https://lucumr.pocoo.org/2026/1/31/pi/)
- [Pi Agent Core (DeepWiki)](https://deepwiki.com/badlogic/pi-mono/3.1-agent-and-transport-layer)

### Agent SDK
- [Anthropic: Building Agents with Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Anthropic: Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [VentureBeat: Claude Code 2.1.0](https://venturebeat.com/orchestration/claude-code-2-1-0-arrives-with-smoother-workflows-and-smarter-agents)

### Computer-Use & Industry
- [Anthropic: Computer Use](https://www.anthropic.com/engineering/advanced-tool-use)
- [OpenAI: Introducing Operator](https://openai.com/index/introducing-operator/)
- [Google: Gemini Computer Use Model](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-computer-use-model/)
- [MCP (Wikipedia)](https://en.wikipedia.org/wiki/Model_Context_Protocol)
- [OpenClaw (GitHub)](https://github.com/openclaw/openclaw)
- [NIST: Securing AI Agent Systems](https://www.nist.gov/news-events/news/2026/01/caisi-issues-request-information-about-securing-ai-agent-systems)
