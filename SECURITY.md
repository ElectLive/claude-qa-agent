# Security Policy

## Reporting a vulnerability
Please **don't open a public issue** for security problems. Use GitHub's private vulnerability reporting (**Security → Report a vulnerability** on this repository). We aim to acknowledge reports within 7 days. On a GitLab-hosted fork, open a **confidential issue** instead.

Examples of what to report:
- A WAY that can leak a token (into a GitLab issue, a saved report, a script, a log)
- A WAY that takes an outward-facing or destructive action without the confirmation its instructions promise (closing issues, load-testing production, pushing code)
- Template code (`test-writer` steps, `flaky.mjs`, CI templates) that runs untrusted input unsafely

## How the agent handles secrets
- Tokens live only in `.env` / `.mcp.json` / `.claude/settings.json`, which are all gitignored. Only the `*.example*` files are committed
- Generated tests read credentials from environment variables (`API_TEST_TOKEN`), and `fixtures.ts` redacts `Authorization`/token/cookie headers in saved API exchanges
- `ci-test-setup` never copies `.auth/` (saved sessions) and asks for **masked** CI variables
- `load-test` refuses `--env prod`

## Using it safely
- Give the GitLab token the smallest scope that works (`api` on one project, or a project access token)
- Point WAYs at staging or test environments with test accounts, never real user data
- Review what the agent files. Every artifact carries the watermark "review before acting on this" for that reason
