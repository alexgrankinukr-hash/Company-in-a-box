---
description: Critically review a plan before implementation
allowed-tools: Task, Read, AskUserQuestion, Edit
---

# Review Plan

Critically review a master plan or phase plan before implementation or creating Linear issues. This command spawns a **subagent** to do thorough research without bloating the main conversation context.

## When to Use This

Use after:
- `/create-master-plan` - Before creating phase issues
- `/create-plan` - Before starting implementation

**The goal:** Catch issues like wrong package names, unrealistic estimates, missing edge cases, or outdated pricing BEFORE you invest time implementing.

## Step 1: Identify the Plan

Check recent conversation context for a plan file that was just created.

Look for paths like:
- `aicib/docs/plans/[project]/master-plan.md`
- `aicib/docs/plans/[project]/plan.md`
- `aicib/docs/plans/[project]/phases/phase[X]-*.md`

**Confirm with user:**
```
I'm going to review this plan: [path]
Is that correct? (or provide a different path)
```

If no plan found in context, ask:
```
What's the path to the plan you want reviewed?
```

## Step 2: Determine Plan Type

Read the plan file to determine type:
- **Master Plan**: Has multiple phases, strategic overview, sequencing
- **Phase Plan**: Has implementation steps, subtasks, specific file paths

This affects what gets reviewed.

## Step 3: Launch Review Subagent

Use the **Task tool** to spawn a subagent that does the thorough review in its own context window.

**IMPORTANT:** The subagent does all the heavy research (web searches, file reads, doc lookups). Only the final summary returns to this conversation.

```
Task tool parameters:
- subagent_type: "general-purpose"
- description: "Review plan for issues"
- prompt: [See detailed prompt below]
```

### Subagent Prompt Template

```
You are reviewing a plan for critical issues before implementation.

**Plan Path:** [path]
**Plan Type:** [master-plan | phase-plan]

## Your Task

Thoroughly review this plan and find issues that could cause problems during implementation.

## Step 1: Read the Plan

Read the plan file at [path].

## Step 2: Extract Claims to Verify

From the plan, extract:
- External APIs/services mentioned (with claimed capabilities)
- Package names and versions
- Performance targets (boot times, response times, etc.)
- Cost/pricing estimates
- Architecture claims (what service X can do)
- File paths mentioned
- Commands or CLI tools referenced

## Step 3: Verify Each Claim

For EACH extracted claim, do verification:

### Technical Claims (APIs, packages, services)
- Web search for current documentation
- Check official sources (GitHub repos, official docs)
- Look for "NOT supported", "deprecated", "limitations"
- Verify the exact package name is correct

### Performance Claims
- Search for benchmarks or real-world reports
- Check if targets are realistic
- Look for "gotchas" or known issues

### Pricing Claims
- Go to official pricing pages
- Verify exact amounts and units
- Check for hidden costs (bandwidth, storage, etc.)
- Note if pricing has changed recently

### File Paths
- Check if mentioned files actually exist in the codebase
- Use Glob to verify paths

### Commands/CLI Tools
- Verify command syntax is correct
- Check if flags/options exist

## Step 4: Check Completeness

### For Master Plans:
- Are phase dependencies correct?
- Are parallel opportunities identified?
- Are edge cases covered for each phase?
- Is the sequencing logical?
- Are all external dependencies identified?
- Is there a fallback/rollback strategy?

### For Phase Plans:
- Do steps follow logical order?
- Are all deliverables achievable with the listed tasks?
- Are edge cases handled?
- Do file paths exist?
- Are testing steps included?

## Step 5: Check Security

- Are there exposed endpoints without auth?
- Is sensitive data properly protected?
- Are firewall rules mentioned where needed?
- Are API keys/secrets handled safely?

## Step 6: Compile Findings

Categorize everything by severity:

**Critical** - Will break implementation or cause serious problems
**Moderate** - Will cause delays or issues
**Minor** - Nice to fix but won't block

## Step 7: Format Output

Return:

---

## Plan Review: [Plan Name]

**Plan Type:** [Master Plan | Phase Plan]
**Path:** [path]

### Summary
- **Claims verified:** X
- **Issues found:** X total (X critical, X moderate, X minor)

---

### Critical Issues

#### 1. [Short title]
**Category:** [Technical Accuracy | Feasibility | Security | etc.]

**Plan says:**
> [Exact quote from plan]

**Reality:**
[What's actually true]

**Source:** [URL or "Codebase check"]

**Recommended fix:**
[Specific text to change in the plan]

---

[Repeat for each issue]

---

### Verified Correct

These claims were verified as accurate:
- [Claim 1] - Source: [link]
- [Claim 2] - Source: [link]

---

### Recommended Plan Updates

1. **Line/Section:** [location in plan]
   **Change from:** `[current text]`
   **Change to:** `[corrected text]`

---

**Overall Assessment:** [Ready to proceed | Needs minor fixes | Needs significant revision | Requires major rework]

---

## Important Notes

- Be thorough - check EVERY external claim
- Always include sources for findings
- Be specific in recommended fixes (exact text changes)
- If something can't be verified, note it as "Unable to verify"
- Don't pad findings - only report real issues
```

## Step 4: Present Findings

When the subagent returns, present the findings to the user:

```
## Plan Review Complete

[Include the full subagent output here]

---

Would you like me to apply these fixes to the plan?
```

## Step 5: Apply Fixes (If Requested)

If user confirms, use the Edit tool to apply each recommended change to the plan file.

After applying:
1. Update the plan's frontmatter with a reviewed timestamp:
   ```yaml
   updated: YYYY-MM-DD (reviewed)
   ```

2. Confirm completion:
   ```
   Applied X fixes to the plan

   Updated: [path]

   Changes made:
   - [Brief list of what changed]

   The plan is now ready for implementation.
   ```

## Guidelines

**DO:**
- Always run as subagent to preserve main context
- Verify EVERY external claim (APIs, packages, pricing)
- Check if file paths actually exist
- Be specific about fixes (exact text changes)
- Include sources for all findings

**DON'T:**
- Do surface-level review without verification
- Skip web searches to save time
- Report vague issues without fixes
- Pad the report with non-issues
- Modify the plan without user confirmation
