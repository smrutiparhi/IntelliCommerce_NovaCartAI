# NovaCart AI — Deferred Items

Items intentionally postponed past the 2026-08-20/25 deadline, per the scope cut in [REQUIREMENTS.md §7](REQUIREMENTS.md#7-deadline-scope-cut-recommendation--needs-your-confirmation). Nothing here is abandoned — it's out of scope for the deadline, not out of scope for the project.

| Item | Originally | Reason deferred | Revisit when |
|---|---|---|---|
| Notification service (real email/SMS) | Tier 3 | Not needed to prove the architecture story; a logged-simulation stub is explicitly permitted by CLAUDE.md if any notification hook is needed for the demo | Post-deadline |
| Analytics service + dashboards | Tier 3 | Aggregation/read-model work is time-expensive and not one of the 3 portfolio differentiators | Post-deadline |
| Workflow service | Tier 3 | No concrete long-running process needs it yet | Post-deadline |
| Seller/Admin dashboards beyond basic CRUD/order view | Tier 3 | Nice-to-have, not load-bearing for the demo story | Post-deadline |
| Cloud deployment (AWS/Azure execution) | Phase 21 | Document the plan + cost estimate; running it costs money and time better spent on the differentiators | Post-deadline, or if time remains after Phase 19 |
| Full CI/CD pipeline | Phase 20 | Basic build+test CI only for the deadline | Post-deadline |
| k6 load testing | Phase 22 | Demo-scale only; no concurrent-user story to prove yet | Post-deadline |
| Playwright E2E beyond one critical path | Phase 22 | One register→browse→cart→checkout→pay→track path proves the flow; full E2E matrix is time-expensive | Post-deadline |
| 80% blanket test coverage | Phase 12/22 | Coverage is risk-targeted instead (saga compensation, payment webhook, AI agent authz, auth) | Post-deadline |
| Fashion/Home/Books/Sports/Lifestyle catalogue | Product vision | Electronics-only launch catalogue; multi-category data model is designed once but only Electronics is populated/tested | Post-deadline, data/taxonomy work only |
| Full AA accessibility sweep (every page) | §10.2 | Core purchase flow only for the deadline | Post-deadline |
| Full DLT admin UI (inspect + replay) | §5.3 | DLT exists and captures failures; admin tooling to act on it is Tier 3 | Post-deadline |
| Atlas Search facets/fuzzy/autocomplete | §6.4 | Falls back to basic Mongo text search if Atlas Search setup threatens the timeline | If time allows before deadline, else post |
