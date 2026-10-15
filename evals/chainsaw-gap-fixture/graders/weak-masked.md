---
type: regex
target: { source: file, path: "qa-artifacts/chainsaw/widget-operator-gaps-2026-01-01/gap-report.md" }
match: contains
flags: "i"
weight: 1
---

tier-enum[^\n]*masked
