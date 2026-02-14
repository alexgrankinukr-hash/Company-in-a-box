---
description: Pre-commit code review of uncommitted changes
allowed-tools: Bash(git:*), Read, Grep
---

# Code Review Task

Perform comprehensive code review of uncommitted changes. Be thorough but concise.

## Step 1: Get Uncommitted Changes

Run `git diff` to see all uncommitted changes.

If no changes, check staged changes: `git diff --cached`

If still nothing: "No uncommitted changes to review. Commit your code first, or use `git add` to stage changes."

## Step 2: Review Each Changed File

For each file in the diff:
1. Read the full file (not just diff) to understand context
2. Check against the criteria below
3. Note any issues found

## Check For:

**Logging**
- No `console.log` statements (use proper logger)
- Logger includes context (user ID, session ID, etc.)
- Appropriate log levels (debug, info, warn, error)

**Error Handling**
- Try-catch for async operations
- Centralized error handlers used
- Error messages are helpful and specific
- No silent failures (empty catch blocks)

**TypeScript**
- No `any` types
- Proper interfaces/types defined
- No `@ts-ignore` or `@ts-expect-error` without explanation
- Strict null checks handled

**Production Readiness**
- No debug statements or commented code
- No TODOs (move to Linear issues)
- No hardcoded secrets or API keys
- No hardcoded URLs (use environment variables)

**React/Hooks** (if applicable)
- useEffect has cleanup function if needed
- Dependencies array is complete and correct
- No infinite loops (effect triggers itself)
- Event listeners are removed on unmount

**Performance**
- No unnecessary re-renders
- Expensive calculations are memoized
- Large lists use virtualization if needed
- Images are optimized and lazy-loaded

**Security**
- Auth/permissions checked before operations
- User inputs are validated and sanitized
- SQL queries use parameterized statements
- Sensitive data is not logged
- RLS policies in place for database operations

**Architecture**
- Follows existing code patterns and conventions
- Code is in correct directory/module
- Functions are appropriately sized (< 50 lines ideally)
- Proper separation of concerns

## Step 3: Output Format

### Looks Good
[List things that were done well]

### Issues Found

For each issue:
**[SEVERITY]** [File:line] - [Issue description]
- Fix: [Suggested fix]

### Summary
- Files reviewed: X
- Critical issues: X
- High issues: X
- Medium issues: X
- Low issues: X

**Overall Assessment:** [Ready to commit / Needs fixes / Requires discussion]

## Severity Levels

- **CRITICAL** - Security vulnerabilities, data loss risks, crashes
- **HIGH** - Bugs, performance issues, poor UX
- **MEDIUM** - Code quality, maintainability concerns
- **LOW** - Style preferences, minor improvements

## Optional: Focus Area

If user provides focus: `/review focus on security`

Emphasize that area in the review but still check other critical items.

## Important Notes

- Be constructive and specific
- Suggest fixes, don't just point out problems
- Consider the existing codebase patterns
- If something is unclear, ask user about intent
- Flag breaking changes or risky modifications
- Prioritize security and data integrity issues
