---
description: Automated multi-AI planning with Claude, Codex, and auto-review - creates robust implementation plans
allowed-tools: Bash(git:*,codex *,mkdir *,rm *,cat *,echo *,chmod *), Read, Write, Grep, Glob, Task, Skill, mcp__linear-server__get_issue, mcp__linear-server__create_comment
---

# Auto Create Plan

Fully automated planning that orchestrates Claude and Codex in parallel, auto-reviews the result, and consolidates into a robust final plan.

## Automation Rules (CRITICAL)

To maximize automation and minimize user confirmations:

1. **MUST use `/prepare-plan-prompt` skill** - Don't manually generate prompts
2. **Launch Task agent + Bash in parallel** - Same tool call batch
3. **Consolidation in main context** - User sees decision-making

**Expected confirmations:** 1 (for the Codex Bash command)

## Workflow Overview

```text
1. Get Linear issue context
          |
          v
2. Generate planning prompt (skill)
          |
          v
3. Create output directories
          |
          v
4. Launch IN PARALLEL:
   +-----------+  +-----------+
   |   Claude  |  |   Codex   |
   | Task(Plan)|  | GPT-5.2   |
   +-----------+  +-----------+
          |              |
5. Wait for both plans
          |              |
          v              v
6. Save both drafts
          |
          v
7. Auto-review Claude's plan (Task agent)
          |
          v
8. Consolidate in MAIN CONTEXT:
   - Compare both plans
   - Apply review findings
   - Extract best ideas
          |
          v
9. Save final plan + link to Linear
```

---

## Step 1: Get Linear Issue Context

**Check if issue ID was provided as argument.**

If user specifies: `/auto-create-plan AIC-123`
- Use that issue ID

If no argument:
- Check recent conversation for Linear issue mentions
- If not found, ask user: "Which Linear issue should I plan?"

Fetch issue using `mcp__linear-server__get_issue`:
- Title
- Description
- Labels
- Priority
- Comments (for acceptance criteria)

**Store for later:**
- `ISSUE_ID` (e.g., "AIC-123")
- `ISSUE_TITLE` (e.g., "Add dark mode toggle")
- `ISSUE_SLUG` (e.g., "add-dark-mode-toggle")

---

## Step 2: Generate Planning Prompt

**Use the Skill tool - do NOT manually implement this.**

```yaml
Skill tool:
  skill: "prepare-plan-prompt"
  args: "[ISSUE_ID]"
```

The skill will:
- Read the Linear issue
- Gather tech stack info from CLAUDE.md
- Find relevant files
- Generate a complete planning prompt

**After the skill outputs the prompt**, you need to save it to a file.

---

## Step 3: Create Output Directories

Create the plan directory structure:

```bash
PLAN_DIR="aicib/docs/plans/[ISSUE_SLUG]"
mkdir -p "$PLAN_DIR/drafts"
```

Also create a temp directory for the prompt:

```bash
TEMP_DIR="/tmp/auto-plan-$(date +%s)"
mkdir -p "$TEMP_DIR"
```

Save the generated prompt to `$TEMP_DIR/prompt.md`.

---

## Step 4: Launch Both Plans in Parallel

**Launch Task agent and Bash command in the SAME tool call batch.**

### 4A: Claude's Plan (Task Agent)

```yaml
Task tool:
  subagent_type: "Plan"
  model: "sonnet"
  prompt: |
    Create an implementation plan for Linear issue [ISSUE_ID]: [ISSUE_TITLE]

    [Full description and instructions...]

    Save the plan to: [TEMP_DIR]/claude-plan.md
    Return only: "Plan saved to [path]"
```

### 4B: Codex's Plan (Bash - runs in parallel)

```bash
codex exec -m "gpt-5.2-codex" -c 'model_reasoning_effort="high"' \
  --dangerously-bypass-approvals-and-sandbox \
  -C "$(pwd)" < "$TEMP_DIR/prompt.md" > "$TEMP_DIR/codex-plan.md" 2>&1
```

**Both launch simultaneously.**

---

## Step 5: Wait and Collect Results

Once both complete:

1. Read `$TEMP_DIR/claude-plan.md`
2. Read `$TEMP_DIR/codex-plan.md`

If Codex failed or is empty, note this but continue with Claude's plan.

---

## Step 6: Save Draft Plans

Copy both plans to the drafts folder:

```bash
cp "$TEMP_DIR/claude-plan.md" "$PLAN_DIR/drafts/claude-plan.md"
cp "$TEMP_DIR/codex-plan.md" "$PLAN_DIR/drafts/codex-plan.md" 2>/dev/null || true
```

---

## Step 7: Auto-Review Claude's Plan

**Use a Task agent** to review Claude's plan for issues and inconsistencies.

---

## Step 8: Save Review

Copy review to drafts:

```bash
cp "$TEMP_DIR/review-findings.md" "$PLAN_DIR/drafts/review-findings.md"
```

---

## Step 9: Consolidate in Main Context (CRITICAL)

**This step runs in MAIN CONTEXT so the user sees the decision-making.**

Read all three files and:

1. **Compare Approaches** - Where do Claude and Codex agree/differ?
2. **Apply Review Findings** - Address critical and moderate issues
3. **Create Final Plan** - Take the best elements from each

---

## Step 10: Output Final Plan

Create the final plan at `$PLAN_DIR/plan.md`:

```markdown
---
linear_issue: [ISSUE_ID]
generated_by: auto-create-plan
created: [YYYY-MM-DD]
---

# Implementation Plan: [ISSUE_TITLE]

**Generated with:** Claude + Codex (GPT-5.2) + Auto-Review

**Overall Progress:** 0%

## TLDR

[2-3 sentence summary]

## Implementation Steps

### Step 1: [Name]

**Subtasks:**
- [Subtask 1]
- [Subtask 2]

### Step 2: [Name]
...

## Key Decisions

| Decision | Claude | Codex | Chosen | Rationale |
|----------|--------|-------|--------|-----------|
| [Topic] | [Approach] | [Approach] | [X] | [Why] |

## Review Findings Addressed

- [Finding] -> [How addressed in final plan]

## Edge Cases

- [Case]: [How handled]

## Testing Approach

[How to verify the implementation]

---

## Drafts

See `drafts/` folder for original AI outputs:
- `claude-plan.md` - Claude's exploration-based plan
- `codex-plan.md` - Codex's prompt-based plan
- `review-findings.md` - Auto-review findings
```

---

## Step 11: Link to Linear

Create a comment on the Linear issue:

```yaml
mcp__linear-server__create_comment:
  issueId: [ISSUE_ID]
  body: |
    **Implementation Plan Created**

    Plan location: `docs/plans/[ISSUE_SLUG]/plan.md`

    Generated with `/auto-create-plan`:
    - Claude plan (full codebase context)
    - Codex plan (GPT-5.2, high reasoning)
    - Auto-review applied

    View drafts in `docs/plans/[ISSUE_SLUG]/drafts/`
```

---

## Step 12: Display Summary

```markdown
## Auto-Create-Plan Complete

**Linear Issue:** [ISSUE_ID] - [ISSUE_TITLE]

**Plans Generated:**
- Claude (full codebase exploration)
- [Codex status]
- Auto-review applied

**Output:**
- Final plan: `docs/plans/[ISSUE_SLUG]/plan.md`
- Drafts: `docs/plans/[ISSUE_SLUG]/drafts/`
- Linear: Comment added with plan location

---

Ready to implement? Use `/execute` to start working through the plan.
```

---

## Error Handling

### Codex CLI not found
Continue with Claude-only planning.

### Codex timeout/failure
Continue with available results.

### No Linear issue found
Ask the user.

## Cleanup

```bash
rm -rf "$TEMP_DIR"
```

The drafts in `$PLAN_DIR/drafts/` are kept for reference.
