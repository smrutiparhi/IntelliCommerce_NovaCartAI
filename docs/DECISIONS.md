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

**Decision:** Option B. Claude Code's actual implementation work (via this session) is scoped to **Member 1's slice only** — Platform & Identity (Eureka, Config Server, Gateway, `novacart-common`, Auth service, app shell, Auth pages, DevOps). Members 2-4 build Catalog & Discovery, Transactions & Saga, and AI & Ops respectively, independently, pulling from the shared repo. Whole-system planning phases (2-4: architecture, DB design, UI/UX design system) remain shared deliverables produced collaboratively, since every slice needs to agree on the same conventions, schema, and design tokens — only the implementation phases (5+) split by ownership. To reduce friction for teammates without heavy AI assistance, Claude Code will scaffold the **full repo skeleton** (all service folders as buildable Maven/Spring Boot modules wired to Eureka/Config, correct package layers per CLAUDE.md §3.2, docker-compose entries, README pointing to each slice's user stories) even though only Member 1's slice gets built out in depth by this session — teammates fill in business logic within an already-correct structure rather than bootstrapping from nothing.

**Consequences:** Makes it possible for every member to genuinely defend their own code. Makes the timeline dependent on 3 people's independent (and currently AI-light) velocity again — the honest ~24-32 day estimate from ADR-002 no longer applies cleanly; actual pace now depends on how fast Copilot lands and how much time teammates can put in, which this session can't observe directly. Revisit this ADR if a teammate's slice stalls badly enough that centralizing it back (ADR-002-style) becomes the pragmatic choice.
