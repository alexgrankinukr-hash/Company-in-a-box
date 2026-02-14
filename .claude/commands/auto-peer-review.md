---
description: Automated three-way code review with Codex, Cursor, and Claude - consolidates findings into action plan
allowed-tools: Bash(git:*,codex *,cursor-agent *,mkdir *,rm *,cat *,echo *,wait *,sleep *,ps *,wc *), Read, Grep, Glob, Write, Task, Skill
---

# Auto Peer Review

Fully automated code review that orchestrates three AI reviewers in parallel and consolidates their findings into an action plan.

## Automation Rules (CRITICAL)

To maximize automation and minimize user confirmations:

1. **MUST use `/prepare-peer-review` skill** - Don't manually generate prompts
2. **MUST use `/review` checklist** - Include exact criteria in Task agent prompt
3. **MUST combine Bash commands** - Single command for Codex + Cursor + wait loop
4. **Launch Task agent in parallel** - Same tool call batch as Bash command

**Expected confirmations:** 1 (for the combined Bash command)

## Context Management

| Step | Context | Why |
|------|---------|-----|
| 1. Generate prompt | Skill -> `/prepare-peer-review` | Reuse existing skill |
| 2. Codex review | External CLI | Separate process |
| 3. Cursor review | External CLI | Separate process |
| 4. Claude's /review | Task agent (forked) | Heavy file reading |
| 5. Consolidation | **Main context** | Team lead decisions should be visible |
| 6. Final output | **Main context** | Action plan |

## Workflow Overview

```text
1. Generate prompt (prepare-peer-review logic)
           |
           v
2. Run 3 reviews IN PARALLEL:
   +-----------+  +-----------+  +-----------+
   |   Codex   |  |   Cursor  |  |   Claude  |
   | GPT-5.2   |  | Composer-1|  |  /review  |
   +-----------+  +-----------+  +-----------+
          |              |              |
3. Wait for all to complete
          |              |              |
          +------+-------+------+------+
                 |
                 v
4. Consolidate with peer-review logic
   - Compare all 3 analyses
   - Identify consensus (2+ agree)
   - Verify findings against code
   - Decide: do / don't do
                 |
                 v
5. Output: Final Action Plan
```

## Step 1: Check Prerequisites

Verify CLIs are available:

```bash
which codex cursor-agent
```

If missing:
- Codex: User needs OpenAI Codex CLI installed
- Cursor: `curl https://cursor.com/install -fsS | bash`

## Step 2: Generate Review Prompt

**CRITICAL: You MUST use the Skill tool here - do NOT manually implement this logic.**

Invoke the `/prepare-peer-review` skill using the Skill tool:

```yaml
# Use Skill tool with:
skill: "prepare-peer-review"
args: "[files if specified]"
```

The skill will:
- Read files or git diff
- Generate a complete review prompt
- Output the prompt (copy this for external CLIs)

**After the skill outputs the prompt**, save it to a temp file for external reviewers.

### Important: Save the Output

First create the review directory, then save the prompt:

```bash
REVIEW_DIR="/tmp/auto-peer-review-$(date +%s)"
mkdir -p "$REVIEW_DIR"
```

Then use the Write tool to save the generated prompt to `$REVIEW_DIR/prompt.md`.

## Step 3: Launch All Reviews in Parallel

**CRITICAL: Use a SINGLE Bash command to launch all external reviews.**

### 3A+3B: Launch Codex and Cursor Together (ONE Bash call)

```bash
cd "$(pwd)" && \
codex exec -m "gpt-5.2-codex" -c 'model_reasoning_effort="high"' \
  --dangerously-bypass-approvals-and-sandbox \
  -C "$(pwd)" < "$REVIEW_DIR/prompt.md" > "$REVIEW_DIR/codex-review.txt" 2>&1 & \
CODEX_PID=$! && \
cursor-agent -p --model "composer-1" --workspace "$(pwd)" \
  < "$REVIEW_DIR/prompt.md" > "$REVIEW_DIR/cursor-review.txt" 2>&1 & \
CURSOR_PID=$! && \
echo "Codex (PID: $CODEX_PID) and Cursor (PID: $CURSOR_PID) reviews launched" && \
echo "Waiting for external reviews (max 5 min)..." && \
TIMEOUT=300; ELAPSED=0; \
while [ $ELAPSED -lt $TIMEOUT ]; do \
  CODEX_DONE=0; CURSOR_DONE=0; \
  ps -p $CODEX_PID > /dev/null 2>&1 || CODEX_DONE=1; \
  ps -p $CURSOR_PID > /dev/null 2>&1 || CURSOR_DONE=1; \
  [ $CODEX_DONE -eq 1 ] && [ $CURSOR_DONE -eq 1 ] && break; \
  sleep 5; ELAPSED=$((ELAPSED + 5)); \
done && \
echo "=== Review Status ===" && \
[ -s "$REVIEW_DIR/codex-review.txt" ] && echo "Codex: $(wc -l < $REVIEW_DIR/codex-review.txt) lines" || echo "Codex: empty/failed" && \
[ -s "$REVIEW_DIR/cursor-review.txt" ] && echo "Cursor: $(wc -l < $REVIEW_DIR/cursor-review.txt) lines" || echo "Cursor: empty/failed"
```

### 3C: Run Claude's /review (Task Agent - runs in parallel)

**Use a Task agent** to run Claude's review following the exact `/review` checklist.

**Launch the Task agent at the same time as the Bash command** - they run in parallel.

## Step 4: Read All Review Outputs

Once all reviews complete, read each review file:
- `$REVIEW_DIR/codex-review.txt`
- `$REVIEW_DIR/cursor-review.txt`
- `$REVIEW_DIR/claude-review.txt`

## Step 5: Consolidate with Peer Review Logic (MAIN CONTEXT)

**Run consolidation in main context** so team lead decisions are visible.

### 5A: Extract Findings from Each Review

Parse each review to identify:
- Issues with severity levels
- File and line references
- Suggested fixes
- Overall assessment

### 5B: Identify Consensus

For each unique finding, check which reviewers flagged it:
- **High Confidence**: 2+ reviewers agree
- **Single Reviewer**: Only one reviewer flagged it

### 5C: Verify Each Finding

For EACH finding:

1. **Read the actual code** to verify the issue exists
2. **Check if already handled** (might be addressed elsewhere)
3. **Assess real severity** based on project context

Categorize as:
- **Valid** - Issue confirmed, should fix
- **Invalid** - Misconception, external reviewer lacked context
- **Suggestion** - Optional improvement, not a bug

### 5D: Make Decisions

For each valid finding, decide:
- **Fix Now** - Critical/High issues, fix before commit
- **Fix Soon** - Medium issues, fix this session
- **Track Later** - Low priority, create Linear issue
- **Won't Fix** - Valid point but not worth the trade-off

## Step 6: Output Final Action Plan

```markdown
## Auto Peer Review - Action Plan

**Reviewers:**
- Codex (GPT-5.2 Codex, High Reasoning)
- Cursor (Composer 1)
- Claude (/review - Full Context)

**Consensus Rule:** 2+ reviewers agree = high confidence

---

## Will Fix (Validated Issues)

| Issue | Codex | Cursor | Claude | Priority |
|-------|-------|--------|--------|----------|
| [description] | Y/N | Y/N | Y/N | HIGH/MED/LOW |

### Fix Details

**1. [PRIORITY] File:line - Issue**
- Flagged by: [list reviewers]
- Verified: [Yes/No - explanation]
- Fix: [What to do]

---

## Won't Fix

| Issue | Source | Reason |
|-------|--------|--------|
| [description] | [reviewer] | [why skipping] |

---

## Summary

- Total findings across all reviewers: X
- Unique issues after deduplication: Y
- **Will fix:** Z (validated)
- **Won't fix:** W (invalid or low-value)
- High-confidence items (2+ agree): N

---

## Assessment

[Your overall take on the code quality and the reviews]
```

## Step 7: Cleanup

```bash
rm -rf "$REVIEW_DIR"
```

## Configuration Options

### Focus area (optional)

`/auto-peer-review security` - Emphasize security in the prompt
`/auto-peer-review performance` - Emphasize performance review

### Single reviewer fallback

If a CLI is unavailable, continue with available reviewers and note which is missing.

## Error Handling

### No changes to review
If `git diff` returns empty:
> "No uncommitted changes found. Stage your changes or make modifications before running auto-peer-review."

### CLI not found
If codex or cursor-agent not in PATH:
> "[tool] not found. Install with: [instructions]. Continuing with available reviewers..."

### Review timeout
If a reviewer exceeds 5 minutes:
> "[reviewer] timed out. Proceeding with available results."

### Empty review output
If a reviewer returns empty output:
> "[reviewer] returned no output. Check CLI authentication and try again."

## Notes

- Claude's /review has an advantage: full codebase context (not just the prompt)
- External reviewers see only the code extract, may miss context
- Consensus (2+ agree) is a strong signal but still verify against code
- The final plan is YOUR decision as team lead - don't blindly accept findings
