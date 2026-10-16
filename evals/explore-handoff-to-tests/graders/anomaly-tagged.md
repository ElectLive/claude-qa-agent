---
type: regex
target: { source: file, path: "qa-artifacts/test-cases/regression/explore-2026-01-01-10-00-A01/Test#01.feature" }
match: contains
weight: 1
---

@regression\b[^\n]*@exploratory\b|@exploratory\b[^\n]*@regression\b