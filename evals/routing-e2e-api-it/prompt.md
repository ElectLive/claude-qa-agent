---
max_turns: 3
timeout_seconds: 180
runs: 2
tags: [routing]
allowed_tools: [Skill, Read, Glob, Grep]
---

e2e api it
Specs:
  orders = https://orders.staging.myapp.com/openapi.json
  stock  = https://stock.staging.myapp.com/openapi.json
