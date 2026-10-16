---
max_turns: 60
timeout_seconds: 1500
runs: 1
tags: [explore, end-to-end]
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit, Agent]
---

explore it run: the exploration is already done. Continue WAY 18 from Phase 2 with this handoff; write it to `qa-artifacts/explore/explore-2026-01-01-10-00/session.yaml` first and use it as the agent's output.

```yaml
status: completed
base_url: https://staging.myapp.com
charter: Explore the cart as a guest to discover discount-code problems
actions_used: 64
pages:
  - { url: /products, title: Products, purpose: browse products, actions: [open product] }
  - { url: /cart, title: Cart, purpose: review items and apply a discount code, actions: [apply code, checkout] }
flows:
  - id: F-01
    name: Guest applies a discount code in the cart
    status: completed
    preconditions: [signed out, empty cart]
    steps:
      - navigate to /products
      - click link "Blue Mug"
      - click button "Add to cart"
      - navigate to /cart
      - fill textbox "Discount code" with "SAVE10"
      - click button "Apply"
    data:
      - { field: Discount code, value: SAVE10, unique: false }
    checkpoints:
      - { after: 3, check: [ 'text "1 item in your cart" visible' ] }
      - { after: 6, check: [ 'text "SAVE10 applied" visible', 'text "Total: 18.00" visible' ] }
validations:
  - { flow: F-01, page: /cart, field: 'textbox "Discount code"', input: "NOPE", observed: 'text "This code is not valid" visible' }
  - { flow: F-01, page: /cart, field: 'textbox "Discount code"', input: "save10!", observed: 'text "This code is not valid" visible' }
anomalies:
  - id: A-01
    kind: validation
    title: '[Cart] Discount code accepted twice, total discounted 20 %'
    url: /cart
    flow: F-01
    steps:
      - navigate to /products
      - click link "Blue Mug"
      - click button "Add to cart"
      - navigate to /cart
      - fill textbox "Discount code" with "SAVE10"
      - click button "Apply"
      - click button "Apply"
    observed: 'Total: 16.00 is shown; two "SAVE10" lines appear'
    expected: 'The second apply is ignored; "Total: 18.00" is shown'
    why_expected: one code per order
    evidence: { screenshot: qa-artifacts/explore/explore-2026-01-01-10-00/A-01.png, console: [], network: [] }
    reproduced: true
    confidence: high
coverage_notes: checkout not explored (payment not allowed)
```

Eval run, so no human will answer: there are no existing tests, treat the R-NN table you derive as confirmed, select A-01, and choose "run later". Today is 2026-01-01; the charter slug is `cart-discount`. Don't run `qa-setup`, don't run tests, don't file anything.
