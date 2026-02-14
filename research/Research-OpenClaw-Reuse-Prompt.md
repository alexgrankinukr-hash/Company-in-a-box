# Prompt: Analyse Our System + OpenClaw for Reusable Architecture

Copy everything below the line into a new Claude Code conversation.

---

## PROMPT START

You are helping me build an open-source AI agent team product. Before you do ANY research, I need you to first understand what I'm building and share your honest assessment.

### How To Work: Use Agent Teams

**IMPORTANT:** For ALL research and analysis in this prompt, use the Task tool to launch multiple Opus agents in parallel wherever possible. Do NOT do everything sequentially yourself -- that's too slow. For example:

- When reading my 7 project files in Phase 1, launch multiple agents to read and summarise them in parallel
- When analysing OpenClaw in Phase 2, launch separate Opus agents for: (1) reading the Deep Analysis guide, (2) reading the Founder Interview, (3) exploring the GitHub repo -- all at the same time
- When doing the GitHub repo analysis, launch separate agents to explore different parts of the codebase in parallel (architecture, agent definitions, config system, skills system, etc.)
- For the Phase 3 synthesis, you can launch agents to draft different sections in parallel (architecture recommendations, steal-this list, MVP scope, etc.)

Use `model: "opus"` for all agents -- they need to think deeply, not just skim. Launch as many as make sense in each step. The goal is speed AND depth.

After all agents return, synthesise their findings into your final analysis for me.

### Phase 1: Understand My Vision (Do This FIRST)

Read the following files in my project directory to understand what I'm trying to build:

1. **Concept.md** -- The core vision: "AI Company-in-a-Box" -- an open-source orchestration layer that lets anyone spawn a hierarchical team of AI agents structured like a real company (CEO, CTO, CFO, CMO + workers) that autonomously executes business tasks
2. **Build-Phases.md** -- The 4-phase build plan from MVP to enterprise
3. **Implementation-Prompt.md** -- The technical implementation spec (architecture, CLI commands, config format, agent definitions)
4. **Research-Competitive-Landscape.md** -- Analysis of competitors (CrewAI, MetaGPT, AutoGen, etc.)
5. **Research-Market-Opportunity.md** -- Market size data and go-to-market strategy
6. **Research-Technical-Feasibility.md** -- Technical architecture based on Claude Code Agent Teams
7. **Marketing-Launch-Notes.md** -- Launch strategy and messaging

All files are in the current working directory.

After reading ALL of these files, give me your honest analysis:

1. **What do you think of the concept?** Be brutally honest. What's strong, what's weak, what's missing?
2. **How would YOU build this?** If you were the architect, what approach would you take? Where would you agree with my plan and where would you deviate?
3. **What's the realistic MVP?** Given what Claude Code Agent Teams can actually do today (and its limitations), what's the smallest thing I could ship that would demonstrate real value?
4. **What are the biggest technical risks?** What could go wrong? What are the hardest unsolved problems?
5. **What's the most important thing I'm not thinking about?**

Take your time. Think deeply. I want your real opinion, not validation.

### Phase 2: Analyse OpenClaw (Do This AFTER Phase 1)

Now read these two files:

1. **OpenClaw-Deep-Analysis.md** -- A comprehensive 1,300-line guide covering OpenClaw's architecture, how it works, security, business model, community, and lessons learned
2. **OpenClawFounderInterview.md** -- Full transcript of Peter Steinberger's Lex Fridman interview (structured with 21 sections)

After reading both, analyse OpenClaw through the lens of our project:

#### Architecture Reuse

1. **What architectural patterns from OpenClaw can we directly reuse?** Be specific -- which components, which design decisions, which patterns? For example:
   - Their Gateway pattern (single entry point routing to agents)
   - Their JSONL session storage (append-only, crash-safe)
   - Their adapter pattern for multi-channel support
   - Their Skills system (CLI-based, not MCP)
   - Their soul.md personality system
   - Their heartbeat/cron for proactive behaviour
   - Their model routing (cheap models for simple tasks, expensive for complex)
   - Their model failover system
   - Their context compaction approach
   - Their lane queue system (per-session serial execution)

2. **What should we NOT copy from OpenClaw?** What are their architectural mistakes or decisions that don't apply to our use case?

3. **What did they get right that we haven't thought about yet?** Things like:
   - Self-modifying software (agent knows its own source code)
   - No-reply tokens for group contexts
   - Security audit built-in
   - Skills vs MCPs stance ("Screw MCPs. Every MCP would be better as a CLI.")

#### Lessons from Their Journey

4. **What lessons from Steinberger's experience should we apply?**
   - His "agentic engineering" workflow (4-10 agents, voice input, never revert, always commit to main)
   - His "agentic trap" warning (simple prompts > overcomplicated multi-agent orchestration > back to simple)
   - His view that human taste/vision is irreplaceable
   - His security-first pivot after initial neglect
   - His Skills vs MCPs architectural decision
   - His approach to open source community building
   - His burnout and sustainability warnings

5. **What risks does OpenClaw's story highlight for us?**
   - Bus factor of 1
   - Security as afterthought
   - No business model
   - Skills marketplace poisoning
   - The naming/trademark lesson

#### The GitHub Repository

6. **Explore the OpenClaw GitHub repository** (https://github.com/openclaw/openclaw) and identify:
   - Specific code we could study or adapt (not copy, since licenses may differ)
   - Their project structure and how it maps to our needs
   - Their agent definition format and how it compares to Claude Code's `.claude/agents/` format
   - Their config system and what we can learn from it
   - How they handle multi-agent coordination vs how we plan to
   - Their testing approach and coverage

### Phase 3: Synthesis and Recommendations

After completing both phases, give me:

1. **A revised architecture recommendation** -- How should we build this, incorporating the best of OpenClaw's patterns and avoiding their mistakes?

2. **A "steal this" list** -- The top 10 specific things we should adopt from OpenClaw (patterns, not code)

3. **A "don't repeat this" list** -- The top 5 mistakes from OpenClaw we must avoid

4. **A revised MVP scope** -- What should the absolute minimum first version look like, informed by everything you've learned?

5. **The one thing that matters most** -- If you had to pick the single most important decision or priority for this project, what would it be?

### Important Notes

- I am non-technical. Explain everything in plain language.
- Be honest and critical, not encouraging. I need real analysis, not cheerleading.
- When referencing OpenClaw patterns, explain them simply -- don't assume I know what "JSONL" or "WebSocket Gateway" means without explanation.
- If something in my concept is unrealistic or naive, say so directly.
- Focus on what's ACTUALLY achievable with today's tools, not what sounds good on paper.
- Remember that OpenClaw is a SINGLE personal agent. We're building TEAMS of agents. The architecture needs are fundamentally different in some ways and similar in others -- be specific about which.

## PROMPT END
