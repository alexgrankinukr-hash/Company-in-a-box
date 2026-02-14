---
description: Analyze feedback from external AI code review
allowed-tools: Read, Bash(git:*), Grep
---

# Peer Review Analysis

A different team lead within the company has reviewed the current code/implementation and provided findings below. Important context:

- **They have less context than you** on this project's history and decisions
- **You are the team lead** - don't accept findings at face value
- Your job is to critically evaluate each finding

## Step 1: Parse External Feedback

User will paste feedback from external AI (Cursor, ChatGPT, etc.).

Extract:
- Overall assessment
- List of issues/findings
- Severity levels (if provided)
- Suggestions

## Step 2: Verify Each Finding

For EACH finding the external reviewer mentioned:

### A. Does this issue actually exist?

**Check the code:**
1. Read the relevant file(s)
2. Find the specific line/function mentioned
3. Verify the issue is real

**If issue does NOT exist:**
- External reviewer misunderstood the code
- May have incomplete context
- Feature might already be handled elsewhere

**If issue DOES exist:**
- Proceed to severity assessment

### B. Assess Real Severity

Don't blindly trust external severity ratings. Evaluate based on YOUR project:

- **CRITICAL** - Actually causes security breach, data loss, or crashes
- **HIGH** - Real bug or performance issue affecting users
- **MEDIUM** - Code quality concern worth addressing
- **LOW** - Style preference or minor improvement

### C. Check if Already Handled

Some "issues" might already be addressed:
- Error handled by middleware
- Validation done at API layer
- Type safety enforced elsewhere
- Known acceptable trade-off

## Step 3: Categorize Findings

Organize into three groups:

### Valid Findings (Confirmed Issues)

Issues that actually exist and should be fixed:

```
**[SEVERITY]** [File:line] - [Issue]
- Why it's valid: [Your verification]
- Fix: [Specific action needed]
- Priority: [Now / Before commit / Future]
```

### Invalid Findings (Misconceptions)

Issues that don't actually exist:

```
**[File:line]** - [Claimed issue]
- Why it's invalid: [Your explanation]
- Context they missed: [What external reviewer didn't know]
```

### Suggestions (Optional Improvements)

Not bugs, but worth considering:

```
**[File:line]** - [Suggestion]
- Benefit: [What would improve]
- Trade-off: [Cost vs benefit]
- Decision: [Accept / Decline] because [reason]
```

## Step 4: Create Action Plan

For confirmed valid findings, create prioritized plan:

### Fix Now (Before Commit)
- [Issue 1] - [Quick description]
- [Issue 2] - [Quick description]

### Fix Soon (This Session)
- [Issue 3] - [Quick description]

### Track for Later (Create Linear Issue)
- [Issue 4] - [Quick description]

### Won't Fix (Explain Why)
- [Issue 5] - [Rationale]

## Step 5: Output Analysis

```markdown
## Peer Review Analysis

**External Reviewer:** [Cursor / ChatGPT / Other]
**Total Findings:** X
**Valid:** Y | **Invalid:** Z

---

## Valid Findings (Confirmed)

[List verified issues with your assessment]

---

## Invalid Findings (Misconceptions)

[List issues that don't actually exist, with explanations]

---

## Suggestions (Optional Improvements)

[List optional improvements with your decision]

---

## Action Plan

### Fix Now (Before Commit)
- [ ] [Action 1]
- [ ] [Action 2]

### Fix Soon (This Session)
- [ ] [Action 3]

### Track for Later
- [ ] Create Linear issue for [Action 4]

### Won't Fix
- [Action 5] - [Rationale]

---

## My Assessment

[Your overall take on the external review]
- What was helpful
- What they missed due to lack of context
- Overall code quality judgment
```

## Important Principles

### Critical Evaluation

Don't be defensive, but don't blindly accept either:
- External reviewer may be right about things you missed
- They may also misunderstand due to lack of context
- Your job is to determine truth, not defend code

### Verify Before Acting

**Always check the actual code** before accepting a finding:
```
Bad: "External reviewer said X is wrong, let me fix it"
Good: "Let me read the code and verify X is actually an issue"
```

### Learn from Feedback

Even invalid findings can teach you:
- Code wasn't clear enough (add comments)
- Architecture not obvious (improve naming)
- Pattern not standard (document decision)
