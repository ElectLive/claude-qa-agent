---
type: llm
weight: 3
---

Judge from the final reply, which lists, per request property, the values the written tests send and the status each expects. PASS when it includes all of:
1. `code` at 2, 3, 20 and 21 characters, with 2 and 21 rejected (4xx) and 3 and 20 accepted (201);
2. `percent` at 0, 1, 90 and 91, with 0 and 91 rejected and 1 and 90 accepted;
3. `kind` with each allowed value accepted and one value outside the enum rejected;
4. `code` that breaks only the pattern (e.g. lowercase or a symbol) rejected;
5. a required field sent as `null`, as a case separate from the field being absent.
FAIL if any of the five is missing, or if a rejected row asserts only "not 2xx" or accepts a 5xx.
