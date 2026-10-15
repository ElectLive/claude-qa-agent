---
type: llm
weight: 3
focus: { source: file, path: "qa-artifacts/chainsaw/widget-operator-gaps-2026-01-01/gap-report.md" }
---

Judge only from this gap report. The repo's webhook rejects images from registry.blocked.example.com on create, rejects decreasing spec.size on update, and rejects deleting a widget annotated qa.example.com/protected=true; a ValidatingAdmissionPolicy denies size above 50; a CEL rule makes spec.owner immutable; a widget-editor ClusterRole grants create/update/patch but not delete; and a Kyverno policy require-team-label is Audit-only. PASS when the report marks the five deny/immutability rules as missing (or untested) P1 gaps with their source file, reports widget-editor RBAC as untested, marks require-team-label as n/a (nothing to deny) or reports its test team-label-audit as wrong because the policy is Audit-only, and marks the image pattern (test image-pattern, which loads its resource from a file) and the tier default (basic-lifecycle) as covered. FAIL if any of those is wrong or absent, or if the report claims a test covers a rule it doesn't.
