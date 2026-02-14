# Build Phases

## Overview

Ship fast. OpenClaw was built in 2 weeks. We target the same: working MVP in 2-3 weeks, then iterate.

---

## Phase 1: MVP + Launch (2-3 weeks)

### Goal
Ship a working open-source tool that anyone can install and run. Record a killer demo. Launch on HN and Twitter/X simultaneously. Target: first 500+ GitHub stars.

### Week 1: Core + Demo

- [ ] Agent persona definitions for CEO, CTO, CFO, CMO + 2-3 workers
- [ ] Working hierarchical team: CEO as lead, C-suite as teammates, workers as subagents
- [ ] Single company template: SaaS Startup
- [ ] Agents produce real output (architecture doc, marketing plan, financial model, task breakdown)
- [ ] 60-second "founding moment" screen recording
- [ ] All agent models user-configurable (Opus/Sonnet/Haiku per agent)
- [ ] Add/remove agents dynamically (want a CFO? add it. don't? turn it off)

### Week 2: CLI + Polish

- [ ] `npx aicib init` -- zero-install CLI that scaffolds a company
- [ ] `aicib brief` -- send a directive to the CEO
- [ ] `aicib status` -- see what all agents are doing
- [ ] `aicib add-agent` -- add a new agent to any department
- [ ] `aicib config` -- change models, enable/disable agents
- [ ] Cost tracking per agent
- [ ] README with quick-start, architecture diagram, demo GIF
- [ ] MIT license, public GitHub repo

### Week 3: Launch

- [ ] Hacker News "Show HN" post (10am-12pm ET, Tuesday/Wednesday)
- [ ] Twitter/X demo video thread with the "founding moment" recording
- [ ] Include the OpenAI + Anthropic validation angle (see Marketing doc)
- [ ] Reddit posts (r/artificial, r/LocalLLaMA, r/ChatGPT)
- [ ] Share with 10-20 AI influencers for organic pickup

### Agent Roles (MVP)

**SaaS Startup Template (all models configurable):**

| Role | Default Model | Responsibilities |
|------|--------------|-----------------|
| CEO | Opus | Strategy, delegation, cross-functional alignment |
| CTO | Opus | Architecture, technical decisions, engineering management |
| Backend Engineer | Sonnet | API development, database design, server logic |
| Frontend Engineer | Sonnet | UI implementation, UX, client-side logic |
| CFO | Sonnet | Budget tracking, financial projections, cost analysis |
| CMO | Sonnet | Marketing strategy, content planning, positioning |

Users can add/remove any role and change any model at any time.

### Technical Architecture
- TypeScript monorepo
- Thin orchestration layer (agent config, lifecycle, cost tracking)
- Claude Code agent teams (TeamCreate) + subagents (Task tool) for hierarchy
- Custom agent definitions in `.claude/agents/`
- Config file: `aicib.config.yaml`
- SQLite for state persistence
- npm package distribution

### Success Metrics
- 500+ GitHub stars in first month
- 50+ people actually run it
- Hacker News front page
- At least 5 community bug reports (proves real usage)
- Demo video gets 50K+ views on Twitter/X

---

## Phase 2: Community, Slack & Polish (1-2 months)

### Goal
Build community, add model flexibility, **ship Slack as the first interface outside the terminal**, improve reliability. Target: 5,000 GitHub stars, active Discord.

### Deliverables
- [ ] **Slack Bot (first external interface)** -- your AI company lives in Slack. Each department gets a channel (#ceo, #engineering, #marketing, #finance). You message the CEO like a real employee. Agents post their work in their channels. Fastest path out of the terminal.
- [ ] LiteLLM integration (use any model provider)
- [ ] Ollama support (fully local/free operation)
- [ ] Agent sleep/wake cycles (don't run 24/7 by default)
- [ ] Prompt caching optimization (up to 95% cost reduction)
- [ ] Custom template creator (define your own company structure)
- [ ] Agent memory persistence across sessions
- [ ] Discord community with #showcase channel
- [ ] Contributing guide for community templates
- [ ] 3+ blog posts / Twitter threads showing real use cases
- [ ] Security audit of agent permissions model

### New Templates (Community-Contributed)
- Consulting Firm (Partner, Analysts, Researchers)
- Content Studio (Editor-in-Chief, Writers, SEO Specialist)
- Dev Shop (PM, Designers, Engineers, QA)

### Success Metrics
- 5,000+ GitHub stars
- 100+ Discord members
- 3+ community-contributed templates
- At least 1 tech blog writes about it unprompted
- <$500/month average cost for active users

---

## Phase 3: Cloud & Monetization (2-3 months)

### Goal
Launch hosted cloud version. First paying customers. Target: $5K MRR.

### Deliverables
- [ ] Cloud-hosted version (Railway or Fly.io)
- [ ] User accounts and authentication
- [ ] One-click company deployment (no CLI needed)
- [ ] Real-time dashboard with agent activity, costs, deliverables
- [ ] Human approval queue (review agent decisions before execution)
- [ ] Webhook integrations (Slack notifications, email reports)
- [ ] Usage-based billing (per agent-hour + token usage)
- [ ] Pro tier ($49-99/month): 5 agents, monitoring, basic templates
- [ ] Team tier ($199-499/month): 25 agents, collaboration, all templates
- [ ] Landing page with demo video and pricing
- [ ] Stripe integration for payments
- [ ] Basic analytics (agent performance, task completion rates)

### Infrastructure
- Containerized agent execution (Docker)
- PostgreSQL for multi-tenant state
- Redis for message queuing at scale
- S3/R2 for deliverable storage
- Monitoring: agent health, cost alerts, error tracking

### Success Metrics
- 50+ paying customers
- $5K+ MRR
- <5% churn in first month
- Average session: agents produce 3+ deliverables per brief
- Cloud deployment in <2 minutes

---

## Phase 4: Scale & Enterprise (Ongoing)

### Goal
Expand into enterprise. Grow community. Target: $50K MRR.

### Deliverables
- [ ] Enterprise tier with SSO, audit logs, compliance
- [ ] On-premise deployment option
- [ ] API for programmatic company management
- [ ] Agent marketplace (community agents with ratings)
- [ ] Multi-company management (run 5+ AI companies simultaneously)
- [ ] Advanced analytics (ROI per agent, department efficiency)
- [ ] SOC 2 Type II certification
- [ ] EU AI Act compliance features
- [ ] White-label option for agencies

### Growth Channels
- Developer conferences (talks, workshops)
- YouTube tutorial series
- Partnership with AI tool aggregators
- Affiliate program for influencers
- Enterprise sales team (when >$20K MRR justifies it)

---

## Timeline Summary

```
Week 1:     Core agents + demo video
Week 2:     CLI tooling + polish
Week 3:     LAUNCH (HN + Twitter/X + Reddit)
Month 2-3:  Phase 2 -- Slack integration + community building + model flexibility
Month 4-6:  Phase 3 -- Cloud version + first revenue (web dashboard here)
Month 6+:   Phase 4 -- Enterprise + scale
```

## Immediate Action Items (Before Starting Phase 1)

- [ ] Finalize product name
- [ ] Set up public GitHub repo
- [ ] Create Twitter/X account for the project
- [ ] Set up `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` environment
- [ ] Start building agent persona definitions

---

## Risk Mitigations Built Into Each Phase

| Phase | Primary Risk | Mitigation |
|-------|-------------|------------|
| 0 | Concept doesn't work | Minimal investment; pivot quickly if demo is unconvincing |
| 1 | No traction | Open source de-risks; even 100 stars validates interest |
| 2 | Cost too high for users | Model mixing + caching reduces costs 80-95% |
| 3 | Won't convert to paid | Free tier always exists; cloud is convenience, not necessity |
| 4 | Enterprise competition | Open source moat; community lock-in; model agnosticism |
