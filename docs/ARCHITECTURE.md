# NovaCart AI — Architecture

Phase 2 deliverable. This is the shared blueprint every member builds their slice against (see `TEAM.md`) — implementation is independently owned per ADR-003, but the boundaries, contracts, and event flow defined here are not.

## 1. System Context

```mermaid
C4Context
  title System Context — NovaCart AI

  Person(customer, "Customer", "Browses, buys, asks the AI assistant")
  Person(seller, "Seller", "Lists products, manages stock")
  Person(admin, "Admin", "Operates and moderates the platform")

  System(novacart, "NovaCart AI", "AI-powered multi-vendor marketplace")

  System_Ext(razorpay, "Razorpay", "Payment gateway (test mode)")
  System_Ext(atlas, "MongoDB Atlas", "Managed DB, Search, Vector Search")
  System_Ext(llm, "LLM Provider", "Powers the AI assistant's RAG + agent")

  Rel(customer, novacart, "Browses, buys, tracks orders, chats with AI assistant")
  Rel(seller, novacart, "Manages own products and stock")
  Rel(admin, novacart, "Monitors saga/order health, moderates")
  Rel(novacart, razorpay, "Creates orders, verifies payments", "HTTPS + webhook")
  Rel(novacart, atlas, "Reads/writes all service data", "MongoDB wire protocol")
  Rel(novacart, llm, "Generates grounded answers, calls tools", "HTTPS")
```

## 2. Container Diagram

```mermaid
C4Container
  title Container Diagram — NovaCart AI

  Person(customer, "Customer / Seller / Admin")

  System_Boundary(novacart, "NovaCart AI") {
    Container(web, "Web Frontend", "React, TypeScript, Vite", "SPA — all customer/seller/admin UI")
    Container(gateway, "API Gateway", "Spring Cloud Gateway", "JWT validation, routing, rate limiting, CORS")
    Container(eureka, "Eureka Server", "Spring Cloud Netflix", "Service registry")
    Container(config, "Config Server", "Spring Cloud Config", "Centralized config per service/profile")

    Container(auth, "Auth Service", "Spring Boot", "Registration, login, JWT issuance, roles")
    Container(product, "Product Service", "Spring Boot", "Catalogue, categories, reviews, search")
    Container(cart, "Cart Service", "Spring Boot", "Cart, wishlist")
    Container(inventory, "Inventory Service", "Spring Boot", "Stock, reservations")
    Container(order, "Order Service", "Spring Boot", "Orders, saga state, outbox")
    Container(payment, "Payment Service", "Spring Boot", "Razorpay integration, refunds, coupons")
    Container(notification, "Notification Service", "Spring Boot", "Event-driven notification log (simulated)")
    Container(ai, "AI Assistant Service", "Spring Boot + Spring AI", "RAG + tool-calling agent")

    ContainerDb(mongo, "MongoDB Atlas", "MongoDB", "auth_db, product_db, inventory_db, cart_db, order_db, payment_db, notification_db, ai_db — one DB per service, shared cluster")
    ContainerQueue(kafka, "Kafka", "Apache Kafka (KRaft)", "Event backbone — saga choreography, notifications, re-embedding triggers")
    ContainerDb(redis, "Redis", "Redis", "JWT blocklist, rate limiting, cart TTL, RAG answer cache")
  }

  System_Ext(razorpay, "Razorpay")
  System_Ext(llm, "LLM Provider")

  Rel(customer, web, "Uses", "HTTPS")
  Rel(web, gateway, "All API calls", "HTTPS/REST + JSON")
  Rel(gateway, auth, "Routes + validates JWT", "REST")
  Rel(gateway, product, "Routes", "REST")
  Rel(gateway, cart, "Routes", "REST")
  Rel(gateway, order, "Routes", "REST")
  Rel(gateway, payment, "Routes", "REST")
  Rel(gateway, ai, "Routes", "REST + SSE (streaming)")

  Rel(auth, eureka, "Registers with", "")
  Rel(product, eureka, "Registers with", "")
  Rel(order, eureka, "Registers with", "")

  Rel(order, cart, "Reads cart at checkout", "REST, sync")
  Rel(order, product, "Reads product snapshot", "REST, sync")
  Rel(ai, product, "Tool calls: search/details", "REST, sync")
  Rel(ai, order, "Tool calls: track/cancel", "REST, sync")

  Rel(order, kafka, "Publishes OrderPlaced/Confirmed/Cancelled (via outbox)", "")
  Rel(inventory, kafka, "Publishes StockReserved/Failed, consumes OrderPlaced", "")
  Rel(payment, kafka, "Publishes PaymentSuccessful/Failed, consumes OrderPlaced", "")
  Rel(notification, kafka, "Consumes order-lifecycle events", "")
  Rel(ai, kafka, "Consumes ProductUpdated (re-embed)", "")

  Rel(payment, razorpay, "Creates order, verifies webhook", "HTTPS")
  Rel(ai, llm, "Retrieval-augmented generation", "HTTPS")

  Rel(auth, mongo, "auth_db")
  Rel(product, mongo, "product_db")
  Rel(order, mongo, "order_db")
  Rel(payment, mongo, "payment_db")
  Rel(ai, mongo, "ai_db")

  Rel(auth, redis, "JWT blocklist")
  Rel(gateway, redis, "Rate limit buckets")
  Rel(cart, redis, "Cart storage + TTL")
```

## 3. Component Diagram — Auth Service

Chosen as the component-level example because it's the first service being built (Member 1's slice). Other members are welcome to add their own service's component diagram here as they design it — same notation.

```mermaid
C4Component
  title Component Diagram — Auth Service

  Container(gateway, "API Gateway", "Spring Cloud Gateway")

  System_Boundary(auth, "Auth Service") {
    Component(controller, "AuthController", "Spring MVC REST Controller", "Exposes /api/v1/auth/* — register, login, refresh, logout, reset")
    Component(service, "AuthService", "Application Service", "Registration/login business logic, orchestrates token issuance")
    Component(jwt, "JwtTokenProvider", "Component", "Signs/verifies RS256 access + refresh tokens")
    Component(security, "SecurityConfig", "Spring Security Filter Chain", "BCrypt password encoding, method-level security")
    Component(rateLimiter, "AuthRateLimitFilter", "Resilience4j + Redis", "5/min throttle on auth endpoints")
    Component(repo, "UserRepository / RefreshTokenRepository", "Spring Data MongoDB", "Persistence")
  }

  ContainerDb(authdb, "auth_db", "MongoDB", "users, refresh_tokens")
  ContainerDb(redis, "Redis", "Redis", "JWT blocklist, rate-limit buckets")

  Rel(gateway, controller, "Routes requests", "HTTPS/REST")
  Rel(controller, rateLimiter, "Checked by")
  Rel(controller, service, "Delegates to")
  Rel(service, jwt, "Issues/validates tokens via")
  Rel(service, security, "Encodes/verifies passwords via")
  Rel(service, repo, "Reads/writes")
  Rel(repo, authdb, "Persists to")
  Rel(rateLimiter, redis, "Reads/writes buckets in")
  Rel(jwt, redis, "Checks/writes blocklist in")
```

## 4. Service Boundary Justification

| Service | Owns | Why this boundary |
|---|---|---|
| Auth | Users, roles, refresh tokens | Identity is its own bounded context — every service trusts it, none should own it, which prevents duplicated/conflicting user records |
| Product | Catalogue, categories, reviews, embeddings | Catalogue data changes on a seller's schedule, independent of orders/inventory — natural boundary around "what can be bought" |
| Inventory | Stock levels, reservations | Stock correctness under concurrent writes is a distinct hard problem (optimistic locking, TTL reservations); isolating it stops Product and Order from fighting over the same write path |
| Cart | Carts, wishlists | Ephemeral, session-shaped data with different access patterns (Redis-backed) than durable order records |
| Order | Orders, order items, saga state | The transactional core — owns the saga because it's the aggregate root of the purchase lifecycle |
| Payment | Payments, refunds, coupons, invoices | Third-party integration (Razorpay) and payment-adjacent concerns are isolated so a provider swap never ripples into Order |
| Notification | Notification log, templates | Fan-out consumer of nearly every event; isolating it means a notification failure can never block a business transaction |
| Analytics | Read models, aggregates | Read-heavy, eventually-consistent by design — must never sit on the hot path of a write (deferred, see DEFERRED.md) |
| AI Assistant | Conversations, vector index, agent runs | Needs its own data lifecycle (embeddings, chat history) and its own cost/latency profile (LLM calls), distinct from transactional services |
| Workflow | Cross-service long-running processes | Reserved for orchestration that doesn't fit a single saga (deferred) |

## 5. Sync vs. Async Matrix

Default is async (Kafka) for state propagation and side effects; sync (REST) only where the caller needs an immediate answer and can degrade gracefully — every sync call wrapped in Resilience4j (3s timeout, 2 retries on idempotent GETs, circuit breaker).

| From → To | Type | Why |
|---|---|---|
| Frontend → Gateway → any service | Sync REST | User-facing request needs an immediate response |
| Order → Cart | Sync REST | Needs current cart contents at the instant of checkout |
| Order → Product | Sync REST | Needs current price/spec to snapshot into the order (denormalized, immutable after purchase) |
| AI Assistant → Product/Order/Inventory (tool calls) | Sync REST | Chat is a live conversation — tool results must return within the turn |
| Order → Kafka (`OrderPlaced`) | Async, via outbox | Triggers the saga — Inventory and Payment react independently, no direct coupling |
| Inventory → Kafka (`StockReserved` / `StockReservationFailed`) | Async | Order doesn't block waiting on stock; saga continues from the event |
| Payment → Kafka (`PaymentSuccessful` / `PaymentFailed`) | Async | Payment completion is driven by an external webhook, inherently async |
| Order → Kafka (`OrderConfirmed` / `OrderCancelled`) | Async | Fans out to Inventory (decrement/release), Notification, Analytics — none of which should block order finalization |
| Product → Kafka (`ProductUpdated`) | Async | Triggers AI re-embedding — a background concern, never on the product-edit request path |

## 6. The Order Saga (choreographed)

Choreography over central orchestration: each service reacts to events and publishes its own next event, with no single "saga orchestrator" service coordinating everyone. Chosen because the flow is a short chain (4-5 hops) where a dedicated orchestrator would just be another service to build, deploy, and fail — for a chain this size, choreography keeps each service's logic local and the failure modes are still traceable via `sagaHistory[]` on the order document. This is the diagram to know cold for an interview.

```mermaid
sequenceDiagram
    participant C as Customer
    participant O as Order Service
    participant K as Kafka
    participant I as Inventory Service
    participant P as Payment Service
    participant N as Notification Service

    C->>O: POST /api/v1/orders
    O->>O: Create order (PENDING) + outbox row, 1 Mongo transaction
    O-->>K: OrderPlaced (outbox relay)
    K-->>I: OrderPlaced
    K-->>P: OrderPlaced

    alt stock available
        I->>I: Reserve stock (15-min TTL)
        I-->>K: StockReserved
    else insufficient stock
        I-->>K: StockReservationFailed
    end

    P->>P: Create Razorpay order
    Note over C,P: Customer pays via Razorpay widget
    P->>P: Verify webhook HMAC signature

    alt payment success
        P-->>K: PaymentSuccessful
    else payment failure
        P-->>K: PaymentFailed
    end

    K-->>O: StockReserved / StockReservationFailed
    K-->>O: PaymentSuccessful / PaymentFailed

    alt both succeeded
        O->>O: status = CONFIRMED
        O-->>K: OrderConfirmed
        K-->>I: OrderConfirmed (reservation → decrement)
        K-->>N: OrderConfirmed (notify customer)
    else either failed — COMPENSATION
        O->>O: status = CANCELLED
        O-->>K: OrderCancelled
        K-->>I: OrderCancelled (release reservation)
        K-->>P: OrderCancelled (refund if already captured)
    end
```

**Mechanics that make this safe, not just a nice diagram:**
- **Outbox pattern** (Order, Payment): domain write + outbox row in one Mongo transaction, a scheduled relay publishes to Kafka — eliminates the dual-write problem (what if the DB write succeeds but the Kafka publish doesn't?).
- **Inbox/dedupe**: every consumer stores processed `eventId`s (unique-indexed `processed_events` collection) — required because Kafka is at-least-once, so consumers must be idempotent.
- **Reservation TTL**: 15 minutes; a scheduled job releases expired reservations and cancels the order if payment never completes.
- **Deadline scope note**: per `REQUIREMENTS.md §7`, the compensation path being built and tested end-to-end for now is payment failure only. Stock-reservation-expiry and full DLT admin tooling are in `DEFERRED.md`.

## 7. Cloud Provider

See `DECISIONS.md` ADR-004. **Azure** (Container Apps + ACR + Key Vault), chosen primarily because the team's GitHub Student Developer Pack includes Azure credit without requiring a card on file — actual deployment execution stays deferred (`DEFERRED.md`) regardless.

## 8. Cross-Cutting Concerns (reference — see CLAUDE.md for full detail)

- **Security**: RS256 JWT (15-min access / 7-day refresh with rotation + reuse detection), gateway validates *and* every service re-verifies (defense in depth), BCrypt-12, Redis token-bucket rate limiting.
- **Observability**: Micrometer → Prometheus/Grafana, OpenTelemetry trace propagation across HTTP and Kafka, structured JSON logs with `traceId`/`correlationId` — full dashboards are a Tier 3 item, deferred, but `traceId` propagation itself is cheap to build in from Phase 6 onward and not worth retrofitting later.
- **Event envelope**: identical shape across every topic (`eventId`, `eventType`, `eventVersion`, `occurredAt`, `source`, `traceId`, `correlationId`, `payload`) — lives in `novacart-common`.
