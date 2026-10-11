---
name: load-test
description: WAY 15 — API load / stress / spike / soak testing with k6. Use when the user says "load test", "stress test", "perf test the api", "how many users can it handle", "spike test".
---

# WAY 15 — Load Testing

Run CLAUDE.md **Step 0** first. **Refuse `--env prod`.** Load tests degrade
the system they hit. Point the user to staging or a dedicated perf environment.

## Step 1: Gather inputs
- OpenAPI spec (file or URL) or an endpoint list (required)
- Profile: `smoke` (default) | `load` | `stress` | `spike` | `soak`, plus optional target VUs and duration
- Write endpoints (POST/PUT/PATCH/DELETE): excluded unless the user lists them explicitly **and** confirms the environment isn't shared

## Phase 1: Write + smoke
Run `load-test-writer` with the profile and `run: false` for anything heavier than smoke. It writes the k6 script(s) to `./qa-artifacts/load-tests/<api-slug>-<YYYY-MM-DD>/` and always runs the **smoke** profile, to prove the script works and get baseline latency.

## Phase 2: Confirm, then run the real profile
Show the user the profile shape (VUs × duration), the endpoints, and the target URL. Ask for explicit confirmation. Then run `load-test-writer` again with `run: true`. Don't skip this step for `stress`, `spike` or `soak`.

## Phase 3: Report
1. Per-endpoint table: p95, p99, error rate, threshold ✅/❌, and smoke vs profile latency
2. For each threshold breach, apply the `bug-report` skill (API context, label `performance`). Include the profile, VUs, the p95 vs threshold, and the error rate. Ask the user before filing, because a breach in an under-provisioned staging environment may not be a product bug
3. Save `./qa-artifacts/sessions/load-<api-slug>-<YYYY-MM-DD-HH-MM>.md` with the watermark footer
