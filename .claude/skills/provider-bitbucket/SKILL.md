---
name: provider-bitbucket
description: How to perform the tracker skill's code-host operations on Bitbucket Cloud — pull requests, diffs, PR comments, Pipelines runs and step logs — through the Bitbucket REST API. Bitbucket is a code host here; pair it with Jira (or another tracker) for issues. Load it when QA_CODE_HOST is bitbucket.
---

# provider-bitbucket

Bitbucket is used as a **code host only**: PRs, diffs and Pipelines. File issues in Jira (`QA_TRACKER=jira`), which is how most Bitbucket teams work.

**Settings:** `BITBUCKET_WORKSPACE`, `BITBUCKET_REPO`, and secrets `BITBUCKET_EMAIL` + `BITBUCKET_API_TOKEN` (an Atlassian API token with repository and pull-request scopes). Load them only inside the command. The base URL is `https://api.bitbucket.org/2.0/repositories/$BITBUCKET_WORKSPACE/$BITBUCKET_REPO`, called `$BB` below:

```bash
set -a; . ./.env; set +a
BB="https://api.bitbucket.org/2.0/repositories/$BITBUCKET_WORKSPACE/$BITBUCKET_REPO"
curl -s -u "$BITBUCKET_EMAIL:$BITBUCKET_API_TOKEN" "$BB/pullrequests/87"
```

## Operations

| Operation | Request |
|---|---|
| `change.get` | `GET $BB/pullrequests/<id>` (title, description, `source.branch.name`, links), plus `GET $BB/pullrequests/<id>/diffstat` for changed files |
| `change.diff` | `GET $BB/pullrequests/<id>/diff` (unified diff). Filter it to the files you need |
| `change.comment` | `POST $BB/pullrequests/<id>/comments` with `{"content":{"raw":"<markdown>"}}` |
| find the PR for a branch | `GET $BB/pullrequests?q=source.branch.name="<branch>"&state=OPEN` (the query must be URL-encoded) |
| `ci.get_run` | `GET $BB/pipelines/<uuid-or-build-number>`, then `GET $BB/pipelines/<uuid>/steps` for each step's state |
| `ci.job_log` | `GET $BB/pipelines/<uuid>/steps/<step-uuid>/log`. Keep the tail |
| `ci.latest_run` | `GET $BB/pipelines?target.branch=<branch>&sort=-created_on&pagelen=1` |
| `ci.lint` | no API. Check `bitbucket-pipelines.yml` parses and uses only known top-level keys (`image`, `definitions`, `pipelines`, `options`, `clone`) |
| `project.check` | `GET $BB` |
| issue operations | not supported here. Use `QA_TRACKER=jira` (`provider-jira`) |
| `file.attach` | for PR comments, link the Pipelines artifacts of the run, or keep the local path |

## Notes
- **UUIDs** come wrapped in braces (`{1a2b…}`). URL-encode them (`%7B…%7D`) in paths
- **Refs:** report pull requests as `#87` and pipelines by build number
- **Markdown:** PR comments render it natively
- **Bitbucket Data Center** uses a different API (`/rest/api/1.0/projects/<key>/repos/<slug>/pull-requests/<id>`). Say it isn't covered yet rather than guessing
