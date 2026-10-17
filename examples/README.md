# Examples

What the agent actually produces, on a **fictional** shop (`shop.example.com`).
These are illustrative samples, not output from a real project. They show
the shape and level of detail you get from each WAY.

| File | Produced by | Trigger |
|---|---|---|
| [test-cases/checkout-discount-2026-10-09/](test-cases/checkout-discount-2026-10-09/) | `test-writer` (WAY 1/4) | `write it #148` |
| [bug-issue.md](bug-issue.md) | `bug-report` skill → GitLab issue (WAY 1/3) | `e2e it #148` / `report it …` |
| [session-report.md](session-report.md) | `session-report` skill (WAY 1) | `e2e it #148` |
| [mr-impact-comment.md](mr-impact-comment.md) | `mr-impact` (WAY 11) → MR comment | `test mr !87` |
| [release-readiness.md](release-readiness.md) | `release-readiness` (WAY 12) | `release check v2.3` |
| [traceability.md](traceability.md) | `traceability` (WAY 14) | `trace it #148` |
| [way-09-verify-fix/](way-09-verify-fix/) — [summary table](way-09-verify-fix/sessions/verify-2026-10-10-09-12.md) | `verify-fix` (WAY 9) | `verify it #161 #164` |
| [way-13-flaky-triage/](way-13-flaky-triage/) — [triage report](way-13-flaky-triage/sessions/flaky-2026-10-09.md) | `flaky-triage` (WAY 13) | `flaky` |
| [way-15-load-test/](way-15-load-test/) — [k6 script](way-15-load-test/load-tests/checkout-read-2026-10-10/smoke.js) · [report](way-15-load-test/sessions/load-checkout-read-2026-10-10-11-42.md) | `load-test` (WAY 15) → `load-test-writer` | `load test` |

Story #148 is the running example: *"As a shopper, I want to apply a discount code at checkout so that I pay the promotional price."*

Samples that produce more than one artifact get a directory named after their WAY,
with the files inside kept at the paths the skill itself writes to (`sessions/`, `load-tests/<api-slug>-<date>/`).
That way a path quoted in a sample matches the path you would actually get on a real run.
Single-artifact samples stay flat.
