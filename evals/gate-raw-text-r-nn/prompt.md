---
max_turns: 20
timeout_seconds: 600
runs: 2
tags: [gate, requirements]
allowed_tools: [Skill, Read, Glob, Grep, Write, Agent]
---

write it "Users can reset their password from the login page via an emailed link. The link expires after 1 hour. The reset page must load fast."
