---
description: Create a markdown implementation plan with progress tracking
allowed-tools: Read, Write, Glob, Bash, mcp__linear-server__get_issue, mcp__linear-server__create_comment, AskUserQuestion, EnterPlanMode
---

# Create Plan

Enter plan mode to explore the codebase, design an implementation approach, and create a detailed plan that gets your approval before implementation.

## When to Use This

Use this command when:
- You need to plan implementation after `/explore` or `/create-issue`
- The task is non-trivial (more than a simple one-file change)
- You want to explore the codebase to understand how to integrate
- You want to approve the approach before implementation starts

**Don't use for:**
- Trivial changes (typos, simple tweaks) - just implement directly
- Tasks with very explicit step-by-step instructions already provided

## Step 1: Get Linear Issue ID and Details

Check recent messages for Linear issue created by `/create-issue`. If found:
- Extract issue ID (e.g., "AIC-123")
- Use it for linking

If not found or unclear:
- Ask user: "What's the Linear issue ID for this plan? (or say 'none' if not tracking)"

**If Linear issue ID provided:**
1. Use `mcp__linear-server__get_issue` to fetch the issue details
2. Extract the issue title from the response
3. Save both issue ID and title for later use

**If no Linear issue ID:**
- Skip issue fetching
- Will need to ask user for a descriptive name later (for folder naming)

## Step 2: Check for Master Plan

Ask user:
**"Is this issue part of a larger master plan?**
- If yes, provide the master plan file path (e.g., `aicib/docs/plans/project-name/master-plan.md`)
- If no, type 'none'"

### If Master Plan Provided:

1. **Read the master plan file**
2. **Identify the phase:**
   - Ask: "Which phase is this issue for? (e.g., '3' for Phase 3)"
   - OR try to auto-detect from issue title (look for "Phase X" pattern)
3. **Extract phase section:**
   - Find `## Phase X:` heading in master plan
   - Read everything until next phase heading
   - This gives you: objective, deliverables, technical decisions, files, dependencies, edge cases

Save this context for plan mode.

### If No Master Plan:

- Use exploration context from recent conversation
- Proceed with standalone plan

## Step 3: Determine Plan Folder and File Path

**If from master plan (phase):**
- Project name: Extract from master plan path (e.g., `aicib/docs/plans/billing/master-plan.md` -> "billing")
- Folder: `aicib/docs/plans/[project-name]/phases/`
- File: `phase[X]-[kebab-case-name]-plan.md`

**If standalone (no master plan):**

1. **Generate folder name from issue title:**
   - If Linear issue ID provided: Use issue title from Step 1
   - If no Linear issue: Ask user "What's a short name for this feature?"

2. **Convert to kebab-case:**
   - "Add dark mode toggle" -> "add-dark-mode-toggle"

3. **Create folder structure:**
   - Folder: `aicib/docs/plans/[issue-name]/`
   - File: `plan.md`

## Step 4: Enter Plan Mode

**Use the `EnterPlanMode` tool** to start the exploratory design phase.

Tell the user:
```
Entering plan mode to explore the codebase and design the implementation approach.
I'll investigate how to integrate this change, then present a detailed plan for your approval.
```

**Plan file structure:**

If from master plan:
```markdown
---
linear_issue: AIC-123
master_plan: aicib/docs/plans/[project]/master-plan.md
phase: 3
created: YYYY-MM-DD
---

# Phase [X] Implementation: [Phase Name]

**Overall Progress:** `0%`

## TLDR
[Phase objective from master plan]

## Context
[Phase context: dependencies, technical decisions, edge cases]

## Implementation Steps

### Step 1: [Step Name]
[Description and rationale]

**Subtasks:**
- Subtask 1
- Subtask 2

### Step 2: [Step Name]
...

## Testing Plan
[How to verify this works]

## Rollback Plan
[How to undo if things go wrong]
```

If standalone:
```markdown
---
linear_issue: AIC-123
created: YYYY-MM-DD
---

# Implementation Plan: [Feature Name]

**Overall Progress:** `0%`

## TLDR
[One sentence summary]

## Context
[Background and why this change]

## Implementation Steps

### Step 1: [Step Name]
[Description]

**Subtasks:**
- Subtask 1
- Subtask 2

### Step 2: [Step Name]
...

## Testing Plan
[How to verify]

## Rollback Plan
[How to undo]
```

**Progress Indicators:**
- To Do - Not started yet
- In Progress - Currently working on
- Done - Completed

### Progress Calculation

Update the overall progress percentage at the top based on completed tasks:
```
**Overall Progress:** `[X]%`
```

Calculate as: (completed tasks / total tasks) x 100

## Step 5: Exit Plan Mode

**Plan mode will exit when:**
- The plan file has been written to the correct location
- You approve the plan

**User will be prompted to approve the plan.**

## Step 5A: Move Plan File to Correct Location

**IMPORTANT:** Plan mode saves files to `.claude/plans/` by default. We need to move it to the correct location.

1. **Find the plan file created by plan mode**
2. **Read the plan file contents**
3. **Create target directory structure**
4. **Write plan to correct location**
5. **Clean up** (optional)

## Step 6: Link Plan to Linear Issue

If Linear issue ID exists, add plan link as comment on Linear issue.

Use `mcp__linear-server__create_comment`:

**If from master plan:**
```
Issue ID: [from step 1]
Body:
**Phase [X] Implementation Plan Created**

Full plan: `aicib/docs/plans/[project-name]/phases/phase[X]-[name]-plan.md`
Master plan: `aicib/docs/plans/[project-name]/master-plan.md`

This phase plan breaks down Phase [X] deliverables into granular implementation steps.
Progress will be tracked during implementation.
```

**If standalone:**
```
Issue ID: [from step 1]
Body:
**Implementation Plan Created**

Full plan: `aicib/docs/plans/[issue-name]/plan.md`

This plan will be updated during implementation with progress tracking.
Folder created for this issue to organize all related planning materials.
```

## Step 7: Output Plan for Review

After linking to Linear:

1. **Read the plan file** using the Read tool
2. **Output the full plan contents in chat** so user can review immediately

## Step 8: Confirm with User

```
Created implementation plan

Location: aicib/docs/plans/[path]/plan.md

Overview:
- X main steps with Y subtasks
- Linked to Linear issue AIC-123
- Critical decisions documented

Next steps:
- **Recommended:** Run `/review-plan` to verify technical claims before implementing
- Start implementation: `/execute`
- Or adjust the plan if needed
```

## Guidelines

**DO:**
- Enter plan mode for all non-trivial implementation planning
- Let plan mode explore the codebase to understand patterns
- Design the approach before writing detailed steps
- Get user approval on the plan before implementation
- Save plan to correct location (phase folder or root)
- Link to Linear for tracking

**DON'T:**
- Skip plan mode and write plans directly in conversation
- Add scope beyond what was discussed
- Make assumptions without exploring the codebase
- Forget to link plan to Linear issue
- Skip outputting the plan for user review

## Important Notes

- **Plan mode is the design phase** - it explores and proposes an approach
- **Markdown plans are the tracking artifact** - saved, versioned, linked to Linear
- **User approval required** - plan mode won't exit without approval
- If user rejects the plan, plan mode can revise and try again
- Once approved, use `/execute` to implement the plan
