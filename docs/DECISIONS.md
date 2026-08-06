# NovaCart AI — Architecture Decision Records

## ADR-001: Deadline-driven scope cut for 2026-08-20/25 delivery

**Date:** 2026-08-06 **Status:** Proposed — awaiting user confirmation

**Context:** CLAUDE.md specifies a 25-phase, production-depth build (10 microservices, full Kafka saga with DLT tooling, RAG with a 50+ case eval harness, a full AI agent tool table, 80% test coverage, CI/CD, cloud deployment, Stripe-level frontend polish). The user needs a working, defensible system by 2026-08-20 (target) / 2026-08-25 (absolute ceiling) — 14-19 days from project start. The full spec is not achievable to production depth in that window by a solo developer, even with AI pair-programming.

**Options considered:**
- **A — Attempt full scope, let quality slip wherever needed.** Rejected: produces something shallow everywhere rather than solid anywhere, and undermines the three portfolio differentiators (§1) that are the actual point of the project.
- **B — Cut scope explicitly, ship Tier 1 fully + a real-but-small Tier 2, defer Tier 3.** Chosen. See `REQUIREMENTS.md §7` for the exact cut line and `DEFERRED.md` for the postponed item list.
- **C — Reduce to Tier 1 only, defer all of Tier 2.** Rejected: Tier 2 contains the three differentiators (real saga, grounded RAG, safe agent) that make this portfolio-worthy per CLAUDE.md §1 — cutting all of it loses the actual story the user needs to tell.

**Decision:** Option B. Tier 1 shipped in full. Tier 2 shipped small-but-real: Inventory with reservations (not exhaustive TTL edge cases), Razorpay in test mode, Kafka saga (happy path + one compensation path), AI Assistant with a small RAG eval set (~15-20 cases) and a small agent tool set (4 read tools + `cancel_order` with confirmation). Tier 3 deferred in full.

**Consequences:** Makes it easy to demo a genuine, defensible architecture story on schedule. Makes it hard to claim full spec compliance with CLAUDE.md as written — this ADR is the record of why, and `DEFERRED.md` is the record of what's still owed if the project continues past the deadline. Revisit this ADR if the deadline changes or if Phase 2+ estimation reveals the cut needs to go deeper (or can be relaxed).

**Amendment (2026-08-06, same day):** The Aug 20/25 target itself was dropped — see ADR-002. The scope defined here (Option B cut) stays in force as the working scope; only the calendar pressure is removed.

---

## ADR-002: Execution model given asymmetric AI tooling across the team

**Date:** 2026-08-06 **Status:** Superseded by ADR-003

**Context:** The project is built by a 4-person team (see `TEAM.md`), but only one member has Claude Pro/Claude Code. ADR-001's timeline math assumed either a solo developer or 4 people with roughly equal AI-assisted velocity working in parallel on independent vertical slices — neither holds. The other 3 members have, at best, free-tier claude.ai (rate-limited) until GitHub Student Developer Pack / Copilot access is verified (pending as of this date).

**Options considered:**
- **A — Force the 4-way parallel plan anyway.** Rejected at the time: 3 members without real AI-pair-programming support would take multiples longer on their slices than estimated, silently blowing the timeline while looking on-track in the task board.
- **B — Member 1 (+Claude Code) becomes the primary code-gen lane across all 4 slices; other members own testing, understanding, docs, and demo prep for their assigned slice, picking up real coding once Copilot lands.** Chosen at the time, later reversed — see ADR-003.
- **C — Wait until Copilot access is confirmed for everyone before finalizing the plan.** Rejected: verification timing is uncertain and there's no reason to block starting Phase 2 on it.

**Decision (superseded):** Option B was chosen and estimated at ~24-32 working days. The user reversed this same day after further thought — see ADR-003 for the actual current model.

**Consequences:** This ADR is kept for the record of why the centralized model was tried and why it didn't stick — see ADR-003 for what replaced it.

---

## ADR-003: Independent per-member ownership via shared git repo (reverts ADR-002)

**Date:** 2026-08-06 **Status:** Accepted

**Context:** Hours after ADR-002 was recorded, the user reversed it: "I'll do my work and they'll do their work" — each of the 4 members builds their own assigned slice independently, collaborating through a shared git repo (the user creates it and gives access to teammates and to this session). This is a deliberate return closer to genuine 4-way ownership, not a rediscovery of the AI-tooling gap — that gap (only Member 1 has Claude Code) still exists and isn't resolved, the user is choosing to proceed with it anyway rather than centralize authorship through one person.

**Options considered:**
- **A — Keep ADR-002's centralized model.** Rejected by the user: undermines each member's ability to genuinely own and defend their slice if one person (via AI) authored all of it.
- **B — Full independent ownership: each member builds their own slice with whatever tooling they have (Copilot once it lands, free-tier AI, or unassisted), coordinating via a shared git repo.** Chosen.
- **C — Hybrid: Member 1 builds the hardest 2 slices (Saga, AI), teammates build the 2 more mechanical ones (Platform, Catalog).** Not chosen — the user's phrasing ("I'll do my work, they'll do theirs") maps to each person keeping their originally assigned slice from `TEAM.md`, not a reassignment by difficulty. Revisit if a teammate's slice stalls.

---

## ADR-004: Cloud provider — Azure

**Date:** 2026-08-06 **Status:** Accepted

**Context:** CLAUDE.md §4/§11 requires picking AWS or Azure in Phase 2 and recording an ADR, even though actual cloud deployment execution is deferred (`DEFERRED.md`) until the core build is solid. The choice still needs making now so later documentation (deployment plan, cost estimate, IAM/secrets patterns referenced in interviews) is consistent rather than hand-waved. CLAUDE.md §11 also explicitly demands a "free-tier-first" mindset — "a student portfolio project that runs up a bill is a failed project."

**Options considered:**
- **A — AWS (ECS Fargate + ALB + ECR + Secrets Manager + CloudWatch).** More common in interview contexts and has the deepest community documentation for Spring Boot on Fargate, but the free tier still typically requires a card on file and has tighter always-free limits.
- **B — Azure (Container Apps + ACR + Key Vault).** Chosen. The team is already pursuing GitHub Student Developer Pack for Copilot access (see `TEAM.md`/ADR-003), and that pack includes Azure for Students credit (~$100-200, no credit card required) — directly serving the free-tier-first requirement. Container Apps is a comparable modern PaaS to Fargate for this workload.
- **C — Defer the choice entirely until deployment actually happens.** Rejected: CLAUDE.md asks for the decision now, and later phases' documentation benefits from a concrete target rather than "TBD."

**Decision:** Azure (Container Apps, ACR, Key Vault), contingent on the Student Pack credit actually coming through for the team.

**Consequences:** Makes later cloud-deployment documentation (Phase 21, currently deferred) target Azure specifically. Makes it easy to actually execute a deployment for free if/when that phase is reached. If Student Pack Azure credit doesn't materialize for some reason, revisit — AWS remains a fine fallback with no functional requirement favoring one over the other for this project.

**Decision:** Option B. Claude Code's actual implementation work (via this session) is scoped to **Member 1's slice only** — Platform & Identity (Eureka, Config Server, Gateway, `novacart-common`, Auth service, app shell, Auth pages, DevOps). Members 2-4 build Catalog & Discovery, Transactions & Saga, and AI & Ops respectively, independently, pulling from the shared repo. Whole-system planning phases (2-4: architecture, DB design, UI/UX design system) remain shared deliverables produced collaboratively, since every slice needs to agree on the same conventions, schema, and design tokens — only the implementation phases (5+) split by ownership. To reduce friction for teammates without heavy AI assistance, Claude Code will scaffold the **full repo skeleton** (all service folders as buildable Maven/Spring Boot modules wired to Eureka/Config, correct package layers per CLAUDE.md §3.2, docker-compose entries, README pointing to each slice's user stories) even though only Member 1's slice gets built out in depth by this session — teammates fill in business logic within an already-correct structure rather than bootstrapping from nothing.

**Consequences:** Makes it possible for every member to genuinely defend their own code. Makes the timeline dependent on 3 people's independent (and currently AI-light) velocity again — the honest ~24-32 day estimate from ADR-002 no longer applies cleanly; actual pace now depends on how fast Copilot lands and how much time teammates can put in, which this session can't observe directly. Revisit this ADR if a teammate's slice stalls badly enough that centralizing it back (ADR-002-style) becomes the pragmatic choice.

---

## ADR-005: Config Server backend — native (filesystem), not git-backed

**Date:** 2026-08-06 **Status:** Accepted

**Context:** Spring Cloud Config Server needs a backend for storing service configuration. The two common options are a separate git repository (the traditional/most-documented approach) or the `native` profile, which serves config files straight from the classpath/filesystem — no second repo involved.

**Options considered:**
- **A — Git-backed.** Traditional approach, supports versioning/webhooks/multiple environments cleanly, but requires standing up and maintaining a *second* repository just for config, plus auth to reach it — overhead disproportionate to a project already centralizing everything in one monorepo (CLAUDE.md §3.1).
- **B — Native (filesystem), bundled at `infra/config-server/src/main/resources/config-repo/`.** Chosen. Config lives in the same repo, versioned in the same commits as the code it configures, no second credential/URL to manage. Trade-off: no built-in config-change webhook or multi-label/branch environment story — acceptable, since this project doesn't need per-environment config branching yet.
- **C — No Config Server at all, plain `application.yml` per service.** Rejected: CLAUDE.md §3.1/§5 explicitly calls for a Config Server as one of the infra trio, and centralizing cross-service settings (Eureka URL, actuator exposure) in one place is genuinely useful once there are 10 services instead of 3.

**Decision:** Native profile, config files under `infra/config-server/src/main/resources/config-repo/` (bundled into the jar via classpath, not a `file:` path — a relative filesystem path was tried first and rejected as fragile, since it breaks depending on the working directory the jar is launched from).

**Gotcha worth recording:** properties from Config Server's imported sources (`spring.config.import: "configserver:..."`) take precedence over a service's own local `application.yml`, and array-valued properties (like `management.endpoints.web.exposure.include`) *replace* rather than merge across property sources. The Gateway's local `application.yml` requested `health,info,gateway`, but the shared `config-repo/application.yml`'s `health,info` silently won until `gateway` was added explicitly to `config-repo/api-gateway.yml`. Anyone adding actuator endpoints to a new service should expect the same and set exposure in that service's own config-repo file, not rely on the local jar's setting.

**Consequences:** Makes config easy to review in the same PR as the code change it affects, and one less repo/credential for 3 AI-light teammates to manage. Makes a future move to per-environment config branches (if cloud deployment resumes, see ADR-004/DEFERRED.md) a deliberate migration rather than something that falls out for free — acceptable, not needed yet.

---

## ADR-006: Opaque refresh tokens, not JWTs

**Date:** 2026-08-06 **Status:** Accepted

**Context:** CLAUDE.md §9 requires refresh tokens with rotation and reuse detection, stored hashed. The access token is a signed JWT (RS256, required for stateless verification across services). The refresh token needed a format decision too.

**Options considered:**
- **A — Refresh token is also a JWT** (signed, with its own claims/expiry). Rejected: all the metadata a refresh token needs (userId, family for rotation, expiry, revocation state) already has to live in Mongo to support revocation and reuse detection — a self-contained signed token would just be redundant with the DB row, and adds signature-verification cost for no benefit since it's always looked up by hash anyway.
- **B — Opaque, high-entropy random string (512 bits), stored only as a SHA-256 hash.** Chosen.

**Decision:** Option B. `JwtTokenProvider.generateOpaqueRefreshToken()` produces the raw token (returned to the client once, set as an httpOnly cookie); only its hash is ever persisted (`RefreshToken.tokenHash`).

**Consequences:** Simpler mental model — the refresh token is a bearer credential you look up, not something you parse. Verified end-to-end during Phase 7 testing: rotation on refresh, and reuse detection (presenting an already-rotated token revokes the entire token family, including the legitimately-issued replacement) both work as specified.

---

## ADR-007: Phase 7 implementation notes (bugs found and fixed during verification)

**Date:** 2026-08-06 **Status:** Accepted

Three real issues were found and fixed while verifying Auth Service + Gateway end-to-end, not just written and assumed correct:

1. **Missing `AuthenticationEntryPoint` → wrong status code.** Without an explicit one configured, Spring Security's default behavior for a request with no/invalid/blocklisted JWT on an `authenticated()` endpoint is an empty-bodied **403**, not the **401** CLAUDE.md §3.4 specifies ("401 unauthenticated · 403 unauthorised" are different things). Fixed with a custom `RestAuthenticationEntryPoint` in both Auth Service and the Gateway's reactive filter, returning a proper 401 in the standard error envelope.
2. **`RequestRateLimiter`'s auto-configured filter factory requires exactly one unqualified `KeyResolver` bean**, even though route-level YAML can reference a second one explicitly by name (`#{@authIpKeyResolver}`) for the stricter `/auth/*` limit. Fixed by marking the default (`ipKeyResolver`) `@Primary`.
3. **RedisRateLimiter's Redis key is derived solely from what the `KeyResolver` returns** — reusing the same resolver (bare client IP) across two different `RequestRateLimiter` filter instances would make them silently share one bucket instead of rate-limiting independently. Fixed by prefixing the auth-specific resolver's output (`"auth:" + ip`), giving it a distinct bucket from the global default.

**Why this is recorded here:** these are exactly the kind of gotchas that don't show up from reading the code, only from actually running it — recording them so the next service built against this same pattern (any teammate adding JWT-protected endpoints, or another `RequestRateLimiter` route) doesn't rediscover them the hard way.
