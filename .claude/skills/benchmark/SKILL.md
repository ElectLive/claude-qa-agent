---
name: benchmark
description: WAY 7 — competitor benchmark. Use when the user says "benchmark it", "find competitors", "compare apps", "find alternatives" for an app URL, name, or Git repo.
---

# WAY 7 — Competitor Benchmark

## Step 1: Gather inputs
**Required (ask if missing):** the target app, as a URL, name/description, or Git repository (GitHub/GitLab URL or local path).
**Optional:** `--focus` (any of `features`, `pricing`, `perf`, `a11y`, `oss`; default `all`) · `--max` (competitors, default 6).

CLAUDE.md Step 0's `--env` doesn't apply here. Confirm the target instead: `Target: repo → https://github.com/org/my-app`.

## Phase 1: Benchmark
Run `competitor-benchmark`. It fingerprints the target (for a repo, from docs **and** code, tagging each feature `code-verified` or `readme-claimed`), finds competitors in ≥2 independent sources, builds a sourced feature matrix and pricing table (unknowns are `❓`), runs Lighthouse (median of 3) when the focus includes `perf`/`a11y`, and saves `./qa-artifacts/benchmarks/[target]-[YYYY-MM-DD].md`.

## Phase 2: Report
1. Print: competitors + overlap %, top differentiators, top gaps, report path
2. Ask the user before filing it as a GitLab issue labeled `benchmark`
3. Suggest `gap it` (WAY 8) to turn the gaps into user stories
