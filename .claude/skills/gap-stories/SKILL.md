---
name: gap-stories
description: WAY 8 — turn a competitor benchmark into user stories. Use when the user says "gap it", "stories from benchmark", "match the leader", "write gap stories", or chains "benchmark it <target> then gap it".
---

# WAY 8 — Benchmark Gap → User Stories

## Step 1: Gather inputs (all optional)
- Report path (default: the most recent `./qa-artifacts/benchmarks/*.md`)
- `--leader <name>` (default: the top-ranked competitor) · `--scope leader|market` (default `leader`)
- The target's repo path or URL. For a URL, shallow-clone it to `./qa-artifacts/benchmarks/src/<slug>` so gaps are re-checked against the code, and delete the clone afterwards
- `--lang <code>` · `--max <n>` (default 10)

Confirm: `Report: <path> | Scope: leader | Repo check: yes/no`.

## Phase 1: Rank, extract, write
Run `benchmark-gap-story-writer`. It ranks the competitors (coverage 40 / overlap 20 / confidence 15 / market fit 15 / measured quality 10, re-normalized if quality was skipped), picks the leader, extracts the gaps (`❓` is never a gap), re-checks them against the repo, prioritizes them, and writes one story per gap in the shared `user-story-format` to `./qa-artifacts/benchmarks/stories/[target]-[YYYY-MM-DD]/US-<n>.md` + `index.md`.

## Phase 2: Report & file
1. Print: the leader + score breakdown, the backlog table, decision-needed items, the folder path
2. Ask the user before filing to the tracker (per the `tracker` skill): one issue per story labeled `user-story` + `benchmark-gap` (+ `decision-needed`), and an index issue labeled `benchmark` linking them
3. Suggest `analyze us <ref>` (WAY 6) on the filed stories
