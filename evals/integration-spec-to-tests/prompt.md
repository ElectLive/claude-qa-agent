---
max_turns: 60
timeout_seconds: 1500
runs: 1
tags: [integration, end-to-end]
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit, Agent]
---

integration it

Spec (inline, use it as the file):
```yaml
openapi: 3.0.3
info: { title: shop, version: "1.0" }
paths:
  /customers:
    post:
      operationId: createCustomer
      requestBody: { required: true, content: { application/json: { schema: { $ref: "#/components/schemas/CustomerIn" } } } }
      responses: { "201": { description: created, content: { application/json: { schema: { $ref: "#/components/schemas/Customer" } } } } }
  /customers/{customerId}:
    parameters: [ { name: customerId, in: path, required: true, schema: { type: string } } ]
    get: { operationId: getCustomer, responses: { "200": { description: ok }, "404": { description: not found } } }
    delete: { operationId: deleteCustomer, responses: { "204": { description: deleted }, "409": { description: customer has orders } } }
  /orders:
    post:
      operationId: createOrder
      requestBody: { required: true, content: { application/json: { schema: { $ref: "#/components/schemas/OrderIn" } } } }
      responses: { "201": { description: created, content: { application/json: { schema: { $ref: "#/components/schemas/Order" } } } }, "422": { description: unknown customer } }
  /orders/{orderId}:
    parameters: [ { name: orderId, in: path, required: true, schema: { type: string } } ]
    get: { operationId: getOrder, responses: { "200": { description: ok }, "404": { description: not found } } }
    delete: { operationId: deleteOrder, responses: { "204": { description: deleted } } }
  /orders/{orderId}/cancel:
    parameters: [ { name: orderId, in: path, required: true, schema: { type: string } } ]
    post: { operationId: cancelOrder, responses: { "200": { description: cancelled }, "409": { description: order already shipped } } }
components:
  securitySchemes: { bearer: { type: http, scheme: bearer } }
  schemas:
    CustomerIn: { type: object, required: [name, email], properties: { name: { type: string }, email: { type: string, example: buyer@test.local } } }
    Customer: { type: object, properties: { id: { type: string }, name: { type: string }, email: { type: string } } }
    OrderIn: { type: object, required: [customerId, sku], properties: { customerId: { type: string }, sku: { type: string, example: SKU-1 } } }
    Order: { type: object, properties: { id: { type: string }, customerId: { type: string }, status: { type: string, enum: [pending, paid, shipped, cancelled] } } }
security: [ { bearer: [] } ]
```

Eval run, so no human will answer: treat the resource map and workflow list you build as confirmed, and don't stop to ask. Today is 2026-01-01; use the folder `qa-artifacts/test-cases/shop-integration-2026-01-01/`. Don't run `qa-setup`, don't run tests, don't file anything.
