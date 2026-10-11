# Changelog

## 1.0.0 — 2026-10-11

First public release.

- Installable as a Claude Code plugin (`qa-agent@devops-qa-agent`) or used from a clone
- WAY 0 `qa-setup` prepares any project (runner, `.env` values, GitLab check)
- Sixteen WAY skills, 9 sub-agents, shared `gitlab-filing`, `bug-report`, `session-report` and `user-story-format` skills
- Runner template, `validate.py`, and an end-to-end template self-test in CI

### History before 1.0.0

**Retired:** `severity-classifier` + `bug-reporter` → `bug-report` skill · `requirements-analyzer` → `test-writer` · `session-reporter` → `session-report` skill · `e2e-test-writer`/`api-test-writer` → `test-writer` · `playwright-navigator`/`api-executor`/`accessibility-checker` → `test-execution-agent`.

**Removed:** the cross-PU integration pipeline (`integration-orchestrator`/`integration-cycle`, `pu-discovery-agent`, `env-access-agent`, `contract-validation-agent`, `test-selection-agent`, `observability-correlation-agent`, `report-agent`). It was out of scope for this project; recover it from git history if ever needed.
