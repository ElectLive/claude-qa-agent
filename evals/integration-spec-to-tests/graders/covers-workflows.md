---
type: llm
weight: 1
focus: { source: file, path: "qa-artifacts/test-cases/shop-integration-2026-01-01/shop-integration-2026-01-01.md" }
---

Judge only from this index file (the test files are checked by other graders). PASS when the file lists separate Test#NN rows for a customer→order chain, an order lifecycle ending in 404, an unknown-customer order rejected with 422, and the cancel transition, and lists the workflows it skipped with a reason each. FAIL only if one of those is missing, or if "cancel a shipped order → 409" is presented as a normal runnable test although the spec has no endpoint that ships an order.
