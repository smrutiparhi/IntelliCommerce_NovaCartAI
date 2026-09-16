# NovaCart AI — Progress

**Timeline:** no hard deadline forced (revised 2026-08-06) — original Aug 20/25 target didn't fit the earlier centralized execution model, and the team chose to take the time the current scope needs rather than force the date. No single critical-path estimate applies now that implementation is independent per member (ADR-003). See [TEAM.md](TEAM.md).
**Team:** 4 members, vertical-slice split, **each building their own slice independently via a shared git repo** (ADR-003, 2026-08-06 — supersedes the earlier centralized model in ADR-002). Claude Code's implementation work in this session is scoped to Member 1's slice (Platform & Identity) plus the full repo skeleton for all slices. Only Member 1 has Claude Code; teammates' GitHub Copilot access (Student Pack) is pending.
**Repo:** [github.com/smrutiparhi/IntelliCommerce_NovaCartAI](https://github.com/smrutiparhi/IntelliCommerce_NovaCartAI) — linked 2026-08-06 as `SOA_PROJECT`, renamed since (old URL still redirects), `main` branch.
**Project restarted:** 2026-08-06 (prior scaffolding lost, see `DECISIONS.md` context — cause unknown, not recoverable).

## Phase Status

| # | Phase | Status |
|---|---|---|
| 1 | Requirement analysis | Done ([REQUIREMENTS.md](REQUIREMENTS.md)) |
| 2 | System architecture | Done ([ARCHITECTURE.md](ARCHITECTURE.md), ADR-004) |
| 3 | Database design | Done ([DATABASE.md](DATABASE.md)) |
| 4 | UI/UX & design system | Done ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)) |
| 5 | Frontend shell | Done — `frontend/novacart-web/`, builds and runs (`npm run dev`, `npm run build` both verified) |
| 6 | Infrastructure trio (Eureka/Config/Gateway) | Done — all 3 running and verified: Gateway registers with Eureka, Config Server serves merged config correctly, routes proxy (503 gracefully with no backend yet, 404 on undefined paths) |
| 7 | Auth service | Done — register/login/refresh/logout/reset all verified end-to-end (see below), through both the service directly and the Gateway |
| 8 | Product service | Done — seller CRUD, catalogue, reviews, search |
| 9 | Inventory service | Done — reservations, expiry, seller stock controls |
| 10 | Cart service | Done — cart and wishlist flows |
| 11 | Order service | Done — checkout, cancellation, item-level seller fulfilment |
| 12 | Payment service | Done — payment simulation, coupons, refunds, signature checks |
| 13 | Kafka + full saga | Done — outbox/inbox, compensation, DLT wiring |
| 14-15 | Notification / Analytics | Deferred — see DEFERRED.md |
| 16-17 | AI RAG + Agent | Not started (small-scope version per REQUIREMENTS.md §7) |
| 18 | Frontend completion | Done for customer and seller commerce flows |
| 19 | Docker | In progress — clean rebuild still needs verification |
| 20 | CI/CD | Reduced scope — basic CI only, see DEFERRED.md |
| 21 | Cloud deployment | Deferred — documented, not executed |
| 22 | Testing sweep | Reduced scope — risk-targeted, not 80% blanket |
| 23 | Documentation | Ongoing alongside each phase |
| 24 | Performance | Deferred |
| 25 | Final review | In progress |

## In Flight
Commerce slices are implemented and integrated: product/catalogue, cart/wishlist, inventory reservations, checkout/order saga, payment/coupons/refunds, notification simulation, seller product management, and item-level seller fulfilment. Frontend production build and Vitest checks pass. The next verification blocker is a clean Docker rebuild: Product Service dependency resolution stalled during the fresh-stack test and needs to be retried with a warm Maven cache.

## Local Dev Setup (established Phase 7)
- **Docker must be running** — MongoDB (`novacart-mongo`, :27017) and Redis (`novacart-redis`, :6379) run as local containers, started manually (`docker run -d --name novacart-mongo -p 27017:27017 mongo:7`, similarly for `redis:7-alpine`). Not yet in a docker-compose file — that's Phase 19's job; for now these are ad hoc local containers.
- **JWT keypair**: generate once via `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out keys/jwt-private-key.pem && openssl rsa -pubout -in keys/jwt-private-key.pem -out keys/jwt-public-key.pem`. `keys/` is gitignored — every clone needs its own. See `.env.example` for the env vars each service needs (`JWT_PRIVATE_KEY_PATH` for Auth Service only, `JWT_PUBLIC_KEY_PATH` for both Auth Service and Gateway).
- **Launch order**: Eureka → Config Server → Gateway → Auth Service (each waits on the previous being healthy; Auth Service and Gateway both need `spring.config.import` to reach Config Server at startup).

## Blocked
None currently. Teammates 2-4's Copilot access (GitHub Student Developer Pack) is pending verification — not a blocker for starting, but affects how soon Catalog & Discovery (Member 2) can parallelize per TEAM.md.
