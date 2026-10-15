---
name: api-session
description: WAY 2 — API test session. Use when the user says "api it", "test api", "run api tests", "api test" — OpenAPI spec or endpoint list → playwright-bdd API tests → run → file bugs → API session report.
---

# WAY 2 — API Testing

Run CLAUDE.md **Step 0** first. The API base URL comes from `--env`.

## Step 1: Gather inputs
You need at least one of: an OpenAPI/Swagger spec (file or URL), an API base URL, or a list of endpoints.
If you only have a base URL and no spec, ask: "Do you have an OpenAPI spec URL or file? If not, list the endpoints you want tested."

## Phase 1: Write tests
1. Fetch the spec (WebFetch) or read the file
2. Run `test-writer` (`api` type). It covers every endpoint with the mandatory cases (+3 for POST/PUT), including a `@boundary` Outline for each request property's schema constraints (`minLength`, `maximum`, `enum`, `pattern`, `required`…), using the shared `steps/api.steps.ts` and the `api` fixture
3. Output: `Test#<nn>` triples under `./qa-artifacts/test-cases/[api-slug]-[YYYY-MM-DD]/`

## Phase 2: Execute
Run `test-execution-agent` with `--project=api`, scoped to that folder. It checks status, schema fields, response time (`API_PERF_THRESHOLD_MS`) and headers. Every request/response pair is saved to `./qa-artifacts/api-responses/` by the `api` fixture.

## Phase 3: Report bugs
For each real failure (skip what `bug-report` says not to file): apply the `bug-report` skill (API context) and file it with labels `bug`, `api`, `sev-<n>`, `p<n>`. The body must include the endpoint and method, the payload sent, expected vs actual (status + body diff), and the response time if over threshold. Redact tokens.

## Phase 4: Summary
Apply the `session-report` skill (WAY 2 template). It saves `./qa-artifacts/sessions/api-<YYYY-MM-DD-HH-MM>.md`.
