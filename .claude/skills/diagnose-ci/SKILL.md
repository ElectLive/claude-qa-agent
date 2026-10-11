---
name: diagnose-ci
description: WAY 5 — diagnose a failed CI run (GitLab pipeline, GitHub Actions run, Azure Pipelines run, Bitbucket pipeline). Use when the user says "ci it", "diagnose ci", "fix ci", "why did ci fail", "check pipeline" with a run URL or ID.
---

# WAY 5 — CI Failure Diagnosis

## Step 1: Gather inputs
**Required (ask if missing):** a CI run URL, or a run ID plus the project/repo. The URL tells you the provider. Otherwise use `QA_CODE_HOST` (see the `tracker` skill).

## Phase 1: Fetch & diagnose
Run `ci-diagnostician` with the run reference, the provider (`gitlab` | `github` | `azure-devops` | `bitbucket`), and the non-secret settings for it (`GITLAB_PROJECT_ID` / `GITHUB_REPO` / `AZDO_ORG_URL`+`AZDO_PROJECT` / `BITBUCKET_WORKSPACE`+`BITBUCKET_REPO`). It fetches the run, the failed jobs (end of each log first) and the linked MR/PR's diff itself, so large logs never enter this conversation. It returns:
- the exact failing step and error line
- the failure type: `test-failure` | `build-failure` | `infra-failure` | `config-failure` | `dependency-failure`
- the root cause, cross-checked with the MR/PR diff, plus confidence
- a concrete fix (file + line, or a command), and whether the failure is transient and safe to retry

If the failed job is a QA test job (from `ci-test-setup`), say so. Its JUnit report names the failing `Test#<nn>`, and the fix may be `test-healer`, not product code.

## Phase 2: Report
1. Print the diagnosis in the agent's output format
2. Save it to `./qa-artifacts/ci/ci-<run-id>-<YYYY-MM-DD>.md`
3. Ask the user before posting it as a comment on the MR/PR (`change.comment`)
