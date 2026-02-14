---
description: Generate self-contained planning prompt for external AIs (Codex, etc.)
allowed-tools: Bash(git:*), Read, Grep, Glob, mcp__linear-server__get_issue, mcp__linear-server__list_comments
---

# Prepare Plan Prompt

Generate a comprehensive planning prompt that can be used by external AIs (Codex, ChatGPT, etc.) for implementation planning.

## Goal

Create a self-contained prompt with:

1. Linear issue context (title, description, acceptance criteria)
2. Tech stack information
3. Relevant codebase context
4. Planning instructions
5. Output format requirements

## Step 1: Get Linear Issue Context

**Check if issue ID was provided as argument.**

### Option A: Issue ID provided

If user specifies: `/prepare-plan-prompt AIC-123`

1. Fetch issue details using `mcp__linear-server__get_issue`
2. Extract: title, description, labels, priority
3. Fetch comments for additional context

### Option B: No issue ID (use recent context)

1. Check recent conversation for Linear issue mentions
2. If found, use that issue ID
3. If not found, ask user for issue ID

## Step 2: Gather Tech Stack Info

Read from `CLAUDE.md` to extract:

- Backend technology and frameworks
- Frontend technology and frameworks
- Database
- Key patterns and conventions

## Step 3: Find Relevant Files

Based on the issue description, identify likely relevant files:

1. Search for keywords from the issue title/description
2. Find entry points (main components, services, routes)
3. Identify related tests if they exist

Use `Grep` and `Glob` to find:

- Components mentioned in the issue
- Services that might be affected
- API endpoints related to the feature

**Rules:**

- Maximum 5-10 files for context
- Prioritize entry points over utility files
- Include type definitions if relevant

## Step 4: Extract Current Patterns

Look for similar features already implemented:

1. How are similar components structured?
2. What naming conventions are used?
3. How is state managed?
4. How are API calls made?

This helps the external AI follow existing patterns.

## Step 5: Generate Planning Prompt

Create a formatted prompt using this template:

```markdown
# Implementation Planning Request

**IMPORTANT - PLANNING ONLY**
- DO NOT write any code
- DO NOT implement anything
- Create a detailed implementation PLAN only
- Describe the approach, not the code

---

## Issue Context

**Linear Issue:** [ID] - [Title]
**Priority:** [Priority]
**Labels:** [Labels]

### Description

[Issue description from Linear]

### Acceptance Criteria

[Extracted from description or comments]

---

## Tech Stack

[Tech stack details from CLAUDE.md]

---

## Relevant Codebase Context

### Key Files

[List of relevant files with brief descriptions]

### Current Patterns

[How similar features are implemented]

### Directory Structure

[Project directory layout]

---

## Planning Instructions

Create an implementation plan that includes:

1. **Overview** - What this feature does (2-3 sentences)

2. **Implementation Steps** - Numbered steps with:
   - What to do
   - Which files to modify/create
   - Key decisions and rationale

3. **Data Model Changes** - If any database/model changes needed

4. **API Changes** - New or modified endpoints

5. **UI Components** - Components to create/modify

6. **Edge Cases** - What could go wrong and how to handle it

7. **Testing Approach** - How to verify it works

---

## Output Format

Structure your plan as:

# Implementation Plan: [Feature Name]

## Overview
[Brief summary]

## Implementation Steps

### Step 1: [Name]
- Files: [list]
- What: [description]
- Why: [rationale]

### Step 2: [Name]
...

## Key Decisions
- [Decision]: [Chosen approach] because [reason]

## Edge Cases
- [Case]: [How to handle]

## Testing
- [What to test]

---

*This is a planning request. Return only the implementation plan, no code.*
```

## Step 6: Output the Prompt

Display the generated prompt in a code block:

```
=====================================
COPY THIS PROMPT TO EXTERNAL AI
=====================================

[Generated prompt here]

=====================================
END OF PROMPT
=====================================

Instructions:
1. Copy the prompt above
2. Paste into Codex, ChatGPT, or other AI
3. The AI will return an implementation plan (no code)
4. Return here to continue with /auto-create-plan workflow

Linear Issue: [ID]
Files referenced: [count]
```

## Optional: Save to File

If called from `/auto-create-plan`, save the prompt to a temp file.

Return the file path for the orchestrating command to use.

## Important Notes

- Keep the prompt self-contained (external AI has no codebase access)
- Include enough context but stay concise (token limits)
- Focus on relevant files, not the entire codebase
- Don't include secrets, API keys, or sensitive data
- Planning prompts should request plans, NOT code
