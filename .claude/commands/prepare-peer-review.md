---
description: Generate context package for external AI code review
allowed-tools: Bash(git:*), Read, Grep, Glob
---

# Prepare Peer Review

Generate a comprehensive prompt that you can copy to external AI (Cursor, ChatGPT, etc.) for peer review.

## Goal

Create a self-contained prompt with:
1. Project context
2. The original problem being solved
3. What was implemented and how
4. Code to review
5. What to focus on
6. Review instructions (both code quality AND implementation approach)

## Step 1: Gather Changes

**Check if specific files were provided as arguments.**

### Option A: Specific files provided

If user specifies files: `/prepare-peer-review src/components/Button.tsx src/hooks/useAuth.ts`

1. Use those specific files for review (even if unchanged)
2. Read the full content of each specified file
3. Skip `git diff` - review the files as they currently exist

This is useful when:
- Working on multiple issues and only want to review one
- Reviewing existing code (not just changes)
- Focusing on specific components

### Option B: No files specified (default)

Run `git diff` to get uncommitted changes.

Parse the diff to identify:
- Which files changed
- What was added/removed/modified
- Overall scope of changes

If no uncommitted changes, also check `git diff --cached` for staged changes.

## Step 2: Understand the Problem AND What Was Built

Check recent conversation for:
- **Original problem or task** being solved (what was broken, missing, or needed)
- **Constraints or requirements** that shaped the approach
- Feature description
- Linear issue details
- Implementation plan
- Key decisions made

Summarize in 2-3 sentences what the original problem was and how this implementation solves it.

## Step 3: Extract Code Context

For each modified file:
- Read the full file
- Identify the relevant sections to review
- Include enough surrounding code for context
- Keep it focused (don't include entire 1000-line files)

**Rules for code extraction:**
- Include full functions that were modified (not just diff lines)
- Include related functions if they interact
- Include type definitions/interfaces used
- Maximum 200 lines per file
- If file is larger, extract only most critical sections

## Step 4: Determine Focus Areas

Based on the changes, identify what to emphasize:

- Security (if auth, payments, data access)
- Performance (if loops, data processing, rendering)
- Type safety (if TypeScript changes)
- Error handling (if async operations, API calls)
- Architecture (if new patterns or refactoring)
- Implementation approach (always include - is this the right way to solve the stated problem?)

## Step 5: Generate Review Prompt

Create a formatted prompt using this template:

```markdown
# Code Review Request

**IMPORTANT - READ-ONLY REVIEW**
- **DO NOT edit any files or implement any changes**
- **DO NOT write any code or apply any fixes**
- **DO NOT use tools to modify files**
- **This is a READ-ONLY code review - provide feedback ONLY**
- **I will implement your suggestions myself after reviewing your feedback**

Your role: Analyze the code below AND critically evaluate the implementation approach. Provide code-level feedback, but also consider whether the overall design and strategy are the best way to solve the original problem. The developer will handle all implementation.

---

## Project Context
[Project name]: AI Company-in-a-Box
[Tech Stack]: TypeScript, Node.js, Claude Agent SDK, SQLite
[Repository]: [Describe the product briefly]

## Problem Statement
[Describe the original problem, task, or requirement. What was broken, missing, or needed? What constraints or goals drove this work?]

## What Was Implemented
[2-3 sentence summary of HOW the problem was solved - the approach taken]

**Related Linear Issue:** AIC-XXX (if applicable)

## Key Technical Decisions
- [Decision 1]: [Rationale]
- [Decision 2]: [Rationale]

## Code to Review

### File 1: `path/to/file1.tsx`
**What changed:** [Brief description]

[Extracted code with context]

### File 2: `path/to/file2.py`
**What changed:** [Brief description]

[Extracted code with context]

[Continue for other files...]

## Focus Areas

Please pay special attention to:
1. **[Focus Area 1]** - [Why it matters]
2. **[Focus Area 2]** - [Why it matters]
3. **[Focus Area 3]** - [Why it matters]

## Review Criteria

**Part 1 - Code Quality:** Check for:

- Security vulnerabilities (SQL injection, XSS, auth bypass)
- Performance issues (N+1 queries, unnecessary re-renders)
- Type safety issues (any types, missing null checks)
- Error handling gaps (unhandled promises, silent failures)
- Code quality concerns (overly complex logic, poor naming)

**Part 2 - Implementation Approach:** Critically evaluate:

- Is this the right approach to solve the problem described above? Would a fundamentally different strategy work better?
- Are there simpler alternatives that achieve the same goal with less complexity?
- Do the key technical decisions make sense, or would you have chosen differently?
- Are there well-known patterns, libraries, or architectures that would be a better fit?
- Does the solution over-engineer or under-engineer any part of the problem?

## Output Format

**REMINDER: Provide feedback only - do not edit files or implement changes.**

Please provide:
1. **Overall Assessment**: [Ready to Merge / Needs Changes / Concerns] and a 1-2 sentence summary
2. **Issues Found**: List each issue with severity (CRITICAL/HIGH/MEDIUM/LOW), location, what's wrong, and how to fix it
3. **Implementation Critique**: Given the original problem, would you have approached this differently? Are there alternative designs that would be simpler, more robust, or more maintainable? Evaluate both the overall strategy and individual technical decisions.
4. **Suggestions**: Describe improvements in plain text (you may include code examples to illustrate, but do NOT apply them)
5. **Questions**: Anything unclear about the design decisions

**Format your response as text feedback, not as file edits or implementations.**

---

*This review is for pre-commit validation. The code has not been committed yet. DO NOT commit, push, or modify any files.*
```

## Step 6: Output the Prompt

Display the generated prompt in a code block so user can easily copy it:

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
2. Paste into Cursor, ChatGPT, or other AI
3. **Important**: If the AI tries to edit files or implement changes, stop it and remind it this is a read-only review
4. Get their feedback (text only, no implementations)
5. Return here and use `/peer-review [paste their response]`

Files included in review: [list files]
Total lines of code: ~[X]

**Note**: The prompt explicitly instructs the external AI not to implement changes. If they attempt to edit files, stop them immediately.
```

## Optional: Focus Parameter

If user specifies: `/prepare-peer-review focus on security`

Adjust the "Focus Areas" section to emphasize that topic.

## Important Notes

- Keep the prompt self-contained (external AI has no access to your codebase)
- Include enough context but stay concise (external AIs have token limits)
- Prioritize showing the most complex or risky code
- Don't include secrets, API keys, or sensitive data in the code extracts
- If files are very large, show the modified functions only
