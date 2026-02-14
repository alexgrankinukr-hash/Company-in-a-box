---
description: Create strategic master plan for multi-phase projects
allowed-tools: Write, Read, Glob, AskUserQuestion
---

# Create Master Plan

After exploring a large project, create a strategic master plan that breaks work into distinct phases.

## When to Use This

Use this command when:
- Project has 5+ distinct implementation stages
- Work will span 1-2 weeks
- Phases have dependencies (Phase 2 needs Phase 1)
- Multiple team members might work on different phases
- You need high-level roadmap before diving into details

**Don't use for:**
- Single features (use `/create-plan` directly)
- Quick fixes
- Projects < 3 phases

## Your Goal

Create a strategic master plan that:
- Breaks project into logical phases
- Identifies dependencies between phases
- Captures key technical decisions
- Provides context for future phase planning
- **Does NOT include granular implementation steps** (that's for `/create-plan`)

## Step 1: Understand Project Scope

Review recent exploration conversation:
- What's the full scope of this project?
- What are the major components/milestones?
- What are the dependencies?
- What's the logical sequence?

If unclear, ask user:
- "What's the project name?"
- "How many phases do you envision? (5-12 typical)"
- "Are there critical dependencies I should know about?"

## Step 2: Identify Phases

Break the project into logical phases based on:
- **Natural boundaries** (backend -> frontend -> integration)
- **Dependencies** (database schema before API endpoints)
- **Deliverables** (each phase should produce something concrete)
- **Complexity** (aim for 4-8 hour phases, not 1 hour or 40 hours)

**Good phase examples:**
- Phase 1: Database Schema & Models
- Phase 2: Backend API Endpoints
- Phase 3: Frontend Components
- Phase 4: Integration & Testing

**Bad phase examples:**
- Phase 1: Everything (too broad)
- Phase 1: Add one import statement (too narrow)
- Phase 1: Miscellaneous fixes (not cohesive)

## Step 3: Generate Project Name

Ask user for project name if not obvious from context:
- Use kebab-case (e.g., "multi-feature-system", "billing-implementation")
- Keep it descriptive but concise

## Step 4: Create Project Folders

Create the following structure:
```
aicib/docs/plans/[project-name]/
  master-plan.md
  overview.md
  phases/
```

Steps:
1. Create directory: `aicib/docs/plans/[project-name]/`
2. Create subdirectory: `aicib/docs/plans/[project-name]/phases/`
3. Create master plan file: `aicib/docs/plans/[project-name]/master-plan.md`
4. Create overview file: `aicib/docs/plans/[project-name]/overview.md`

## Step 5: Write Master Plan File

Save to: `aicib/docs/plans/[project-name]/master-plan.md`

### Master Plan Template:

```markdown
---
project: [Project Name]
created: YYYY-MM-DD
total_phases: [X]
phases_completed: 0
estimated_duration: [X-Y weeks]
status: not_started
---

# Master Plan: [Project Name]

## Overview

**What:** [1-2 sentence description of the entire project]

**Why:** [Business/technical reason for this project]

**Scope:** [High-level scope - what's included and what's NOT]

**Success Criteria:**
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

---

## Phase 1: [Phase Name]

**Objective:** [What this phase accomplishes in 1 sentence]

**Deliverables:**
- [Concrete deliverable 1]
- [Concrete deliverable 2]
- [Concrete deliverable 3]

**Technical Decisions:**
- [Decision 1]: [Rationale]
- [Decision 2]: [Rationale]

**Files to Modify:**
- `path/to/file1.py`
- `path/to/file2.tsx`
- `path/to/file3.ts`

**Edge Cases:**
- [Edge case 1]
- [Edge case 2]

**Dependencies:** None (first phase)

**Complexity:** [Simple / Medium / Complex]

**Estimated Effort:** [X-Y hours]

---

## Phase 2: [Phase Name]

**Objective:** [What this phase accomplishes]

**Deliverables:**
- [Deliverable 1]
- [Deliverable 2]

**Technical Decisions:**
- [Decision]: [Rationale]

**Files to Modify:**
- `path/to/file.ts`

**Edge Cases:**
- [Edge case]

**Dependencies:** Phase 1 (needs database schema)

**Complexity:** [Simple / Medium / Complex]

**Estimated Effort:** [X-Y hours]

---

[Continue for all phases...]

---

## Sequencing Strategy

**Sequential Phases (must be done in order):**
- Phases 1-3 (foundation)
- Phase 7 depends on 4-6 complete

**Parallel Phases (can be done simultaneously):**
- Phases 4-6 (independent features)
- Phases 9-10 (separate components)

**Critical Path:** 1 -> 2 -> 3 -> 7 -> 11 -> 12

---

## Critical Technical Decisions

### Decision 1: [Topic]
**Choice:** [What we're doing]
**Rationale:** [Why this approach]
**Impact:** [Which phases this affects]

### Decision 2: [Topic]
**Choice:** [What we're doing]
**Rationale:** [Why this approach]
**Impact:** [Which phases this affects]

---

## Risks & Mitigations

**Risk:** [What could go wrong]
**Impact:** [How bad it would be]
**Mitigation:** [How we'll prevent/handle it]

---

## Architecture Overview

[Optional: High-level architecture diagram in text/ASCII or description of major components and how they fit together]

---

## Testing Strategy

**Per Phase:**
- Unit tests for new functions
- Integration tests if API changes
- Manual testing of UI changes

**Final Phase:**
- End-to-end testing
- Performance testing
- Security review

---

## Documentation Requirements

**During Implementation:**
- Update `docs/flows/` for user-facing changes
- Add to `docs/pending-docs.md` for technical changes
- Track edge cases in `docs/edge-cases.md`

**After Completion:**
- Update main README if architecture changed
- Document new APIs in technical docs
- Create user guide if needed

---

## Notes

[Any additional context that doesn't fit above]
[Known limitations or future work]
[External dependencies or blockers]
```

## Step 6: Write Overview File

Save to: `aicib/docs/plans/[project-name]/overview.md`

### Overview Template:

```markdown
# Project Overview: [Project Name]

**Status:** Phase 0/[X] Complete
**Started:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD

---

## Progress Summary

- Phase 1: [Phase Name] - Not Started
- Phase 2: [Phase Name] - Not Started
- Phase 3: [Phase Name] - Not Started
[Continue for all phases...]

---

## Implementation Log

(Phases will be appended here as they complete via `/complete`)
```

**Instructions:**
- List all phases from the master plan with not-started status
- Leave Implementation Log section empty - will be filled by `/complete` command
- This file acts as a living changelog for the project

## Step 7: Confirm with User

Tell the user:

```
Created master plan structure at aicib/docs/plans/[project-name]/

Files created:
- master-plan.md - Strategic phase breakdown
- overview.md - Living progress tracker
- phases/ - Folder for phase-specific plans

Overview:
- [X] phases identified
- Sequential: [list]
- Parallel opportunities: [list]
- Estimated total effort: [X-Y hours / days]

Next steps:
1. **Recommended:** Run `/review-plan` to verify technical claims, pricing, and assumptions
2. Review the master plan: aicib/docs/plans/[project-name]/master-plan.md
3. Use `/create-phase-issues aicib/docs/plans/[project-name]/master-plan.md` to create Linear issues
4. Or adjust phases if needed

Master plan is strategic - detailed tactical plans will be created per phase during `/create-plan`.
The overview.md file will be automatically updated by `/complete` as phases finish.
```

## Guidelines

**Phase Definition Rules:**

**DO:**
- Make phases cohesive (related work grouped)
- Size phases for 4-8 hours of work
- Identify clear deliverables per phase
- Note dependencies explicitly
- Include technical context (decisions, edge cases)
- Keep objective clear and measurable

**DON'T:**
- Create 20+ phases (too granular)
- Create 2-3 huge phases (too broad)
- Mix unrelated work in one phase
- Forget to identify dependencies
- Include step-by-step implementation (save for phase plans)

**Detail Level:**

Master plan should be **strategic, not tactical**:
- "Add feature CRUD endpoints" (strategic)
- NOT "Define Feature model, create POST /features endpoint, add error handling" (tactical - save for phase plan)

**Estimation:**

Be realistic but don't overthink:
- Simple phase: 2-4 hours
- Medium phase: 4-8 hours
- Complex phase: 8-12 hours

If phase > 12 hours, break it down further.

## Important Notes

- Master plan is a **living document** - can be updated as you learn
- Each phase will get its own detailed plan via `/create-plan`
- Use `/create-phase-issues` after this to create Linear tracking
- Master plan stays high-level - details go in phase plans
- Focus on WHAT to build and WHY, not HOW
