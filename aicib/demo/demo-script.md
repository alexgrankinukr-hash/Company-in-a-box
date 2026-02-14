# AICIB 120-Second Demo Video Script

> **Total runtime:** 120 seconds
> **Demo company:** FreelancerPM -- a project management SaaS for freelancers
> **Estimated cost of this demo run:** ~$1.00-$1.50
> **Tone:** Confident, minimal, let the product speak. Think Apple keynote energy in a terminal.

---

## Pre-Roll (before recording starts)

- Terminal is clean, dark background, font size 16+
- Cursor is blinking at a clean prompt: `~ $`
- No previous output visible
- Window is ~120 columns x 35 rows

---

## Scene 1: Initialize the Company (0:00 - 0:05)

**What you type:**
```
npx aicib init --name "FreelancerPM"
```

**What appears on screen:**
```
Creating company: FreelancerPM...

  FreelancerPM/
  ├── .aicib/
  │   ├── config.yaml
  │   ├── agents.db
  │   └── memory/
  ├── departments/
  │   ├── engineering/
  │   ├── marketing/
  │   └── finance/
  └── deliverables/

Org Chart:
  ┌─────────┐
  │   CEO   │
  └────┬────┘
  ┌────┼──────────┐
  ▼    ▼          ▼
 CTO  CMO       CFO
  │
  ▼
 Backend Engineer

Company "FreelancerPM" created. Run `aicib start` to boot agents.
```

**Narration (voiceover):**
> "One command. A full company structure -- CEO, CTO, CMO, CFO, and engineers -- ready to go."

**Transition:** Pause 0.5s, then type next command.

---

## Scene 2: Boot the Team (0:05 - 0:15)

**What you type:**
```
aicib start
```

**What appears on screen:**
```
Starting FreelancerPM...

  ● CEO .............. online
  ● CTO .............. online
  ● CFO .............. online
  ● CMO .............. online
  ● Backend Eng ...... online

  5/5 agents running. Awaiting brief.
  Cost so far: $0.00
```

Each agent line appears one at a time with a brief delay (~1s each), creating a "booting up" animation effect. The dot after the role name fills in with an animated loading indicator before switching to "online."

**Narration:**
> "Start boots five AI agents. Each one has a defined role, its own memory, and the ability to talk to the others. Like hiring an entire leadership team in ten seconds."

**Transition:** Brief pause, then start typing the brief.

---

## Scene 3: Give the Brief (0:15 - 0:45)

**What you type:**
```
aicib brief "Build a project management SaaS for freelancers. Target: solo consultants making $75K-$200K. MVP in 2 weeks. Budget: $500/month."
```

**What appears on screen (streaming, line by line over ~25 seconds):**
```
Brief received. Routing to CEO...

CEO is reading the brief...
CEO: "Understood. Project management SaaS for freelancers.
      Let me break this down and delegate across departments."

CEO is thinking...
  ├── Identifying technical requirements...
  ├── Scoping marketing strategy...
  └── Requesting financial projections...

CEO: "I'm delegating now. Here's the plan:"
  → CTO: "Design a minimal tech stack for a PM tool. 2-week MVP timeline."
  → CMO: "Research the solo consultant market. Draft a positioning strategy."
  → CFO: "Model costs for $500/month budget. Project runway and break-even."
```

The output streams in real-time, giving the impression of the CEO actively thinking and making decisions. Each delegation arrow (-->) appears with a slight delay.

**Narration:**
> "You give one brief to the CEO. The CEO reads it, thinks through the problem, and starts delegating -- just like a real executive. No prompts to each agent. No micromanaging. The CEO decides who does what."

**Transition:** Output continues streaming into Scene 4.

---

## Scene 4: Inter-Agent Communication (0:45 - 1:05)

**What appears on screen (continuing from Scene 3, no new command needed):**
```
--- Agent Communication ---

[CEO → CTO]
  "We need a lightweight stack for a PM SaaS. Target users are
   non-technical freelancers. Prioritize: task boards, time tracking,
   invoicing. Must ship MVP in 14 days."

[CTO → Backend Engineer]
  "Set up the following architecture:
   - Next.js frontend + API routes
   - PostgreSQL via Supabase
   - Auth: Supabase Auth (Google + email)
   - Deploy on Vercel
   Start with the data model for projects, tasks, and invoices."

[CEO → CMO]
  "Our target is solo consultants ($75K-$200K income). They currently
   use Trello + spreadsheets. Position us as 'the all-in-one tool
   that replaces your 5-tab workflow.' Draft launch channels."

[CEO → CFO]
  "Monthly budget is $500. Model: infrastructure costs, estimated
   API usage, projected revenue at $15/user/month. When do we
   break even?"
```

Messages appear one block at a time with a brief pause between each, creating the visual rhythm of a real-time conversation.

**Narration:**
> "Watch the agents talk to each other. The CTO breaks down the technical requirements and hands specifics to the engineer. The CMO gets market context. The CFO gets budget constraints. Every agent is working in parallel -- just like a real company."

**Transition:** Messages finish, deliverables start appearing.

---

## Scene 5: Deliverables Appear (1:05 - 1:25)

**What appears on screen (continuing from previous output):**
```
--- Deliverables ---

  ✓ deliverables/engineering/architecture.md      (CTO)
    → Tech stack, data model, 2-week sprint plan

  ✓ deliverables/marketing/marketing-plan.md      (CMO)
    → ICP definition, positioning, launch channels, content calendar

  ✓ deliverables/finance/financial-projection.md  (CFO)
    → Cost model, break-even analysis, 6-month runway projection

  3 deliverables generated.
```

Each deliverable line appears with a checkmark animation (spinner -> checkmark). The description fades in after the filename.

**Narration:**
> "Real deliverables. Not summaries -- actual documents. An architecture plan with a data model and sprint timeline. A marketing plan with positioning and launch channels. A financial projection with break-even analysis. All created in under a minute."

**Transition:** Clear beat, then type status command.

---

## Scene 6: Status Check (1:25 - 1:35)

**What you type:**
```
aicib status
```

**What appears on screen:**
```
FreelancerPM — Company Status

  Agent              Status      Tasks    Cost
  ─────────────────────────────────────────────
  CEO                idle        3/3      $0.42
  CTO                idle        2/2      $0.31
  Backend Engineer   idle        1/1      $0.18
  CMO                idle        1/1      $0.19
  CFO                idle        1/1      $0.13
  ─────────────────────────────────────────────
  Total                          8/8      $1.23

  Session: 4m 12s | All tasks complete.
```

**Narration:**
> "Full transparency. Every agent, every task, every dollar. The entire company ran your brief for a dollar twenty-three. That's the cost of a real CTO, CMO, and CFO -- working together -- for less than a cup of coffee."

**Transition:** Short pause.

---

## Scene 7: CEO Status Report (1:35 - 1:50)

**What appears on screen (continuation of status output or a separate report block):**
```
CEO Status Report:
──────────────────
"All departments have delivered. Here's where we stand:

 Engineering: Architecture locked. Next.js + Supabase + Vercel.
              14-day sprint plan ready. Data model covers projects,
              tasks, time entries, and invoices.

 Marketing:   Target ICP defined (solo consultants, $75K-$200K).
              Positioning: 'Replace your 5-tab workflow.'
              Launch via Product Hunt + freelancer Slack communities.

 Finance:     At $500/mo budget, infrastructure costs ~$87/mo.
              Break-even at 34 paying users ($15/mo plan).
              6-month runway is comfortable with current budget.

 Recommendation: Proceed to development. First milestone: deploy
                 auth + empty dashboard by Day 3."
```

**Narration:**
> "The CEO doesn't just delegate -- it synthesizes. A cross-functional status report that ties engineering, marketing, and finance together into a coherent next step. This is what a real CEO does."

**Transition:** Fade to end card.

---

## Scene 8: End Card (1:50 - 2:00)

**What appears on screen:**

Terminal fades slightly. Centered text appears over the terminal:

```
    ┌─────────────────────────────────────────┐
    │                                         │
    │   One command. An entire AI company.    │
    │                                         │
    │          github.com/aicib/aicib         │
    │              Open source.               │
    │                                         │
    └─────────────────────────────────────────┘
```

**Narration:**
> "One command. An entire AI company. Open source. Star us on GitHub."

---

## Production Notes

### Pacing
- Scenes 1-2 (init + start) are fast and punchy -- establish the concept quickly.
- Scene 3 (brief) is the "wow" moment -- let it breathe. The streaming output IS the demo.
- Scenes 4-5 (communication + deliverables) are the proof -- show that real work happened.
- Scenes 6-7 (status + report) are the payoff -- cost transparency and CEO synthesis.
- Scene 8 (end card) is the CTA -- keep it short and clean.

### If Recording Takes Longer Than 120s
The demo will naturally take 2-4 minutes in real time. Plan to:
1. Record at real speed
2. Speed up Scenes 1-2 to 1.5x
3. Keep Scene 3 at 1x (the streaming is the magic)
4. Speed up Scenes 4-5 to 1.25x
5. Keep Scenes 6-8 at 1x

### Audio
- Background music: subtle lo-fi or ambient electronic (no lyrics)
- Voiceover: recorded separately, laid over the terminal footage
- Terminal typing sounds: optional but adds authenticity

### Visual Polish
- Consider a subtle vignette on the terminal edges
- Agent names could be color-coded (CEO=gold, CTO=blue, CMO=green, CFO=red)
- Deliverable checkmarks in green
- Cost numbers in yellow/amber
