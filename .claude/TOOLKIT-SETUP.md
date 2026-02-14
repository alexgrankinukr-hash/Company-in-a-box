# Dev Toolkit Setup Guide

This folder contains reusable Claude Code commands and skills for structured software development. They were exported from another project and need to be configured for yours.

## What's Included

### Core Development Workflow (use in order)
| Command | What it does |
|---------|-------------|
| `/explore` | Understand the problem before writing code - asks questions, maps dependencies |
| `/create-issue` | Capture a bug/feature as a Linear issue (works standalone or after /explore) |
| `/create-master-plan` | Break a large project into phases with dependencies |
| `/create-phase-issues` | Turn a master plan into individual Linear issues per phase |
| `/create-plan` | Create a detailed implementation plan for one issue/phase |
| `/review-plan` | Fact-check a plan (verifies APIs, packages, pricing, file paths) |
| `/execute` | Implement the plan step by step with progress tracking |
| `/review` | Pre-commit code review of uncommitted changes |
| `/document` | Update documentation after code changes |

### Peer Review (multi-AI review)
| Command | What it does |
|---------|-------------|
| `/prepare-peer-review` | Generate a prompt to copy to Cursor/ChatGPT for code review |
| `/peer-review` | Analyze feedback from external AI review (validates findings) |
| `/auto-peer-review` | Fully automated 3-way review (Codex + Cursor + Claude) |

### Planning Automation
| Command | What it does |
|---------|-------------|
| `/prepare-plan-prompt` | Generate planning prompt for external AIs |
| `/auto-create-plan` | Automated planning with Claude + Codex + auto-review |

### Skill (background agent)
| Skill | What it does |
|-------|-------------|
| `prepare-peer-review` | Same as command but runs as a forked agent (used by auto-peer-review) |

---

## Configuration Required

These commands use **placeholders** that need to be replaced with your project's details. You have two options:

### Option A: Find-and-Replace (Quick)

Search all files in `.claude/commands/` and `.claude/skills/` for these placeholders and replace them:

| Placeholder | Replace with | Example |
|-------------|-------------|---------|
| `[PROJECT_NAME]` | Your project's display name | "AI Teams Platform" |
| `[PROJECT_DIR]` | Your main project directory | "src" or "app" or "aicib" |
| `[TEAM_NAME]` | Your Linear team name | "AI Teams" |
| `[ISSUE_PREFIX]` | Your Linear issue prefix | "AIT" |
| `[TECH_STACK]` | Your tech stack summary | "Next.js, TypeScript, Python, FastAPI" |

### Option B: Let Claude Do It (Recommended)

Copy this prompt into Claude Code in your project:

---

**PROMPT TO PASTE:**

```
I have a development toolkit in .claude/commands/ and .claude/skills/ with placeholder values that need to be configured for this project.

Please do the following:

1. Read all .md files in .claude/commands/ and .claude/skills/
2. Replace these placeholders throughout ALL files:
   - [PROJECT_NAME] → "<YOUR PROJECT NAME>"
   - [PROJECT_DIR] → "<YOUR MAIN DIRECTORY>"
   - [TEAM_NAME] → "<YOUR LINEAR TEAM>"
   - [ISSUE_PREFIX] → "<YOUR ISSUE PREFIX>"
   - [TECH_STACK] → "<YOUR TECH STACK>"
3. Create the docs directory structure that these commands expect:
   - [PROJECT_DIR]/docs/plans/
   - [PROJECT_DIR]/docs/flows/
   - [PROJECT_DIR]/docs/technical/
   - [PROJECT_DIR]/docs/edge-cases.md
   - [PROJECT_DIR]/docs/pending-docs.md
4. Show me what you changed

Replace the angle-bracket values above with your actual project details before pasting.
```

---

## Directory Structure Expected

These commands expect your project to have (or will create) this structure:

```
[PROJECT_DIR]/
  docs/
    plans/          ← Master plans and phase plans live here
      [project-name]/
        master-plan.md
        overview.md
        phases/
          phase1-*.md
          phase2-*.md
    flows/           ← User-facing documentation
    technical/       ← Technical documentation
    edge-cases.md    ← Edge case tracking
    pending-docs.md  ← Items to document later
```

## Prerequisites

### Required
- **Claude Code** (CLI) - These are Claude Code slash commands
- **Linear** (with MCP server) - For issue tracking integration

### Optional (for automation commands)
- **Codex CLI** (OpenAI) - Used by `/auto-peer-review` and `/auto-create-plan`
- **Cursor Agent CLI** - Used by `/auto-peer-review`

If the optional CLIs aren't installed, the automation commands will gracefully fall back to Claude-only mode.

## Recommended Workflow

### For a small task (< 1 day)
```
/explore → /create-issue → /create-plan → /execute → /review → /document
```

### For a large project (multi-day/week)
```
/explore → /create-master-plan → /review-plan → /create-phase-issues
Then for each phase:
  /create-plan → /execute → /review → /document
```

### For code review before commit
```
/review                    ← Quick self-review
/prepare-peer-review       ← Get external opinion
/peer-review [feedback]    ← Analyze external feedback
/auto-peer-review          ← Fully automated 3-way review
```

## Tips

- These commands work best when your CLAUDE.md has project context (tech stack, patterns, structure)
- The `/review-plan` command saves you time by catching wrong package names, outdated APIs, and unrealistic estimates before you start coding
- Linear integration is optional - you can say "none" when asked for issue IDs
- Plans are saved as markdown files so they persist across sessions
