---
type: regex
target: { source: file, path: "qa-artifacts/test-cases/shop-integration-2026-01-01/Test#01.feature" }
match: contains
weight: 2
---

@api\b[^\n]*@integration\b|@integration\b[^\n]*@api\b
