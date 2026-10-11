---
name: gitlab-filing
description: Shared mechanics for filing/updating GitLab Issues and posting comments on Issues or MRs. Every agent and skill in this project that files to GitLab (bug-report, session-report, user-story-enhancer, ci-diagnostician) references this skill instead of re-describing the mechanics inline.
---

# gitlab-filing

This skill is the single place that describes *how* this project talks to
GitLab via GitLab MCP. Agents that produce issue/comment *content* (e.g.
the `bug-report` skill formats a bug body and picks its labels)
still own that formatting — this skill only covers the mechanical calls:
create, update, comment, and what to do when a call fails.

## Server and tool names

The GitLab MCP server is `@zereight/mcp-gitlab@2.2.1`. From a clone it's
registered as `gitlab` in `.mcp.json` (template: `.mcp.example.json`); in the
plugin it ships with the plugin, so every tool below is named
`mcp__plugin_qa-agent_gitlab__<tool>` instead of `mcp__gitlab__<tool>`. Same
tools, same parameters. Tool names and parameters below were checked
against that version's schemas:

- `mcp__gitlab__create_issue`
- `mcp__gitlab__get_issue`
- `mcp__gitlab__update_issue`
- `mcp__gitlab__create_note` (comment on an Issue or MR)
- `mcp__gitlab__list_issues` (filters: `labels`, `milestone`, `search`, `scope`)
- `mcp__gitlab__upload_markdown` (attach a local file, see below)
- `mcp__gitlab__get_merge_request`, `mcp__gitlab__list_merge_request_changed_files`, `mcp__gitlab__get_merge_request_diffs`, `mcp__gitlab__list_merge_requests` (WAY 5, 11)
- `mcp__gitlab__get_pipeline`, `mcp__gitlab__list_pipelines`, `mcp__gitlab__list_pipeline_jobs`,
  `mcp__gitlab__get_pipeline_job_output` (WAY 5, 12)
- `mcp__gitlab__validate_ci_lint` (WAY 10)

Several of these are **not** in the server's default toolset. The config must set
`GITLAB_TOOLSETS=core,issues,merge_requests,pipelines,ci` (an explicit list
replaces the default, so `core` must stay in it) and
`GITLAB_TOOLS=upload_markdown` (that one tool lives in the unrelated `users`
toolset, so it's enabled on its own). If a tool above is missing from `/mcp`,
check those two variables first. If the server is upgraded, re-check the names.

## Identifiers: IID vs internal ID

GitLab Issues and MRs have two IDs:

- **IID** — the project-scoped number shown in the UI and used everywhere in
  this project's user-facing text (`#143`, `Issue: 148`). Use this when a
  human or a WAY input gives you a number.
- **internal `id`** — a global ID some GitLab API endpoints require instead
  of IID (this varies by endpoint and API version). If a call rejects an
  IID, check whether it wants the internal ID instead — fetch the issue
  first to resolve one to the other rather than guessing.

Always report IIDs back to the user (`#143`), never the internal ID.

## Creating an Issue

```
mcp__gitlab__create_issue(
  project_id: GITLAB_PROJECT_ID,     # or the URL-encoded GITLAB_NAMESPACE/GITLAB_PROJECT path
  title: <title>,
  description: <body — include the watermark footer, see CLAUDE.md's Output Watermark>,
  labels: [<label>, ...]             # see Label Conventions below
)
```

Return the created issue's IID + URL to the caller so it can be printed,
cross-linked, or referenced in a session report.

## Updating an Issue

```
mcp__gitlab__update_issue(
  project_id: GITLAB_PROJECT_ID,
  issue_iid: <IID>,
  description: <new body>,           # full replace — see note below
  labels: [<label>, ...]             # only if labels are changing
)
```

A description update is a **full replace, not a patch**. If the agent
manages a watermark footer (per CLAUDE.md's Output Watermark policy), it
must be part of the body passed here every time — it does not carry over
from the previous version automatically.

### Closing / reopening

`update_issue` takes `state_event: close | reopen`. Closing or reopening an
issue is visible to the whole team, so only do it when the WAY says so
(e.g. `verify-fix` with the user's confirmation), and always post a comment
explaining why in the same pass.

## Attaching files (screenshots, logs)

A local path like `runs/<id>/artifacts/…/test-failed-1.png` means nothing to a
developer reading the issue. Upload the file first:

```
mcp__gitlab__upload_markdown(
  project_id: GITLAB_PROJECT_ID,
  file_path: <absolute path to the local file>
)
```

It returns a markdown snippet (`![name](/uploads/…)`). Put that snippet in the
issue or comment body. Upload only what helps reproduce: the failure
screenshot, plus the `error-context.md` or a short console log excerpt. Never
upload traces (`trace.zip`) or `api-responses/` captures unless you've checked
they contain no tokens or personal data. If the upload fails, keep the local
path in the body, label it "on the QA machine", and carry on.

## Linking issues (test-plan ↔ test-case, bug ↔ test-case)

GitLab has no first-class "linked issues" field over the MCP surface assumed
here — link by reference instead: include `Related to #<IID>` (or
`Relates to #<IID>`) in the body/description text of the issue being linked.
GitLab auto-renders `#<IID>` references as links within the same project.

## Posting a comment (Issue or MR)

```
mcp__gitlab__create_note(
  project_id: GITLAB_PROJECT_ID,
  noteable_type: issue | merge_request,
  noteable_iid: <IID>,
  body: <comment text — include the watermark footer if this comment is a human-facing report, e.g. WAY 6's QA analysis>
)
```

Use `noteable_type: merge_request` for what CLAUDE.md calls an "MR
discussion comment" (WAY 1 Phase 4, WAY 11, WAY 4's `MR:` option, WAY 5's
optional diagnosis comment).

## Label Conventions

Apply these consistently — agents and skills choosing labels (`bug-report`,
WAY orchestration steps) should draw only from this set
unless a WAY explicitly says otherwise:

| Label | Meaning | Set by |
|---|---|---|
| `bug` | Any filed defect | WAY 1/2/3 |
| `sev-1` / `sev-2` / `sev-3` / `sev-4` | Severity, from the `bug-report` skill | WAY 1/2/3 |
| `p1` / `p2` / `p3` | Priority, from the `bug-report` skill | WAY 1/2/3 |
| `test-plan` | Index issue summarizing a set of test cases | WAY 1/4 |
| `test-case` | One issue per generated `Test#<nn>` | WAY 1 |
| `api` | Bug or test case from API testing (WAY 2) | WAY 2 |
| `e2e` | Bug or test case from browser testing (WAY 1) | WAY 1 |
| `accessibility` | Bug originating from an axe-core violation | WAY 1 |
| `qa-session-report` | End-of-session summary issue | WAY 1/2 |
| `benchmark` | Competitor benchmark report, or the index of a gap backlog | WAY 7/8 |
| `user-story` | User story written from a benchmark gap | WAY 8 |
| `benchmark-gap` | Story closing a feature gap vs a benchmarked competitor | WAY 8 |
| `decision-needed` | Story that conflicts with a deliberate product choice; needs a PO call before work starts | WAY 8 |
| `verified` | Bug whose regression test passed after the fix | WAY 9 |
| `fix-failed` | Bug whose regression test still fails after a claimed fix | WAY 9 |
| `performance` | Bug from a load-test threshold breach | WAY 15 |
| `flaky-test` | Test (not product) issue: a scenario quarantined by flaky triage | WAY 13 |
| `release-readiness` | Go/no-go report for a milestone | WAY 12 |

## Failure Handling

If any `mcp__gitlab__*` call fails (auth error, network error, rate limit,
project not found, etc.):

1. Log the error (what was attempted, what GitLab returned)
2. Skip that specific operation — do not retry in a loop
3. Continue the rest of the WAY/agent's work — do not abort the whole run

This mirrors CLAUDE.md's Global Rules. If the failing call was the only way
to deliver an artifact a human needs (e.g. `user-story-enhancer`'s issue
update), print the formatted content to chat instead so the user can apply
it manually.

## Rules

- Never invent a project ID, namespace, or IID — if `GITLAB_PROJECT_ID` (or
  `GITLAB_NAMESPACE`/`GITLAB_PROJECT`) is unset, stop and ask rather than
  guessing
- Every issue body and comment this skill helps post that is meant for
  humans to read still needs the watermark footer from CLAUDE.md's Output
  Watermark section — this skill does not add it for you, the calling agent
  must include it in the content it passes in
