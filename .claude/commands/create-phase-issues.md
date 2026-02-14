---
description: Break master plan into phase-specific Linear issues
allowed-tools: Read, mcp__linear-server__create_issue, mcp__linear-server__update_issue, AskUserQuestion
---

# Create Phase Issues

Read a master implementation plan and create individual Linear issues for each phase.

## When to Use This

After creating a master plan with `/create-master-plan`, use this command to:
- Create one Linear issue per phase
- Link phases together (dependencies)
- Set up tracking for the entire project

## Step 1: Get Master Plan Path

User provides master plan file path as argument:
```
/create-phase-issues aicib/docs/plans/project-name/master-plan.md
```

If no argument provided, ask:
"What's the path to the master plan file?"

## Step 2: Read and Parse Master Plan

Read the master plan file and extract:

1. **Project metadata** (from frontmatter):
   - Project name
   - Total phases
   - Overall description

2. **For each phase** (from `## Phase X:` sections):
   - Phase number
   - Phase name
   - Objective
   - Deliverables
   - Technical decisions
   - Dependencies
   - Complexity
   - Estimated effort

Parse until you find all phases (look for pattern `## Phase [number]:`)

## Step 3: Confirm with User

Show summary and ask for confirmation:

```
Found [X] phases in master plan: [project-name]

Phases to create:
1. Phase 1: [Name] - [Complexity], [Effort]
2. Phase 2: [Name] - [Complexity], [Effort]
3. Phase 3: [Name] - [Complexity], [Effort]
...

This will create [X] Linear issues in the "aicib" team.
Proceed? (yes/no)
```

## Step 4: Create Linear Issues

For each phase, create a Linear issue using `mcp__linear-server__create_issue`:

### Issue Structure:

**Title format:**
```
[Project Name] - Phase [X]: [Phase Name]
```

**Description format:**
```markdown
**Phase [X] of [Total]** in the [Project Name] project

**Master Plan:** `[path/to/master-plan.md]`

## Objective
[Phase objective from master plan]

## Deliverables
- [Deliverable 1]
- [Deliverable 2]
- [Deliverable 3]

## Technical Decisions
- [Decision 1]: [Rationale]
- [Decision 2]: [Rationale]

## Files to Modify
- `path/to/file1.ts`
- `path/to/file2.py`

## Edge Cases
- [Edge case 1]
- [Edge case 2]

## Dependencies
[Dependencies text from master plan]

---

**Complexity:** [Simple/Medium/Complex]
**Estimated Effort:** [X-Y hours]

Use `/create-plan` with this issue to generate detailed implementation plan.
```

**Fields:**
- `team`: "aicib"
- `title`: [As formatted above]
- `description`: [As formatted above]
- `labels`: ["Phase"]
- `estimate`: [Convert effort to points: 2-4h=1, 4-6h=2, 6-8h=3, 8-12h=5, 12+=8]

Store created issue IDs to link dependencies later.

## Step 5: Link Dependencies

After all issues are created, link dependencies using `mcp__linear-server__update_issue`:

For each phase that has dependencies:
- Parse dependency text (e.g., "Phase 1 complete", "Depends on Phase 2 and 3")
- Extract phase numbers
- Get issue IDs from created issues
- Use `update_issue` with `blockedBy` field

**IMPORTANT:** When updating `blockedBy`, you must include ALL blocking issues, not just new ones.

## Step 6: Return Summary

List all created issues with links:

```markdown
Created [X] phase issues for [Project Name]

Master plan: `[path]`

Issues created:

**Phase 1:** AIC-124 - [Phase 1 Name]
- Complexity: [X]
- Effort: [X hours]
- Dependencies: None

**Phase 2:** AIC-125 - [Phase 2 Name]
- Complexity: [X]
- Effort: [X hours]
- Dependencies: Phase 1 (AIC-124)

[... continue for all phases ...]

---

**Next Steps:**

For each phase (in order):
1. `/create-plan` (provide Linear issue ID and master plan path)
2. `/execute` the generated phase plan
3. `/review` -> `/document` -> `/complete`
4. Move to next phase

**View in Linear:** Filter by label "Phase" to see all issues

**Parallel Work:**
Based on master plan, these phases can be done in parallel:
- [List any parallel phases if mentioned in master plan]
```

## Guidelines

**Issue Naming:**
- Always include project name for context
- Include phase number for ordering
- Keep phase name concise but descriptive

**Dependency Linking:**
- Parse dependencies carefully (look for phase numbers)
- Link ALL blocking phases, not just immediate predecessor
- Example: If Phase 5 depends on 1, 2, 3 -> link all three

**Estimate Conversion:**
Be consistent:
- 2-4 hours = 1 point
- 4-6 hours = 2 points
- 6-8 hours = 3 points
- 8-12 hours = 5 points
- 12+ hours = 8 points (or consider breaking phase down)

## Important Notes

- Issues are created in "aicib" team
- All issues get "Phase" label for filtering
- Dependencies are linked via `blockedBy` relationships
- Master plan path is included in each issue for reference
- Effort estimates are converted to Linear story points
- This command doesn't create the implementation plans - that's done per phase with `/create-plan`
