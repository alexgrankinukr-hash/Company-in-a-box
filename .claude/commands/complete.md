---
description: Wrap up implementation - commit, update Linear, create PR
allowed-tools: Bash(git:*), Bash(gh:*), mcp__linear-server__update_issue, mcp__linear-server__create_comment, Read, Edit, Write, Glob
---

# Complete

Finish the implementation by wrapping up all loose ends.

## Step 1: Pre-Commit Verification

Before committing, verify:

### A. Check Documentation

Ask user: "Did you run `/document` to update documentation?"

If NO:
- Offer to run `/document` now
- Wait for docs to be updated
- Then proceed

If YES:
- Continue to next check

### B. Review Git Status

Run `git status` to show:
- Untracked files
- Modified files
- Staged files

Confirm with user these are the intended changes.

### C. Show Change Summary

Run `git diff --stat` to show high-level summary of changes.

Ask: "Ready to commit these changes?"

## Step 2: Create Commit

### A. Stage All Changes

```bash
git add .
```

Or if user wants selective staging, ask which files to include.

### B. Generate Commit Message

Based on the changes, create a descriptive commit message following existing conventions:

**Format:**
```
[Action] [Brief description]

[Longer description if needed]

- Bullet point of key change 1
- Bullet point of key change 2
- Bullet point of key change 3

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Action verbs:**
- "Add" - New feature or file
- "Update" - Modification to existing feature
- "Fix" - Bug fix
- "Refactor" - Code restructuring
- "Remove" - Deletion

**Example:**
```
Add dark mode toggle to user settings

Users can now switch between light, dark, and system themes.
Theme preference persists across sessions and syncs across devices.

- Add ThemeProvider context with localStorage sync
- Add theme toggle in Settings page
- Update CSS variables for theme switching
- Handle system preference detection and updates

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### C. Execute Commit

Use heredoc for proper formatting:
```bash
git commit -m "$(cat <<'EOF'
[Your generated commit message here]
EOF
)"
```

### D. Get Commit Hash

After successful commit:
```bash
git log -1 --format=%H
```

Save this hash for Linear update.

## Step 2A: Check if This is a Phase

**Determine if this is part of a multi-phase project:**

1. Look for the plan file that was used
2. Check if the plan path contains `/phases/` folder
3. If YES: read the plan file frontmatter for `phase: X` and `master_plan: path`
4. If NO: skip to Step 3

## Step 2B: Update Master Plan (Phases Only)

If this is a phase:

1. **Read the master plan file** from the path in phase plan frontmatter
2. **Update frontmatter:**
   - Find `phases_completed:` line
   - Increment the number (e.g., `0` → `1`, `3` → `4`)
3. **Mark phase as complete:**
   - Find `## Phase [X]:` heading in master plan
   - Add ` ✅ COMPLETE` at the end of the heading line
   - Add a new line after the heading: `**Completed:** YYYY-MM-DD`
4. **Write the updated master plan** back to disk

## Step 2C: Update Overview Document (Phases Only)

If this is a phase:

1. **Read overview.md** from same folder as master plan: `feature-intel/docs/plans/[project]/overview.md`
2. **Update progress summary:**
   - Find the line for this phase in Progress Summary section
   - Change `⬜ Phase X:` to `✅ Phase X:`
   - Update the status count at top: `Phase X/Y Complete` (increment X)
   - Update "Last Updated" date
3. **Append to Implementation Log:**
   - Go to end of file (or after "## Implementation Log" section)
   - Add new entry:
   ```markdown
   ## Phase [X]: [Phase Name] ✅

   **Completed:** YYYY-MM-DD
   **Commit:** [commit-hash]
   **Linear Issue:** [REV-XXX]

   **What was accomplished:**
   - [Summary from completed phase plan tasks]
   - [Key deliverables]

   **Files modified:**
   - `path/to/file1.ts` - [brief description]
   - `path/to/file2.py` - [brief description]

   ---
   ```
4. **Write the updated overview.md** back to disk

## Step 2D: Commit Plan Updates (Phases Only)

If this is a phase:

```bash
git add feature-intel/docs/plans/[project]/master-plan.md
git add feature-intel/docs/plans/[project]/overview.md
git commit --amend --no-edit
```

This amends the implementation commit to include the plan file updates.

## Step 3: Update Linear Issue

If Linear issue ID was provided (or extracted from plan file):

### A. Get Issue ID

From user argument: `/complete REV-123`

Or from plan file frontmatter: Look for plan in `feature-intel/docs/plans/` and extract `linear_issue`

Or ask user: "What's the Linear issue ID? (or 'none' to skip)"

### B. Add Comprehensive Implementation Comment

Use `mcp__linear-server__create_comment`:

**Create detailed comment including everything accomplished:**

```markdown
✅ **Implementation Complete**

**Commit:** [commit-hash]
**Plan:** `feature-intel/docs/plans/[path-to-plan].md`

## What Was Accomplished

[Detailed summary of all completed tasks from the plan - list each major task]
- Task 1: [Description of what was done]
- Task 2: [Description of what was done]
- Task 3: [Description of what was done]

## Files Modified

[List each modified file with brief description of changes]
- `path/to/file1.ts` - Added dark mode toggle component
- `path/to/file2.tsx` - Updated theme context provider
- `path/to/file3.css` - Added CSS variables for theming

## Testing Done

[What was tested and verified]
- Tested light/dark/system theme switching
- Verified persistence across sessions
- Checked responsive behavior

## Documentation Updated

[What docs were updated, or note if pending]
- Updated `docs/flows/settings.md` with theme toggle
- Added to `docs/pending-docs.md` for technical review

---

[If this is a phase, add:]
This was **Phase [X] of [Y]** in [Project Name]
Master plan: `feature-intel/docs/plans/[project]/master-plan.md`
```

**Important:** Make this comment comprehensive - it should serve as a complete record of what was done, not just a brief summary.

### C. Mark Issue as Done

Use `mcp__linear-server__update_issue`:

```
Issue ID: [from step 3A]
State: "Done"
```

## Step 4: Create Pull Request (Optional)

Ask user: "Create a pull request?"

### If YES:

Use existing `/pr` command or:

```bash
gh pr create --title "[PR title]" --body "$(cat <<'EOF'
## Summary
[What this PR does]

## Changes
- [Change 1]
- [Change 2]

## Testing
- [ ] Manual testing done
- [ ] Verified in dev environment

## Related
- Linear: REV-XXX
- Commit: [hash]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Get PR URL from output.

### If NO:

Skip PR creation. Code is committed but not pushed.

## Step 5: Confirmation

Provide summary:

```markdown
✅ Implementation Wrapped Up

**Commit:** [short-hash] - "[commit message first line]"
**Linear:** REV-XXX marked as Done
**PR:** [URL or "Not created"]

**Summary:**
- [X] Code committed
- [X] Linear issue updated
- [X] Documentation [updated/pending]
- [X] PR [created/skipped]

**Next steps:**
[If PR created]: Review PR and merge when ready
[If no PR]: Push to remote when ready: `git push origin [branch]`

All done! 🎉
```

## Important Rules

### Commit Message Quality

- Keep first line under 72 characters
- Use imperative mood ("Add feature" not "Added feature")
- Include context in body if change is complex
- Always include Co-Authored-By tag

### Linear Integration

- Only update Linear if issue ID provided/found
- Don't create Linear issues automatically
- Include commit hash for traceability
- Mark as "Done" only if truly complete

### Pull Request

- Never create PR without user permission
- Use descriptive title and body
- Link to Linear issue
- Include testing notes

### Safety Checks

- Confirm changes before committing
- Don't commit if tests are failing (if applicable)
- Don't commit secrets or sensitive data
- Verify documentation was updated

## Error Handling

### If Commit Fails

- Show error message
- Check for pre-commit hooks blocking
- Fix issues
- Retry

### If Linear Update Fails

- Still show commit success
- Tell user: "Linear update failed, but code is committed"
- Provide manual update instructions

### If PR Creation Fails

- Still show commit and Linear success
- Provide manual PR creation command

## Example Execution

**User:** `/complete REV-456`

**You:**

```
📋 Pre-Commit Verification

Documentation status: ✅ Updated
Git status: 8 files modified, 2 new files
Change summary:
  web/src/components/Settings.tsx       | 45 +++++++++++++++++++++++++++++
  web/src/contexts/ThemeProvider.tsx    | 67 +++++++++++++++++++++++++++++++++++++++++++

Ready to commit these changes? (yes/no)
```

**User:** yes

**You:**

```
Creating commit...

Commit message:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Add dark mode toggle to user settings

Users can now switch between light, dark, and system themes.
Theme preference persists across sessions and syncs across devices.

- Add ThemeProvider context with localStorage sync
- Add theme toggle in Settings page
- Update CSS variables for theme switching
- Handle system preference detection and updates

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Committed: abc123def

Updating Linear issue REV-456...
✅ Added implementation notes
✅ Marked as Done

Create a pull request? (yes/no)
```

**User:** yes

**You:**

```
Creating PR...

✅ PR created: https://github.com/user/repo/pull/42

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Implementation Wrapped Up

**Commit:** abc123d - "Add dark mode toggle to user settings"
**Linear:** REV-456 marked as Done
**PR:** https://github.com/user/repo/pull/42

**Summary:**
- [X] Code committed
- [X] Linear issue updated
- [X] Documentation updated
- [X] PR created

**Next steps:**
Review PR at https://github.com/user/repo/pull/42 and merge when ready

All done! 🎉
```
