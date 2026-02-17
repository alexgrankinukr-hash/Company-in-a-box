# Edge Cases

Track edge cases discovered during implementation.

## Agent Runner / SDK Integration

### Start — Double Start Prevention

**Scenario:** User runs `aicib start` when a session is already active
**Handling:** Checks `getActiveSDKSessionId()` before creating a new session. If active, blocks with message.
**User sees:** "Team already running! Use 'aicib brief' to send directives, or 'aicib stop' to end the session."

### Brief — No Active Session

**Scenario:** User runs `aicib brief` without running `aicib start` first
**Handling:** `getActiveSDKSessionId()` returns null, command exits with error
**User sees:** "No active session found. Run 'aicib start' first to launch the team."

### Brief — Daily Cost Limit Reached

**Scenario:** Accumulated API costs for today exceed the configured daily limit
**Handling:** Checks `getTotalCostToday()` against `config.settings.cost_limit_daily` before sending brief
**User sees:** "Daily cost limit reached ($X.XX / $50). Increase the limit in aicib.config.yaml or wait until tomorrow."

### Start — Missing CEO Agent Definition

**Scenario:** CEO soul.md file is missing from `.claude/agents/` directory
**Handling:** `startCEOSession()` throws error when `agents.get("ceo")` returns undefined
**User sees:** "CEO agent definition not found. Run 'aicib init' first."

### Agent Runner — SDK Tool Mismatch

**Scenario:** Soul.md files reference `SendMessage` and `TeamCreate` tools which don't exist in the Agent SDK
**Handling:** `EXCLUDED_TOOLS` set filters these out silently during `buildSubagentMap()`
**User sees:** Nothing — this is handled transparently

### Stop — No Active Session

**Scenario:** User runs `aicib stop` when no session is running
**Handling:** `getActiveSession()` returns null, command exits gracefully
**User sees:** "No active session found."

### Agent Runner — Disabled Agents

**Scenario:** Agent has `enabled: false` in config.yaml
**Handling:** `buildSubagentMap()` checks `agentConfig.enabled` and skips disabled agents
**User sees:** Disabled agents don't appear in the CEO's available team

### Brief — Subagent Saves Files in Wrong Directory

**Scenario:** CEO delegates to multiple department heads (CTO, CFO, CMO). Some subagents save deliverables in the project directory, others save to the repo root or `process.cwd()`.
**Cause:** The Agent SDK's `AgentDefinition` type doesn't support a `cwd` field. Subagents are supposed to inherit the parent session's `cwd`, but this is inconsistent — especially for agents spawned in parallel or after the first subagent.
**Handling:** CEO's system prompt (in `startCEOSession()`) and each brief prompt (in `sendBrief()`) now include the absolute project directory path with instructions to use absolute paths when delegating file-writing tasks to department heads.
**User sees:** All deliverables land in the correct project directory.

## Background Mode

### Brief — Double Background Brief Prevention

**Scenario:** User runs `aicib brief --background "task"` while another background job is already running
**Handling:** `getActiveBackgroundJob(sessionId)` checks for jobs with status `running`. If found and PID is alive, blocks with error.
**User sees:** "A background brief is already running. Job #2: 'test directive one...' Wait for it to finish or run 'aicib stop' to cancel."

### Brief — Stale Crashed Job Auto-Heal

**Scenario:** A previous background worker crashed (or was killed with `kill -9`), but the DB still shows `status = "running"`. User runs `aicib brief` again.
**Handling:** `brief.ts` checks PID liveness on any job marked `running`. If the PID is dead, auto-marks the job as `failed` with message "Worker process crashed (auto-healed by brief)" and proceeds with the new brief.
**User sees:** "Stale job #N auto-healed (worker had crashed)." followed by normal brief execution.

### Status — Worker Process Crashed

**Scenario:** Background worker process crashed or was killed externally, but DB still shows status `running`
**Handling:** `isProcessRunning(pid)` checks if the PID is still alive. If not, auto-updates job to `failed` with error message.
**User sees:** "Background work: FAILED (worker process not found)"

### Stop — Background Job Running During Stop

**Scenario:** User runs `aicib stop` while a background job is still running
**Handling:** `killBackgroundJob()` sends SIGTERM to the worker process. Re-reads the job's current status from DB before updating — only marks as `failed` if the job is still `running`. If the worker finished just before the kill, the `completed` status is preserved.
**User sees:** "Stopping background job #2... Background worker terminated."

### Stop — Race: Worker Completes Just Before Kill

**Scenario:** Worker finishes and marks job as `completed` at the exact moment `aicib stop` calls `killBackgroundJob()`
**Handling:** `killBackgroundJob()` re-reads job status from DB before writing. Sees `completed`, skips the update. The SIGTERM is harmless (process already exited).
**User sees:** Job shows as COMPLETED in `aicib status` / `aicib logs`, not incorrectly overwritten to FAILED.

### Background Worker — Config Load Failure

**Scenario:** Worker process can't load `aicib.config.yaml` (file deleted or corrupted after spawning)
**Handling:** Worker catches the error, marks job as `failed` with "Config load failed" message, exits
**User sees:** Job shows as FAILED in `aicib status` and `aicib logs`

### Background Worker — SDK Error (Cost Limit, API Key, etc.)

**Scenario:** `sendBrief()` throws during background execution (cost limit hit, API error, etc.)
**Handling:** Worker catches the error, logs it to `background_logs`, marks job as `failed` with error message
**User sees:** Error details in `aicib logs` and `aicib status`

### Background Worker — Job Not Found in DB

**Scenario:** Worker starts but its job ID doesn't exist in the database (e.g., DB was reset between spawn and worker startup)
**Handling:** Worker checks `getBackgroundJob(jobId)` immediately on startup. If null, writes error to stderr and exits with code 1.
**User sees:** Job never appears in `aicib status`. Worker process exits silently.

### Background Manager — Spawn Failure (PID Undefined)

**Scenario:** `spawn()` fails (bad path, permissions issue). `child.pid` is `undefined`.
**Handling:** Manager checks `child.pid === undefined` after spawn. If so, marks job as `failed` with "Failed to spawn worker process (pid undefined)" and throws an error.
**User sees:** Error message from `brief.ts`'s catch block.

### Logs — Invalid --lines Value

**Scenario:** User runs `aicib logs --lines abc` or `aicib logs --lines -5`
**Handling:** Validates parsed number is a positive integer. Rejects NaN, negative, zero, and fractional values.
**User sees:** "Error: --lines must be a positive integer."

## CEO Journal / Memory (S3)

### Journal Loading — Database Error

**Scenario:** Journal database is corrupted, has schema issues, or has permission problems when CEO starts up
**Handling:** `startCEOSession()` catches the error and logs a console warning. CostTracker is always closed via `finally` block (no DB connection leak). CEO starts without journal context.
**User sees:** "Warning: Failed to load journal entries: [error details]" — then normal session startup.

### Journal Generation — API Failure

**Scenario:** Haiku model call fails during journal summary generation (network error, budget exceeded, etc.)
**Handling:** Caught in `generateJournalEntry()`, warning logged. Brief result is unaffected.
**User sees:** "Warning: Journal entry generation failed: [error details]" — brief output is already complete.

### Journal Context — Too Long

**Scenario:** 10 journal entries exceed ~6000 characters (~3000 tokens), which could bloat the CEO's context
**Handling:** `startCEOSession()` trims to 5 entries if formatted text exceeds 6000 chars
**User sees:** Nothing — handled transparently

## Personas (S2)

### Init/Start — Missing Persona Preset

**Scenario:** Preset file doesn't exist or is malformed (e.g., template was created with an older version)
**Handling:** `loadPersonaFromConfig()` catches the error. For the default "professional" preset, shows a dim note. For user-selected presets, shows a warning.
**User sees:** "Note: No persona preset loaded. Agents running with base personalities only." or "Warning: Persona preset 'creative' could not be loaded."

### Config — Override Key Typo

**Scenario:** User sets a persona override for a role that doesn't exist (e.g., `overrides: { marketing: creative }` instead of `cmo`)
**Handling:** `buildSubagentMap()` checks override keys against loaded agent roles after building the map
**User sees:** "Warning: Persona override key 'marketing' does not match any agent role. Check spelling in config."

## Cost & Budget (S4)

### Brief — Daily Cost Limit Reached

**Scenario:** Today's accumulated API costs exceed the configured daily limit
**Handling:** `brief.ts` checks `getTotalCostToday()` before sending. Hard stop if exceeded.
**User sees:** "Daily cost limit reached ($50.12 / $50). Increase the limit in aicib.config.yaml or wait until tomorrow."

### Brief — Monthly Cost Limit Reached

**Scenario:** This month's accumulated API costs exceed the configured monthly limit
**Handling:** `brief.ts` checks `isMonthlyLimitReached()` before sending. Hard stop if exceeded.
**User sees:** "Monthly cost limit reached."

### Brief — Approaching Budget Limit

**Scenario:** Costs are between 50-80% or above 80% of daily/monthly limit
**Handling:** Warning displayed but brief proceeds
**User sees:** Yellow warning at 50%+, red warning at 80%+, with dollar amounts and percentages

### Cost Display — Corrupted Data

**Scenario:** Cost value is NaN, Infinity, or negative due to database corruption
**Handling:** `formatPercent()` returns "N/A" for non-finite or negative values instead of displaying garbage like "NaN%"
**User sees:** "N/A" in the percentage column

## Session Completion & Status Tracking (S6)

### Brief — Session Ends Before Sub-Agents Finish

**Scenario:** CEO delegates to CTO/CFO/CMO via Task tool, but the session ends after only 4-5 CEO turns before sub-agents complete their work
**Handling:** `maxTurns` set to 500 for CEO sessions and 200 for sub-agents. `maxBudgetUsd` remains the real cost safety net.
**User sees:** Full delegation cycle completes — sub-agents run, CEO compiles results

### Brief — Foreground Job Fails Mid-Execution

**Scenario:** `sendBrief()` throws an error during a foreground brief after the foreground job record was already created
**Handling:** Catch block marks the foreground job as "failed" in the database with the actual error message, and sets CEO status to "error"
**User sees:** Error message in terminal. `aicib logs` shows the job as FAILED with the error details.

### Status — Runtime Agent Status

**Scenario:** User runs `aicib status` while a brief is executing
**Handling:** `status.ts` reads from `agent_status` table (updated in real-time by brief.ts / background-worker.ts via `setAgentStatus()`). Shows working/idle/error/stopped with current task description.
**User sees:** CEO shows "working" with task snippet; sub-agents show "working" when dispatched, "idle" when done

### Logs — Foreground vs Background Job Display

**Scenario:** User runs `aicib logs` after a foreground brief
**Handling:** Foreground jobs are identified by `[foreground]` prefix on directive. Prefix stripped for display.
**User sees:** "Foreground Job #N" header instead of "Background Job #N"

## Slack Integration

### Slack — No Active Session When Brief Arrives

**Scenario:** User sends a message in `#aicib-ceo` but hasn't run `aicib start`
**Handling:** `handleSlackBrief()` checks `getActiveSDKSessionId()`. Returns error if null. BriefQueue's `processNext()` also checks and posts warning to Slack.
**User sees:** Bot replies: "No active session. Run `aicib start` first."

### Slack — Daily Cost Limit Reached

**Scenario:** Accumulated API costs for today exceed the configured daily limit when a Slack brief arrives
**Handling:** `handleSlackBrief()` checks `getTotalCostToday()` before enqueuing
**User sees:** Bot replies: "Daily cost limit reached ($X.XX / $50). Increase the limit or wait until tomorrow."

### Slack — Monthly Cost Limit Reached

**Scenario:** Monthly costs exceed the configured monthly limit when a Slack brief arrives
**Handling:** `handleSlackBrief()` checks `getTotalCostThisMonth()` after the daily check
**User sees:** Bot replies: "Monthly cost limit reached ($X.XX / $500). Increase the limit or wait until next month."

### Slack — Daemon Crashes

**Scenario:** The Slack daemon process crashes (OOM, unhandled exception, killed externally)
**Handling:** `aicib slack status` checks PID liveness via `isProcessRunning()`. If PID is dead but state says "connected", reports "daemon crashed".
**User sees:** Status shows "CRASHED" in red. Hint: "Restart with: aicib slack connect"

### Slack — Concurrent Briefs (Queue Ordering)

**Scenario:** Multiple Slack messages arrive before the first brief finishes processing
**Handling:** `BriefQueue` processes sequentially. Each brief gets its own `currentThreadTs` and calls `clearToolUseTracking()` at start. Subsequent briefs wait in FIFO order.
**User sees:** "Brief queued (position #2). I'll get to it after the current task."

### Slack — Rapid Messages (Debounce Coalescing)

**Scenario:** User types 3 messages within 2 seconds
**Handling:** `BriefQueue.enqueue()` merges them into one brief via debounce timer. Text joined with newlines.
**User sees:** Single acknowledgment. All 3 messages processed as one brief.

### Slack — Bold/Italic Markdown Conversion

**Scenario:** Agent output contains `**bold**` and `*italic*` Markdown
**Handling:** Italic regex runs BEFORE bold regex. Italic `(?<!\*)\*(?!\*)` won't match `**bold**` delimiters. Bold converts after.
**User sees:** Correct formatting: bold appears bold, italic appears italic (not both as italic).

### Slack — Mentions in Agent Output

**Scenario:** Agent output contains Slack tokens like `<@U123>` or `<#C456>`
**Handling:** `markdownToMrkdwn()` extracts Slack tokens before HTML escaping, replaces with placeholders, restores after escaping.
**User sees:** Mentions render correctly as clickable Slack links, not escaped text.

### Slack — Channel Not Accessible

**Scenario:** Channel exists but bot isn't a member (private channel, or name_taken error)
**Handling:** `ensureChannels()` catches the error, logs warning, skips that channel
**User sees:** Warning during `aicib slack connect`. Department messages fall back to CEO channel.

### Slack — DB Connection Locked During Heartbeat

**Scenario:** Daemon's heartbeat write fails because another process holds a DB lock
**Handling:** Heartbeat catch block silently ignores the error. WAL mode + busy_timeout=5000ms reduces occurrence.
**User sees:** Nothing — heartbeat resumes on next 30-second tick.

### Slack — Health Check Timeout on Connect

**Scenario:** Daemon spawns but fails to connect within 10 seconds (bad token, network issues)
**Handling:** `slackConnectCommand()` polls `CONNECTION_STATE` for 10s. If "error" or timeout, warns user.
**User sees:** "Slack bot started but hasn't confirmed connection yet. Check: aicib slack status"

### Slack — Agent Display Name Without chat:write.customize Scope

**Scenario:** Bot posts messages with `username` and `icon_emoji` but the Slack App doesn't have the `chat:write.customize` scope
**Handling:** Slack silently ignores the `username` and `icon_emoji` parameters. Message still posts successfully.
**User sees:** All messages show as the app name (e.g., "AICIB") instead of "CEO", "CTO", etc. Functional but less clear.

### Slack — Session-Complete Telemetry Suppressed

**Scenario:** SDK emits a `result` type message with cost/turns/duration after processing a brief
**Handling:** `formatForSlack()` returns `null` for `result` messages. The message handler skips posting.
**User sees:** Nothing in Slack. Telemetry only appears in the terminal via `aicib logs`.

### Slack — Brief Completion Signal

**Scenario:** CEO finishes processing a message from Slack
**Handling:** BriefQueue swaps the :eyes: reaction for :white_check_mark: on the original message. No "Brief complete" text is posted.
**User sees:** Their message gets a checkmark reaction when done. Thread contains only the CEO's actual reply.

### Slack — Immediate Brief vs Queued Brief Acknowledgment

**Scenario:** User sends a message when no other brief is processing (position 1) vs when a brief is already in progress (position > 1)
**Handling:** Position 1: no text ack — just :eyes: reaction. Position > 1: text reply "Brief queued (position #N)." Errors always get text replies.
**User sees:** Clean conversation for single messages. Queue position feedback when busy.

### Slack — Chat Classification Wrong (Chat Treated as Brief)

**Scenario:** User asks "What do you think about our pricing strategy?" — heuristic is ambiguous, AI classifier says BRIEF.
**Handling:** Confirmation buttons appear. User clicks "No, let's chat." CEO switches to conversational mode.
**User sees:** Brief confirmation message, then conversational reply after clicking "No."

### Slack — Chat Classification Wrong (Brief Treated as Chat)

**Scenario:** User says "Can you get the team to look at our pricing?" — heuristic classifies as chat by mistake.
**Handling:** CEO replies conversationally. User can re-send with clearer language or use "/brief" prefix.
**User sees:** A conversational reply. They can retype more explicitly or prefix with "/brief".

### Slack — AI Classification Fails

**Scenario:** Haiku classification call throws (network, budget, timeout).
**Handling:** `classifyWithAI()` catches the error, logs a warning, and returns "chat" (cheaper/safer fallback).
**User sees:** Conversational CEO reply. No error visible.

### Slack — Brief Confirmation Timeout

**Scenario:** User gets confirmation buttons but doesn't click within 30 seconds.
**Handling:** Timer fires, removes buttons, auto-treats as chat. Posts ":speech_balloon: No response — treating as a chat."
**User sees:** Button message updates to "treating as a chat", then CEO responds conversationally.

### Slack — Stale Confirmation Button Click

**Scenario:** Timeout fires (auto-chat), then user clicks "Yes, brief the team" on the stale message.
**Handling:** `resolveConfirmation()` returns undefined (already cleaned up). Action handler responds: "This was already handled."
**User sees:** "This was already handled. Send a new message or use /brief to submit a brief."

### Slack — Department Chat No Active Session

**Scenario:** User sends a message in #aicib-engineering before running `aicib start`.
**Handling:** `handleChat()` checks `getActiveSDKSessionId()` — returns null, posts error.
**User sees:** ":warning: No active session. Run `aicib start` first."

### Slack — Department Chat Agent Disabled

**Scenario:** User sends a message in #aicib-engineering but CTO has `enabled: false` in config.
**Handling:** `handleChat()` checks agent config. Posts error with the agent's display name.
**User sees:** ":warning: CTO is currently offline. Enable the agent in aicib.config.yaml."

### Slack — @Mention Unrecognized Agent

**Scenario:** User types "@Designer" which doesn't match any known role.
**Handling:** `parseMention()` returns `{ mentionedRole: null }`. Message is handled by the channel's default owner.
**User sees:** Department head responds normally (ignoring the unrecognized mention).

### Slack — @Mention Cross-Department

**Scenario:** User types "@CFO" in #aicib-engineering.
**Handling:** @mention takes priority over channel owner. CFO responds in #aicib-engineering.
**User sees:** CFO replies in the engineering channel. By design — user explicitly requested a specific agent.

### Slack — Concurrent Chat Multiple Channels

**Scenario:** User sends messages in #aicib-engineering and #aicib-finance at the same time.
**Handling:** ChatQueue processes different agents in parallel. CTO and CFO each have their own queue slot.
**User sees:** Both agents respond independently. No blocking.

### Slack — Chat During Active Brief

**Scenario:** A CEO brief is processing, and user sends a message in #aicib-engineering.
**Handling:** Department chat sessions are independent from the CEO brief pipeline. CTO has its own SDK session.
**User sees:** CTO responds while CEO brief continues. No interference.

### Slack — SessionLock Contention (CEO Chat During Brief)

**Scenario:** User sends a casual chat message in #aicib-ceo while a brief is processing.
**Handling:** `SessionLock` is held by BriefQueue. CEO chat waits until the brief completes, then processes.
**User sees:** Delayed response — chat arrives after the brief finishes. Not an error.

### Slack — Chat Cost Limits

**Scenario:** Daily cost limit reached when a department chat message arrives.
**Handling:** `handleChat()` checks cost limits before starting. Posts cost limit message.
**User sees:** ":warning: Daily cost limit reached ($X / $Y)."

### Slack — Chat Prefix False Positive ("hire" matches "hi")

**Scenario:** User sends "hire a developer" — the classifier's chat prefix "hi" would match "hire" via `startsWith`.
**Handling:** `classifyHeuristic()` uses `startsWithWord()` which checks for word boundaries (space, punctuation, or end-of-string after the prefix). Also, brief signals (deadlines, delegation, action verbs) are checked BEFORE chat prefixes so strong brief evidence always wins.
**User sees:** "hire a developer" is correctly classified as ambiguous or definite_brief, not chat.

### Slack — @Mention with Punctuation in Custom Display Name

**Scenario:** Custom display name has punctuation like "Alex (CEO)" — user types `@Alex (CEO)`.
**Handling:** `parseMention()` uses `(?=[\s.,!?;:]|$)` lookahead instead of `\b` word boundary. Since `\b` fails after non-word characters like `)`, the lookahead correctly matches when followed by whitespace, punctuation, or end-of-string.
**User sees:** Mention is correctly detected; the named agent responds.

### Slack — Brief Confirmation Button Click After Timeout

**Scenario:** 30-second timeout fires (auto-chat), then user clicks "Yes" or "No" on the stale buttons.
**Handling:** `resolveConfirmation()` returns undefined (already cleaned up by timeout). Both `confirm_brief` and `reject_brief` handlers check for undefined and return "Already handled."
**User sees:** "This was already handled. Send a new message or use /brief to submit a brief."

### Slack — Department Chat When chat_enabled is false

**Scenario:** User set `chat_enabled: false` in config, but sends a message in `#aicib-engineering`.
**Handling:** Department channel routing checks `!slackConfig.chat_enabled` and returns early. Message is silently ignored.
**User sees:** No response. Consistent with CEO channel behavior when chat is disabled.

## Hook System / Extension Registries (Wave 0)

### Config Extension — Reserved Key

**Scenario:** A feature module calls `registerConfigExtension({ key: 'agents', ... })` using a key that belongs to the core config
**Handling:** `registerConfigExtension()` checks against `RESERVED_CONFIG_KEYS` set and throws immediately
**User sees:** Developer error at startup: `Config extension key "agents" is reserved`

### Config Extension — Duplicate Key

**Scenario:** A feature module is imported twice, or two features use the same config key
**Handling:** `registerConfigExtension()` checks for existing key in the registry and throws
**User sees:** Developer error at startup: `Config extension key "autonomy" is already registered`

### Config Extension — Partial YAML Section

**Scenario:** User's YAML has `autonomy: { level: high }` but the extension defaults include `{ enabled: true, level: 'medium' }`
**Handling:** `validateConfig()` shallow-merges defaults with YAML values: `{ ...defaults, ...yamlValues }`
**User sees:** Nothing — missing fields silently filled with defaults. The merged result is `{ enabled: true, level: 'high' }`

### Config — Unknown YAML Keys Preserved

**Scenario:** User manually adds a custom section to their YAML (e.g., `my_notes: ...`), or a process saves config without importing all feature modules
**Handling:** `validateConfig()` collects unrecognized top-level keys into `extensions`. `saveConfig()` flattens them back to top-level YAML.
**User sees:** Nothing — their custom sections survive load/save round-trips

### Hook Registration — Duplicate Name

**Scenario:** `registerContextProvider('task-status', fn)` called twice (module imported multiple times)
**Handling:** Second call throws: `Context provider "task-status" is already registered`
**User sees:** Developer error at startup. Same pattern for `registerMessageHandler()` and `registerTable()`.

### Message Handler — Runtime Error

**Scenario:** A registered message handler (e.g., Slack bridge) throws during message processing
**Handling:** `notifyMessageHandlers()` catches the error and logs: `Warning: Message handler "slack-bridge" failed: [error]`
**User sees:** Warning in terminal. Main session flow continues unaffected.

## Agent Intelligence Features (Wave 2 Session 3)

### Intelligence — Unknown Skill Name

**Scenario:** Frontmatter or config references a skill name that doesn't exist in the built-in library or custom skills.
**Handling:** `resolveSkills()` logs a console warning and skips the unknown skill. Agent continues with remaining valid skills.
**User sees:** `Warning: Unknown skill "nonexistent_skill" — skipping. Add it as a custom skill in config or check the name.`

### Intelligence — Empty Skills Array in Frontmatter

**Scenario:** Agent frontmatter has `skills: []` (explicit empty array).
**Handling:** `resolveAgentSkills()` treats `undefined`/missing as "use defaults" and `[]` (explicit empty) as "no skills." Empty frontmatter array is respected — the user intentionally removed all skills.
**User sees:** Nothing — agent gets no skill context injected.

### Intelligence — Config Override for Non-Existent Agent

**Scenario:** Config has `autonomy.overrides.data-scientist: { level: full }` but no data-scientist agent exists.
**Handling:** The override is silently ignored since no agent will resolve with that role name during context provider execution.
**User sees:** Nothing — the override has no effect.

### Intelligence — CEO Escalation Chain

**Scenario:** CEO needs to escalate something.
**Handling:** `buildEscalationChain()` skips the "ceo" step for the CEO role (checks `if (agentRole !== "ceo")`). CEO's chain is: retry → human_founder.
**User sees:** CEO's escalation protocol shows only 2 steps.

### Intelligence — All Features Disabled

**Scenario:** User sets `autonomy.enabled: false`, `escalation.enabled: false`, `skills.enabled: false` in config.
**Handling:** Each context provider checks the `enabled` flag and returns empty string. No prompt context injected.
**User sees:** Zero behavior change from pre-Session-3 behavior. System works exactly as before.

### Intelligence — Skills Scalar in Frontmatter

**Scenario:** Agent frontmatter uses `skills: code_review` (scalar string) instead of a YAML array (`skills:\n  - code_review`).
**Handling:** `resolveAgentSkills()` accepts `string | string[] | undefined`. Scalar strings are wrapped in a single-element array. Without this, spreading a string `[..."code_review"]` would produce `["c","o","d","e","_","r",...]`.
**User sees:** Nothing — skill resolves correctly regardless of YAML format.

### Intelligence — Chain Override Includes human-founder

**Scenario:** Config `chain_overrides.cto` includes `"human-founder"` as one of the targets.
**Handling:** After building the custom chain, `buildEscalationChain()` checks if the last step already targets `"human-founder"` before appending the always-present final step. Prevents duplicate.
**User sees:** Nothing — chain has exactly one human_founder step at the end.

### Intelligence — Chain Override Excess Targets

**Scenario:** Config `chain_overrides.cto` has 6 targets but only 4 custom slots are available (retry and human_founder are fixed).
**Handling:** `buildEscalationChain()` logs a `console.warn` about excess targets. Extra targets are silently dropped — only the first 4 are used.
**User sees:** Warning in terminal: `Warning: chain_overrides.cto has 6 targets but only 4 are used (retry and human_founder are fixed).`

### Intelligence — Config Section is Non-Object

**Scenario:** User writes `skills: "on"` or `autonomy: true` (scalar instead of object) in the config YAML.
**Handling:** All three validators (`validateAutonomyConfig`, `validateEscalationConfig`, `validateSkillsConfig`) check `typeof raw !== "object"` and return an error immediately.
**User sees:** Config validation error: `skills must be an object (not a scalar)`.

### Intelligence — Config Array Elements are Non-Strings

**Scenario:** User writes `autonomy.overrides.cto.grant: [true, 42]` (non-string array elements).
**Handling:** Validators check `.some((x) => typeof x !== "string")` on all array fields (`grant`, `restrict`, `add`, `remove`, `chain_overrides.*`).
**User sees:** Config validation error: `autonomy.overrides.cto.grant items must be strings`.

### Intelligence — Context Provider Performance

**Scenario:** Three context providers each call `loadAgentDefinitions()` which reads all soul.md files from disk.
**Handling:** With 8 small .md files, each call takes < 10ms. Total: ~30ms. Not a concern for session startup.
**Future optimization:** Cache agent definitions across providers within a single `gatherExtensionContext()` call — deferred to Phase 3.

### Cost Recording — Unknown Model

**Scenario:** SDK returns a model ID that doesn't start with "claude-opus" or "claude-haiku" (e.g., a new model family)
**Handling:** Assigned to sonnet tier via prefix-match heuristic (`startsWith`). `toSDKShortName()` logs a `console.warn` on fallback. Uses sonnet-tier fallback pricing ($3/$15 per M tokens).
**User sees:** `Unknown model "claude-future-5" — falling back to sonnet tier`

### Cost Recording — SDK Reports $0 Cost

**Scenario:** SDK's `costUSD` field is exactly 0 for a model usage entry
**Handling:** Treated as "SDK didn't calculate cost" rather than "genuinely free." Falls back to estimated pricing from model router's `getFallbackPricing()`.
**User sees:** Nothing — cost is recorded using estimated pricing instead of $0.

### Engine — Test State Leak

**Scenario:** A test calls `setEngine(mockEngine)` but doesn't clean up, leaving the mock in place for subsequent tests
**Handling:** `resetEngine()` clears the singleton. Call in test teardown (`afterEach`) to restore default behavior.
**User sees:** N/A — developer/test concern only.

## Task Management (Wave 2 Session 4)

### Tasks — Circular Blocker Dependency

**Scenario:** User or agent tries to add a blocker that would create a cycle (e.g., A blocks B, then B blocks A).
**Handling:** `addBlocker()` runs BFS cycle detection starting from `blockerId` and following existing blocker edges. If `taskId` is reachable from `blockerId`, adding the edge would create a cycle, so it throws an error. (Fixed in peer review — original implementation started from `taskId` looking for `blockerId`, which missed cycles because it traversed edges in the wrong direction.)
**User sees:** "Adding this blocker would create a cycle" — the blocker is not added.

### Tasks — TASK::CREATE with Fields in Any Order

**Scenario:** Agent outputs `TASK::CREATE title="Test" priority=high department=engineering` (priority before department).
**Handling:** Regex matches the title first, then scans the remainder for individual key=value pairs in any order.
**User sees:** Nothing — task created correctly regardless of field order.

### Tasks — Natural Language False Positive Prevention

**Scenario:** Agent says "I completed 5 items in the backlog" (not referring to task #5).
**Handling:** Natural language patterns now require the word "task" before `#N`. "completed 5 items" won't match; "completed task #5" will.
**User sees:** Nothing — only genuine task references trigger updates.

### Tasks — Message Handler projectDir Bridging

**Scenario:** The task message handler needs `projectDir` but the handler API doesn't pass it.
**Handling:** The context provider sets module-level `lastProjectDir` during each session. The message handler reads it. One session per process, so no cross-session contamination.
**User sees:** Nothing — TASK:: markers in agent output are processed correctly.

### Tasks — Blocked Filter

**Scenario:** User runs `aicib tasks list --blocked` to see tasks waiting on other work.
**Handling:** SQL subquery checks for unfinished blockers (`status NOT IN ('done', 'cancelled')`). Tasks with only completed blockers are NOT shown as blocked.
**User sees:** Only tasks that are genuinely stuck waiting for other unfinished work.

### Tasks — Column Whitelist in Updates

**Scenario:** Message handler passes a `Record<string, unknown>` to `updateTask()` — keys come from parsed agent output.
**Handling:** `updateTask()` checks each key against `ALLOWED_COLUMNS` set. Unknown keys silently skipped.
**User sees:** Nothing — only valid task fields are updated.

### Tasks — Multiple CLI Update Flags

**Scenario:** User runs `aicib tasks update 5 --status done --priority high --assign cto`.
**Handling:** All field changes collected into one object, applied in a single `updateTask()` call. Comment added separately.
**User sees:** One "Task Updated" confirmation with all changes listed.

### Tasks — Flush Failures Logged

**Scenario:** Database write fails during debounced task update flush (e.g., disk full, table locked).
**Handling:** Individual update failures logged via `console.warn("Task update failed:", e)`. Outer DB connection failures logged via `console.warn("Task flush DB error:", e)`. Other queued updates continue.
**User sees:** Warning in terminal. Agent session not interrupted.

### Tasks — Fresh Project (No Tables Yet)

**Scenario:** User runs `aicib tasks` before ever running `aicib start` (which creates DB tables via CostTracker.init).
**Handling:** `TaskManager` constructor calls `ensureTables()` which runs `CREATE TABLE IF NOT EXISTS` for all 3 task tables + indexes. Safe to run alongside CostTracker since both use `IF NOT EXISTS`.
**User sees:** Empty task board — no crash.

### Tasks — TASK::CREATE with Empty Title

**Scenario:** Agent outputs `TASK::CREATE title=""` (empty title).
**Handling:** Message handler checks `if (!title?.trim()) break;` before calling `createTask()`. Empty or whitespace-only titles are silently skipped.
**User sees:** Nothing — no task created.

### Tasks — max_context_tasks Set to Zero

**Scenario:** User sets `tasks.max_context_tasks: 0` in config to disable task board injection.
**Handling:** Context provider returns `""` immediately when `maxTasks === 0`. `listTasks()` also guards with `limit != null && limit > 0` so `0` doesn't become unlimited.
**User sees:** No task board in agent prompts. Tasks still exist in DB and are accessible via `aicib tasks`.

## Projects (Long Autonomous Task Chains)

### Project — sendBrief() Throws Mid-Phase

**Scenario:** `sendBrief()` throws during phase execution (network error, API failure, cost limit mid-run).
**Handling:** Try/catch around the entire phase execution block. Marks the current phase as `"failed"` with the error message and `completed_at`. Adds prior accumulated costs to project totals. Marks project as `"failed"`. Breaks out of loop — normal completion logic updates the background job.
**User sees:** Phase shows as FAILED in `aicib project status`. `aicib logs` shows the error.

### Project — External Cancellation While Phase Running

**Scenario:** User runs `aicib project cancel` while a phase is actively executing.
**Handling:** Cancel sets project status to `"cancelled"` in DB and sends SIGTERM to the worker. At the top of each loop iteration, the worker re-reads project status. If `"cancelled"` or `"paused"`, it breaks out. Even if SIGTERM delivery fails (race, permission), the DB check catches it.
**User sees:** `aicib project status` shows project as "cancelled". Worker stops after current phase's `sendBrief()` returns.

### Project — Cancel Uses Correct Session ID

**Scenario:** User runs `aicib stop` then `aicib start` (new session), then `aicib project cancel`. The active CLI session differs from the session that spawned the project.
**Handling:** `projectCancelCommand()` looks up the background job using the project's own `session_id` (from the `projects` table), not the current CLI session.
**User sees:** Cancel works correctly regardless of session changes.

### Project — Cost Under-Counting on Failed Phase

**Scenario:** A phase is rejected 3 times (max retries). Each attempt costs $2. Only the last attempt's cost was being recorded in the project totals.
**Handling:** The failed-phase branch now computes accumulated totals from all retry attempts (same pattern as the approved-phase branch): `phaseTotalCost = phase.cost_usd + phaseResult.totalCostUsd`. These accumulated values are used in both `updatePhase()` and `updateProject()`.
**User sees:** `aicib project status` shows correct total cost including all retry attempts.

### Project — Duplicate Phase Numbers

**Scenario:** A bug or race condition tries to insert two phases with the same `phase_number` for the same project.
**Handling:** `UNIQUE(project_id, phase_number)` constraint on the `project_phases` table. SQLite rejects the duplicate insert.
**User sees:** Error during planning phase. Project fails with clear error message.

### Project — Daily Cost Limit Hit Between Phases

**Scenario:** Phase 3 completes but today's total cost now exceeds the daily limit.
**Handling:** Cost limit checked at the top of each loop iteration before starting the next phase. Project status set to `"paused"`.
**User sees:** `aicib project status` shows "paused". Can resume tomorrow or after increasing the limit.

### Project — SIGTERM Between Phases

**Scenario:** `aicib stop` sends SIGTERM while the worker is between phases (e.g., checking loop conditions).
**Handling:** `sigtermReceived` flag is set. Checked at the top of each loop iteration. Project status set to `"paused"`.
**User sees:** Project shows as "paused". Background job shows as "completed" (graceful stop).

### Tasks — Natural Language Multiple Task References

**Scenario:** Agent says "Completed task #5 and task #3" in a single message.
**Handling:** NL patterns use `.matchAll()` with the `g` flag instead of `.match()` (first match only). Both task #5 and #3 are updated to "done".
**User sees:** Both tasks updated — not just the first one mentioned.
