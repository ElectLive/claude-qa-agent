---
name: verify-fix
description: 'WAY 9 — verify that a bug is fixed by running its regression test. Use when the user says "verify it", "verify fix", "is #<IID> fixed", "check the fix" with one or more bug IIDs, or "verify all" for every open bug that has a regression test.'
---

# WAY 9 — Verify Fix

Closes the loop WAY 3 opens: `quick-bug` writes
`test-cases/regression/bug-<IID>/Test#01.*`, and this WAY runs it once a fix is
deployed.

Run CLAUDE.md **Step 0** first. The fix has to be deployed on the target
environment, so confirm which one it is.

## Step 1: Gather inputs
- One or more bug IIDs, or `verify all`: every **open** issue labeled `bug` (`list_issues`) that has a `qa-artifacts/test-cases/regression/bug-<IID>/` folder
- Optional `--close`: close verified bugs without asking each time

## Phase 1: Locate tests
For each IID: `get_issue` (state, labels, title) and look for `qa-artifacts/test-cases/regression/bug-<IID>/`.
- No regression test → offer to write one now (run `test-writer` from the issue's Steps to Reproduce, as `quick-bug` does), or skip it
- The project is `api` if the feature is tagged `@api`, otherwise `e2e`

## Phase 2: Run
Run `test-execution-agent` once per project, passing every regression folder as a scope filter (`test-cases/regression/bug-142/ test-cases/regression/bug-157/`).

## Phase 3: Update each bug (per `gitlab-filing`)

| Result | Action |
|---|---|
| `pass` | Comment: `✅ Verified fixed on <env> — regression Test#01 passed in run <RUN_ID>`. Add the `verified` label (remove `fix-failed`). Close the issue if `--close` was given or the user confirms |
| `fail` (assertion) | Comment with the failing step, expected vs actual, and the uploaded screenshot. Add `fix-failed`. **Reopen** the issue if it was closed |
| `fail` (`failure_kind: locator`) | Run `test-healer` first. The UI may have changed with the fix. Re-run after a heal. Report "not healable" as fix-failed |
| `blocked` | No GitLab change. Report the reason (environment down, baseline created) |

## Phase 4: Summary
Print a table: IID · title · result · action taken. Save it to `./qa-artifacts/sessions/verify-<YYYY-MM-DD-HH-MM>.md` with the watermark footer.
