---
name: provider-azure-devops
description: How to perform the tracker skill's operations on Azure DevOps (Services or Server) — Boards work items, Repos pull requests, Pipelines runs and logs, attachments — with the az CLI (azure-devops extension) and its REST API. REST calls were checked against Microsoft's 7.1 reference. Load it when QA_TRACKER or QA_CODE_HOST is azure-devops.
---

# provider-azure-devops

**Tool:** Azure CLI with the DevOps extension (`az extension add --name azure-devops`). Authentication: `AZURE_DEVOPS_EXT_PAT` in the environment (a PAT with Work Items, Code and Build scopes), or `az devops login`. Load `.env` only inside the command.

**Settings:** `AZDO_ORG_URL` (`https://dev.azure.com/<org>`), `AZDO_PROJECT`, `AZDO_REPO`. Simplest: set defaults once with `az devops configure --defaults organization=$AZDO_ORG_URL project=$AZDO_PROJECT`. Otherwise pass `--org "$AZDO_ORG_URL"` on every command, but `--project` **only** where it exists: `work-item create`, `boards query`, `pipelines runs show/list` and `devops project show`. `work-item update/show`, `work-item relation add`, `repos pr show` and `repos pr work-item list` reject `--project` ("unrecognized arguments"). Flags were checked against `az` 2.91 with `azure-devops` extension 1.1. For anything the CLI lacks, use `az devops invoke` or `curl -u ":$AZURE_DEVOPS_EXT_PAT" "$AZDO_ORG_URL/$AZDO_PROJECT/_apis/…?api-version=7.1"`.

## Operations

| Operation | Command |
|---|---|
| `issue.create` | `az boards work-item create --type Bug --title "<t>" --description "<html>" --fields "Microsoft.VSTS.TCM.ReproSteps=<html>" "Microsoft.VSTS.Common.Severity=2 - High" "Microsoft.VSTS.Common.Priority=1" "System.Tags=bug; sev-2; e2e"`. Stories use `--type "User Story"`. Returns `id` |
| `issue.get` | `az boards work-item show --id <id> -o json` |
| `issue.update` | `az boards work-item update --id <id> --description "<html>" --fields "System.Tags=<full tag list>"` (tags are one `;`-separated field, so read, edit, then write them all) |
| `issue.comment` | `az boards work-item update --id <id> --discussion "<html>"` |
| `issue.close` / `reopen` | `az boards work-item update --id <id> --state Closed --discussion "<why>"` / `--state Active`. State names depend on the process (Agile: New/Active/Resolved/Closed; Scrum: New/Approved/Committed/Done). Read the current state first |
| `issue.list` | `az boards query --wiql "SELECT [System.Id],[System.Title] FROM workitems WHERE [System.TeamProject]=@project AND [System.Tags] CONTAINS 'bug' AND [System.State] <> 'Closed' AND [System.IterationPath] UNDER '<path>'"` |
| `issue.link` | `az boards work-item relation add --id <a> --relation-type related --target-id <b>`. Relation names come from the organization, so list them with `az boards work-item relation list-type` if `related` is rejected |
| `file.attach` | 1. Upload: `curl -u ":$AZURE_DEVOPS_EXT_PAT" -H "Content-Type: application/octet-stream" --data-binary @<path> "$AZDO_ORG_URL/$AZDO_PROJECT/_apis/wit/attachments?fileName=<name>&api-version=7.1"`, which returns `{id, url}`. 2. Link: `curl -u ":$AZURE_DEVOPS_EXT_PAT" -X PATCH -H "Content-Type: application/json-patch+json" -d '[{"op":"add","path":"/relations/-","value":{"rel":"AttachedFile","url":"<url>"}}]' "$AZDO_ORG_URL/$AZDO_PROJECT/_apis/wit/workitems/<id>?api-version=7.1"`. 3. Embed `<img src="<url>">` in the HTML |
| `change.get` | `az repos pr show --id <id> -o json`, plus `az repos pr work-item list --id <id>` for linked items |
| `change.diff` | latest iteration: `GET …/_apis/git/repositories/$AZDO_REPO/pullRequests/<id>/iterations?api-version=7.1` (take the highest `id`). Changed files: `GET $AZDO_ORG_URL/$AZDO_PROJECT/_apis/git/repositories/$AZDO_REPO/pullRequests/<id>/iterations/<last>/changes?api-version=7.1` (`changeEntries[].item.path`, `changeType`; page with `$top`/`$skip`). File content at the source commit: `GET …/items?path=<p>&versionDescriptor.version=<commit>&versionDescriptor.versionType=commit` |
| `change.comment` | `POST $AZDO_ORG_URL/$AZDO_PROJECT/_apis/git/repositories/$AZDO_REPO/pullRequests/<id>/threads?api-version=7.1` with `{"comments":[{"content":"<markdown>","commentType":1}],"status":1}` |
| `ci.get_run` | `az pipelines runs show --id <run-id> -o json`, then `GET …/_apis/build/builds/<run-id>/timeline?api-version=7.1`. Failed jobs/tasks are the `records` with `result: failed`, and each one's `log.id` is its log |
| `ci.job_log` | `GET …/_apis/build/builds/<run-id>/logs/<logId>?api-version=7.1` (the `logId` comes from the failed timeline record). Keep the tail |
| `ci.latest_run` | `az pipelines runs list --branch <branch> --top 1 -o json` |
| `ci.lint` | no lint API for YAML on its own. Check the YAML parses, and use a queue-time dry run only if the user asks |
| `project.check` | `az devops project show --project "$AZDO_PROJECT" -o json` |

## Formats
- **Work item descriptions and comments are HTML.** Convert Markdown: `##` → `<h2>`, lists → `<ul>/<ol>`, tables → `<table>`, code → `<pre><code>`, `<details>` stays as is. PR thread comments accept Markdown
- **Severity/priority fields:** `Microsoft.VSTS.Common.Severity` takes `1 - Critical` · `2 - High` · `3 - Medium` · `4 - Low`. `Microsoft.VSTS.Common.Priority` takes 1–4. Keep the `sev-*`/`p*` tags too, so filters work the same everywhere
- **Milestone:** iteration path (`Project\Release 2.3`). Ask once which one maps to "milestone"
- **Refs:** work items `#143`, pull requests `!87`
