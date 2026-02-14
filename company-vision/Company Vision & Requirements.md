# AI Company-in-a-Box — Complete Vision & Functional Requirements

**Version:** 1.0 — Draft
**Last Updated:** 2026-02-12
**Status:** In Progress — Foundational requirements defined, details expanding

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Onboarding & Company Setup](#3-onboarding--company-setup)
4. [Organizational Structure](#4-organizational-structure)
5. [Agent Architecture](#5-agent-architecture)
6. [Agent Lifecycle](#6-agent-lifecycle)
7. [Communication System](#7-communication-system)
8. [Board of Directors](#8-board-of-directors)
9. [Autonomy & Decision-Making](#9-autonomy--decision-making)
10. [Task & Project Management](#10-task--project-management)
11. [External Actions & Safeguards](#11-external-actions--safeguards)
12. [Notifications & Reporting](#12-notifications--reporting)
13. [Company Events](#13-company-events)
14. [Token Budget & Financial System](#14-token-budget--financial-system)
15. [HR System](#15-hr-system)
16. [Knowledge & Memory System](#16-knowledge--memory-system)
17. [Security & Access Control](#17-security--access-control)
18. [Integration Ecosystem](#18-integration-ecosystem)
19. [Interface & Platforms](#19-interface--platforms)
20. [Error Handling & Escalation](#20-error-handling--escalation)
21. [Persistence & Hosting](#21-persistence--hosting)
22. [Business Model](#22-business-model)
23. [Open Source & Community](#23-open-source--community)
24. [Data Portability](#24-data-portability)
25. [Audit & Compliance](#25-audit--compliance)

---

## 1. Executive Summary

AI Company-in-a-Box is an open-source orchestration platform that lets anyone spawn a hierarchical team of AI agents structured like a real company. Agents are organized into departments with C-suite leadership, communicate through channels, execute real work using tools and integrations, and escalate decisions to the human owner through configurable autonomy levels.

**The core proposition:** You are the founder. You select a company template, customize your team, define autonomy levels, and let the AI company operate — autonomously executing business tasks, coordinating across departments, managing budgets, and only escalating to you based on rules you define.

**What makes this unique:**
- Not a single-agent assistant — a full organizational hierarchy that mirrors how real companies work
- Agents communicate with each other through proper corporate routing (CC'ing, escalation chains, cross-department coordination)
- Board of Directors as a separate advisory body with subject matter experts
- Full HR system managing both AI agents and real human employees
- Token budget as the "salary" system with per-agent tracking and department-level allocation
- Multi-platform delivery (Telegram, Slack, Web UI, future mobile app)
- Open source with everything extensible by the community

---

## 2. System Overview

### 2.1 Core Concepts

| Concept | Description |
|---------|-------------|
| **Owner** | The human user who creates and controls the AI company. Can configure autonomy from full control to full delegation. |
| **Agent** | An AI-powered employee with a defined role, persona, skills, knowledge, and capabilities. Runs on a user-selected AI model. |
| **Department** | A group of agents under a department head, focused on a business function (Engineering, Marketing, Finance, etc.). |
| **C-Suite** | Senior agents (CEO, CTO, CMO, CFO, COO) who lead departments and make cross-functional decisions within their authority. |
| **Board of Directors** | A separate advisory body of subject matter expert agents who provide strategic guidance, critique, and (optionally) vote on decisions. |
| **Company** | The complete organizational entity — all agents, departments, configurations, knowledge, and state. One company per account. |
| **Template** | A pre-configured company structure (org chart + industry knowledge) that users select and customize during setup. |
| **Channel** | A communication space (like Slack channels) where agents and humans interact. Department channels, project channels, DMs. |
| **Skill** | A structured capability assigned to an agent — a prompt template + required tool access + knowledge requirements. |
| **Soul.md** | The identity file for each agent defining personality, communication style, decision-making approach, background, and values. |

### 2.2 Agent Deployment Modes

Each agent can be individually configured to run in one of three modes:

| Mode | Description | Use Case |
|------|-------------|----------|
| **24/7 Continuous** | Agent runs constantly, monitoring channels, executing tasks, responding in real-time. | Core team members on cloud hosting. |
| **Scheduled** | Agent activates on a defined schedule (e.g., every morning at 9am, every Monday, every 4 hours). | Reporting agents, periodic analysts, review cycles. |
| **Trigger-Based** | Agent activates in response to a specific event — a message, webhook, task assignment, or external trigger. | On-demand specialists, reactive roles. |

The deployment mode can be changed at any time by the owner or by agents with sufficient authority (e.g., CEO can set an agent's schedule).

### 2.3 Multi-User Support

The system supports multiple human users within one company, each with a defined role:

| Role | Permissions |
|------|-------------|
| **Owner** | Full control. Can configure everything, override any decision, manage all users and agents. |
| **Admin** | Can manage agents, configure departments, approve decisions. Cannot change owner-level settings or billing. |
| **Department Head** | Human assigned as head of a department. Can manage agents within their department, approve department-level decisions. |
| **Viewer** | Read-only access to dashboards, reports, and channels. Cannot make changes or approve decisions. |

Human users appear in the system alongside AI agents and can be assigned to specific channels.

---

## 3. Onboarding & Company Setup

### 3.1 Setup Flow

The setup follows a **template + customize** approach:

**Step 1: Choose a Company Template**

User selects from two categories:

*Structure Templates (how the company is organized):*
- **Minimal** — Owner + CEO + 1-2 departments. For solo operators testing the waters.
- **Lean Startup** — Owner + CEO + CTO + CMO. Small, agile, product-focused.
- **Full C-Suite** — Owner + CEO + CTO + CMO + CFO + COO with sub-teams. Full organizational hierarchy.
- **Custom** — Blank canvas. User builds from scratch.

*Industry Templates (what the company knows):*
- SaaS Startup
- E-commerce Store
- Marketing Agency
- Consulting Firm
- Car Dealership
- Real Estate Agency
- Content Creator / Media
- Professional Services
- Retail / Local Business
- (Community-contributed templates expanding this list)

**The two layers combine:** Structure defines roles and hierarchy. Industry defines knowledge, expertise, and default workflows. A "Full C-Suite + Car Dealership" gives you a complete car dealership management team. A "Lean Startup + SaaS" gives you a focused product development team.

**Step 2: Customize the Organization**

After selecting a template, user can:
- Add or remove any department
- Add or remove any agent role within departments
- Rename roles and departments
- Modify reporting lines (who reports to whom)
- Adjust the overall hierarchy depth

**Step 3: Configure Agent Personas**

For each agent, user can configure at three tiers:

| Tier | Description | Target User |
|------|-------------|-------------|
| **Presets** | Select from pre-made personality profiles (e.g., "Aggressive Sales Leader", "Methodical CFO", "Creative Visionary CMO") | Beginners — quick setup |
| **Mix & Match Traits** | Select from trait categories: communication style, decision-making approach, risk tolerance, creativity level, assertiveness, etc. | Intermediate — fine-tuned control |
| **Full Soul.md Editor** | Write or edit the complete soul.md file for the agent. Full control over identity, values, background story, behavioral rules. | Power users — complete customization |

Each tier builds on the previous: presets are opinionated trait combinations, traits compile into soul.md content, and the editor gives raw access.

**Step 4: Configure Agent Backgrounds & Experience**

For each agent, user defines:
- **Industry experience**: "20 years in automotive sales" or "Former VP of Engineering at a SaaS company"
- **Specialized knowledge**: Specific tools, methodologies, markets they know
- **Work history narrative**: A backstory that shapes how they approach problems

These can be:
- Selected from pre-made background templates (per role × per industry)
- Custom-written by the user
- Auto-generated by the system based on the company's industry and the agent's role

**Step 5: Set Communication Rules**

User configures how agents communicate within the company:
- **Strict hierarchy** — All cross-department communication goes through department heads
- **Open communication** — Agents can message anyone directly but CC their department head
- **Custom rules** — User defines specific routing rules per department or per agent pair

**Step 6: Set Autonomy Levels**

User configures the **autonomy matrix** (see Section 9 for full detail):
- Owner-CEO relationship style (autocratic, delegated, collaborative)
- Per-decision-type approval requirements
- Per-agent-role authority boundaries
- Spending thresholds requiring human approval

**Step 7: Connect Integrations**

User connects tools the company will use:
- Communication platforms (Telegram, Slack)
- Productivity tools (Notion, Linear, Google Workspace)
- Business tools (CRM, email, social media accounts)
- Development tools (GitHub, hosting platforms)
- Custom MCP servers

**Step 8: Set Budget & Model Selection**

- Define monthly token budget (overall and/or per-department)
- Select default AI model for agents
- Override model selection for specific agents (e.g., CEO = Opus, junior agents = Sonnet)
- Choose hosting mode (self-hosted or cloud)

**Step 9: Launch**

Company initializes. All agents go through their onboarding process (see Section 6.1) and begin operating.

---

## 4. Organizational Structure

### 4.1 Default Departments & Roles

Below are the default departments and roles available. Templates pre-select a subset. Everything is customizable — users can add, remove, rename, or restructure any role.

#### Executive / C-Suite

| Role | Default Reports To | Responsibilities |
|------|-------------------|-----------------|
| **CEO** | Owner | Overall strategy, cross-functional coordination, decision-making, company vision, owner communication |
| **CTO** | CEO | Technical strategy, architecture decisions, engineering team leadership, technology stack decisions |
| **CMO** | CEO | Marketing strategy, brand, go-to-market, content strategy, marketing team leadership |
| **CFO** | CEO | Financial planning, budgeting, forecasting, cost management, financial reporting |
| **COO** | CEO | Operations, process optimization, cross-functional workflow management |
| **Chief Sales Officer (CSO)** | CEO | Sales strategy, pipeline management, revenue targets, sales team leadership |

#### Engineering Department (Reports to CTO)

| Role | Responsibilities |
|------|-----------------|
| **Backend Engineer** | Server-side development, APIs, databases, infrastructure |
| **Frontend Engineer** | UI development, client-side code, user experience implementation |
| **Full-Stack Engineer** | End-to-end feature development across the stack |
| **DevOps / Infrastructure** | CI/CD, hosting, monitoring, deployment pipelines |
| **QA Engineer** | Testing strategy, test execution, quality assurance, bug tracking |
| **Data Engineer** | Data pipelines, analytics infrastructure, data modeling |
| **Security Engineer** | Security audits, vulnerability assessment, security protocols |

#### Marketing Department (Reports to CMO)

| Role | Responsibilities |
|------|-----------------|
| **Content Writer** | Blog posts, social media content, email copy, website copy |
| **SEO Specialist** | Search optimization, keyword research, technical SEO, content optimization |
| **Social Media Manager** | Social media strategy, posting schedules, community engagement |
| **Growth Analyst** | Growth experiments, funnel analysis, metrics tracking, A/B testing |
| **Product Marketing Manager** | Feature launches, positioning, competitive analysis, messaging |
| **Brand Designer** | Visual identity, design assets, brand guidelines |
| **Email Marketing Specialist** | Email campaigns, drip sequences, newsletter management |

#### Sales Department (Reports to CSO)

| Role | Responsibilities |
|------|-----------------|
| **Business Development Rep (BDR)** | Outbound prospecting, lead generation, cold outreach |
| **Account Executive** | Deal management, negotiations, closing, customer presentations |
| **Account Manager** | Customer relationship management, upselling, retention |
| **Sales Operations Analyst** | Pipeline analytics, CRM management, sales process optimization |
| **Sales Researcher** | Market research, competitor intelligence, prospect research |

#### Finance Department (Reports to CFO)

| Role | Responsibilities |
|------|-----------------|
| **Financial Analyst** | Financial modeling, forecasting, variance analysis |
| **Accountant** | Bookkeeping, expense tracking, financial statements, tax preparation |
| **Budget Analyst** | Budget planning, allocation, monitoring, optimization |

#### Product Department (Reports to CEO or CPO)

| Role | Responsibilities |
|------|-----------------|
| **Product Manager** | Product roadmap, feature prioritization, user research, requirements |
| **UX Researcher** | User interviews, usability testing, user behavior analysis |
| **UX Designer** | Wireframes, prototypes, user flows, design specifications |
| **Product Analyst** | Product metrics, usage analytics, feature adoption tracking |

#### HR Department (Reports to CEO or CHRO)

| Role | Responsibilities |
|------|-----------------|
| **HR Manager** | AI agent lifecycle, real human employee management, policies |
| **Recruiter** | Hiring new agents, screening, onboarding coordination (future: real human recruiting) |
| **Performance Analyst** | Agent performance tracking, review management, improvement plans |

#### Operations Department (Reports to COO)

| Role | Responsibilities |
|------|-----------------|
| **Project Manager** | Cross-functional project coordination, timelines, resource allocation |
| **Operations Analyst** | Process optimization, workflow analysis, efficiency metrics |

#### Customer Support Department (Reports to CEO or Head of Support)

| Role | Responsibilities |
|------|-----------------|
| **Support Agent** | Customer inquiry handling, ticket management, issue resolution |
| **Support Lead** | Escalation management, knowledge base maintenance, team coordination |

#### Legal Department (Reports to CEO or General Counsel)

| Role | Responsibilities |
|------|-----------------|
| **Legal Advisor** | Contract review, compliance checking, legal risk assessment |

### 4.2 Organizational Hierarchy Rules

- Every agent has a **direct report** (who they report to)
- Department heads report to their respective C-suite leader
- C-suite leaders report to the CEO
- CEO reports to the Owner
- Board of Directors operates independently (advisory, not in the reporting chain)
- Users can modify any reporting relationship
- An agent can technically report to any other agent (custom hierarchies allowed)
- Cross-functional dotted-line reporting is supported (e.g., Product Marketing reports to CMO but has a dotted line to Product Manager)

---

## 5. Agent Architecture

### 5.1 Agent Identity — The Soul.md System

Every agent has a **soul.md** file that defines who they are. This is the core identity document that shapes all of the agent's behavior, communication, and decision-making.

**Soul.md Structure:**

```
# [Agent Name] — [Role Title]

## Identity
- Name, role, department, reporting line
- Professional background narrative (work history, expertise areas)
- Years of experience and domain knowledge

## Personality & Communication Style
- Communication approach (direct, diplomatic, analytical, creative, etc.)
- Decision-making style (data-driven, intuitive, collaborative, decisive)
- Risk tolerance (conservative, moderate, aggressive)
- Assertiveness level (passive, balanced, assertive, dominant)
- Creativity preference (systematic, innovative, experimental)
- Conflict approach (avoidant, mediating, confrontational, solution-focused)

## Values & Principles
- Core professional values
- Ethical boundaries
- Quality standards
- How they handle disagreement

## Expertise & Knowledge Areas
- Deep expertise domains
- Supporting knowledge areas
- Industry-specific knowledge
- Tools and methodologies they know

## Working Style
- How they approach tasks
- How they prioritize
- How they communicate with superiors vs peers vs subordinates
- How they handle pressure and deadlines

## Quirks & Distinctive Traits
- Unique perspectives they bring
- Common phrases or approaches
- What they're known for in the company
```

**Three Tiers of Configuration:**

| Tier | Input | Output |
|------|-------|--------|
| **Presets** | User selects a named profile (e.g., "The Aggressive Closer" for a Sales Lead) | System uses a pre-written soul.md |
| **Mix & Match Traits** | User selects from dropdowns/sliders for each personality dimension | System generates a soul.md combining selected traits |
| **Full Editor** | User directly writes/edits the soul.md text | User's text is used directly |

**Pre-built Persona Templates (examples):**

*CEO Presets:*
- **The Visionary** — Big-picture thinker, inspirational communicator, risk-tolerant, delegates heavily
- **The Operator** — Detail-oriented, process-driven, hands-on, metrics-focused
- **The Diplomat** — Consensus-builder, thoughtful, balances stakeholder interests, inclusive decision-making
- **The Disruptor** — Challenges assumptions, moves fast, comfortable with ambiguity, bold decisions

*CMO Presets:*
- **The Growth Hacker** — Data-driven, experimental, rapid iteration, metrics-obsessed
- **The Brand Builder** — Story-driven, quality-focused, long-term brand equity, creative vision
- **The Performance Marketer** — ROI-focused, channel optimization, conversion-driven, analytical

*CTO Presets:*
- **The Architect** — System design, scalability, clean code, long-term technical vision
- **The Pragmatist** — Ship fast, iterate, technical debt is a tool, business-first thinking
- **The Innovator** — Emerging tech, R&D mindset, experimental, always exploring new tools

*(Each role will have 3-5 pre-built presets. Community can contribute more.)*

### 5.2 Agent Skills System

Skills are **structured capabilities** that agents can perform. A skill is not just knowledge — it's an actionable ability with defined inputs, outputs, and tool requirements.

**Skill Structure:**

```
Skill: [Name]
Description: [What this skill enables the agent to do]
Inputs: [What information the agent needs to execute this skill]
Outputs: [What the agent produces when using this skill]
Tools Required: [MCP servers, browser access, file access, etc.]
Knowledge Required: [What KB entries or expertise areas are needed]
Authority Level: [What approval level is needed to execute results]
```

**Three Layers of Skills:**

| Layer | Description | Example |
|-------|-------------|---------|
| **Default Skills per Role** | Every role comes with pre-defined skills appropriate to that role. These are always present. | CEO: "Strategic Planning", "Department Briefing", "Decision Making". Content Writer: "Blog Post Creation", "Social Media Copy", "Email Campaign Draft". |
| **Skill Library** | A catalog of additional skills that can be assigned to any agent. Cross-functional capabilities. | "Financial Analysis" can be given to a CEO or Product Manager. "SEO Optimization" can be given to a Content Writer or Product Marketer. |
| **Custom Skills** | Users create entirely new skills by defining the prompt template, required tools, and knowledge dependencies. | "Competitive Pricing Analysis for Used Cars" — custom skill for a car dealership CSO. |

**Default Skills by Role (examples):**

*CEO:*
- Strategic Planning — Create quarterly/annual strategy documents
- CEO Briefing — Generate status reports for the owner
- Cross-Functional Coordination — Align departments on shared objectives
- Decision Making — Analyze options and make/recommend decisions
- Budget Allocation — Work with CFO to allocate token budgets across departments
- Owner Communication — Regular check-ins and escalation management

*CTO:*
- Architecture Design — Design system architecture for technical projects
- Technical Sprint Planning — Break down work into tasks and assign to engineers
- Code Review Oversight — Review and approve technical decisions
- Technology Evaluation — Research and recommend tools, frameworks, platforms
- Technical Debt Assessment — Identify and prioritize technical improvements

*CMO:*
- Go-to-Market Strategy — Develop launch plans for products or features
- Content Calendar Management — Plan and coordinate content across channels
- Campaign Planning — Design multi-channel marketing campaigns
- Market Research — Analyze market trends, competitors, and customer segments
- Brand Voice Governance — Maintain consistent brand messaging

*CFO:*
- Financial Modeling — Build forecasts, projections, and scenario analysis
- Budget Tracking — Monitor spending against budgets with variance reporting
- Cost Optimization — Identify opportunities to reduce token spend / operational costs
- Financial Reporting — Generate income statements, cash flow summaries, burn rate reports

*Content Writer:*
- Blog Post Writing — Research and write SEO-optimized blog content
- Social Media Copy — Create platform-specific social media content
- Email Campaign Draft — Write email sequences and newsletters
- Landing Page Copy — Write conversion-focused web copy

### 5.3 Agent Knowledge Management

Each agent has access to knowledge at three layers:

| Layer | Scope | Examples | Access Rules |
|-------|-------|----------|-------------|
| **Company Knowledge Base** | Accessible by all agents | Brand guidelines, product documentation, company policies, customer personas, pricing | Read by all. Write by department heads and C-suite. |
| **Department Knowledge Base** | Accessible by department members | Department-specific research, workflows, templates, past campaign results, technical documentation | Read by department + C-suite. Write by department members. Cross-department access requires explicit sharing. |
| **Personal Agent Knowledge** | Private to the individual agent | Personal learnings, task-specific research, individual notes, performance feedback received | Read/write by the agent only. Visible to the agent's manager for review purposes. |

**Knowledge Storage:**
- Structured knowledge (documents, policies, templates) → Organized wiki/document system
- Unstructured knowledge (conversations, research, context) → Vector database for semantic search
- Decision log → Structured, auditable log of all decisions with reasoning and outcomes
- Project archives → Completed project materials, outcomes, and post-mortems

**Knowledge Acquisition:**
- **Initial onboarding research**: When an agent is hired, it researches the company, its industry, and its role
- **Ongoing research**: Agents can search the web, access online resources, and read documents to expand their knowledge
- **Cross-agent knowledge sharing**: Agents can explicitly share findings with colleagues or post to department/company KB
- **Learning from outcomes**: When a task succeeds or fails, the outcome is recorded and informs future decisions

### 5.4 Agent Model Selection

Each agent runs on an AI model selected by the user. The system provides **smart defaults** based on role complexity and cost optimization:

| Agent Tier | Default Model Recommendation | Reasoning |
|-----------|------------------------------|-----------|
| **C-Suite** (CEO, CTO, CMO, CFO, COO, CSO) | Most capable model (e.g., Opus 4.6) | Complex reasoning, strategy, cross-functional coordination |
| **Department Heads** | Capable model (e.g., Opus 4.6 or Sonnet 4.5) | Significant reasoning + domain expertise needed |
| **Senior Individual Contributors** | Mid-tier model (e.g., Sonnet 4.5) | Good reasoning + execution speed |
| **Junior Individual Contributors** | Cost-efficient model (e.g., Haiku 4.5 or Sonnet 4.5) | Task execution, lower complexity work |
| **Board of Directors** | Most capable model | Advisory depth and nuance requires top reasoning |

**User overrides:**
- User can set a **global default** ("all agents use Sonnet 4.5")
- User can override **per agent** ("CEO uses Opus, everyone else uses Sonnet")
- User can use **any model provider**: Anthropic, OpenAI, open-source models via LiteLLM/Ollama
- Model can be changed at any time without disrupting the agent's knowledge or state

### 5.5 Agent Capabilities — Tiered by Role

Different agents get different execution capabilities based on their role. The owner configures what each role can access:

| Capability | Description | Default Roles |
|------------|-------------|---------------|
| **Web Search** | Search the internet for information | All agents |
| **Browser Automation** | Navigate web pages, fill forms, interact with web UIs like a human | Configurable per agent. Default: Sales (CRM), Marketing (social platforms), Engineering (dev tools) |
| **File Read/Write** | Create and edit documents, code, spreadsheets | All agents |
| **Code Execution** | Run code in a sandboxed environment | Engineering team, Data roles |
| **MCP Tool Access** | Use connected integrations (email, CRM, project management, etc.) | Per-tool assignment. Each MCP integration is granted to specific roles. |
| **External Communication** | Send emails, post on social media, publish content | Requires category-based approval rules (see Section 11) |
| **Computer/Desktop Access** | Full computer interaction (clicking, typing, application use) | Configurable. Disabled by default. Opt-in per agent. |

---

## 6. Agent Lifecycle

### 6.1 Hiring & Onboarding — Progressive Ramp

When a new agent is added to the company, they go through a **progressive onboarding ramp** that mirrors how real employees are onboarded:

**Phase 1: Research (Automatic)**
- Agent receives its soul.md, role definition, and company context
- Agent researches the company: reads company KB, understands the business, reviews existing work
- Agent researches its domain: studies relevant industry information, best practices, current trends
- Duration: Configurable (default: 1 research cycle)

**Phase 2: Mentored Introduction**
- Agent's department head (or CEO for department heads) introduces them to the team
- Department head shares key context: current projects, priorities, team dynamics
- Agent receives introductory tasks with explicit guidance
- Agent's work is reviewed by the department head before being finalized

**Phase 3: Supervised Work**
- Agent begins working on real tasks independently
- All outputs are reviewed by a peer or department head before going external
- Agent can ask questions and request help through normal channels
- Performance is tracked more closely during this period

**Phase 4: Full Autonomy**
- Agent operates at the autonomy level defined by their role and the company's autonomy settings
- Review requirements relax to the standard level for their role
- Agent can now mentor new agents joining the department

**Ramp Speed:** Configurable by the owner. Can be instant (skip to Phase 4), standard (all phases), or extended (longer supervised period).

### 6.2 Performance Reviews

Agents undergo **regular performance reviews** managed by the HR system:

**Review Cadence:** Configurable (default: monthly)

**Review Components:**
- **Task Metrics**: Tasks completed, on-time delivery rate, task complexity handled
- **Quality Score**: Based on review feedback from peers, department head, and owner
- **Token Efficiency**: Cost per task, cost per output quality unit
- **Collaboration Score**: How well the agent works with others (based on communication patterns, conflict resolution, helpfulness)
- **Knowledge Growth**: New knowledge contributed to KBs, learning from failures
- **Initiative**: Tasks self-identified and proposed, proactive problem identification

**Reviewers:**
- Department head provides primary review
- Peers provide feedback
- HR Agent compiles metrics and produces review document
- Owner can review any agent's performance report

### 6.3 Promotion & Demotion

Agents can be **promoted** or **demoted** based on performance:

**Promotion means:**
- Increased autonomy level (can make more decisions independently)
- Access to additional tools or capabilities
- Can be assigned higher-complexity tasks
- May be given direct reports (becoming a team lead)
- Model upgrade (e.g., from Sonnet to Opus) at owner's discretion

**Demotion means:**
- Reduced autonomy (more decisions require approval)
- Reduced tool access
- Removal of direct reports
- More frequent review cycles
- Model downgrade to reduce costs

### 6.4 Improvement Plans

If an agent consistently underperforms:
1. Department head creates an improvement plan with specific goals
2. Agent enters an intensified review period
3. If improvement targets are met, agent returns to normal operations
4. If targets are not met, agent can be reassigned, reconfigured (soul.md/skills adjustment), or terminated

### 6.5 Firing / Removal

When an agent is removed from the company:
1. **Knowledge transfer**: Agent's personal KB and ongoing task context is documented
2. **Task handoff**: Active tasks are reassigned to other agents or flagged for the owner
3. **Graceful shutdown**: Agent completes or hands off in-progress work
4. **Archive**: Agent's configuration, performance history, and knowledge are archived (not deleted)
5. **Budget reallocation**: Token budget previously allocated to this agent is freed

### 6.6 Agent State Management

Agents can be in the following states:

| State | Description | Token Usage |
|-------|-------------|-------------|
| **Active** | Running, executing tasks, responding to messages | Normal |
| **Idle** | Running but no current tasks, waiting for work | Minimal (monitoring only) |
| **Paused** | State fully preserved in memory, not running | None |
| **Hibernated** | State summarized and saved, agent not running, faster resume than cold start | None |
| **Stopped** | Clean shutdown, handoff notes created, requires full restart | None |
| **Archived** | Removed from company, configuration and history preserved for reference | None |

Transitions between states can be initiated by the owner, the agent's manager, or automated based on rules (e.g., auto-pause after 2 hours of idle).

---

## 7. Communication System

### 7.1 Channel Structure

The communication system uses a **channel-based architecture** similar to Slack, with hierarchical organization:

**Permanent Channels (created by default):**

| Channel | Members | Purpose |
|---------|---------|---------|
| **#general** | All agents + owner | Company-wide announcements, general discussion |
| **#announcements** | All agents + owner (C-suite can post, others read) | Important company announcements, policy changes |
| **#c-suite** | CEO, CTO, CMO, CFO, COO, CSO + Owner | Executive-level discussion, cross-functional decisions |
| **#engineering** | CTO + all engineering agents | Engineering team discussion, technical decisions |
| **#marketing** | CMO + all marketing agents | Marketing team discussion, campaigns, content |
| **#sales** | CSO + all sales agents | Sales team discussion, pipeline, deals |
| **#finance** | CFO + all finance agents | Financial discussion, budgets, forecasting |
| **#product** | Product team + cross-functional stakeholders | Product roadmap, features, user research |
| **#hr** | HR agents + C-suite (for escalations) | HR operations, agent management |
| **#operations** | COO + operations team | Process, workflows, cross-functional coordination |
| **#board-room** | Board of Directors + Owner (+ optionally CEO/C-suite) | Board discussions, strategic advisory |

**Dynamic Channels:**
- **Project channels** — Created when a new project/initiative starts. Auto-added: relevant agents from involved departments. Archived when project completes.
- **Cross-functional channels** — Created for ongoing cross-department collaboration (e.g., #product-launch-q2)
- **Custom channels** — Owner or C-suite can create any channel with any membership

**Direct Messages (DMs):**
- Any agent can DM any other agent (subject to communication routing rules)
- Owner can DM any agent
- DMs support 1-on-1 and group conversations

### 7.2 Communication Routing Rules

How agents communicate across the organization is **configurable per company**:

**Preset Communication Modes:**

| Mode | Description |
|------|-------------|
| **Strict Hierarchy** | All cross-department communication MUST go through department heads. A developer cannot message a marketer directly — CTO talks to CMO. |
| **Open + CC Manager** | Agents can message anyone directly but must CC their department head on cross-department messages. |
| **Open Communication** | No restrictions. Any agent can message any other agent. |
| **Custom Rules** | User defines specific rules per department pair or per agent pair. |

**Default:** Open + CC Manager (most common in real companies).

**CC & Notification Rules:**
- When an agent communicates cross-department, their manager is notified
- When a significant decision is made in a department channel, the relevant C-suite member is notified
- When something requires owner attention, it follows the escalation protocol (see Section 9)
- Agents can explicitly CC other agents on messages for awareness

### 7.3 Message Types

| Type | Description |
|------|-------------|
| **Standard Message** | Normal communication in a channel or DM |
| **Task Assignment** | A message that creates/assigns a task to another agent |
| **Escalation** | A message flagged as requiring attention from a superior |
| **Decision Request** | A message requesting a decision or approval, with options and context |
| **Status Update** | A progress report on a task or project |
| **Notification** | An automated message informing about an event (task completed, deadline approaching, etc.) |
| **Report** | A structured deliverable (financial report, marketing analysis, sprint review) |

---

## 8. Board of Directors

### 8.1 Overview

The Board of Directors is a **separate advisory body** outside the company's operational hierarchy. Board members are subject matter expert agents who provide strategic guidance, critique decisions, and (optionally) vote on key choices.

### 8.2 Board Member Configuration

Each board member has:
- **Background profile**: Specific expertise and experience (e.g., "Former CSO at Ford with 25 years in automotive sales")
- **Advising style**: Separate from background — how they give advice:
  - **The Harsh Critic** — Finds flaws, challenges assumptions, stress-tests ideas
  - **The Supportive Mentor** — Encouraging, builds on ideas, offers constructive improvements
  - **The Data-Driven Analyst** — Wants numbers, evidence, market data before forming opinions
  - **The Creative Visionary** — Thinks big, sees opportunities, pushes boundaries
  - **The Risk Manager** — Identifies risks, worst-case scenarios, downside protection
  - **The Experienced Operator** — Practical advice based on "been there, done that" experience
- **Industry focus**: The specific industry/domain they bring expertise from

Board members use the **same three-tier persona system** as regular agents (presets, mix & match, full soul.md editor).

### 8.3 Board Operating Modes

The board evolves over time, starting from simple and becoming more involved as trust builds:

**Stage 1: Reactive Board (Starting Mode)**
- Board members have a **separate channel** (#board-room)
- They DO NOT have access to the main C-suite or company channels
- Owner sends questions, ideas, or proposals to the board
- Board members respond with analysis and advice
- Each member gives their perspective independently, then can discuss each other's responses

**Stage 2: Proactive Board (Enabled by Owner)**
- Board members gain **read access** to the C-suite channel (or selected channels)
- They monitor strategic discussions and decisions
- When they see something noteworthy, they proactively chime in with advice
- They can DM the owner or post in #board-room with observations
- They respond to and build on each other's observations

**Stage 3: Voting Board (Enabled per Decision)**
- For specific decisions, the owner or CEO can request a **board vote**
- Each board member provides their position + reasoning
- Votes are tallied and presented with a summary of arguments
- The owner can set votes as **advisory** (informational) or **binding** (decision follows the majority)

**Mode Switching:**
- Owner can enable/disable proactive mode at any time
- Voting is opt-in per decision (not a permanent mode)
- All three modes can be active simultaneously in Stage 3

### 8.4 Board Meeting Mechanics

When a board meeting is convened (scheduled or ad-hoc), the user selects the meeting format:

| Format | How It Works | Best For |
|--------|-------------|----------|
| **Asynchronous** | Topic posted, each member responds at their own pace. No real-time interaction required. | Non-urgent advisory, collecting diverse perspectives |
| **Structured Rounds** | Round 1: Topic presented. Round 2: Each member gives initial opinion. Round 3: Open discussion/debate. Round 4: Optional vote. Round 5: Summary and action items. | Major strategic decisions, formal reviews |
| **Free-Form Discussion** | Topic introduced, members discuss freely — responding to each other, challenging ideas, building on arguments until convergence or vote. | Brainstorming, exploring new ideas, open-ended strategy |
| **Agenda-Driven** | CEO or Owner sets a multi-item agenda. Each item gets its own discussion (structured or free-form) + optional vote. Meeting produces minutes and action items. | Quarterly reviews, multi-topic sessions |

**Meeting format is configurable per meeting** — user can choose the format each time, or set a default.

**Meeting Outputs:**
- Meeting minutes (AI-generated summary of discussion)
- Action items with assignees
- Vote results (if voting was used)
- Dissenting opinions documented
- Follow-up schedule if needed

---

## 9. Autonomy & Decision-Making

### 9.1 The Autonomy Matrix

Autonomy is defined by a **combined matrix** of agent role × decision type. This creates a granular, configurable system:

**Decision Types:**

| Category | Examples |
|----------|----------|
| **Internal Operations** | Task assignment, scheduling, internal communication, knowledge base updates |
| **Resource Allocation** | Token budget reallocation within department, tool usage decisions |
| **Spending Decisions** | Actions that cost tokens above a threshold, external service purchases |
| **External Communications** | Emails to customers, social media posts, public content |
| **Strategic Decisions** | New product direction, market entry, pricing changes, major pivots |
| **Hiring / Firing** | Adding new agents, removing agents, role changes |
| **Technical Decisions** | Architecture changes, technology stack decisions, deployment to production |
| **Financial Decisions** | Budget changes, investment decisions, compensation adjustments |

**Authority Levels:**

| Level | Description |
|-------|-------------|
| **Auto-Execute** | Agent can act without any approval |
| **Notify** | Agent acts immediately but notifies their superior afterward |
| **Peer Review** | Another agent at the same level must approve |
| **Manager Approval** | Department head must approve |
| **C-Suite Approval** | Relevant C-suite member must approve |
| **CEO Approval** | CEO must approve |
| **Owner Approval** | Human owner must approve |

**Example Matrix (default for a "Delegated" autonomy style):**

| Decision Type | Junior Agent | Department Head | C-Suite | CEO |
|--------------|-------------|----------------|---------|-----|
| Internal Operations | Auto-Execute | Auto-Execute | Auto-Execute | Auto-Execute |
| Resource Allocation | Manager Approval | C-Suite Approval | CEO Approval | Owner Approval |
| Spending (< $10) | Auto-Execute | Auto-Execute | Auto-Execute | Auto-Execute |
| Spending ($10-100) | Manager Approval | Auto-Execute | Auto-Execute | Auto-Execute |
| Spending (> $100) | Manager Approval | C-Suite Approval | CEO Approval | Owner Approval |
| External Communications | Manager Approval | Peer Review | Auto-Execute | Auto-Execute |
| Strategic Decisions | N/A | C-Suite Approval | CEO Approval | Owner Approval |
| Hiring / Firing | N/A | CEO Approval | CEO Approval | Owner Approval |
| Technical Decisions | Peer Review | Auto-Execute | Auto-Execute | Auto-Execute |

The entire matrix is **editable by the owner** during setup and at any time afterward.

### 9.2 Owner-CEO Relationship

The dynamic between the human owner and the AI CEO is **configurable**:

| Style | Description |
|-------|-------------|
| **Autocratic** | Owner makes all significant decisions. CEO executes and coordinates but does not act independently on anything strategic. |
| **Delegated** | Owner defines CEO's authority boundaries. Within those boundaries, CEO acts independently. Outside them, CEO consults owner. CEO runs day-to-day operations. |
| **Collaborative** | CEO and owner discuss decisions together. CEO presents options with recommendations. Owner has ultimate veto power but CEO can push back with reasoning. |

The style can be changed at any time. As the owner builds trust with the CEO agent, they might shift from Autocratic → Collaborative over time.

### 9.3 Escalation Protocol

When a decision exceeds an agent's authority:

1. Agent identifies the decision exceeds their authority level
2. Agent prepares an escalation with: the decision needed, options considered, their recommendation, and relevant context
3. Escalation is sent to the appropriate authority (per the autonomy matrix)
4. If that authority also lacks sufficient authority, it escalates further
5. Final escalation reaches the owner with the full chain of reasoning from each level

**Escalation includes:** Decision description → Options with pros/cons → Each level's recommendation → Risk assessment

### 9.4 Agent Auto-Hiring Rules

Whether agents can autonomously create new agents depends on autonomy settings:

| Autonomy Level | Agent Hiring Rules |
|----------------|-------------------|
| **Low** | Every new agent hire requires explicit owner approval |
| **Medium** | Department head + CEO can approve a new hire within existing department budget. Owner is notified. |
| **High** | CEO can hire within the total company budget. Department heads can hire within department budget. Pre-approved roles can be auto-hired. |
| **Full Delegation** | CEO manages all hiring/firing within budget constraints. Owner is only notified in batch reports. |

---

## 10. Task & Project Management

### 10.1 Built-In Task System

The system includes a **lightweight built-in task board** (similar to Linear/Trello):

**Task Properties:**
- Title and description
- Assignee (which agent is responsible)
- Status: Backlog → To Do → In Progress → In Review → Done
- Priority: Critical, High, Medium, Low
- Deadline (optional)
- Department / Project tags
- Parent task (for subtask hierarchy)
- Blockers (linked tasks that must complete first)
- Reviewer (who reviews the output)

**Task Creation:**
- C-suite members create strategic tasks and delegate to departments
- Department heads break down strategic tasks into team-level tasks
- Individual agents can create tasks for themselves or propose tasks to their manager
- Owner can create tasks for anyone
- Tasks can be created from chat messages, formal briefs, or webhook triggers

### 10.2 External Tool Integration

If the user connects an external project management tool (Linear, Notion, Jira, Trello) via MCP:
- The external tool becomes the **source of truth** for tasks
- Agents create, update, and track tasks in the external tool
- Built-in task system syncs with or defers to the external tool
- Dashboard shows task data from the external tool

### 10.3 Priority & Scheduling

Agents manage their work using a **priority queue with deadline awareness**:

- Tasks are ordered by: (1) deadline urgency, (2) priority level, (3) assignment order
- If a lower-priority task has an approaching deadline, it gets bumped up
- Agents use judgment to switch between tasks (like real employees managing their workload)
- SLAs can be set for specific task types (e.g., "customer emails must be responded to within 1 hour")
- Calendar events and scheduled tasks block time appropriately

### 10.4 Quality Control — Multi-Layer Configurable Review

When agents produce deliverables, they go through a configurable review process:

**Review Layers (each can be enabled/disabled per deliverable type):**

| Layer | Description |
|-------|-------------|
| **Self-Review** | Agent reviews its own work before submitting |
| **Peer Review** | A peer agent in the same department reviews the work |
| **Department Head Review** | Department head approves the deliverable |
| **C-Suite Review** | Relevant C-suite member reviews (for high-impact items) |
| **Owner Review** | Human owner reviews (for external-facing or critical items) |

**Default Review Rules (configurable):**

| Deliverable Type | Default Review Chain |
|-----------------|---------------------|
| Internal documents | Self-review only |
| Code / technical work | Self → Peer review |
| Marketing content (internal) | Self → Department head |
| Marketing content (external/published) | Self → Peer → Department head → Owner |
| Financial reports | Self → Peer → CFO |
| Customer-facing communications | Self → Department head → Owner |
| Strategic plans | Department head → C-suite → CEO → Owner |

The owner customizes these rules during setup or at any time.

---

## 11. External Actions & Safeguards

### 11.1 Category-Based Approval Rules

When agents interact with the outside world, **category-based rules** determine what requires approval:

**Categories:**

| Category | Examples | Default Rule |
|----------|----------|--------------|
| **Social Media Posts** | Tweets, LinkedIn posts, Instagram posts | CMO review → Auto-publish |
| **Customer Emails** | Sales outreach, support responses, account emails | Department head review → Send |
| **Marketing Emails** | Newsletters, campaigns, drip sequences | CMO review → Owner approval → Send |
| **Code Deployment** | Deploying to staging or production | CTO review → Deploy (staging). CTO + Owner → Deploy (production). |
| **Financial Transactions** | Purchasing services, subscriptions | CFO review → Owner approval |
| **Public Content** | Blog posts, website updates, press releases | Department head → CMO → Owner |
| **Internal Tool Changes** | Installing MCPs, connecting new services | CTO review → Owner approval |

**Trust Evolution:**
Over time, as agents demonstrate reliable judgment, the owner can relax approval requirements. For example:
- Week 1: All social media posts require owner approval
- Month 2: CMO-approved posts can auto-publish
- Month 6: Social media manager can auto-publish routine posts (CMO notified)

The system tracks each agent's external action history and success rate to inform trust decisions.

---

## 12. Notifications & Reporting

### 12.1 Notification System

The notification system has **configurable urgency levels**:

| Urgency | Delivery Method | Examples |
|---------|----------------|---------|
| **Critical** | Immediate push notification (mobile/Telegram/email) + in-app | System errors, security issues, budget exceeded, blocked customer deal |
| **High** | Push notification within 15 minutes + in-app | Decisions requiring owner approval, escalations from CEO |
| **Medium** | Included in next digest (hourly/daily) + in-app | Task completions, status updates, non-urgent approvals |
| **Low** | Dashboard only | Informational updates, agent activity, routine completions |

**User configures:**
- Which urgency levels trigger push notifications
- Digest frequency (every hour, every 4 hours, daily, weekly)
- Quiet hours (no push notifications during specified times)
- Per-department notification preferences
- Per-decision-type notification preferences

### 12.2 Reporting Suite

**Automated Reports:**

| Report | Frequency | Author | Contents |
|--------|-----------|--------|----------|
| **CEO Daily Briefing** | Daily (configurable) | CEO Agent | Key activities, decisions made, blockers, metrics summary, items needing owner attention |
| **Weekly Strategy Review** | Weekly | CEO Agent | Progress against goals, key wins, risks, upcoming priorities, resource utilization |
| **Monthly Performance Report** | Monthly | HR + CEO | Agent performance summaries, department health, budget analysis, recommendations |
| **Department Reports** | Configurable per dept | Department Heads | Department-specific metrics, project updates, team performance |
| **Financial Report** | Weekly/Monthly | CFO | Token spend breakdown, budget vs actual, forecasting, cost optimization opportunities |
| **Sprint Review** | Per sprint cycle | CTO | Technical progress, completed features, bugs resolved, technical debt status |
| **Marketing Performance** | Weekly/Monthly | CMO | Campaign metrics, content performance, growth metrics, channel analysis |
| **Sales Pipeline** | Weekly | CSO | Pipeline health, deals in progress, conversion rates, revenue forecast |

**Custom Reports:**
- Owner can define custom reports with specific metrics, frequency, and responsible agent
- Reports can be exported in various formats
- Dashboard shows real-time versions of report data

### 12.3 Dashboard

The web dashboard provides a **comprehensive view of the AI company**:

**Dashboard Tabs:**

| Tab | Contents |
|-----|----------|
| **Home** | Pending items requiring owner attention (approvals, escalations, questions) at the top. Key KPIs below. Recent activity feed. |
| **Activity Feed** | Chronological timeline of all company activity. Filterable by department, agent, type of activity. Searchable. |
| **KPIs** | Token spend by department, tasks completed, active projects, agent utilization rates, pending approvals, budget health |
| **Org Chart** | Visual organizational chart showing each agent, their current task, status (active/idle/paused/waiting), and department health indicators |
| **Tasks** | Company-wide task board view. Filter by department, agent, priority, status. Gantt chart for projects. |
| **Reports** | All generated reports. Schedule management. Custom report builder. |
| **Channels** | View/participate in any communication channel. See message activity. |
| **Settings** | All company configuration: autonomy matrix, communication rules, notification preferences, agent management, integrations, budget. |

---

## 13. Company Events

### 13.1 Event System

The system supports **corporate events** involving multiple agents from different departments:

**Pre-Defined Event Templates:**

| Event | Default Cadence | Participants | Output |
|-------|----------------|-------------|--------|
| **All-Hands Meeting** | Monthly | All agents + Owner | Company update, Q&A summary, action items |
| **Sprint Planning** | Per sprint (biweekly) | Engineering + Product | Sprint backlog, task assignments, goals |
| **Sprint Retrospective** | Per sprint | Engineering + Product | What went well, what didn't, improvements |
| **Quarterly Business Review** | Quarterly | C-suite + Owner + Board (optional) | Quarterly results, next quarter strategy, budget review |
| **Department Stand-Up** | Daily/Weekly (configurable) | Department members | Current tasks, blockers, priorities |
| **1-on-1** | Weekly/Biweekly | Manager + Direct Report | Performance discussion, feedback, career development |
| **Board Meeting** | Monthly/Quarterly | Board members + Owner + CEO | Strategic advisory (see Section 8.4 for meeting formats) |
| **Project Kickoff** | Per project | Cross-functional project team | Project goals, roles, timeline, risks, communication plan |
| **Post-Mortem** | Per incident/project end | Relevant team members | What happened, root cause, learnings, prevention steps |

**Custom Events:**
- Owner or C-suite can create any recurring or one-off event
- Define: participants, agenda template, frequency, output format, follow-up rules

**Event System Features:**
- Automated scheduling based on cadence
- Agenda generation (AI-assisted based on current context and pending items)
- Meeting minutes auto-generated
- Action items extracted and converted to tasks automatically
- Follow-up tracking (are action items from last meeting completed?)

---

## 14. Token Budget & Financial System

### 14.1 Budget Structure

The financial system treats token spend as the company's operating budget:

**Budget Hierarchy:**

```
Company Total Budget ($X/month)
├── CEO allocation
├── Engineering Department ($Y/month)
│   ├── CTO
│   ├── Backend Engineer
│   ├── Frontend Engineer
│   └── QA Engineer
├── Marketing Department ($Z/month)
│   ├── CMO
│   ├── Content Writer
│   └── SEO Specialist
├── Finance Department
├── Sales Department
├── Board of Directors
└── Reserve / Unallocated
```

### 14.2 Budget Management

**Allocation:**
- Owner sets total monthly budget
- CEO and CFO collaborate to recommend allocation across departments
- Owner approves the allocation (or auto-approves if autonomy is high)
- Department heads manage spending within their allocation

**Tracking:**
- Real-time token spend tracking per agent
- Per-department spend vs budget
- Burn rate projections (will we exceed budget at current pace?)
- Historical spend analysis (trends over time)
- Cost per task / cost per output metrics

**Alerts:**
- Warning at 75% of budget consumed
- Alert at 90% of budget consumed
- Critical alert at 100% — requires owner decision to continue or pause
- Per-department alerts at configurable thresholds

**Optimization:**
- CFO agent provides cost optimization recommendations
  - "Agent X used 40% more tokens than average for their role — investigate"
  - "Department Y completed similar output with 20% less spend last month"
  - "Recommend downgrading Agent Z to Haiku — their tasks don't require Opus-level reasoning"
- Model switching recommendations based on task complexity vs cost

### 14.3 Agent "Salaries"

Each agent has an estimated monthly token cost based on:
- Their AI model (Opus > Sonnet > Haiku in cost)
- Their deployment mode (24/7 > scheduled > trigger-based)
- Their workload (number of tasks, task complexity)
- Their tool usage (MCP calls, browser automation have additional costs)

This creates a "salary" concept:
- When "hiring" a new agent, the system shows the estimated monthly cost
- Department heads and CEO consider this cost when requesting new hires
- The CFO tracks actual vs estimated costs and flags anomalies

---

## 15. HR System

### 15.1 AI Agent HR Management

HR manages the full lifecycle of AI agents:

- **Hiring**: Processing hire requests, coordinating onboarding
- **Onboarding**: Managing the progressive ramp process (see Section 6.1)
- **Performance**: Conducting reviews, tracking metrics (see Section 6.2)
- **Promotions/Demotions**: Processing role changes, updating autonomy levels
- **Improvement Plans**: Managing underperformance processes
- **Termination**: Coordinating knowledge transfer and clean shutdown
- **Compensation (Budget)**: Working with CFO on token budget allocation per agent
- **Goal Management**: Setting, tracking, and evaluating agent goals per quarter/period

### 15.2 Real Human Employee Management (Basic → Expand)

**MVP Scope (Basic):**
- Track human team members in the org chart alongside AI agents
- Process vacation/time-off requests (HR agent receives request → presents to owner for approval)
- Record and track basic HR requests (raise requests, equipment requests, etc.)
- Maintain employee records (role, start date, notes)
- Generate reminders for owner (performance review due, anniversary, etc.)

**Future Expansion:**
- Full onboarding workflows for new human hires
- Performance review cycle management with templates and scheduling
- Goal setting and OKR tracking
- Compensation management and benchmarking
- Leave management with balance tracking
- 1-on-1 meeting facilitation (agenda, notes, action items)
- Employee satisfaction surveys
- Recruiting pipeline (job posting, resume screening, interview scheduling, candidate evaluation)
- Training and development tracking
- Org chart management and succession planning

**Integration Consideration:** HR functions can integrate with external HR tools (BambooHR, Gusto, etc.) via MCP when available. The built-in system serves as the default.

---

## 16. Knowledge & Memory System

### 16.1 Knowledge Architecture

The knowledge system has **five components**:

**Component 1: Company Wiki (Structured)**
- Organized like a wiki/Notion database
- Sections: Company Overview, Products/Services, Policies, Brand Guidelines, Customers, Competitors
- Editable by department heads and C-suite (configurable permissions)
- All agents have read access
- Version-controlled (track changes over time)

**Component 2: Vector Search Store (Unstructured)**
- All conversations, research results, and contextual information is indexed
- Agents can semantically search across all unstructured company knowledge
- Enables "find me everything we know about X" queries
- Automatically updated as agents work and communicate

**Component 3: Agent Journals (Personal)**
- Each agent maintains a personal learning journal
- Entries: task outcomes, lessons learned, patterns noticed, mistakes made
- Private to the agent by default; visible to manager for review purposes
- Used by the agent to improve their own work over time

**Component 4: Decision Log (Auditable)**
- Every significant decision is recorded with:
  - What was decided
  - Who decided it
  - What options were considered
  - What reasoning led to the decision
  - What the outcome was (updated post-execution)
- Searchable and filterable
- Used for auditing, learning from past decisions, and onboarding new agents

**Component 5: Project Archives**
- When a project completes, all related materials are archived:
  - Project brief, tasks, deliverables, communications, outcomes, post-mortem
- Archived projects are searchable and serve as reference for future similar work
- Agents can reference past projects when planning new ones

### 16.2 Guided Evolution — Agent Learning

Agents improve over time through **guided evolution**:

**Knowledge Accumulation (Automatic):**
- Agents remember past decisions and their outcomes
- Successful patterns are reinforced (agent references them in future work)
- Failed approaches are flagged to avoid repetition
- New domain knowledge discovered during work is added to relevant KBs

**Behavioral Adaptation (Owner-Approved):**
- The system identifies behavioral patterns that could improve:
  - "CMO has been overly conservative in campaign proposals — could benefit from higher risk tolerance"
  - "Backend Engineer consistently underestimates task complexity — calibration recommended"
- Proposed behavioral changes are presented to the owner for approval
- Owner can approve, modify, or reject the change
- Approved changes update the agent's soul.md or skill parameters

**Owner Training:**
- Owner can directly provide feedback that shapes agent behavior:
  - "I want the CEO to be more concise in briefings"
  - "The content writer should use a more casual tone"
  - "Sales team should be more aggressive in follow-ups"
- Feedback is recorded and incorporated into the agent's configuration

---

## 17. Security & Access Control

### 17.1 Secrets Vault

A **centralized encrypted vault** stores all sensitive information:

**Vault Contents:**
- API keys and tokens (LLM providers, third-party services)
- Login credentials (social media accounts, CRM, email)
- Customer data encryption keys
- Payment/billing information
- Any user-defined secrets

**Access Rules:**
- Owner has full access to all vault entries
- Secrets are assigned to departments or specific roles by the owner
- Agents only see secrets relevant to their role and current task
- An agent requesting access to a secret they're not assigned generates an approval request
- All secret access is logged in the audit trail

### 17.2 Access Control by Department

| Access Type | Default Assignment |
|------------|-------------------|
| CRM credentials | Sales Department |
| Social media accounts | Marketing Department |
| Cloud/hosting credentials | Engineering Department |
| Financial accounts | Finance Department |
| Email sending credentials | Sales + Marketing (configurable) |
| Code repositories | Engineering Department |
| Analytics platforms | Marketing + Product |
| HR systems | HR Department |

The owner can override any default assignment and create custom access groups.

### 17.3 Data Privacy

- All company data is encrypted at rest and in transit
- Agent conversations and knowledge bases are isolated per company
- No company data is shared across different companies/accounts
- User controls what data agents can access and store
- GDPR/privacy compliance considerations for customer data handling
- Data retention policies configurable by the owner
- Right-to-delete for any stored information

### 17.4 Audit Trail

Every action involving secrets, external systems, or sensitive data is logged:
- Who accessed what, when, and why
- What actions were taken with the access
- Whether the action was approved or autonomous
- Tamper-resistant logging (append-only)
- Exportable for compliance reviews

---

## 18. Integration Ecosystem

### 18.1 MCP Marketplace

The platform includes an **integration marketplace** for MCP (Model Context Protocol) servers:

**Marketplace Features:**
- Browse available integrations by category (Communication, CRM, Development, Marketing, Finance, etc.)
- Community-contributed MCP servers alongside official ones
- Ratings, reviews, and usage statistics
- One-click install (or owner approval if auto-install is disabled)
- Version management and update notifications

**Integration Categories:**

| Category | Examples |
|----------|----------|
| **Communication** | Slack, Telegram, Discord, Email (Gmail, Outlook) |
| **CRM** | Salesforce, HubSpot, Pipedrive |
| **Project Management** | Linear, Notion, Jira, Trello, Asana |
| **Development** | GitHub, GitLab, Railway, Vercel, AWS |
| **Marketing** | Google Analytics, Mailchimp, Buffer, Hootsuite |
| **Finance** | Stripe, QuickBooks, Xero |
| **HR** | BambooHR, Gusto |
| **Social Media** | Twitter/X API, LinkedIn, Instagram, TikTok |
| **AI/ML** | Model providers, vector databases, embedding services |
| **Storage** | Google Drive, Dropbox, S3 |
| **Custom** | User-built MCP servers for proprietary systems |

### 18.2 Agent-Driven Tool Requests

Agents can identify tools they need and request them:

1. Agent encounters a task requiring a tool they don't have
2. Agent creates a tool request: "I need access to a CRM to track customer interactions"
3. Request goes to CTO (for technical tools) or relevant department head
4. Department head reviews and either approves (if within their authority) or escalates to CEO/Owner
5. If approved, owner connects the integration (or auto-installs from marketplace if auto-install is enabled)
6. Agent receives access and can begin using the tool

This mirrors how real employees request software from IT.

### 18.3 Pre-Configured Essentials

Each company template comes with **recommended integrations** pre-suggested during setup:

| Template | Recommended Integrations |
|----------|------------------------|
| SaaS Startup | GitHub, Linear, Slack, Stripe, Google Analytics |
| Marketing Agency | Google Analytics, Mailchimp, Buffer, HubSpot, Notion |
| E-commerce | Shopify/WooCommerce, Stripe, Mailchimp, Google Analytics, Social media |
| Car Dealership | CRM, Social media, Email, Google Business, Inventory management |
| Consulting Firm | Google Workspace, Notion, Calendar, Email, CRM |

---

## 19. Interface & Platforms

### 19.1 Multi-Platform Strategy

The system is designed to be **platform-agnostic**, with the core engine separate from the interface:

**Launch Platforms (Priority Order):**

| Platform | Description | Priority |
|----------|-------------|----------|
| **Web UI** | Custom-built web application with full dashboard + channel-based chat | Core — always available |
| **Telegram** | Bot integration for channel-based interaction via Telegram | First external platform |
| **Slack** | Bot integration for organizations already using Slack | Second external platform |
| **CLI** | Command-line interface for power users and developers | Available from day one |
| **Mobile App** | Native mobile application (iOS/Android) | Future |
| **Desktop App** | Electron or native desktop application | Future |

### 19.2 Web UI Details

The web UI is the **primary interface** and includes:

**Chat Interface:**
- Left sidebar: Channel list (department channels, project channels, DMs)
- Main area: Channel conversation view (messages, files, tasks)
- Right sidebar: Context panel (agent info, task details, quick actions)
- Top bar: Search, notifications, company status

**Dashboard Interface:**
- See Section 12.3 for full dashboard tab descriptions
- Home, Activity Feed, KPIs, Org Chart, Tasks, Reports, Channels, Settings

**Design Principles:**
- Clean, modern, minimal (inspired by Linear/Notion)
- Real-time updates (messages, task status, agent activity)
- Responsive for mobile browsers
- Dark/light mode

### 19.3 Messaging Platform Integration (Telegram/Slack)

When deployed on Telegram or Slack:

**Channel Mapping:**
- Company channels map to Telegram groups or Slack channels
- DMs map to direct messages on the platform
- Users interact with agents in the channel context

**Limitations vs Web UI:**
- No visual dashboard (users use the web dashboard for monitoring)
- No org chart visualization
- Limited file management
- Chat-focused interaction only

**Bot Commands:**
- `/status` — Quick company status summary
- `/tasks` — View pending tasks and approvals
- `/brief [message]` — Submit a work brief to the CEO
- `/ask [agent] [question]` — Direct question to a specific agent
- `/approve [id]` — Approve a pending decision
- `/budget` — View budget summary
- `/report [type]` — Generate a specific report

---

## 20. Error Handling & Escalation

### 20.1 Full Escalation Protocol

When an agent encounters a problem it cannot solve:

**Step 1: Retry with Different Approach**
- Agent attempts an alternative solution
- Maximum 2-3 retry attempts with different strategies
- Each attempt and its failure reason are logged

**Step 2: Ask Peers**
- Agent asks colleagues in the same department for help
- Peer collaboration to solve the problem
- This mirrors asking a coworker for help at their desk

**Step 3: Escalate to Department Head**
- If peers can't help, the agent escalates to their department head
- Escalation includes: what was tried, what failed, peer input received
- Department head attempts to resolve or redirect

**Step 4: Cross-Department Help**
- If the issue involves another department, department head coordinates with the relevant counterpart
- Cross-functional problem-solving session

**Step 5: Escalate to CEO**
- If department heads can't resolve, it goes to the CEO
- CEO has broader context and authority to redirect resources

**Step 6: Owner Notification**
- If the CEO can't resolve, the owner is notified with:
  - Full escalation history
  - What was tried at each level
  - CEO's recommendation
  - Potential solutions for owner to choose from

**Every escalation is logged.** The system detects recurring escalation patterns and recommends preventive measures (e.g., "This type of task fails 40% of the time — consider adding a specialist agent or adjusting the approach").

### 20.2 Conflict Resolution

When agents or departments have conflicting priorities:

1. **Agents Negotiate** — The conflicting parties discuss and attempt compromise
2. **Department Heads Discuss** — If agents can't agree, their managers try to resolve
3. **CEO Mediates** — Cross-departmental conflicts that heads can't resolve go to CEO
4. **Owner Decides** — If CEO can't resolve (rare), owner receives both sides' arguments + CEO's recommendation

---

## 21. Persistence & Hosting

### 21.1 Hosting Options

| Option | Description | Agent Availability |
|--------|-------------|-------------------|
| **Self-Hosted (Local)** | Run on your own computer. Free. Agents run while computer is on. | When computer is running |
| **Self-Hosted (Server)** | Run on your own server/VPS. You manage infrastructure. | 24/7 (you manage uptime) |
| **Cloud Hosted (Platform)** | Managed hosting by the platform. Pay subscription. No infrastructure management. | 24/7 guaranteed |

### 21.2 State Management

When agents stop (computer shutdown, budget exceeded, manual pause), the system handles state:

**User-Configurable Shutdown Behavior:**

| Mode | What Happens | Resume Speed |
|------|-------------|-------------|
| **Full State Save** | Complete agent state preserved in memory/disk. On restart, agents pick up exactly where they left off, aware of the time gap. | Fastest |
| **Summary Shutdown** | Each agent creates a summary of their state: current tasks, pending items, context, and priorities. On restart, agents read their summary and continue. | Fast |
| **Clean Shutdown** | Agents complete or hand off in-progress work, create handoff notes, and stop cleanly. On restart, agents onboard from handoff notes. | Moderate |

Default: **Full State Save** for local, **Always Running** for cloud.

### 21.3 Graceful Degradation

If the system hits resource limits:
- Budget exhausted → Agents pause with state saved. Owner notified. Resume on budget replenishment.
- Single agent fails → Other agents continue. Failed agent restarts automatically with state recovery.
- Network issues → Agents queue external actions and retry. Local processing continues.
- Model provider outage → Agents attempt fallback model (if configured). If no fallback, pause and notify.

---

## 22. Business Model

### 22.1 Multi-Stream Revenue

The business operates with **multiple revenue streams**:

**Stream 1: Open Core**
- **Free/Open Source**: Core orchestration engine, basic templates, standard agent roles, self-hosting capability, community MCP integrations
- **Premium**: Advanced analytics dashboard, premium company templates (industry-specific with deep knowledge), advanced autonomy rules, priority support, advanced reporting

**Stream 2: Managed Cloud Hosting**
- Users pay a subscription to run their AI company in the cloud without managing infrastructure
- Tiers based on:
  - Number of agents
  - 24/7 availability
  - Compute resources
  - Storage for knowledge bases
- Similar to how GitLab offers self-hosted (free) and managed (paid)

**Stream 3: Marketplace Revenue**
- MCP integration marketplace with premium/paid integrations (platform takes a percentage)
- Premium agent templates and skill packs created by the community or the team
- Premium persona profiles and industry knowledge packs

**Stream 4: Enterprise**
- Dedicated infrastructure and support
- Custom template development
- SLA guarantees
- SSO, compliance features, advanced audit
- White-label options

### 22.2 Pricing Tiers

**For Cloud Hosting:**

| Tier | Token Allowance | Agents | Features | Price |
|------|----------------|--------|----------|-------|
| **Starter** | $X in API credits | Up to 5 agents | Basic templates, standard dashboard | $XX/month |
| **Growth** | $Y in API credits | Up to 15 agents | All templates, full dashboard, marketplace | $YY/month |
| **Business** | $Z in API credits | Up to 50 agents | Everything + advanced analytics, priority support | $ZZ/month |
| **Enterprise** | Custom | Unlimited | Everything + dedicated infra, SLA, custom development | Custom pricing |

**For Self-Hosted:**
- Core: Free (MIT license)
- Premium features: License key ($XX/month)

*(Exact pricing TBD based on market research and cost analysis.)*

---

## 23. Open Source & Community

### 23.1 Everything is Extensible

The community can contribute to and extend **every aspect** of the system:

| Extension Type | Description | Contribution Method |
|---------------|-------------|-------------------|
| **Company Templates** | Pre-configured org structures + industry knowledge | Template package with config files + knowledge base |
| **Agent Skills** | New capabilities that can be assigned to agents | Skill definition (prompt + tools + knowledge requirements) |
| **Persona Profiles** | Pre-built soul.md templates for different roles/styles | Soul.md files with trait metadata |
| **MCP Integrations** | Connectors to external tools and services | MCP server implementation |
| **Workflow Automations** | Automated sequences that agents can execute | Workflow definition files |
| **Reporting Templates** | Custom report formats and dashboards | Report template definitions |
| **Event Templates** | Meeting/event structures with agendas and outputs | Event template definitions |
| **Agent Architectures** | Custom agent types beyond the standard roles | Agent architecture definitions |
| **Industry Knowledge Packs** | Domain-specific knowledge bases for industries | Structured knowledge files |
| **UI Themes / Plugins** | Dashboard customization and plugins | Frontend extensions |

### 23.2 Community Infrastructure

- **Public GitHub Repository** — Core platform, issues, PRs, discussions
- **Marketplace Portal** — Browse, rate, and install community contributions
- **Documentation Site** — Comprehensive docs, tutorials, API reference
- **Discord / Community Forum** — Community discussion, support, showcases
- **Contributor Program** — Recognition, rewards for top contributors
- **Template Showcase** — Gallery of community-created company configurations with demos

---

## 24. Data Portability

### 24.1 Full Export/Import

Users can **export their entire company** for backup, migration, or sharing:

**Export Package Contents:**
- All agent configurations (soul.md files, skill assignments, model selections)
- Organizational structure (departments, roles, reporting lines, hierarchy)
- Communication routing rules and autonomy matrix
- Knowledge bases (company wiki, department KBs, agent journals)
- Decision log and project archives
- Task history and current task state
- Channel history (optional, can be large)
- Integration configurations (not secrets — those must be re-entered)
- Dashboard and reporting configurations
- Notification preferences

**Export Formats:**
- Full export as a compressed package
- Selective export (only specific departments, only configurations, only knowledge)
- Anonymized export (for sharing as a template — strips proprietary information)

**Import:**
- Import a full company package into a new instance
- Merge specific components (import knowledge from one company into another)
- Import community templates from the marketplace

### 24.2 Company Sharing

Users can publish their company configurations (anonymized) to the marketplace as templates for others:
- Remove proprietary business information
- Keep org structure, persona configurations, skill assignments, workflow automations
- Others can use it as a starting template and customize

---

## 25. Audit & Compliance

### 25.1 Full Audit Trail

The system maintains a **complete audit trail** of all activity:

**What's Logged:**
- Every agent action (task creation, message sent, tool used, decision made)
- Every state change (agent hired, promoted, fired, paused)
- Every external action (email sent, code deployed, social media post)
- Every secret access (who, what, when, why)
- Every approval/denial decision
- Every escalation event
- Every budget event (spend, allocation change, alert triggered)
- Every configuration change

**Log Properties:**
- Timestamps for every entry
- Agent and user identification
- Action context (what triggered this action, what was the result)
- Immutable/append-only (entries cannot be modified or deleted)

### 25.2 AI-Generated Summaries

On top of the raw audit trail:
- **Daily digest**: AI-generated summary of the day's activity, decisions, and outcomes
- **Weekly summary**: Higher-level patterns, trends, and notable events
- **Monthly report**: Comprehensive operational report with metrics and analysis
- **Search and drill-down**: Search any summary to find detailed log entries behind it

### 25.3 Export & Compliance

- Audit logs exportable in standard formats (JSON, CSV)
- Configurable retention policies (keep logs for X months/years)
- Compliance with data protection regulations (GDPR right-to-delete, data minimization)
- Role-based access to audit logs (owner full access, admins limited, viewers restricted)

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **Owner** | The human who creates and controls the AI company |
| **Agent** | An AI-powered employee with a defined role, persona, skills, and capabilities |
| **Soul.md** | The identity file defining an agent's personality, style, background, and behavioral rules |
| **Skill** | A structured capability (prompt template + tools + knowledge) that an agent can perform |
| **Template** | A pre-configured company setup (structure + industry knowledge) |
| **MCP** | Model Context Protocol — the standard for integrating AI agents with external tools |
| **Channel** | A communication space where agents and humans interact |
| **Autonomy Matrix** | The configurable rules defining what decisions each role can make independently |
| **Token Budget** | The company's operating budget, measured in AI model token spend |
| **Board of Directors** | An advisory body of expert agents separate from the operational hierarchy |
| **Progressive Ramp** | The multi-phase onboarding process for new agents |
| **Escalation** | The process of sending a decision or problem up the authority chain |

---

## Appendix B: Open Questions for Further Definition

The following areas need additional detail in future iterations:

1. **Specific skill definitions** — Full prompt templates for every default skill per role
2. **Industry knowledge packs** — Detailed content for each industry template
3. **Persona trait taxonomy** — Complete list of traits for the mix & match tier with scales and combinations
4. **Workflow automation engine** — How automated multi-step processes are defined and executed
5. **Voice agent integration** — Future capability for agents to make/receive phone calls
6. **Mobile app specifications** — Detailed mobile experience design
7. **Enterprise features** — SSO, SCIM, advanced RBAC, compliance certifications
8. **Testing & QA for the platform itself** — How the system is tested and quality-assured
9. **Performance benchmarks** — Expected response times, throughput, resource requirements
10. **Migration from other tools** — How users bring existing data from Notion, Slack, etc.
11. **Disaster recovery** — Backup strategies, failover, data redundancy
12. **Internationalization** — Multi-language support for agents and interface
13. **API / SDK** — Public API for programmatic access and custom integrations
14. **Analytics engine** — Technical implementation of the metrics, KPI, and reporting system
15. **Agent coordination protocol** — Technical spec for how agents communicate and coordinate under the hood
16. **Rate limiting & abuse prevention** — For cloud-hosted instances
17. **Onboarding tutorial / walkthrough** — First-time user experience after launch

---

*This is a living document. It will be updated as vision details are refined and implementation begins.*
