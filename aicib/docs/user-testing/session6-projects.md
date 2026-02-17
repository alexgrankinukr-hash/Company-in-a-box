# Session 6 User Testing: Projects (Long Autonomous Task Chains)

## What You're Testing

Feature #28 — the ability to give AICIB a big goal and have it autonomously plan, execute, review, and retry across multiple phases without you babysitting it.

## Prerequisites

- AICIB built and linked: `cd aicib && npm run build && npm link`
- An active session: `aicib start`
- (Optional) Lower your daily cost limit temporarily to test the pause behavior

---

## Test 1: Happy Path — Small Project

**Goal:** Verify the full planning → execution → review → completion loop.

**Config tweak** (optional, to keep costs down):
```yaml
# In aicib.config.yaml
projects:
  max_phases: 3
  max_phase_retries: 1
```

**Run:**
```bash
aicib brief -p "Create a simple Node.js CLI calculator app with three phases: 1) project setup with package.json and tsconfig, 2) implement add/subtract/multiply/divide commands, 3) write unit tests"
```

**What you should see immediately:**
```
  Project created. CEO is planning phases.

  Project #1 | Job #5 | PID 12345
  Check progress:  aicib project status
  View full logs:  aicib logs
  Cancel project:  aicib project cancel
```

**Monitor progress** (run these repeatedly):
```bash
aicib project status    # Phase-by-phase progress with icons
aicib logs              # Live conversation from the worker
```

**What to look for:**
- [ ] Planning phase creates 3 phases with titles and objectives
- [ ] Phases move through: pending → executing → reviewing → completed
- [ ] Files actually appear in your project directory
- [ ] Each phase builds on previous ones (tests reference code from phase 2)
- [ ] Cost accumulates across phases (shown in `project status`)
- [ ] Final status shows "completed" with all phases checked off

**Expected cost:** $3-8 depending on phase complexity.
**Expected time:** 5-15 minutes.

---

## Test 2: Project Status Display

**Run during or after Test 1:**
```bash
aicib project status
```

**What to look for:**
- [ ] Project title displayed
- [ ] Status shows executing/completed
- [ ] Phase count (e.g., "Phases: 2/3")
- [ ] Cost and turns accumulated
- [ ] Each phase listed with icon (checkmark, arrow, circle)
- [ ] Failed phases show attempt count
- [ ] Duration shown if > 0

```bash
aicib project list
```

**What to look for:**
- [ ] Table format with ID, title, status, phases, cost, created date
- [ ] Most recent project at top

---

## Test 3: Cancel a Running Project

**Goal:** Verify that cancellation stops the worker and marks everything correctly.

**Run:**
```bash
aicib brief -p "Write a REST API with 5 endpoints, full test coverage, documentation, deployment config, and monitoring setup"
```

**Wait** until at least Phase 1 is executing (check with `aicib project status`).

**Then cancel:**
```bash
aicib project cancel
```

**What to look for:**
- [ ] Output says "Cancelling: ..." and "Project #N cancelled."
- [ ] If worker was running, shows "Killed worker process (PID ...)"
- [ ] `aicib project status` shows "cancelled"
- [ ] No orphaned background processes (`ps aux | grep background-worker`)
- [ ] `aicib status` shows CEO as "idle" (not stuck on "working")

---

## Test 4: Cost Limit Pause

**Goal:** Verify the project pauses when the daily cost limit is hit.

**Config tweak** — set a very low limit:
```yaml
settings:
  cost_limit_daily: 2    # Very low — will trigger quickly
```

**Run:**
```bash
aicib brief -p "Build a full-stack React app with authentication, dashboard, API, and database setup"
```

**What to look for:**
- [ ] After 1-2 phases, project status changes to "paused"
- [ ] Log message: "Daily cost limit reached ($X.XX) — pausing project"
- [ ] Background job shows as "completed" (graceful stop, not "failed")
- [ ] CEO status returns to "idle"

**Cleanup:** Reset `cost_limit_daily` back to your normal value (e.g., 50).

---

## Test 5: Phase Retry (If a Phase Gets Rejected)

This one is harder to trigger intentionally since it depends on the review verdict. To increase chances:

**Run a project with vague acceptance criteria:**
```bash
aicib brief -p "Create a beautiful, pixel-perfect landing page that would impress a designer at Apple, with flawless animations, perfect typography, and zero accessibility issues"
```

**What to look for (if rejection happens):**
- [ ] Phase shows "REJECTED" in logs with feedback
- [ ] Phase attempt count increments (e.g., "attempt 2/3")
- [ ] Retry uses the rejection feedback
- [ ] Cost accumulates across retries (not just last attempt)
- [ ] If max retries exhausted: project shows "failed" with error message

**Note:** The review defaults to APPROVED if ambiguous, so rejections may be rare. That's by design.

---

## Test 6: Verify `aicib stop` During a Project

**Goal:** Verify that `aicib stop` gracefully pauses a running project via SIGTERM.

**Run:**
```bash
aicib brief -p "Set up a complete testing infrastructure with unit tests, integration tests, and CI pipeline"
```

**Wait** until a phase is executing, then:
```bash
aicib stop
```

**What to look for:**
- [ ] `aicib stop` reports killing the background worker
- [ ] Project status shows "paused" (not "failed" or "executing")
- [ ] No orphaned phases stuck in "executing" status
- [ ] A future `aicib start` + new project works normally

---

## Quick Reference

| Command | What it does |
|---------|-------------|
| `aicib brief -p "..."` | Start a new project |
| `aicib project status` | Show active project with phases |
| `aicib project list` | List all projects |
| `aicib project cancel` | Cancel and kill worker |
| `aicib logs` | View live worker output |
| `aicib status` | Check CEO/agent status |
| `aicib stop` | Graceful stop (pauses project via SIGTERM) |

## Cost Expectations

| Test | Phases | Estimated Cost | Time |
|------|--------|---------------|------|
| Test 1 (calculator) | 3 | $3-8 | 5-15 min |
| Test 3 (cancel) | 1-2 before cancel | $1-3 | 2-5 min |
| Test 4 (cost limit) | 1-2 before pause | $2 (your limit) | 2-5 min |
| Test 5 (retry) | varies | $5-15 | 10-30 min |
| Test 6 (stop) | 1 before stop | $1-3 | 2-5 min |

**Total to run all tests:** ~$12-30 depending on how many you run and whether retries happen.

## Troubleshooting

**Project stuck in "executing" after cancel/stop:**
Check `ps aux | grep background-worker`. If the process is still running, kill it manually: `kill <PID>`. This shouldn't happen after the F2/F3 fixes but worth checking.

**"No active project to cancel":**
The project may have already completed or failed. Check `aicib project list` to see all projects.

**Cost seems wrong:**
Check `aicib cost` for the full breakdown. Project costs include all retry attempts — a phase retried 3 times at $2 each shows $6, not $2.
