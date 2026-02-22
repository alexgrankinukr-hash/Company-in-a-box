# Playwright Smoke Test Brief -- AICIB UI

**Author:** CTO
**Date:** 2026-02-21
**Status:** Proposed

---

## 1. Objective

Stand up a Playwright smoke test suite that validates the **critical happy paths** of the AICIB dashboard UI. These are not exhaustive E2E tests -- they are fast, deterministic checks that answer one question: **"Is the app fundamentally broken?"**

If all smoke tests pass, a deploy can proceed. If any fail, something critical is wrong.

## 2. Scope

### In scope

- Dashboard shell renders (sidebar, topbar, layout)
- Navigation between all primary pages
- Setup / onboarding flow is reachable
- API health endpoints return valid JSON
- SSE stream connects and emits initial `connected` event
- Key data pages render their expected structure (tables, cards, empty states)
- Business lifecycle controls (start/stop dialogs)
- Error handling (404 page)

### Out of scope

- AI agent execution (requires live Claude API key -- not suitable for CI)
- Full CRUD workflows (create task, edit project, etc. -- those are integration tests)
- Visual regression / screenshot diffing (future phase)
- Performance / load testing
- Mobile viewport testing (first pass is desktop-only)

## 3. Test Matrix

| # | Test Case | Route / Target | Assertion | Priority |
|---|-----------|---------------|-----------|----------|
| S01 | Dashboard shell loads | `/` | Sidebar visible with nav items; Topbar renders; no JS crash | P0 |
| S02 | Navigate all sidebar pages | `/tasks`, `/activity`, `/agents`, `/hr`, `/knowledge`, `/journal`, `/projects`, `/costs`, `/settings` | Each page loads without error; `<h1>` or page-specific element present | P0 |
| S03 | API status endpoint | `GET /api/status` | Returns 200; JSON body contains `company`, `session`, `agents`, `tasks`, `costs` keys | P0 |
| S04 | API businesses endpoint | `GET /api/businesses` | Returns 200; JSON body contains `hasAnyBusiness` key | P0 |
| S05 | SSE stream connects | `GET /api/stream` | Response is `text/event-stream`; first data frame contains `"type":"connected"` | P1 |
| S06 | Setup flow accessible | `/setup` | Setup wizard component renders (look for setup-specific heading or form) | P1 |
| S07 | Business creation page | `/businesses/new` | Page renders without crash; form elements present | P1 |
| S08 | Tasks page data structure | `/tasks` | DataTable component or empty-state placeholder renders | P1 |
| S09 | Costs page data structure | `/costs` | BarChart component or cost summary card renders | P1 |
| S10 | Agents page renders | `/agents` | Agent cards/nodes or empty state renders | P1 |
| S11 | Business bootstrap guard | `/` (with no business) | Redirects to `/businesses/new` when `hasAnyBusiness` is false | P2 |
| S12 | 404 page | `/nonexistent-route` | Returns non-blank page; does not show raw Next.js error | P2 |

**Total: 12 smoke tests.** Expected runtime: under 30 seconds in CI.

## 4. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Test framework | **Playwright** (`@playwright/test`) | Best-in-class browser automation; built-in assertions, auto-wait, trace viewer |
| Language | **TypeScript** (strict) | Matches codebase; type-safe selectors and assertions |
| Browser | **Chromium only** for smoke suite | Speed over coverage -- cross-browser is for a full E2E suite |
| CI runner | GitHub Actions | Playwright has official GH Action; caches browser binaries |
| Reporter | HTML + JUnit (for CI) | HTML for local debugging; JUnit for CI integration |

### Playwright config highlights

```typescript
// playwright.config.ts (key settings)
{
  testDir: './tests/smoke',
  timeout: 15_000,           // 15s per test max
  retries: 1,                // One retry for flake resilience
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    trace: 'on-first-retry', // Capture trace only on failure
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    { name: 'smoke', use: { browserName: 'chromium' } },
  ],
}
```

## 5. Project Structure

```
aicib/ui/
  playwright.config.ts          # Playwright configuration
  tests/
    smoke/
      dashboard-shell.spec.ts   # S01: shell loads
      navigation.spec.ts        # S02: sidebar nav
      api-health.spec.ts        # S03, S04: API endpoints
      sse-stream.spec.ts        # S05: SSE connection
      setup-flow.spec.ts        # S06, S07: setup + business creation
      data-pages.spec.ts        # S08, S09, S10: tasks/costs/agents
      guards.spec.ts            # S11: bootstrap guard redirect
      error-pages.spec.ts       # S12: 404
    fixtures/
      seed-db.ts                # DB seeding helper
      test-business.ts          # Fixture: creates a test business project dir
```

Tests live inside `aicib/ui/tests/` (colocated with the Next.js app) rather than a top-level `e2e/` directory. This keeps Playwright config simple and ensures imports resolve against the UI package.

## 6. Prerequisites

### Environment

| Requirement | Detail |
|-------------|--------|
| Node.js | >= 20 (matches project) |
| Playwright browsers | `npx playwright install chromium` (automated in CI) |
| Dev server | `npm run dev` inside `aicib/ui/` (Playwright `webServer` config handles this) |
| SQLite DB | Tests need a seeded `.aicib/state.db` -- the seed fixture creates one with minimal data |
| `AICIB_PROJECT_DIR` | Must point to a test fixture directory containing `aicib.config.yaml` and `.aicib/state.db` |
| No API keys needed | Smoke tests do not trigger agent execution -- they only test the UI + read-only API layer |

### DB Seeding Strategy

The seed fixture creates a temporary project directory with:
- A minimal `aicib.config.yaml` (company name, one agent defined, cost limits)
- A `better-sqlite3` DB pre-populated with: 1 business entry, 2 sample tasks, 1 cost entry, 1 agent status row, 1 channel with 2 thread entries

This keeps tests deterministic and independent of any live data.

### Package.json scripts to add

```json
{
  "scripts": {
    "test:smoke": "playwright test --project=smoke",
    "test:smoke:ui": "playwright test --project=smoke --ui"
  }
}
```

## 7. Estimated Effort

| Task | LOE | Notes |
|------|-----|-------|
| Playwright setup + config | ~2 hours | Install, config file, CI workflow, seed fixture scaffolding |
| DB seed fixture (`seed-db.ts`, `test-business.ts`) | ~3 hours | Create temp project dir, write minimal config YAML, seed SQLite tables |
| S01-S04 (shell + API health) | ~2 hours | Straightforward page + fetch assertions |
| S05 (SSE stream) | ~2 hours | Needs `page.evaluate` or `request.get` with stream handling |
| S06-S07 (setup/business pages) | ~1 hour | Simple page-load assertions |
| S08-S10 (data pages) | ~2 hours | Assert component presence with seeded data |
| S11-S12 (guard + 404) | ~1 hour | Route intercept for guard; simple 404 check |
| CI integration (GH Actions) | ~1 hour | Workflow file, browser caching, artifact upload for traces |

**Total: ~14 hours (~2 days of focused engineering time)**

This is a **~2 day task** for one engineer. The DB seed fixture is the most complex piece -- the actual Playwright tests are straightforward.

## 8. Risks and Open Questions

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **SSE testing flakiness** | Medium | Use Playwright `page.evaluate()` to create an `EventSource` and wait for the `connected` event with a timeout. Avoid asserting on real-time data changes. |
| **DB state leakage between tests** | Medium | Each test file gets a fresh temp directory via the seed fixture. Use `test.beforeEach` to reset. `AICIB_PROJECT_DIR` is set per-worker. |
| **BusinessBootstrapGuard redirect** | Low | S11 needs to mock `GET /api/businesses` to return `{ hasAnyBusiness: false }`. Use Playwright `route.fulfill()` to intercept. |
| **Next.js dev server cold-start** | Low | The `webServer.timeout` is set to 30s. In CI, consider using `next build && next start` for faster startup and more production-like behavior. |
| **Port conflicts in CI** | Low | Use a non-default port (e.g., 3177) in CI to avoid conflicts. |

### Open questions

1. **Auth**: The current codebase has no auth layer. If auth is added before smoke tests ship, we will need a login fixture or test-bypass header. **Decision needed before implementation.**
2. **`next start` vs `next dev` in CI**: Running against the production build (`next build && next start`) is more realistic but adds ~30s to CI. Worth it? **Recommendation: use `next start` in CI, `next dev` locally.**
3. **Parallel workers**: Playwright defaults to parallel execution. Since each test needs its own `AICIB_PROJECT_DIR`, we need one temp dir per worker. This is handled by the fixture, but worth flagging.
4. **Business registry**: The `business-registry.ts` module reads from a global registry file. Tests need to either mock this or write to a temp registry path. Need to check if the registry path is configurable via env var.

---

## Decision Log

| Decision | Chosen | Rejected alternatives |
|----------|--------|-----------------------|
| Test location | `aicib/ui/tests/smoke/` (colocated) | `aicib/e2e/` (top-level) -- rejected because Playwright config becomes more complex with path resolution across packages |
| Browser scope | Chromium only | Multi-browser (Chromium + Firefox + WebKit) -- rejected for smoke suite; adds 3x runtime for marginal value at this stage |
| DB strategy | Fresh temp dir per test file | Shared test DB with cleanup -- rejected due to state leakage risk and parallelism complexity |
| Dev server mode | `next dev` locally, `next start` in CI | Always `next dev` -- rejected because production build catches more real issues in CI |
