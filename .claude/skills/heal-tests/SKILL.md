---
name: heal-tests
description: WAY 16 — repair tests broken by UI changes (renamed buttons, moved elements) from the latest run. Use when the user says "heal it", "heal tests", "fix selectors", "tests broke after the redesign".
---

# WAY 16 — Heal Tests

`test-healer` also runs automatically inside `e2e-session`, `verify-fix` and
`mr-impact`. This WAY is the standalone entry point.

## Phase 1: Find locator failures
Take the run the user names, or the newest `qa-artifacts/runs/*/results.json`. Collect failed scenarios whose error is a locator failure: `waiting for getBy…`, `locator.<action>: Timeout`, `strict mode violation`. For each, keep the `error-context` attachment path (`runs/<id>/artifacts/<test-dir>/error-context.md`).

If there's no recent run, offer to run `test-execution-agent` first.

## Phase 2: Propose
Run `test-healer` in **propose** mode with all of them in one call. Show a table: test · old locator → candidate · verdict · `product_note` · files affected (including `also_affects` for shared steps).

## Phase 3: Apply (with the user's approval)
Run `test-healer` in **apply** mode for the approved tests only. Report `healed` / `healed-partially` / `heal-failed`.
- `not-healable: element missing` → offer `report it` (WAY 3) with the scenario's steps
- Every `product_note` is something the product team should confirm. List them at the end

Save `./qa-artifacts/sessions/heal-<YYYY-MM-DD-HH-MM>.md` with the watermark footer.
