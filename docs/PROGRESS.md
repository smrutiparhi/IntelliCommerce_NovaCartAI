# NovaCart AI — Progress

**Timeline:** no hard deadline forced (revised 2026-08-06) — original Aug 20/25 target didn't fit the earlier centralized execution model, and the team chose to take the time the current scope needs rather than force the date. No single critical-path estimate applies now that implementation is independent per member (ADR-003). See [TEAM.md](TEAM.md).
**Team:** 4 members, vertical-slice split, **each building their own slice independently via a shared git repo** (ADR-003, 2026-08-06 — supersedes the earlier centralized model in ADR-002). Claude Code's implementation work in this session is scoped to Member 1's slice (Platform & Identity) plus the full repo skeleton for all slices. Only Member 1 has Claude Code; teammates' GitHub Copilot access (Student Pack) is pending.
**Repo:** [github.com/smrutiparhi/SOA_PROJECT](https://github.com/smrutiparhi/SOA_PROJECT) — linked 2026-08-06, `main` branch.
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
| 7 | Auth service | Not started |
| 8 | Product service | Not started |
| 9 | Inventory service | Not started |
| 10 | Cart service | Not started |
| 11 | Order service | Not started |
| 12 | Payment service | Not started |
| 13 | Kafka + full saga | Not started |
| 14-15 | Notification / Analytics | Deferred — see DEFERRED.md |
| 16-17 | AI RAG + Agent | Not started (small-scope version per REQUIREMENTS.md §7) |
| 18 | Frontend completion | Not started |
| 19 | Docker | Not started |
| 20 | CI/CD | Reduced scope — basic CI only, see DEFERRED.md |
| 21 | Cloud deployment | Deferred — documented, not executed |
| 22 | Testing sweep | Reduced scope — risk-targeted, not 80% blanket |
| 23 | Documentation | Ongoing alongside each phase |
| 24 | Performance | Deferred |
| 25 | Final review | Not started |

## In Flight
Phase 6 (Infrastructure trio) done. Maven Wrapper (`./mvnw`) committed to repo root — pinned to Maven 3.9.16, self-bootstraps, no system-wide Maven install needed by anyone on the team going forward. Parent POM pins Spring Boot 3.3.13 / Spring Cloud 2023.0.6 (verified compatible via web search, not guessed). Eureka (8761), Config Server (8888, native/filesystem-backed — ADR-005), and API Gateway (8080, all 8 planned service routes pre-declared, CORS for the frontend dev server, trace-ID propagation filter) all build and run. Gateway confirmed registered in Eureka; routes confirmed proxying (graceful 503 for not-yet-built services, 404 for undefined paths). All 3 services currently running locally for inspection — Eureka dashboard at http://localhost:8761. Awaiting confirmation before Phase 7 (Auth service).

## Blocked
None currently. Teammates 2-4's Copilot access (GitHub Student Developer Pack) is pending verification — not a blocker for starting, but affects how soon Catalog & Discovery (Member 2) can parallelize per TEAM.md.
