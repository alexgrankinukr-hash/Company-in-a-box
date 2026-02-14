---
description: Quickly capture bugs/features/improvements as Linear issues
allowed-tools: mcp__linear-server__create_issue, mcp__linear-server__list_issue_labels, Grep, WebSearch, AskUserQuestion
---

# Create Issue

User is mid-development and thought of a bug/feature/improvement. Capture it fast so they can keep working.

## Two Usage Modes

### Mode 1: After `/explore` (Detailed)
If recent conversation includes exploration summary from `/explore` command:
- Use exploration findings to create comprehensive issue
- Include technical decisions, integration points, edge cases
- Minimal additional questions needed

### Mode 2: Quick Capture (Standalone)
If no exploration context:
- Ask questions to understand issue
- Gather context yourself
- Keep it fast (under 2 minutes)

## Your Goal

Create a complete Linear issue with:
- Clear title
- TL;DR of what this is about
- Current state vs expected outcome
- Relevant files that need touching (max 3)
- Risk/notes if applicable
- Proper type label (Bug/Feature/Improvement)
- Priority if indicated

## How to Get There

### Step 1: Check for Exploration Context

Look back in recent conversation for `/explore` output. If found:
- Extract: What we're building, key decisions, files, complexity, edge cases
- Use this as primary context
- Skip to Step 3

### Step 2: Gather Context (if no exploration)

**Ask questions** to fill gaps - be concise, respect the user's time. Usually need:
- What's the issue/feature
- Current behavior vs desired behavior
- Type (bug/feature/improvement) and priority if not obvious

Keep questions brief. One message with 2-3 targeted questions beats multiple back-and-forths.

**Search for context** only when helpful:
- Web search for best practices if it's a complex feature
- Grep codebase to find relevant files
- Note any risks or dependencies you spot

**Skip what's obvious** - If it's a straightforward bug, don't search web. If type/priority is clear from description, don't ask.

### Step 3: Create the Linear Issue

Use `mcp__linear-server__create_issue` with:

**Required fields:**
- `title` - Clear, concise summary (e.g., "Login button unresponsive on mobile")
- `team` - Always use "aicib"
- `description` - Structured markdown:

**If from exploration:**
```markdown
## TL;DR
[One-line summary from exploration]

## What We're Building
[Summary from exploration]

## Technical Approach
[Key decisions from exploration]

## Files to Modify
- path/to/file1.ts
- path/to/file2.py

## Edge Cases
- [Edge case 1]
- [Edge case 2]

## Notes
[Constraints, dependencies, complexity level]
```

**If quick capture:**
```markdown
## TL;DR
[One-line summary]

## Current State
[What happens now]

## Expected Outcome
[What should happen]

## Relevant Files
- path/to/file1.ts (if known)

## Notes
[Any risks, dependencies, or context]
```

**Optional fields:**
- `labels` - Choose from: "Bug", "Improvement", or "Feature"
- `priority` - Only set if user indicated urgency:
  - 0 = No priority (default)
  - 1 = Urgent
  - 2 = High
  - 3 = Normal
  - 4 = Low
- `estimate` - Only set if clear scope from exploration (1-8 points)

### Step 4: Return Issue Details

After creating, tell the user:
- Issue ID (e.g., "AIC-123")
- Issue title
- Link to view in Linear
- Quick summary of what was captured

Format:
```
Created Linear issue AIC-123: "Title here"
View: https://linear.app/aicib/issue/AIC-123

Captured as [Bug/Feature/Improvement] with [complexity] scope.
Listed X files to modify and Y edge cases to consider.

Next: Use `/create-plan` to generate implementation plan.
```

## Behavior Rules

- **Check context first** - Look for exploration findings before asking questions
- **Be fast** - Total exchange under 2 minutes (quick capture) or instant (post-exploration)
- **Be conversational** - Natural questions, not robotic checklist
- **Default wisely** - priority: 0 (none), don't set estimate unless clear
- **Stay focused** - Max 3 files in context, bullet points over paragraphs
- **Respect their flow** - They're working, capture and get out of the way
