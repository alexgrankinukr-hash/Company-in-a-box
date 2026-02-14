---
description: Implement the plan step by step
allowed-tools: Write, Edit, Read, Grep, Glob, Bash, TodoWrite, mcp__linear-server__create_comment
---

# Execute

Implement the plan step by step.

## Step 1: Determine Which Plan to Follow

### If user provides plan path:
```
/execute aicib/docs/plans/project/phases/phase1-plan.md
```
Use the specified plan file.

### If no path provided:
```
/execute
```

Try to find the plan in this order:
1. Check recent messages for plan file mentioned by `/create-plan`
2. Look for phase plans: search `aicib/docs/plans/*/phases/*.md` for most recent file
3. Look for standalone plans: search `aicib/docs/plans/*/plan.md` for most recent file (excludes phase plans)
4. If multiple or none found, ask user: "Which plan should I follow?"

### If no plan file exists:
Use current plan mode plan (from this conversation context).

## Step 2: Read the Plan

If using markdown plan file:
- Read the entire plan file
- Note the `linear_issue` from frontmatter (if present)
- Understand all steps and substeps
- Check current progress (which items are done vs pending)

If using plan mode plan:
- Use the plan from current conversation
- Track progress with TodoWrite

## Step 3: Implement Step by Step

Now implement precisely as planned, in full.

Implementation Requirements:

- **Write elegant, minimal, modular code**
- **Adhere strictly to existing code patterns, conventions, and best practices**
- **Include thorough, clear comments/documentation within the code**

For each step:

### A. Mark as In Progress

**If using markdown plan file:**
- Update step status to in-progress
- Update progress percentage
- Edit the plan file with these changes

**If using plan mode:**
- Update TodoWrite status to "in_progress"

### B. Implement the Step

- Read relevant files
- Make necessary changes (Write/Edit)
- Follow existing patterns
- Add comments where needed
- Test as you go

### C. Mark as Complete

**If using markdown plan file:**
- Update step status to done
- Recalculate overall progress percentage
- Edit the plan file with these changes

**If using plan mode:**
- Update TodoWrite status to "completed"

### D. Add Implementation Notes (Optional)

If step had significant findings or decisions, add Linear comment:
```
Use mcp__linear-server__create_comment if linear_issue exists:

Body:
**Step [N] Complete**: [Step Name]

Key changes:
- [Change 1]
- [Change 2]

Notes:
- [Any important decisions or findings]
```

Only add Linear comments for significant milestones, not every substep.

## Step 4: After All Steps Complete

Confirm completion:

**If using markdown plan file:**
```
Implementation complete!

Plan: aicib/docs/plans/[path-to-plan].md
Progress: 100%
All [X] steps completed

Next steps:
- Review code: `/review`
- Update docs: `/document`
- Wrap up: `/complete`
```

**If using plan mode:**
```
Implementation complete!

All [X] tasks from plan mode completed

Next steps:
- Review code: `/review`
- Update docs: `/document`
- Wrap up: `/complete`
```

## Important Rules

### Progress Tracking

When updating markdown plan files:
- Always update both status indicators and progress percentage
- Recalculate progress percentage after each step
- Formula: (completed items / total items) x 100

### Code Quality

- Follow patterns from existing codebase
- Add comments for non-obvious logic
- Keep functions small and focused
- Test each piece before moving to next

### Linear Integration

- Only add Linear comments for major milestones
- Keep comments concise
- Include what was done, not how (code speaks for itself)

### When Blocked

If you encounter an issue:
1. Don't skip the step
2. Document the blocker
3. Ask user for clarification
4. Update plan with blocker note
