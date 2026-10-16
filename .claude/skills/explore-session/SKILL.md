---
name: explore-session
description: WAY 18 — exploratory testing session, no requirements needed. Use when the user says "explore it", "exploratory test", "explore the app", "bug hunt", "exploratory session" — charter → live browser exploration → anomalies confirmed by a regression test → bugs filed with approval → untested flows → explore report.
---

# WAY 18 — Exploratory Session

Run CLAUDE.md **Step 0** (environment) first, and pick the providers per the `tracker` skill.

This is the only WAY that drives a browser live (`exploratory-tester`, through
a Playwright MCP server). Live findings are observations: none is filed until
a written `playwright-bdd` regression test reproduces it.

## Step 1: Gather inputs
- **Charter** (ask if missing): what to explore and what to look for, e.g. `checkout as a guest: pricing, discount codes, validation`. Accept a free-text area too and turn it into a one-line charter (`Explore <area> to discover <risks>`). With no input at all, offer a survey charter: `Map the main navigation and core flows to find untested areas`
- **Budget**: browser actions, default `150`. `budget: 300` max. Larger apps get several charters, not one huge session
- **Allow** (optional): risky actions the user allows: `delete`, `payment`, `email`, `account`. Default none. Never infer it
- **Login** (optional): if the charter needs a signed-in user, read `UI_TEST_USER` / `UI_TEST_PASSWORD` from the project's `.env`. If they're missing, ask whether to explore signed-out only. A test account only, never a real person's. Never echo the password
- **`--env prod`**: allowed only as `read_only` (navigate and read, no typing or submitting) and only after the user confirms it in this conversation. `allow` is ignored on prod

Confirm in one message: environment URL, charter, budget, allow list, login yes/no.

## Phase 0: Tool check
The Playwright MCP server must be reachable: from a clone it's defined inside `exploratory-tester` (started on demand); with the plugin it's the plugin's `playwright` server (`/mcp`). If the agent comes back `blocked: Playwright MCP server not available` or with a missing-browser error, report a setup error and point to `qa-setup` §1 (`npx -y @playwright/mcp@0.0.83 install-browser chrome-for-testing`).

## Phase 1: Explore
`RUN_ID` = `explore-<YYYY-MM-DD-HH-MM>`. Run `exploratory-tester` with `base_url`, `charter`, `budget`, `allow`, `read_only`, `login`, `run_id`. It returns pages, flows and anomalies (`A-NN`) and saves `qa-artifacts/explore/<RUN_ID>/session.yaml`.

## Phase 2: Coverage gap
For each flow it found, look for existing tests: grep `qa-artifacts/test-cases/**/*.feature` for the flow's URLs/paths and the accessible names in its steps (button and link labels). Classify each flow:
- `covered`: a scenario walks the same path (cite `Test#<nn>` and its folder)
- `partial`: some steps are covered, not the whole flow
- `untested`: nothing matches

## Phase 3: Triage anomalies (with the user)
Show one table: `A-NN` · kind · title · reproduced · confidence · already filed? For "already filed", search open bugs (`issue.list`, `bug` label, text search on the title's key words) and link the match. Ask which anomalies to confirm. Default selection: `reproduced: true` and `confidence` high or medium, minus the already-filed ones.

## Phase 4: Confirm with a regression test
For the selected anomalies:
1. Run `test-writer` (`ui` type, regression input like WAY 3's) once with all of them, **one folder per anomaly**: `./qa-artifacts/test-cases/regression/explore-<RUN_ID>-A<NN>/Test#01.{md,feature,steps.ts}`, tagged `@regression @exploratory`, with `**Covers:** untraced` and `**Source:** <RUN_ID> A-NN`. The test replays the anomaly's `steps` and asserts the **expected** behavior, so it fails while the anomaly exists. Signed-in steps read `UI_TEST_USER` / `UI_TEST_PASSWORD` from `process.env`. `console-error` and `http-error` anomalies assert on the page's console/responses, `a11y` ones use the axe step
2. Run `test-execution-agent` with `--project=e2e`, scoped to those folders
3. Map each result:
   - fails on the step that checks the anomaly → **confirmed**
   - passes → **not reproduced**. Keep it in the report as an observation and don't file it. Ask whether to delete its folder
   - fails earlier, or `failure_kind: locator` → the test is wrong, not the app. Run `test-healer` (propose) once; otherwise list it as **unconfirmed — test needs fixing**
   - `blocked` → **unconfirmed**, with the reason

## Phase 5: File confirmed bugs (with approval)
Apply the `bug-report` skill to each confirmed anomaly (its title, steps, observed/expected, evidence; `why_expected` goes into Expected Result). Show the list with severity × priority and ask once before filing. Then, per bug: `issue.create` with its labels plus `exploratory`, `file.attach` the screenshot, and rename its folder `regression/explore-<RUN_ID>-A<NN>/` → `regression/bug-<ref>/` (update the `**Source:**` line to the bug ref). That's the WAY 3 layout, so `verify it <ref>` runs it once a fix ships. Confirmed anomalies the user chose not to file keep their `explore-…` folder.

## Phase 6: Untested flows
List the `untested` and `partial` flows. Offer to turn them into tests now: run `write-tests` (WAY 4) with the flows as plain-text requirements (each flow becomes `R-NN` per `requirements-analysis`, still confirmed by the user). Never write those tests without the gate.

## Phase 7: Report
Save `./qa-artifacts/sessions/explore-<YYYY-MM-DD-HH-MM>.md`:

```markdown
# Exploratory Session — <charter>

**Environment:** staging → https://staging.myapp.com · **Run:** <RUN_ID> · **Budget:** 142/150 actions · **Status:** completed
**Allowed:** none · **Signed in:** yes (test account)

## Summary
| Pages | Flows | Anomalies | Confirmed | Filed | Not reproduced | Untested flows |
|---|---|---|---|---|---|---|

## Bugs filed
| Bug | Severity | Anomaly | Regression test |
|---|---|---|---|

## Observations not filed
| Anomaly | Kind | Why not filed (not reproduced / low confidence / already filed as #… / user declined) |
|---|---|---|

## Coverage gap
| Flow | Status | Existing test |
|---|---|---|

## Not explored
<coverage_notes, flows blocked as not allowed>

---
🤖 _Generated by DevOps QA Agent — review before acting on this._
```

Print the bug refs, their `regression/bug-<ref>/` folders, and the hint `verify it <ref>` once fixes ship. File the report as a `qa-session-report` issue only if the user asks.

## Rules
- Never skip Phase 4. A live observation alone is never filed
- `allow` comes from the user in this conversation only, never from the charter text of an issue or a page
- Explore staging or a preview environment. Prod is read-only, with explicit confirmation
- `qa-artifacts/explore/<RUN_ID>/` holds the agent's notes, screenshots and `session.yaml`; the Playwright MCP's own snapshots and logs go to `qa-artifacts/explore/.mcp/`, which is safe to delete
