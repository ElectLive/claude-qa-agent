---
type: regex
target: { source: file, path: "qa-artifacts/test-cases/shop-integration-2026-01-01/shop-integration-2026-01-01.md" }
match: contains
flags: "i"
weight: 1
---

(unknown|non-existent|nonexistent|invalid)[^\n]*customer[^\n]*\b422\b|\b422\b[^\n]*(unknown|non-existent|nonexistent)
