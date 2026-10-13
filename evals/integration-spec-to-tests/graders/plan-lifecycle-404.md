---
type: regex
target: { source: file, path: "qa-artifacts/test-cases/shop-integration-2026-01-01/shop-integration-2026-01-01.md" }
match: contains
flags: "i"
weight: 1
---

lifecycle[^\n]*\b404\b|\b404\b[^\n]*lifecycle
