---
name: write-tests
description: WAY 4 — write test cases only, no execution. Use when the user says "write it", "write tests", "generate test cases" — requirements (text or GitLab issue), optional App/Spec/MR → test files + test-plan issue.
---

# WAY 4 — Write Test Cases Only

## Step 1: Gather inputs
**Required (ask if missing):** requirements, as plain text or a GitLab Issue IID/URL.
**Optional:** `App:` (feature URL, adds UI context to step wording) · `Spec:` (OpenAPI URL, adds API scenarios) · `MR:` (MR IID to comment the plan on) · `visual: true`.

## Phase 1: Check requirements
If the issue has a **Missing Information** section with unanswered questions, ask the user before writing anything.

## Phase 2: Write & file
1. Run `test-writer` for `ui` scenarios. If `Spec:` was given, run it again for `api` scenarios (two runs of the same agent)
2. Both write `Test#<nn>` triples under `./qa-artifacts/test-cases/[feature]-[YYYY-MM-DD]/` plus the index `.md`, with `**Source:**`/`**Covers:**` traceability lines
3. File a `test-plan` issue with the index content
4. If `MR:` was given, comment the test plan summary on that MR
