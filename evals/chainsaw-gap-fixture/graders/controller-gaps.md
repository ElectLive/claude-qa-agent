---
type: llm
weight: 2
focus: { source: file, path: "qa-artifacts/chainsaw/widget-operator-gaps-2026-01-01/gap-report.md" }
---

Judge only from this gap report. The controller adds the finalizer qa.example.com/cleanup, creates an owned ConfigMap named <widget>-config and deletes it on Widget deletion, sets Ready=True/Reconciled, and sets Ready=False/ImageUnavailable when the image ends in ".missing"; the defaulting webhook sets maxReplicas to twice the size. PASS when the report lists the finalizer, the owned ConfigMap (creation and/or cleanup), and the Ready=False/ImageUnavailable condition as gaps, and the maxReplicas default as a gap. Ready=True may be reported as weak (the existing ready-status test uses sleep). FAIL if any of these is missing from the report.
