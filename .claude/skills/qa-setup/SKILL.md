---
name: qa-setup
description: WAY 0 — prepare the current project for DevOps QA Agent (test runner in qa-artifacts/, per-project .env values, GitLab check). Use when the user says "qa setup", "set up qa", "init qa agent", or when another WAY finds qa-artifacts/ or its runner missing.
---

# WAY 0 — QA Setup

Run once per project. Ask before changing anything that already exists.

## 1. Test runner → `qa-artifacts/`
- If `qa-artifacts/playwright.config.ts` is missing, copy the template: `${CLAUDE_PLUGIN_ROOT}/runner-template/` → `qa-artifacts/` (the `package.json`, `playwright.config.ts` and `README.md` files)
- If a config already exists, compare it with the **Playwright config contract** in `test-execution-agent` and list the differences. Don't overwrite it
- From `qa-artifacts/`: `npm install`, then `npx playwright install chromium`. Report the `npx playwright --version` output

## 2. Project values → `.env` (project root)
These differ per project, so they don't live in the plugin settings. Add any missing keys, and keep existing values:

```
GITLAB_PROJECT_ID=        # numeric ID or URL-encoded path, e.g. 42 or my-group%2Fmy-app
STAGING_URL=
PROD_URL=
FEATURE_BASE_URL=         # review apps: FEATURE_BASE_URL/<branch>
API_TEST_TOKEN=           # test-account token for API tests, never a real user's
API_PERF_THRESHOLD_MS=2000
```

Ask the user for each value, or leave it empty with a comment. Then make sure `.gitignore` covers `.env` and `qa-artifacts/` (add the missing lines with the user's OK). Tests reach CI through `ci-test-setup`, not by committing `qa-artifacts/`.

## 3. GitLab
- **Plugin install:** the GitLab URL and token come from the plugin settings (`/plugin configure qa-agent@devops-qa-agent`). Check that the `gitlab` server shows as connected in `/mcp`
- **Clone install:** check `.mcp.json` exists (copied from `.mcp.example.json`) and the server is connected
- Then call `get_project` with `GITLAB_PROJECT_ID` to prove the token can reach the project. Report its name

## 4. Summary
Print what was created, changed, or skipped, plus a first command to try, e.g. `write it "<a small feature of this app>" App: <STAGING_URL>`.
