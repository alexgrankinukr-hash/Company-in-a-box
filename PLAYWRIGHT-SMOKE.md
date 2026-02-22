# Playwright Smoke Test Setup

## What Was Set Up

Greenfield Playwright E2E smoke test suite for the AICIB Next.js UI dashboard.

**Installed packages:**
- `@playwright/test` (dev dependency)
- Chromium browser binary (via `npx playwright install chromium`)

**Files created:**

| File | Purpose |
|------|---------|
| `aicib/ui/playwright.config.ts` | Playwright configuration (Chromium-only, webServer auto-start) |
| `aicib/ui/tests/e2e/dashboard.spec.ts` | Homepage smoke tests (page load, heading, console errors) |
| `aicib/ui/tests/e2e/navigation.spec.ts` | Sidebar navigation smoke tests (link visibility, click-through, no 500s) |

**Files modified:**

| File | Change |
|------|--------|
| `aicib/ui/package.json` | Added `test:e2e` and `test:e2e:headed` scripts |

## How to Run Tests

From the `aicib/ui/` directory:

```bash
# Run all smoke tests (headless, auto-starts dev server)
npm run test:e2e

# Run in headed mode (opens browser window for debugging)
npm run test:e2e:headed

# Run a specific test file
npx playwright test tests/e2e/dashboard.spec.ts

# View the HTML report after a run
npx playwright show-report
```

The Playwright config includes a `webServer` block that will automatically start `npm run dev` on port 3000 if nothing is already listening. If you already have the dev server running, it will reuse it.

## What Is Tested

### `dashboard.spec.ts` (3 tests)
- **Page loads successfully** -- verifies the server returns a non-500 response and no Next.js error overlay appears.
- **Page has a visible heading** -- confirms at least one `<h1>` element is present and contains text.
- **No uncaught JS console errors** -- listens for `console.error` messages during page load, ignoring expected noise (failed API fetches, EventSource disconnections, hydration warnings in dev mode).

### `navigation.spec.ts` (3 tests)
- **Sidebar renders with all expected nav links** -- checks that all 10 sidebar nav items (Home, Tasks, Activity, Team, HR, Wiki, Journal, Projects, Costs, Settings) are visible with correct text.
- **Clicking each nav link renders without a 500 error** -- clicks every sidebar link and verifies the page does not show "Internal Server Error" or a Next.js error overlay.
- **Nav links have correct href attributes** -- validates that each `<a>` in the sidebar nav points to a known application route.

### Resilience
All navigation tests gracefully skip if the sidebar is not visible (which happens when the app redirects to `/setup` or `/businesses/new` due to missing config/business). This means the tests will not produce false failures in a fresh environment.

## What Is NOT Covered (Future Work)

- **API integration tests** -- no assertions on actual API responses or data rendering
- **Authentication/authorization** -- no login flows or role-based access testing
- **Form interactions** -- no testing of the setup wizard, business creation, or brief composer
- **Cross-browser** -- Chromium only; Firefox and WebKit are not included
- **Mobile/responsive** -- no viewport size variations tested
- **Visual regression** -- no screenshot comparison testing
- **Performance** -- no Core Web Vitals or load time assertions
- **Accessibility** -- no axe-core or ARIA compliance checks
- **Data seeding** -- no test fixtures or mock data; tests rely on whatever state exists
- **CI pipeline integration** -- configuration exists (`forbidOnly`, `retries`, `workers`) but no CI workflow file was created
