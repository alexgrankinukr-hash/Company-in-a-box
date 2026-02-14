# Cost Analysis: AI Company-in-a-Box Platform

**Date**: February 12, 2026
**Purpose**: Detailed cost analysis for running a multi-agent AI platform where users spawn teams of 10-20 AI agents that work continuously on business tasks.

---

## 1. Model Pricing (February 2026)

### 1.1 Anthropic Claude Models (per million tokens)

| Model | Input | Output | Batch Input | Batch Output |
|-------|-------|--------|-------------|--------------|
| **Claude Opus 4.6** | $5.00 | $25.00 | $2.50 | $12.50 |
| **Claude Opus 4.5** | $5.00 | $25.00 | $2.50 | $12.50 |
| **Claude Sonnet 4.5** | $3.00 | $15.00 | $1.50 | $7.50 |
| **Claude Haiku 4.5** | $1.00 | $5.00 | $0.50 | $2.50 |

**Prompt Caching (massive cost saver):**
- 5-minute cache write: 1.25x base input price
- 1-hour cache write: 2x base input price
- **Cache reads: 0.1x base input price (90% savings)**

| Model | Cache Write (5min) | Cache Write (1hr) | Cache Read |
|-------|-------------------|-------------------|------------|
| Opus 4.6 | $6.25/MTok | $10.00/MTok | **$0.50/MTok** |
| Sonnet 4.5 | $3.75/MTok | $6.00/MTok | **$0.30/MTok** |
| Haiku 4.5 | $1.25/MTok | $2.00/MTok | **$0.10/MTok** |

**Long Context (>200K tokens):**
- Opus 4.6: $10.00 input / $37.50 output
- Sonnet 4.5: $6.00 input / $22.50 output

### 1.2 OpenAI Models (per million tokens)

| Model | Input | Output | Notes |
|-------|-------|--------|-------|
| **GPT-4o** | $2.50 | $10.00 | Strong general-purpose |
| **GPT-4.1** | $2.00 | $8.00 | Latest flagship |
| **GPT-4.1 mini** | $0.40 | $1.60 | Budget option |
| **GPT-4o mini** | $0.15 | $0.60 | Cheapest OpenAI |
| **o3** | $2.00 | $8.00 | Reasoning model |
| **o3-mini** | $1.10 | $4.40 | Budget reasoning |
| **o4-mini** | $1.10 | $4.40 | Latest budget reasoning |

### 1.3 Open-Source Models via Hosted APIs (per million tokens)

**Via Together AI / Fireworks / Groq:**

| Model | Input | Output | Notes |
|-------|-------|--------|-------|
| **Llama 4 Maverick** | $0.27 | $0.85 | Best open-source value |
| **Llama 3.3 70B** | $0.88 | $0.88 | Proven workhorse |
| **Llama 3.1 8B** | $0.18 | $0.18 | Ultra-cheap for simple tasks |
| **Mistral Small 3** | $0.10 | $0.30 | Cheapest usable option |
| **DeepSeek-V3.1** | $0.60 | $1.70 | Strong reasoning |
| **Qwen 2.5 7B** | $0.30 | $0.30 | Good small model |

**Self-Hosted (GPU costs):**
- Single A100 (40GB): ~$2-3/hr cloud rental = $1,440-2,160/month
- Runs 7B-13B models; effective cost ~$0.05-0.10/MTok at high utilization
- H100 (80GB): ~$25-40/hr = $18,000-28,800/month
- Runs 70B+ models; effective cost ~$0.10-0.30/MTok at high utilization
- **Break-even vs API at ~5-10M tokens/month for premium models**
- **Not recommended until >100M tokens/month**

### 1.4 Price Comparison Summary (Cost per 1M output tokens -- the expensive part)

| Tier | Model | Output $/MTok | Relative Cost |
|------|-------|---------------|---------------|
| Premium | Claude Opus 4.6 | $25.00 | 1.0x (baseline) |
| Premium | Claude Sonnet 4.5 | $15.00 | 0.6x |
| Mid-tier | GPT-4o | $10.00 | 0.4x |
| Mid-tier | GPT-4.1 | $8.00 | 0.32x |
| Budget API | Claude Haiku 4.5 | $5.00 | 0.2x |
| Budget API | o3-mini / o4-mini | $4.40 | 0.18x |
| Budget API | GPT-4.1 mini | $1.60 | 0.064x |
| Open-source | Llama 4 Maverick | $0.85 | 0.034x |
| Open-source | Llama 3.1 8B | $0.18 | 0.007x |

---

## 2. Per-Agent Token Estimates

### 2.1 Token Usage by Activity Type

Based on research data and Anthropic's own agent pricing examples:

| Activity | Input Tokens | Output Tokens | Total Tokens | Notes |
|----------|-------------|---------------|--------------|-------|
| **Receiving/reading a message** | 500-1,500 | 50-200 | ~1,000 | System prompt + message + brief ack |
| **Simple conversation turn** | 1,500-3,000 | 300-800 | ~3,000 | Including context window |
| **Multi-turn discussion (per turn)** | 3,000-8,000 | 500-1,500 | ~6,000 | Growing context accumulates |
| **Complete a writing task** | 5,000-15,000 | 2,000-5,000 | ~15,000 | Blog post, report, email draft |
| **Data analysis task** | 10,000-30,000 | 1,500-4,000 | ~25,000 | Analyzing data + explanation |
| **Code review** | 8,000-25,000 | 2,000-6,000 | ~20,000 | Reading code + detailed feedback |
| **Web research** (per search) | 15,000-40,000 | 1,000-3,000 | ~30,000 | Search results + page content + synthesis |
| **MCP tool use** (per tool call) | 2,000-5,000 | 500-1,500 | ~4,000 | Tool definition + result processing |
| **Complex multi-step task** | 50,000-150,000 | 10,000-30,000 | ~100,000 | Multiple iterations, tool calls, reasoning |

**Key insight**: Input tokens dominate costs in agent workflows (3-10x more than output), but output tokens cost 5x more per token. The net result is roughly 50/50 cost split between input and output for most agent tasks.

### 2.2 Agent Activity Profiles

| Profile | Tasks/Day | Avg Tokens/Task | Daily Tokens | Monthly Tokens |
|---------|-----------|-----------------|--------------|----------------|
| **Light** (monitoring, occasional response) | 5-10 | 5,000 | 50,000 | 1.5M |
| **Moderate** (business hours, regular tasks) | 20-40 | 10,000 | 300,000 | 9M |
| **Active** (continuous during business hours) | 50-100 | 15,000 | 1,000,000 | 30M |
| **Intensive** (24/7 continuous operation) | 150-300 | 20,000 | 4,000,000 | 120M |

### 2.3 Critical Multiplier: Agent-to-Agent Communication

Multi-agent systems have a communication overhead multiplier. When agents talk to each other:

- **Each message is consumed by the receiver as input tokens** (their system prompt + conversation history + new message)
- A 10-agent team meeting where each agent speaks once = 10 messages x 10 receivers = **100 inference calls** (though each agent only reads the messages directed to it or broadcast to all)
- Realistic overhead: **1.5-3x multiplier** on raw task token estimates for multi-agent coordination
- A "board meeting" with 5 agents discussing for 10 rounds: ~5 agents x 10 turns x 6,000 tokens/turn = **300,000 tokens per meeting**

---

## 3. Usage Scenario Cost Estimates

### 3.1 Minimal Company: 5 Agents, Moderate Activity

**Profile**: Small team -- CEO, Developer, Marketer, Analyst, Support agent. A few tasks per day each.

| Component | Tokens/Month | Model Mix | Monthly Cost |
|-----------|-------------|-----------|--------------|
| 3 agents on Haiku 4.5 (light tasks) | 3 x 9M = 27M | Haiku | $27 input + $135 output = **$162** |
| 1 agent on Sonnet 4.5 (complex tasks) | 1 x 9M = 9M | Sonnet | $27 input + $135 output = **$162** |
| 1 agent on Opus 4.6 (CEO decisions) | 1 x 4.5M = 4.5M | Opus | $22.5 input + $112.5 output = **$135** |
| Agent coordination overhead (1.5x) | ~25M additional | Mixed | ~**$125** |
| **TOTAL** | ~65M tokens | | **~$584/month** |

**With prompt caching (50% of input cached):**
- Input cost reduction: ~40%
- **Optimized total: ~$400/month**

### 3.2 Standard Company: 10 Agents, Active (Business Hours)

**Profile**: Full team -- CEO, CTO, CFO, 2 Developers, Designer, Marketer, Sales, Support, Analyst. Continuous work 8 hours/day.

| Component | Tokens/Month | Model Mix | Monthly Cost |
|-----------|-------------|-----------|--------------|
| 5 agents on Haiku 4.5 (routine tasks) | 5 x 30M = 150M | Haiku | $150 input + $750 output = **$900** |
| 3 agents on Sonnet 4.5 (complex work) | 3 x 30M = 90M | Sonnet | $270 input + $1,350 output = **$1,620** |
| 2 agents on Opus 4.6 (leadership) | 2 x 15M = 30M | Opus | $150 input + $750 output = **$900** |
| Agent coordination (2x multiplier) | ~270M additional | Mixed | ~**$1,350** |
| Web search (~100 searches/day) | -- | $0.01/search | **$30** |
| **TOTAL** | ~540M tokens | | **~$4,800/month** |

**With prompt caching (60% of input cached):**
- **Optimized total: ~$3,200/month**

**With batch API for non-urgent tasks (30% batched):**
- **Further optimized: ~$2,700/month**

### 3.3 Full Company: 20 Agents, 24/7 Operation

**Profile**: Complete organization with all departments running around the clock.

| Component | Tokens/Month | Model Mix | Monthly Cost |
|-----------|-------------|-----------|--------------|
| 10 agents on Haiku 4.5 | 10 x 120M = 1.2B | Haiku | $1,200 input + $6,000 output = **$7,200** |
| 7 agents on Sonnet 4.5 | 7 x 120M = 840M | Sonnet | $2,520 input + $12,600 output = **$15,120** |
| 3 agents on Opus 4.6 | 3 x 60M = 180M | Opus | $900 input + $4,500 output = **$5,400** |
| Agent coordination (2.5x) | ~1.5B additional | Mixed | ~**$10,000** |
| Web search (~500/day) | -- | | **$150** |
| **TOTAL** | ~3.7B tokens | | **~$37,870/month** |

**With prompt caching (65% cached):**
- **Optimized total: ~$24,000/month**

**With batch API + caching combined:**
- **Aggressively optimized: ~$18,000/month**

### 3.4 Board of Directors: 4-5 Members, Periodic Activity

**Profile**: Board Chair, Finance Director, Strategy Advisor, Industry Expert, Legal Advisor. Weekly meetings + ad-hoc advice.

| Component | Tokens/Month | Model Mix | Monthly Cost |
|-----------|-------------|-----------|--------------|
| 4 weekly board meetings (5 agents, 15 rounds each) | 4 x 5 x 15 x 8K = 2.4M | Opus 4.6 | $12 input + $60 output = **$72** |
| Ad-hoc consultations (10/month, brief) | 10 x 20K = 200K | Opus 4.6 | ~**$6** |
| Document review (4 reports/month) | 4 x 100K = 400K | Opus 4.6 | ~**$12** |
| **TOTAL** | ~3M tokens | | **~$90/month** |

**With caching (board has stable system prompts):**
- **Optimized: ~$60/month**

The Board of Directors is by far the cheapest use case -- high value, low token volume.

---

## 4. Cost Optimization Strategies

### 4.1 Model Routing (Biggest Lever -- 60-80% savings possible)

**Strategy**: Route tasks to the cheapest model capable of handling them.

| Task Category | Recommended Model | Cost vs All-Opus | Examples |
|---------------|-------------------|------------------|----------|
| Simple acknowledgments, routing | Haiku 4.5 | **5x cheaper** | "Got it", task assignment, status updates |
| Content generation, analysis | Sonnet 4.5 | **1.7x cheaper** | Writing, code review, data analysis |
| Strategic decisions, complex reasoning | Opus 4.6 | Baseline | Architecture decisions, board meetings, novel problem-solving |
| Repetitive structured tasks | GPT-4.1 mini or Llama 4 | **15-30x cheaper** | Data formatting, summarization, template filling |

**Recommended default mix for cost efficiency:**
- 50% of calls to Haiku 4.5 (simple tasks)
- 35% of calls to Sonnet 4.5 (moderate tasks)
- 15% of calls to Opus 4.6 (complex tasks)
- **This mix costs ~$5.85/MTok blended output vs $25/MTok all-Opus = 77% savings**

### 4.2 Prompt Caching (Second Biggest Lever -- 40-60% input savings)

Every agent has a system prompt (500-2,000 tokens) that repeats on every call. In multi-agent systems:

- **System prompts**: Cache with 1-hour TTL. Saves 90% on system prompt input costs.
- **Shared context** (company knowledge, project state): Cache across agents. One write, many reads.
- **Conversation history**: Use 5-minute cache for ongoing conversations.

**Example impact on Standard Company (10 agents):**
- Without caching: ~$4,800/month
- With aggressive caching: ~$2,700/month
- **Savings: $2,100/month (44%)**

### 4.3 Batch API (50% discount on deferrable work)

Tasks that don't need real-time response (guaranteed within 24 hours, usually minutes):

- End-of-day reports and summaries
- Content drafts for review
- Data analysis on historical data
- Code documentation generation
- Weekly planning documents

**Rule of thumb**: 20-40% of a company's agent tasks can be batched.

**Stacking caching + batch** for Opus 4.6:
- Standard: $5.00 input / $25.00 output
- Cached + Batch: $0.25 input / $12.50 output
- **95% savings on input, 50% on output**

### 4.4 Context Window Management

Agents accumulate context rapidly. Strategies:

1. **Sliding window**: Keep only last N messages (discard old context) -- reduces input tokens linearly
2. **Summarization**: Periodically summarize conversation history into a compact form (costs one Haiku call, saves many future tokens)
3. **Retrieval-Augmented Generation (RAG)**: Store knowledge externally, retrieve only relevant chunks instead of stuffing everything into context
4. **Shared memory store**: Instead of passing all context between agents, write to a shared database and let agents query what they need

**Impact**: Can reduce average context size from 15,000 tokens to 3,000-5,000 tokens per call = **50-70% reduction in input tokens**.

### 4.5 Agent Communication Optimization

- **Hub-and-spoke**: Route through a coordinator agent (Haiku) instead of all-to-all messaging
- **Async message queues**: Batch agent-to-agent messages instead of real-time back-and-forth
- **Structured formats**: Use JSON/structured output for inter-agent communication (more token-efficient than natural language)
- **Selective broadcasting**: Only notify agents relevant to a topic, not all agents

### 4.6 Combined Optimization Impact

| Optimization | Savings | Cumulative Effect |
|-------------|---------|-------------------|
| Smart model routing | 60-77% | 60-77% savings |
| Prompt caching | 40-60% on input | Additional 15-25% |
| Batch API (30% of tasks) | 50% on batched | Additional 10-15% |
| Context management | 50-70% on input | Additional 10-20% |
| Communication optimization | 30-50% on coordination | Additional 5-10% |
| **TOTAL POTENTIAL SAVINGS** | | **~80-90% vs naive approach** |

**Standard Company example:**
- Naive (all-Opus, no optimization): ~$22,000/month
- Fully optimized: ~$2,200-3,000/month

---

## 5. Pricing Model Feasibility

### 5.1 What Each Tier Can Deliver

#### $99/month Tier -- "Starter"

| What you get | Token budget | How it works |
|-------------|-------------|--------------|
| 3-5 agents | ~15-20M tokens | Haiku 4.5 primary, Sonnet for key decisions |
| Light activity | ~5-10 tasks/day | Best for advisory board or minimal team |
| Board of Directors mode | Comfortable fit | Weekly meetings + consultations |

**Our cost to serve**: ~$40-60/month (with optimization)
**Margin**: 40-60%
**Best for**: Freelancers, small experiments, advisory boards

#### $199/month Tier -- "Team"

| What you get | Token budget | How it works |
|-------------|-------------|--------------|
| 5-8 agents | ~40-60M tokens | Haiku primary, Sonnet/Opus for complex tasks |
| Moderate activity | ~20-30 tasks/day | Business hours operation |
| Some Opus access | Limited to strategic decisions | ~5-10% of calls |

**Our cost to serve**: ~$100-130/month
**Margin**: 35-50%
**Best for**: Small businesses, startups wanting AI assistance

#### $499/month Tier -- "Business"

| What you get | Token budget | How it works |
|-------------|-------------|--------------|
| 10-15 agents | ~150-250M tokens | Full model routing: Haiku/Sonnet/Opus |
| Active operation | Continuous during business hours | All departments covered |
| Web research included | ~50 searches/day | Agents can browse and research |
| Priority Opus access | For CEO/CTO/strategy | ~15% of calls |

**Our cost to serve**: ~$250-350/month
**Margin**: 30-50%
**Best for**: SMBs wanting a full AI team

#### $999/month Tier -- "Enterprise" (recommended addition)

| What you get | Token budget | How it works |
|-------------|-------------|--------------|
| 20 agents | ~500M-1B tokens | Heavy Opus usage for all leadership |
| 24/7 operation | Continuous | Full company simulation |
| Unlimited web search | | Deep research capability |
| Custom agent roles | | Specialized for industry |

**Our cost to serve**: ~$500-700/month (with heavy optimization)
**Margin**: 30-40%
**Best for**: Companies wanting maximum AI leverage

### 5.2 API Access vs User's Own Keys

#### We Provide API Access (Managed Model)

| Factor | Details |
|--------|---------|
| Revenue per user | $99-999/month subscription |
| Our cost | API costs + infrastructure (15-20% overhead) |
| **Gross margin** | **30-60% depending on tier** |
| Pros | Predictable revenue, full control, simpler UX |
| Cons | We bear all API cost risk, heavy users can blow margin |
| Risk mitigation | Token budgets, rate limiting, usage caps per tier |

**Critical risk**: A single power user on the $499 plan could easily consume $2,000+ in API costs if uncapped. **Hard token limits per billing period are essential.**

#### Users Bring Their Own Keys (BYOK Model)

| Factor | Details |
|--------|---------|
| Revenue per user | $29-99/month platform fee |
| Our cost | Only infrastructure (~$5-15/user/month) |
| **Gross margin** | **70-90%** |
| Pros | No API cost risk, users pay their own usage, scalable |
| Cons | Lower revenue per user, complex UX (key management), users see raw costs |
| Best for | Power users, developers, cost-conscious customers |

#### Hybrid Model (Recommended)

| Tier | Model | Revenue | Our Cost | Margin |
|------|-------|---------|----------|--------|
| Free trial | BYOK only | $0 | ~$5 infra | Negative (acquisition) |
| Starter $99 | Included credits + BYOK option | $99 | ~$50 | 50% |
| Team $199 | Included credits + BYOK option | $199 | ~$120 | 40% |
| Business $499 | Included credits + BYOK option | $499 | ~$300 | 40% |
| Enterprise $999 | Included credits + BYOK upgrade | $999 | ~$600 | 40% |
| BYOK-only | Platform fee only | $29-49 | ~$10 | 70-80% |

### 5.3 Unit Economics at Scale

**Assuming 1,000 paying customers with distribution:**

| Tier | Users | MRR | Total API Cost | Gross Profit |
|------|-------|-----|----------------|--------------|
| Starter $99 | 400 | $39,600 | $20,000 | $19,600 |
| Team $199 | 300 | $59,700 | $36,000 | $23,700 |
| Business $499 | 200 | $99,800 | $60,000 | $39,800 |
| Enterprise $999 | 50 | $49,950 | $30,000 | $19,950 |
| BYOK $39 | 50 | $1,950 | $500 | $1,450 |
| **TOTAL** | **1,000** | **$251,000** | **$146,500** | **$104,500** |

**Blended gross margin: ~42%**
**ARR at 1,000 customers: ~$3M**

---

## 6. Competitive Landscape

### 6.1 Direct Competitors and Pricing

| Competitor | Type | Pricing | Agents | Notes |
|-----------|------|---------|--------|-------|
| **Lindy AI** | No-code agent builder | $0 (free, 400 credits/day), $20-50/mo (Pro), $300/mo (Business) | Single agents, some multi-agent | Credit-based; simple tasks = 1 credit. Most comparable to our Starter tier. |
| **CrewAI** | Dev framework + hosted | $99/mo (Teams), custom (Enterprise) | Multi-agent teams | Developer-focused; requires coding. Costs scale with complexity. |
| **Relevance AI** | Agent builder | Free (100 credits/day), $99/mo (Pro), $599/mo (Team) | Multi-agent on Team plan | Split credit model (actions + vendor credits). Enterprise only for full multi-agent. |
| **AutoGen (Microsoft)** | Open-source framework | Free (self-hosted) + your API costs | Unlimited | No hosting; you run everything. Best for developers. |
| **LangGraph / LangChain** | Framework | Free (open-source) + LangSmith $39-399/mo for monitoring | Unlimited | Infrastructure-only play; no managed agents. |
| **n8n** | Workflow automation | $20-50/mo (Cloud), free (self-hosted) | Workflow agents | Not purpose-built for AI agents but can orchestrate them. |
| **IBM watsonx.ai** | Enterprise AI | Custom (typically $10K+/mo) | Enterprise agents | Aimed at large corporations; full platform. |

### 6.2 Key Competitive Observations

1. **Nobody is doing "AI Company-in-a-Box" with 10-20 persistent agents as a product**. Most platforms offer 1-5 agents or require developer setup for more. This is a differentiation opportunity.

2. **Pricing benchmarks**:
   - Simple agent platforms: $20-100/month
   - Multi-agent platforms: $99-599/month
   - Enterprise: $500-5,000+/month
   - Full "AI employee" replacements: $2,000-5,000/month per agent seat (emerging pricing model)

3. **The "AI employee" pricing model** is gaining traction: companies charge $2,000-5,000/month per AI agent positioned as replacing a human worker. Our "company" pricing of $499-999 for 10-20 agents is dramatically cheaper than 10-20 x $2,000 = $20,000-100,000/month.

4. **Credit-based models** (Lindy, Relevance) create user anxiety and unpredictable costs. Flat monthly pricing with clear agent/token limits is more attractive.

### 6.3 Our Competitive Position

| Our Advantage | Detail |
|--------------|--------|
| **10-20 agents for $499-999** | Competitors charge $2,000-5,000 per individual AI employee |
| **Full company simulation** | Not just single agents -- a coordinated team with roles |
| **Board of Directors for $99** | Unique offering; no competitor has this |
| **Transparent pricing** | No credit anxiety; clear tiers with defined capabilities |
| **BYOK option** | Power users control their own costs |

---

## 7. Recommendations

### 7.1 Immediate Actions

1. **Update the cost-tracker.ts** in the codebase. Current pricing (`opus: { input: 15.0, output: 75.0 }`) reflects the old Opus 4.0/4.1 generation. The current Opus 4.6 is **67% cheaper** at $5/$25 per MTok. This is actually great news for our economics.

2. **Implement model routing from day one**. This is not optional -- it's the difference between $22K/month and $2.5K/month cost-to-serve for the same workload. The router should classify every task before sending it to a model.

3. **Implement prompt caching aggressively**. Agent system prompts, company context, and shared knowledge should use 1-hour cache writes. This alone saves 40-60% on input costs.

4. **Set hard token budgets per tier**. Without caps, a single user can bankrupt the business. Suggested caps:

| Tier | Monthly Token Cap | Equivalent Daily Budget |
|------|------------------|------------------------|
| Starter $99 | 20M tokens | ~650K/day |
| Team $199 | 60M tokens | ~2M/day |
| Business $499 | 250M tokens | ~8M/day |
| Enterprise $999 | 1B tokens | ~33M/day |

### 7.2 Pricing Strategy

1. **Launch with 4 tiers**: $99, $199, $499, $999
2. **Include a BYOK option at $29-49/month** for developers who want to use their own API keys
3. **Offer the Board of Directors as the entry point** at $99 -- it's cheap to run, high perceived value, and gets users into the platform
4. **Position against "AI employee" pricing**: "Why pay $5,000/month for one AI employee when you can have an entire AI company for $499?"

### 7.3 Technical Architecture for Cost Control

1. **Model router service**: Classifies every request and routes to cheapest capable model
2. **Token budget enforcer**: Tracks and enforces per-user monthly limits
3. **Cache orchestrator**: Manages prompt caching across agents, maximizes cache hits
4. **Batch queue**: Non-urgent tasks automatically queued for batch API (50% discount)
5. **Context compressor**: Summarizes long conversations, manages sliding windows
6. **Usage dashboard**: Real-time cost visibility for both us and users

### 7.4 Cost Trajectory

Model prices have been dropping ~40-60% year over year. Our cost projections:

| Timeframe | Expected Cost Trend | Impact |
|-----------|-------------------|--------|
| 2026 H1 | Current prices | Margins as modeled above |
| 2026 H2 | 20-30% reduction likely | Margins improve or we offer more |
| 2027 | 40-60% further reduction | $499 tier becomes very profitable |
| 2028+ | Potential 10x cheaper | Agent platforms become very high margin |

**The business gets more profitable over time as model prices fall**, assuming we lock in subscription pricing. This is a strong tailwind.

---

## 8. Summary Table: Monthly Costs by Scenario

| Scenario | Naive Cost | Optimized Cost | Recommended Tier | Our Margin |
|----------|-----------|---------------|-----------------|------------|
| Board of Directors (5 agents, weekly) | $150 | **$60** | $99 Starter | ~40% |
| Minimal Company (5 agents, moderate) | $900 | **$400** | $199 Team | ~35% |
| Standard Company (10 agents, active) | $4,800 | **$2,700** | $499 Business | ~35% |
| Full Company (20 agents, 24/7) | $37,870 | **$18,000** | $999 Enterprise | ~40% |

---

## Sources

- [Anthropic Claude API Official Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [MetaCTO - Anthropic Claude API Pricing 2026](https://www.metacto.com/blogs/anthropic-api-pricing-a-full-breakdown-of-costs-and-integration)
- [OpenAI API Pricing - All Models (pricepertoken.com)](https://pricepertoken.com/pricing-page/provider/openai)
- [Finout - Claude Pricing in 2026](https://www.finout.io/blog/claude-pricing-in-2026-for-individuals-organizations-and-developers)
- [Finout - OpenAI Pricing in 2026](https://www.finout.io/blog/openai-pricing-in-2026)
- [Together AI Pricing](https://www.together.ai/pricing)
- [LLM API Cost Comparison 2026 (inventivehq)](https://inventivehq.com/blog/llm-api-cost-comparison)
- [Self-Hosting AI Models vs API Pricing 2026](https://www.aipricingmaster.com/blog/self-hosting-ai-models-cost-vs-api)
- [AI Agent Pricing 2026 Complete Guide (nocodefinder)](https://www.nocodefinder.com/blog-posts/ai-agent-pricing)
- [Lindy AI Pricing](https://www.lindy.ai/pricing)
- [Relevance AI Pricing](https://relevanceai.com/pricing)
- [AI Agent Pricing Models (aimultiple)](https://research.aimultiple.com/ai-agent-pricing/)
- [The 2026 Guide to SaaS & AI Pricing Models](https://www.getmonetizely.com/blogs/the-2026-guide-to-saas-ai-and-agentic-pricing-models)
- [Token Cost Trap - Medium](https://medium.com/@klaushofenbitzer/token-cost-trap-why-your-ai-agents-roi-breaks-at-scale-and-how-to-fix-it-4e4a9f6f5b9a)
- [Claude Opus 4.6 Pricing Guide (aifreeapi)](https://www.aifreeapi.com/en/posts/claude-opus-4-pricing)
- [Anthropic Prompt Caching Documentation](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
