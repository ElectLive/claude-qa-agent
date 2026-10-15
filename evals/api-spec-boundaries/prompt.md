---
max_turns: 40
timeout_seconds: 1200
runs: 1
tags: [api, boundaries, end-to-end]
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit, Agent]
---

api it --env staging

Spec (inline, use it as the file):
```yaml
openapi: 3.0.3
info: { title: coupons, version: "1.0" }
paths:
  /coupons:
    post:
      operationId: createCoupon
      requestBody: { required: true, content: { application/json: { schema: { $ref: "#/components/schemas/CouponIn" } } } }
      responses:
        "201": { description: created, content: { application/json: { schema: { $ref: "#/components/schemas/Coupon" } } } }
        "400": { description: invalid request }
        "401": { description: unauthorized }
components:
  securitySchemes: { bearer: { type: http, scheme: bearer } }
  schemas:
    CouponIn:
      type: object
      required: [code, percent, kind]
      properties:
        code: { type: string, minLength: 3, maxLength: 20, pattern: "^[A-Z0-9]+$", example: SAVE10 }
        percent: { type: integer, minimum: 1, maximum: 90 }
        kind: { type: string, enum: [single-use, multi-use] }
    Coupon: { type: object, properties: { id: { type: string }, code: { type: string }, percent: { type: integer }, kind: { type: string } } }
security: [ { bearer: [] } ]
```

Eval run, so no human will answer and nothing can be executed: do Phase 1 (write the tests) only, then stop. Don't run `qa-setup`, don't run tests, don't file anything. Today is 2026-01-01; use the folder `qa-artifacts/test-cases/coupons-2026-01-01/`. End your reply with, for each request property, the values your tests send and the status each one expects.
