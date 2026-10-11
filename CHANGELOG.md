# Changelog

## 1.1.0 — 2026-10-11

Works with any major provider, not just GitLab.

- **Issue trackers:** GitLab, GitHub, Jira (Cloud/Data Center), Azure Boards. **Code hosts + CI:** GitLab, GitHub, Azure DevOps, Bitbucket Cloud. Chosen per project with `QA_TRACKER` / `QA_CODE_HOST`
- New `tracker` skill (replaces `gitlab-filing`): one provider-neutral set of operations (`issue.*`, `change.*`, `ci.*`, `file.attach`) that every WAY calls
- New `provider-gitlab`, `provider-github` (`gh` CLI), `provider-jira` (Atlassian MCP or REST, Markdown → wiki markup), `provider-azure-devops` (`az` CLI + REST, HTML bodies), `provider-bitbucket` (REST) skills
- `ci-test-setup` writes GitLab CI, GitHub Actions, Azure Pipelines or Bitbucket Pipelines config
- `user-story-enhancer` and `test-writer` no longer touch the tracker (the calling WAY fetches and files), so they work with every provider
- `qa-setup` asks for the providers and checks access for each; secrets are never read into the conversation (only the non-secret `.env` keys are grepped)
- GitLab token is now optional in the plugin settings

**Verification:** GitLab operations were checked against `@zereight/mcp-gitlab@2.2.1` schemas. GitHub read operations were run against a live repo, including a full `trace it` through the plugin. Jira, Azure DevOps and Bitbucket follow their documented APIs and need field reports.

## 1.0.0 — 2026-10-11

First public release.

- Installable as a Claude Code plugin (`qa-agent@devops-qa-agent`) or used from a clone
- WAY 0 `qa-setup` prepares any project (runner, `.env` values, GitLab check)
- Sixteen WAY skills, 9 sub-agents, shared `gitlab-filing`, `bug-report`, `session-report` and `user-story-format` skills
- Runner template, `validate.py`, and an end-to-end template self-test in CI

### History before 1.0.0

**Retired:** `severity-classifier` + `bug-reporter` → `bug-report` skill · `requirements-analyzer` → `test-writer` · `session-reporter` → `session-report` skill · `e2e-test-writer`/`api-test-writer` → `test-writer` · `playwright-navigator`/`api-executor`/`accessibility-checker` → `test-execution-agent`.

**Removed:** the cross-PU integration pipeline (`integration-orchestrator`/`integration-cycle`, `pu-discovery-agent`, `env-access-agent`, `contract-validation-agent`, `test-selection-agent`, `observability-correlation-agent`, `report-agent`). It was out of scope for this project; recover it from git history if ever needed.
