---
name: diagnose-ci
description: WAY 5 — diagnose a failed GitLab CI/CD pipeline. Use when the user says "ci it", "diagnose ci", "fix ci", "why did ci fail", "check pipeline" with a pipeline URL or ID.
---

# WAY 5 — CI Failure Diagnosis

## Step 1: Gather inputs
**Required (ask if missing):** a pipeline URL, or a pipeline ID + project (e.g. `group/project#1234`).

## Phase 1: Fetch & diagnose
Run `ci-diagnostician` with just the pipeline reference. It fetches the pipeline, the failed jobs (end of each log first) and the linked MR's diff itself, so large logs never enter this conversation. It returns:
- the exact failing step and error line
- the failure type: `test-failure` | `build-failure` | `infra-failure` | `config-failure` | `dependency-failure`
- the root cause, cross-checked with the MR diff, plus confidence
- a concrete fix (file + line, or a command), and whether the failure is transient and safe to retry

If the failed job is a QA test job (from `ci-test-setup`), say so. Its JUnit report names the failing `Test#<nn>`, and the fix may be `test-healer`, not product code.

## Phase 2: Report
1. Print the diagnosis in the agent's output format
2. Save it to `./qa-artifacts/ci/ci-<pipeline-id>-<YYYY-MM-DD>.md`
3. Ask the user before posting it as an MR comment
