---
name: provider-github
description: How to perform the tracker skill's operations on GitHub (github.com or GitHub Enterprise) with the gh CLI — issues, pull requests, Actions workflow runs and logs, labels, attachments. Every write and CI path was run live against a test repo. Load it when QA_TRACKER or QA_CODE_HOST is github.
---

# provider-github

**Tool:** the GitHub CLI `gh` (2.40+). It's authenticated once per machine with `gh auth login`, or through `GH_TOKEN` in the environment for CI. Check with `gh auth status`. For GitHub Enterprise, `gh auth login --hostname <host>` and pass `-R <host>/<owner>/<repo>`.

**Settings:** `GITHUB_REPO=owner/repo` (defaults to the current git remote). Pass `-R "$GITHUB_REPO"` on every command.

Write every body to a temp file first and pass `--body-file <file>`, never `--body "<long text>"`.

## Operations

| Operation | Command |
|---|---|
| `issue.create` | `gh issue create -R $GITHUB_REPO --title "<t>" --body-file b.md --label bug --label sev-2` prints the issue URL; the number is its last segment |
| `issue.get` | `gh issue view <n> -R $GITHUB_REPO --json number,title,body,labels,state,milestone,url` |
| `issue.update` | `gh issue edit <n> -R $GITHUB_REPO --body-file b.md --add-label verified --remove-label fix-failed` |
| `issue.comment` | `gh issue comment <n> -R $GITHUB_REPO --body-file c.md` |
| `issue.close` / `reopen` | `gh issue close <n> -R $GITHUB_REPO --comment "<why>" --reason completed` / `gh issue reopen <n> -R $GITHUB_REPO --comment "<why>"` |
| `issue.list` | `gh issue list -R $GITHUB_REPO --label bug --milestone "<title>" --state open --search "<text>" --json number,title,labels,state,body -L 200` |
| `issue.link` | put `Relates to #<n>` in the body. GitHub renders it as a link |
| `file.attach` | see "Attachments" below |
| `change.get` | `gh pr view <n> -R $GITHUB_REPO --json number,title,body,headRefName,baseRefName,files,url` |
| `change.diff` | `gh pr diff <n> -R $GITHUB_REPO --name-only`, then `gh pr diff <n> -R $GITHUB_REPO` (pipe through a filter for the files you need) |
| `change.comment` | `gh pr comment <n> -R $GITHUB_REPO --body-file c.md` |
| find the PR for a branch | `gh pr list -R $GITHUB_REPO --head <branch> --state all --json number,state -L 1` |
| `ci.get_run` | `gh run view <run-id> -R $GITHUB_REPO --json status,conclusion,headBranch,headSha,event,jobs,url` (a run URL's last segment is the ID). **`conclusion: failure` with an empty `jobs` list means the workflow file itself is invalid.** There are no logs then, so read the workflow file at `headSha`, parse it, and report a `config-failure` |
| `ci.job_log` | `gh run view <run-id> -R $GITHUB_REPO --log-failed \| sed 's/\x1b\[[0-9;]*m//g' \| tail -n 200` (that strips ANSI colour codes), or `--job <job-id> --log` for one job. If either says "log not found" right after the run ends, wait ~20s and retry, or use `gh api repos/$GITHUB_REPO/actions/jobs/<job-id>/logs` |
| `ci.latest_run` | `gh run list -R $GITHUB_REPO --branch <branch> -L 1 --json databaseId,event,status,conclusion,headSha,url`. Add `--event pull_request` when you want the PR's run rather than a push run |
| `ci.lint` | no API. If `actionlint` is installed, run `actionlint <file>`. Otherwise check the YAML parses and say lint was skipped |
| `project.check` | `gh repo view $GITHUB_REPO --json nameWithOwner,visibility` |

## Labels
GitHub doesn't create labels on first use. Before filing the first time, create the missing ones from the `tracker` label set: `gh label create <name> -R $GITHUB_REPO --color <hex> --description "<meaning>" --force` (`--force` updates an existing label instead of failing). Do this once per repo, with the user's OK.

## Milestones
`--milestone` takes the milestone **title**. `gh issue list --milestone` accepts a number or a title.

## Attachments
GitHub's API has no endpoint for uploading files into issue bodies. In order of preference:
1. **CI artifact link**: if the run happened in GitHub Actions, link the run's artifacts (`<run-url>#artifacts`)
2. **Release asset**: if the repo has a prerelease named `qa-artifacts` (`gh release view qa-artifacts -R $GITHUB_REPO`), use it **without asking**. `qa-setup` created it with the user's consent. If it doesn't exist, ask once before creating it with `gh release create qa-artifacts -R $GITHUB_REPO --prerelease --title "QA artifacts" --notes "Screenshots attached to QA bug reports"`, then for each file `gh release upload qa-artifacts <file> -R $GITHUB_REPO --clobber`, and embed `![name](https://github.com/<owner>/<repo>/releases/download/qa-artifacts/<file>)`. Prefix the file name with the run ID so names don't collide. On private repos these links only work for people with repo access, which is the intended audience
3. Otherwise keep the local path and label it "on the QA machine"

## Notes
- **Markdown:** GitHub renders it natively, including `<details>` and tables
- **Rate limits:** `gh api rate_limit` if calls start failing with 403
- **Issues disabled:** if the repo has issues turned off (`gh repo view --json hasIssuesEnabled`), say so, and suggest Jira/Azure Boards as `QA_TRACKER`
