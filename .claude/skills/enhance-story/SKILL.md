---
name: enhance-story
description: WAY 6 — score and rewrite a GitLab user story. Use when the user says "analyze us", "enhance us", "analyze and update us", "improve us" with an issue IID.
---

# WAY 6 — User Story Enhancer

**Required (ask if missing):** a GitLab Issue IID (`#143`, `143`).

Run `user-story-enhancer` with the IID. It:
1. Fetches the issue
2. Scores the story (starts at 100, deducts for gaps)
3. Rewrites the issue body in the shared `user-story-format`: Gherkin ACs in a collapsible block, a test scenarios table, Missing Information, a DoD, and the original body preserved verbatim
4. Posts the QA analysis (score, grade, strengths, issues with fixes) as a **separate comment**

Afterwards, if the story's Missing Information section isn't empty, tell the user. `e2e-session`/`write-tests` will stop on those questions.
