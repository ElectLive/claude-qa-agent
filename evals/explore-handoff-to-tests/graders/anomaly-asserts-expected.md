---
type: llm
weight: 2
focus: { source: file, path: "qa-artifacts/test-cases/regression/explore-2026-01-01-10-00-A01/Test#01.feature" }
---

PASS when the scenario clicks "Apply" twice and then asserts the expected result (total 18.00, or only one discount line), so it fails while the bug exists. FAIL if it asserts the observed buggy result (16.00 or two SAVE10 lines) as correct.