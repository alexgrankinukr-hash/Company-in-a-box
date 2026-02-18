---
description: Automated three-way code review with Codex, Cursor, and Claude - consolidates findings into action plan
allowed-tools: Bash(git:*,codex *,cursor-agent *,mkdir *,ls *,wc *,test *,which *,sleep *,ps *), Read, Write, Grep, Glob, Task, EnterPlanMode
---

# Auto Peer Review

## HARD RULES — Read These First

You MUST follow every rule below. Do NOT improvise, do NOT fall back to "common" review patterns.

### Rule 1: NEVER put review content in main chat
ALL review content (prompts, reviews, action plans) goes to FILES on disk. The main chat only ever sees short 1-3 line summaries. This is the entire point of this command — if you dump content into chat, you've defeated the purpose.

### Rule 2: NEVER use the Skill tool
The Skill tool is NOT in allowed-tools. Do NOT try to invoke `/prepare-peer-review` or `/review` as skills. Use Task agents that follow the same logic and write to files.

### Rule 3: NEVER use /tmp/ — use docs/code-reviews/
Reviews are PERSISTENT records saved inside the repo. The directory is `{REPO_ROOT}/docs/code-reviews/{SESSION}/`. Never use `/tmp/` or any temporary directory.

### Rule 4: NEVER use shell variables across Bash calls
Each Bash tool call is a fresh shell. `$REVIEW_DIR` from one call does NOT exist in the next. Always use the full literal path string in every Bash call.

### Rule 5: Use EXACT CLI syntax specified below
Do NOT guess Codex or Cursor CLI flags. The exact commands are provided — copy them, substituting only the path.

### Rule 6: All review files use .md extension
`codex-review.md`, `cursor-review.md`, `claude-review.md` — NEVER `.txt`.

---

## Overview

Orchestrates three AI reviewers in parallel, saves results to persistent files, consolidates into an action plan, and enters plan mode.

```
docs/code-reviews/{session}/
  prompt.md          ← Review prompt (input for all 3 reviewers)
  codex-review.md    ← Codex output
  cursor-review.md   ← Cursor output
  claude-review.md   ← Claude output
  action-plan.md     ← Consolidated action plan
```

---

## Step 1: Setup

### 1A: Determine repo root and session name

First, get the repo root (works in both main repo and worktrees):

```bash
git rev-parse --show-toplevel
```

Store this as `REPO_ROOT` (a literal string you remember, NOT a shell variable).

For the session name:
- If user provided an argument (e.g. `/auto-peer-review agent-scheduler`), use it.
- If no argument, auto-generate: run `git rev-parse --abbrev-ref HEAD`, then append today's date. Example: `phase-3-wave-1_2026-02-18`. Sanitize: replace `/` with `-`.

You now have two literal strings to use in ALL subsequent steps:
- `REPO_ROOT` — e.g. `/Users/oleksiihrankin/Downloads/AI Startup/worktrees/phase3-wave1-s6`
- `REVIEW_DIR` — e.g. `/Users/oleksiihrankin/Downloads/AI Startup/worktrees/phase3-wave1-s6/docs/code-reviews/agent-scheduler`

### 1B: Create directory and check for changes

Run in ONE Bash call:

```bash
mkdir -p "{REVIEW_DIR}" && git -C "{REPO_ROOT}" diff --stat HEAD && git -C "{REPO_ROOT}" diff --cached --stat
```

If both diffs are empty, stop: "No uncommitted changes found."

### 1C: Check which reviewers are available

```bash
which codex 2>/dev/null && echo "CODEX_AVAILABLE" || echo "CODEX_NOT_FOUND"; which cursor-agent 2>/dev/null && echo "CURSOR_AVAILABLE" || echo "CURSOR_NOT_FOUND"
```

Tell the user which reviewers were found. Claude is always available.

---

## Step 2: Generate Review Prompt

**Use a Task agent** to generate the prompt and write it to a file.

⚠️ Do NOT generate the prompt yourself. Do NOT output prompt content to chat. The Task agent writes to file and returns a 1-line summary.

Launch this Task agent call:
- **subagent_type:** `general-purpose`
- **mode:** `bypassPermissions`
- **description:** `Generate review prompt`
- **prompt:** (substitute your actual REPO_ROOT and REVIEW_DIR paths below)

```
Generate a code review prompt and write it to a file.

INSTRUCTIONS:
1. Run: git -C "{REPO_ROOT}" diff HEAD
   If empty, also try: git -C "{REPO_ROOT}" diff --cached
2. Parse the diff to identify which files changed
3. Read each changed file IN FULL using the Read tool
4. Generate a review prompt in markdown with these sections:
   - "# Code Review Request" header
   - "## READ-ONLY REVIEW" warning (reviewer must NOT edit files or implement fixes)
   - "## Project Context" — AI Company-in-a-Box, TypeScript CLI, Claude Agent SDK, SQLite
   - "## Problem Statement" — what was being solved (infer from code changes and commit messages)
   - "## What Was Implemented" — 2-3 sentence summary
   - "## Code to Review" — for each changed file: filename, what changed, extracted code (full functions, not just diff lines, max 200 lines per file)
   - "## Focus Areas" — based on what changed (security, performance, types, error handling, etc.)
   - "## Review Criteria" — Part 1: Code quality checks. Part 2: Implementation approach critique.
   - "## Output Format" — ask for: overall assessment, issues with severity/location/fix, implementation critique, suggestions
5. Write the complete prompt to this EXACT path using the Write tool:
   {REVIEW_DIR}/prompt.md
6. Return ONLY this text (nothing else): "Prompt generated: X files, ~Y lines of code reviewed"
```

Wait for this Task agent to complete before proceeding to Step 3.

---

## Step 3: Launch All 3 Reviews in Parallel

⚠️ Step 2 must be COMPLETE (prompt.md must exist) before starting this step.

Launch these in the SAME tool call batch so they run in parallel:

### 3A: External reviewers — single background Bash command

⚠️ Use the EXACT commands below. Do NOT change model names, flags, or flag order.

**If BOTH Codex and Cursor are available:**

```bash
codex exec -o "{REVIEW_DIR}/codex-review.md" review --uncommitted -m gpt-5.3-codex-high --ephemeral & CODEX_PID=$! ; cat "{REVIEW_DIR}/prompt.md" | cursor-agent -p --mode plan --trust --force --model composer-1.5 --workspace "{REPO_ROOT}" > "{REVIEW_DIR}/cursor-review.md" 2>&1 & CURSOR_PID=$! ; echo "Codex PID:$CODEX_PID Cursor PID:$CURSOR_PID" ; TIMEOUT=600; ELAPSED=0; while [ $ELAPSED -lt $TIMEOUT ]; do C1=0; C2=0; ps -p $CODEX_PID >/dev/null 2>&1 || C1=1; ps -p $CURSOR_PID >/dev/null 2>&1 || C2=1; [ $C1 -eq 1 ] && [ $C2 -eq 1 ] && break; sleep 10; ELAPSED=$((ELAPSED+10)); echo "${ELAPSED}s..."; done ; echo "=== Done ===" ; [ -s "{REVIEW_DIR}/codex-review.md" ] && echo "Codex: $(wc -l < "{REVIEW_DIR}/codex-review.md") lines" || echo "Codex: empty/failed" ; [ -s "{REVIEW_DIR}/cursor-review.md" ] && echo "Cursor: $(wc -l < "{REVIEW_DIR}/cursor-review.md") lines" || echo "Cursor: empty/failed"
```

**If only Codex available:**
```bash
codex exec -o "{REVIEW_DIR}/codex-review.md" review --uncommitted -m gpt-5.3-codex-high --ephemeral ; echo "=== Done ===" ; [ -s "{REVIEW_DIR}/codex-review.md" ] && echo "Codex: $(wc -l < "{REVIEW_DIR}/codex-review.md") lines" || echo "Codex: empty/failed"
```

**If only Cursor available:**
```bash
cat "{REVIEW_DIR}/prompt.md" | cursor-agent -p --mode plan --trust --force --model composer-1.5 --workspace "{REPO_ROOT}" > "{REVIEW_DIR}/cursor-review.md" 2>&1 ; echo "=== Done ===" ; [ -s "{REVIEW_DIR}/cursor-review.md" ] && echo "Cursor: $(wc -l < "{REVIEW_DIR}/cursor-review.md") lines" || echo "Cursor: empty/failed"
```

**If neither available:** Skip 3A entirely.

### 3B: Claude review — Task agent with Opus 4.6

Launch in the SAME tool call as 3A above.

- **subagent_type:** `general-purpose`
- **model:** `opus`
- **mode:** `bypassPermissions`
- **description:** `Claude code review`
- **prompt:** (substitute your actual REVIEW_DIR path)

```
You are one of three independent code reviewers. Perform a thorough code review.

INSTRUCTIONS:
1. Read the review prompt at: {REVIEW_DIR}/prompt.md
   This contains the code to review, project context, and focus areas.
2. Follow ALL review criteria in the prompt.
3. Additionally check for these specific items:
   - No console.log (use proper logger)
   - Try-catch for async operations, no silent failures
   - No `any` types in TypeScript, proper interfaces, strict null checks
   - No debug statements, TODOs, hardcoded secrets or URLs
   - Expensive operations memoized, no unnecessary work
   - Auth checked before operations, inputs validated, parameterized SQL
   - Follows existing codebase patterns and conventions
4. IMPORTANT: You have full repo access. If you need to check how a function is used elsewhere, or verify that error handling exists upstream, READ the actual source files. This is your advantage over the other reviewers.
5. Write your COMPLETE review to this EXACT path using the Write tool:
   {REVIEW_DIR}/claude-review.md
   Include: overall assessment, issues with severity (CRITICAL/HIGH/MEDIUM/LOW) and file:line, suggested fixes, what looks good, summary stats.
6. Return ONLY this text (nothing else): "Claude review complete: X issues found (Y critical, Z high)"
```

---

## Step 4: Verify All Review Files

After BOTH parallel operations from Step 3 complete, check what we have:

```bash
echo "=== Review Files ===" ; for f in prompt.md codex-review.md cursor-review.md claude-review.md; do if [ -s "{REVIEW_DIR}/$f" ]; then echo "OK $f: $(wc -l < "{REVIEW_DIR}/$f") lines"; else echo "MISSING $f"; fi; done
```

**Minimum requirement:** `claude-review.md` must exist. If it doesn't, stop and report error.

Missing external reviews are OK — proceed with what's available.

---

## Step 5: Consolidate Reviews

**Use a NEW Task agent** to read all review files and produce the action plan.

⚠️ Do NOT read the review files yourself. Do NOT consolidate in main context. The Task agent does ALL the work and writes the action plan to a file.

- **subagent_type:** `general-purpose`
- **model:** `opus`
- **mode:** `bypassPermissions`
- **description:** `Consolidate reviews into action plan`
- **prompt:** (substitute your actual REVIEW_DIR and SESSION name)

```
Consolidate multiple AI code reviews into a single action plan.

INSTRUCTIONS:
1. Read ALL of these files using the Read tool:
   - {REVIEW_DIR}/prompt.md (the original review prompt — tells you what was reviewed)
   - {REVIEW_DIR}/claude-review.md (always present)
   - {REVIEW_DIR}/codex-review.md (may not exist — skip if Read fails)
   - {REVIEW_DIR}/cursor-review.md (may not exist — skip if Read fails)

2. For each review that exists, extract: issues, severity, file/line references, suggestions.

3. DEDUPLICATE: Group similar findings across reviewers.

4. CONSENSUS: For each unique finding, note which reviewers flagged it:
   - 2+ reviewers agree = HIGH CONFIDENCE
   - 1 reviewer only = VERIFY CAREFULLY

5. VERIFY: For each finding, read the ACTUAL SOURCE CODE (not just the review). Confirm:
   - Does the issue actually exist in the code?
   - Is it already handled elsewhere?
   - What's the real severity?

6. CATEGORIZE:
   - Valid → Fix Now (critical/high) / Fix Soon (medium) / Track Later (low)
   - Invalid → Won't Fix (explain why)
   - Suggestion → Accept or Decline (with rationale)

7. Write the action plan to this EXACT path using the Write tool:
   {REVIEW_DIR}/action-plan.md

   Use this format:

   ## Auto Peer Review — Action Plan
   **Session:** {SESSION}
   **Date:** [today's date]
   **Reviewers:** [list which participated, note any missing]
   **Consensus Rule:** 2+ reviewers agree = high confidence

   ### Will Fix (Validated Issues)

   | # | Issue | Codex | Cursor | Claude | Severity | Priority |
   |---|-------|-------|--------|--------|----------|----------|
   (use Y/N/— for each reviewer)

   #### Fix Details
   **1. [SEVERITY] `file:line` — Issue title**
   - Flagged by: [reviewers]
   - Confidence: High (2+ agree) / Single reviewer
   - Verified: Yes — [how you confirmed against actual code]
   - Fix: [specific action]

   ### Won't Fix
   | # | Issue | Source | Reason |

   ### Summary
   - Total findings across all reviewers: X
   - Unique after dedup: Y
   - Will fix: Z | Won't fix: W
   - High-confidence (2+ agree): N

   ### Overall Assessment
   [1-2 paragraphs on code quality, key risks, next steps]

8. Return ONLY this text (nothing else):
   "Action plan: X to fix (Y critical, Z high), W won't fix. Key concern: [1 sentence]"
```

---

## Step 6: Present Results

Read the action plan file:
```
Read: {REVIEW_DIR}/action-plan.md
```

Show the user a SHORT summary, then the action plan content:

```
## Auto Peer Review Complete

**Session:** {SESSION}
**Saved to:** docs/code-reviews/{SESSION}/

[X] to fix ([Y] critical, [Z] high) · [W] won't fix · [N] high-confidence

Files: prompt.md · codex-review.md [or skipped] · cursor-review.md [or skipped] · claude-review.md · action-plan.md
```

Then output the full `action-plan.md` content.

---

## Step 7: Enter Plan Mode

Call the `EnterPlanMode` tool. The action plan becomes the fix-it plan:
1. List each "Will Fix" item as a numbered step with file path and specific change
2. `ExitPlanMode` when ready for user approval
3. After approval, execute the fixes

---

## Error Handling

- **No changes:** "No uncommitted changes found."
- **CLI not found:** Skip that reviewer, continue with others, note in action plan.
- **Timeout (10 min):** Proceed with whatever output exists.
- **Empty output:** Note as "failed" in action plan, proceed with available reviews.
- **Claude review failed:** Stop and report — minimum 1 reviewer required.
