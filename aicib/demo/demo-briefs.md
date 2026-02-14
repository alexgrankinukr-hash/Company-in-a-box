# AICIB Demo Briefs

> Three pre-tested briefs ranked by impressiveness.
> All briefs use the FreelancerPM demo company.
> Run `aicib init --name "FreelancerPM"` before using any of these.

---

## Brief 1: "The Showstopper"

**Use for:** Demo videos, conference presentations, investor pitches
**Estimated cost:** ~$2.00-$3.00
**Runtime:** ~3-5 minutes

### The Brief

```
aicib brief "Build a project management SaaS for freelancers. Target audience: solo consultants and independent professionals making $75K-$200K annually. They currently juggle Trello, Google Sheets, and manual invoicing. We need an MVP in 2 weeks with a monthly infrastructure budget of $500. The product should handle project tracking, time logging, and invoicing in one place. Plan for a Product Hunt launch. Price point: $15/month per user."
```

### Why This Brief Is Impressive

- **Activates every department.** The CEO must coordinate engineering (build it), marketing (launch it), and finance (budget it). This is the full company working together.
- **Forces cross-functional dependencies.** The marketing launch plan depends on the engineering timeline. The financial model depends on the pricing and infrastructure costs. The CEO must synthesize all of it.
- **Produces tangible deliverables.** Not vague summaries -- actual architecture decisions, a content calendar, a break-even model.
- **Relatable problem.** Everyone in the audience has either used a PM tool or been a freelancer. They immediately understand the product.

### Expected Departments Activated

| Department | Agent | Task |
|---|---|---|
| Executive | CEO | Read brief, delegate, synthesize status report |
| Engineering | CTO | Design tech stack, define data model, plan 2-week sprint |
| Engineering | Backend Engineer | Receive architecture instructions from CTO |
| Marketing | CMO | Define ICP, positioning, launch channels, content plan |
| Finance | CFO | Model costs, project break-even, assess runway |

### Expected Deliverables

1. **`deliverables/engineering/architecture.md`** -- Tech stack selection (e.g., Next.js + Supabase), database schema for projects/tasks/invoices, 2-week sprint plan with milestones.
2. **`deliverables/marketing/marketing-plan.md`** -- Ideal customer profile, competitive positioning against Trello/Asana, Product Hunt launch strategy, content calendar for first 30 days.
3. **`deliverables/finance/financial-projection.md`** -- Monthly cost breakdown (infra, API, services), revenue model at $15/user/month, break-even analysis, 6-month runway projection.

### What to Point Out in the Demo

- "Notice the CEO didn't just forward the brief -- it broke the problem into domain-specific tasks."
- "The CTO chose a tech stack based on the 2-week constraint -- that's real technical judgment."
- "The CFO's break-even number depends on the pricing the CEO set and the infra costs the CTO estimated. Cross-functional coordination."
- "Total cost: about two dollars. That's a CTO, CMO, and CFO working together for less than a latte."

---

## Brief 2: "The Strategy Session"

**Use for:** Demonstrating inter-department coordination, follow-up demos after the showstopper
**Estimated cost:** ~$1.50-$2.00
**Runtime:** ~2-4 minutes

### The Brief

```
aicib brief "We're launching FreelancerPM in 6 weeks. I need a coordinated go-to-market plan. Engineering needs to define the feature milestones for weeks 1-2 (core), 3-4 (polish), and 5-6 (launch prep). Marketing needs a launch sequence that maps to those milestones -- you can't promote features that aren't built yet. Finance needs to allocate our $3,000 launch budget across engineering tools, marketing spend, and a contingency reserve. Everyone's timelines must align. Give me one integrated launch calendar."
```

### Why This Brief Is Impressive

- **Explicit coordination requirement.** The brief literally says "everyone's timelines must align." This forces the CEO to orchestrate, not just delegate.
- **Shows temporal reasoning.** Marketing can't promote a feature before engineering ships it. The agents must reason about sequencing and dependencies.
- **Unified deliverable.** The ask is "one integrated calendar" -- meaning the CEO must merge three department outputs into a coherent plan. This is the CEO's hardest job.
- **Budget allocation.** The CFO must divide a fixed budget across competing needs, forcing tradeoff decisions.

### Expected Departments Activated

| Department | Agent | Task |
|---|---|---|
| Executive | CEO | Coordinate timelines, merge into unified calendar |
| Engineering | CTO | Define 3-phase feature milestones (core/polish/launch) |
| Marketing | CMO | Build launch sequence mapped to engineering milestones |
| Finance | CFO | Allocate $3,000 across departments with contingency |

### Expected Deliverables

1. **`deliverables/engineering/milestone-plan.md`** -- Three 2-week phases with specific features per phase, definition of done for each milestone.
2. **`deliverables/marketing/launch-sequence.md`** -- Pre-launch teasers (weeks 1-4), launch day plan (week 5), post-launch follow-up (week 6). Each activity mapped to a shipped feature.
3. **`deliverables/finance/budget-allocation.md`** -- $3,000 split across engineering tooling, marketing spend (ads, design, copywriting), and contingency. Per-week spend schedule.
4. **`deliverables/executive/integrated-calendar.md`** -- Unified week-by-week calendar showing engineering milestones, marketing activities, and budget draws side by side.

### What to Point Out in the Demo

- "Look at the calendar -- marketing doesn't start promoting the invoicing feature until week 4, because engineering ships it in week 3. The agents reasoned about dependencies."
- "The CFO front-loaded engineering spend and back-loaded marketing spend. That's smart budget allocation for a phased launch."
- "The CEO produced a unified calendar. That deliverable doesn't come from any single department -- it's synthesis."

---

## Brief 3: "The Quick Win"

**Use for:** Quick live demos, testing, showing someone in 60 seconds, low-budget recording sessions
**Estimated cost:** ~$0.50-$1.00
**Runtime:** ~1-2 minutes

### The Brief

```
aicib brief "Write a competitive analysis of FreelancerPM vs Trello, Asana, and Monday.com for the solo freelancer segment. Focus on what we can offer that they can't: integrated invoicing, freelancer-specific time tracking, and a simple pricing model. Include a positioning statement we can use on our landing page."
```

### Why This Brief Is Impressive (for a quick demo)

- **Fast and focused.** Primarily activates the CMO with light CEO coordination. Produces a polished deliverable quickly.
- **Immediately understandable.** Everyone knows Trello and Asana. The competitive angle is instantly relatable.
- **Produces quotable output.** The positioning statement is something you can read aloud: "That's a real tagline an AI team just wrote."
- **Shows delegation even in a small task.** The CEO still reads, decides who handles it, and may ask the CFO for pricing model input.

### Expected Departments Activated

| Department | Agent | Task |
|---|---|---|
| Executive | CEO | Read brief, route to CMO, possibly consult CFO on pricing |
| Marketing | CMO | Write competitive analysis and positioning statement |
| Finance | CFO | (Light touch) Input on pricing model comparison |

### Expected Deliverables

1. **`deliverables/marketing/competitive-analysis.md`** -- Feature comparison matrix (FreelancerPM vs Trello vs Asana vs Monday.com), strengths/weaknesses for the freelancer segment, positioning statement.

### What to Point Out in the Demo

- "Even for a focused task, the CEO decided who should handle it. You don't assign agents -- the company figures it out."
- "Read that positioning statement. An AI marketing team wrote that in under a minute for less than a dollar."
- "This is the cheap version. The full company brief with all departments costs about two dollars."

---

## Choosing the Right Brief

| Situation | Use | Why |
|---|---|---|
| Recording the main demo video | Brief 1 (Showstopper) | Maximum wow factor, all departments, best for narration |
| Following up after someone saw the video | Brief 2 (Strategy Session) | Shows coordination depth, different from the video |
| Live demo at a meetup or 1-on-1 | Brief 3 (Quick Win) | Fast, cheap, low risk of awkward waiting |
| Testing before a recording session | Brief 3 (Quick Win) | Cheapest way to verify everything works |
| Investor pitch live demo | Brief 1 or 2 | Depends on time available; Brief 1 if 5+ min, Brief 2 if 3 min |

---

## Cost Budgeting for a Recording Session

Expect to run each brief 2-3 times to get a clean recording:

| Brief | Cost per run | Runs needed | Budget |
|---|---|---|---|
| Brief 1 (Showstopper) | ~$2.50 | 3 | ~$7.50 |
| Brief 2 (Strategy Session) | ~$1.75 | 2 | ~$3.50 |
| Brief 3 (Quick Win) | ~$0.75 | 3 | ~$2.25 |
| **Total recording session** | | | **~$13.25** |

Set a daily cost limit of $20 to give yourself headroom for retakes and testing.
