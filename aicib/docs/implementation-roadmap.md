# Implementation Roadmap

## Phase 3 — Enterprise Features

### Wave 1 (Complete)

#### S4: Scheduler System
- **Status:** Done
- **Files:** `src/core/scheduler.ts`, `src/core/scheduler-register.ts`, `src/core/scheduler-daemon.ts`, `src/cli/schedule.ts`
- **What:** Cron-based scheduling with daemon mode, missed-run policies, agent targeting

#### S5: MCP Integration Framework
- **Status:** Done (PR #7 merged)
- **Files:** `src/core/mcp-*.ts`, `src/cli/mcp.ts`
- **What:** Model Context Protocol server integration for agents

#### S6: External Safeguards
- **Status:** Done (PR #6 merged)
- **Files:** `src/core/safeguards.ts`, `src/core/safeguards-register.ts`
- **What:** Cost limits, rate limiting, content filtering, circuit breakers

### Wave 2 (Current)

#### S7: Reporting Suite + Automated Performance Reviews
- **Status:** Implementation complete, peer review fixes applied
- **Linear:** #12 (Reporting Suite), #34 (Auto Performance Reviews)
- **Branch:** `emdash/phase3-wave2-s7-2q1`

##### Reporting Suite (#12)
- **Files:** `src/core/reporting.ts`, `src/core/reporting-register.ts`, `src/cli/report.ts`
- **What:** Automated report generation (daily briefings, weekly dept, monthly financial, sprint reviews, marketing). Background job spawning, scheduled reporting, metrics collection.
- **CLI:** `aicib report [dashboard|generate|list|show|templates|schedule]`

##### Automated Performance Reviews (#34)
- **Files:** `src/core/perf-review.ts`, `src/core/perf-review-register.ts`, `src/cli/hr.ts` (extended)
- **What:** Automated agent evaluations on task completion. Org chart reviewer determination, 4-score system, recommendation engine, queue processing.
- **CLI:** `aicib hr auto-reviews [--process]`, `aicib hr reviews <role> [--auto]`

##### Peer Review Fixes (S7 session)
Applied 11 fixes from Codex code review:

| # | Severity | Fix | File(s) |
|---|----------|-----|---------|
| 1 | HIGH | Report ID injection into directive (was literal `<report_id>`) | `reporting.ts`, `report.ts` |
| 2 | HIGH | Report content capture on COMPLETE (content was never saved) | `reporting-register.ts` |
| 3 | HIGH | Honor `trigger` config in auto-review handler | `perf-review-register.ts` |
| 4 | HIGH | Honor `include_cost_efficiency` config with dynamic weights | `perf-review.ts` |
| 5 | HIGH | Fix quality score SQL (wrong denominator, wrong LIKE pattern) | `perf-review.ts` |
| 6 | HIGH | Atomic queue claim (prevent double-processing race condition) | `perf-review.ts` |
| 7 | MEDIUM | Parameterize `windowDays` in SQL (was string-interpolated) | `perf-review.ts` |
| 8 | MEDIUM | Remove duplicate table definition from `ReportManager.ensureTables()` | `reporting.ts` |
| 9 | LOW | Validate `--delivery` option in CLI | `report.ts` |
| 10 | LOW | Fix `limit=0` treated as falsy in `listReports` | `reporting.ts` |
| 11 | NIT | Reduce redundant `loadConfig` calls in `hrAutoReviewsCommand` | `hr.ts` |

**Cursor review:** All 12 findings dismissed (referenced non-existent files from a different feature set).

**Won't fix (deliberate):**
- Module-level mutable state — established codebase pattern
- Multiple DB connections per queue item — acceptable with SQLite WAL mode
- Empty catch blocks — expected for fresh-install "table may not exist" scenarios

---

## Verification Checklist

- [x] `npx tsc --noEmit` — zero errors
- [x] `REPORT::COMPLETE id=<N>` directive contains real report ID
- [x] Report content captured when COMPLETE marker is parsed
- [x] `trigger: "periodic"` prevents task completions from queueing reviews
- [x] `include_cost_efficiency: false` zeroes efficiency score and adjusts weights
- [x] Quality score query filters by `comment_type = 'review_result'` in WHERE clause
- [x] Queue processing uses atomic claim via `db.transaction()`
- [x] `windowDays` clamped and parameterized in all SQL queries
- [x] `reports` table only defined in `reporting-register.ts`
