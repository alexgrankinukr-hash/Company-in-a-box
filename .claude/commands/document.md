---
description: Update documentation after code changes
allowed-tools: Read, Write, Edit, Bash(git:*), Glob, Grep
---

# Update Documentation Task

You are updating documentation after code changes. **Always write actual documentation - never just track items.**

## 1. Identify Changes

Check what was modified:
```bash
git diff --name-only  # Uncommitted changes
# OR
git diff --name-only HEAD~1 HEAD  # Last commit
```

For each changed file:
- Note what was added/removed/modified
- Identify which features/modules were affected

## 2. Verify Current Implementation

**CRITICAL**: DO NOT trust existing documentation. Read the actual code.

For each changed file:
- Read the current implementation
- Understand actual behavior (not documented behavior)
- Note any discrepancies with existing docs

## 3. Write Documentation

**ALWAYS write real documentation. Never just add to pending-docs.md.**

### User-Facing Changes -> `docs/flows/`
Changes that affect what users see or do:
- New buttons, screens, dialogs
- Modified workflows or interactions
- New features or capabilities
- Changed behavior or UI

**Action:** Update or create doc in `aicib/docs/flows/`

### Technical/Backend Changes -> `docs/technical/`
Internal implementation details:
- Bug fixes and how they were resolved
- Performance improvements
- New backend endpoints or services
- Database schema changes
- API modifications

**Action:** Update or create doc in `aicib/docs/technical/`

### Edge Cases -> `docs/edge-cases.md`
New edge cases discovered or handled:
- Error conditions
- Boundary cases
- Failure modes

**Action:** Add to `aicib/docs/edge-cases.md`

## 4. Write the Documentation

### For User-Facing Changes -> `docs/flows/`

Update or create files in `aicib/docs/flows/`:

**Format:**
```markdown
# [Feature Name]

## Overview
[What this feature does - 1-2 sentences]

## How It Works
1. User does [action]
2. System shows [result]
3. User can [next action]

## What Can Go Wrong
- [Scenario] -> [What happens, how to fix]

## Technical Notes
- [Implementation detail if relevant to user behavior]
```

### For Technical/Backend Changes -> `docs/technical/`

Create or update files in `aicib/docs/technical/`:

**Format:**
```markdown
# [Module/Feature Name]

## What It Does
[Brief description]

## How It Works
[Explain the flow, data, logic]

## Key Files
- `path/to/file1.ts` - [what it does]
- `path/to/file2.py` - [what it does]

## Edge Cases
- [Scenario] -> [How it's handled]

## Related
- Linear: [issue ID if applicable]
- Related docs: [links to other relevant docs]
```

### For Edge Cases -> `docs/edge-cases.md`

Add to `aicib/docs/edge-cases.md` under appropriate section:

**Format:**
```markdown
### [Feature Name] - [Edge Case]

**Scenario:** [What can happen]
**Handling:** [What the system does]
**User sees:** [What feedback they get]
```

## 5. Documentation Style Rules

**DO:**
- **Concise** - Sacrifice perfect grammar for brevity
- **Practical** - Show examples over theory
- **Accurate** - Code-verified, not assumed
- **Current** - Matches actual implementation
- **Scannable** - Bullet points, short paragraphs
- **Plain English** - User is non-technical

**DON'T:**
- Enterprise fluff ("leverage", "utilize", "facilitate")
- Outdated information
- Assumptions without verification
- Long paragraphs
- Technical jargon in user docs

## 6. Ask if Uncertain

If you're unsure about intent behind a change or user-facing impact, **ask the user** - don't guess.

## 7. Summary

After updating docs, confirm:

```markdown
Documentation Updated

**User-facing docs:**
- Updated/Created: `docs/flows/[name].md`
- What changed: [brief description]

**Technical docs:**
- Updated/Created: `docs/technical/[name].md`
- What changed: [brief description]

**Edge cases:**
- Added to: `docs/edge-cases.md`
- [brief list]

All documentation now matches current implementation.
```

## Important Notes

- **ALWAYS write real docs** - never just track items in pending-docs.md
- User-facing changes -> `docs/flows/`
- Technical changes -> `docs/technical/`
- Keep docs scannable - user should grasp in 30 seconds
- Verify against actual code, not assumptions
