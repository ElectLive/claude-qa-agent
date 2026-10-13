---
type: regex
target: { source: file, path: "qa-artifacts/test-cases/shop-integration-2026-01-01/shop-integration-2026-01-01.md" }
match: contains
flags: "i"
weight: 2
---

shipped[^\n]*(NOT IMPLEMENTED|skip|blocked|cannot|can.t|no endpoint)|(NOT IMPLEMENTED|skip|blocked|no endpoint)[^\n]*ship
