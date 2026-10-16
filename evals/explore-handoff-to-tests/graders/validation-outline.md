---
type: llm
weight: 1
focus: { source: file, path: "qa-artifacts/test-cases/cart-discount-2026-01-01/cart-discount-2026-01-01.md" }
---

PASS when the index lists a separate negative test (or Scenario Outline) for invalid discount codes covering "NOPE" and "save10!" with the message "This code is not valid", traced to its own R-NN. FAIL if invalid codes are not covered or are folded into the happy-path test.