---
max_turns: 40
timeout_seconds: 1200
runs: 1
tags: [chainsaw, gap, end-to-end]
allowed_tools: [Skill, Read, Glob, Grep, Write, Agent]
---

chainsaw gaps
Repo: ${CLAUDE_PLUGIN_ROOT}/scripts/chainsaw-selftest/gap-repo

Eval run, so no human will answer: don't stop to ask, and stop after the gap report (write no tests). Today is 2026-01-01; use the folder `qa-artifacts/chainsaw/widget-operator-gaps-2026-01-01/`. Don't touch a cluster and don't edit anything in the repo.
