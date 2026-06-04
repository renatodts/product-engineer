# 01 — Ramp-Up Roadmap

This roadmap defines the intended learning path through the nine projects in this monorepo. Each project is a self-contained product at a defined complexity score (10 → 100). The score is not a difficulty rating in isolation — it reflects cumulative architectural, domain, and infrastructure complexity relative to the others. You are meant to build them in order, or to use higher-numbered projects as stretch targets once a lower one ships.

The gym metaphor is deliberate: you do not skip straight to bench-pressing your bodyweight. Each project exercises a specific set of muscles — domain modeling, API design, observability, event-driven architecture, payments, multi-tenancy — and each one carries forward everything learned before it.

---

## Complexity Progression Table

| #   | Project                     | Complexity Score | Primary Theme                            |
| --- | --------------------------- | :--------------: | ---------------------------------------- |
| 1   | AI Flashcards               |        10        | Foundation CRUD + AI integration         |
| 2   | Invoice Automation          |        25        | Document workflows + background jobs     |
| 3   | Life OS                     |        35        | Personal productivity + real-time sync   |
| 4   | Financial OS                |        50        | Multi-ledger accounting + data integrity |
| 5   | Team Knowledge Copilot      |        60        | Multi-user AI + RAG + permissions        |
| 6   | Payments Domain             |        70        | Stripe, webhooks, double-entry ledger    |
| 7   | Ramp Clone                  |        75        | Corporate card + spend management        |
| 8   | Personal ERP                |        85        | Cross-domain orchestration + reporting   |
| 9   | Enterprise Operating System |       100        | Multi-tenant SaaS + full observability   |

---

## Phase Breakdown

### Phase 1 — Foundation (Projects 1–2, scores 10–25)

These projects establish the monorepo muscle memory. You will wire up a Next.js front end, a NestJS API, shared TypeScript configs, and run your first CI pipeline end-to-end. The AI integration in project 1 is intentionally light — a single call to a language model to generate flashcard content — so the focus stays on project structure and deployment.

Key outcomes: working Turborepo pipeline, first Vitest + Jest test suites, first deployment, first ADR written.

### Phase 2 — Domain Modeling (Projects 3–4, scores 35–50)

Here the domain model becomes the hard part. Life OS introduces multi-entity state (habits, tasks, journals, goals) and requires deliberate aggregate design to avoid anemic models. Financial OS raises the stakes with ledger correctness: every debit must have a matching credit, and data loss is not recoverable. DDD concepts (value objects, domain events) become load-bearing rather than academic.

Key outcomes: first bounded context map, first domain event, first database migration strategy.

### Phase 3 — Collaboration & AI at Scale (Projects 5–6, scores 60–70)

Projects 5 and 6 introduce multi-user systems. Team Knowledge Copilot adds RAG pipelines, vector search, and role-based access. Payments Domain adds external service reliability: Stripe webhooks must be idempotent, outbox patterns become mandatory, and you learn what "at-least-once delivery" really costs in production.

Key outcomes: first event-driven saga, first idempotency key, first vector database integration.

### Phase 4 — Enterprise Scale (Projects 7–9, scores 75–100)

The final three projects layer enterprise concerns on top of everything learned. Ramp Clone models corporate card spend with approval workflows. Personal ERP orchestrates cross-domain reads and writes. Enterprise OS adds multi-tenancy, tenant-isolated data, and a full observability stack. Each project is a portfolio centrepiece on its own.

Key outcomes: multi-tenant schema design, distributed tracing, product-grade error budgets.

---

## How to Use This Roadmap

- **Building sequentially**: start at project 1, ship to production (even a toy deployment), write the retro, move on.
- **Targeting a weakness**: if you already know CRUD but not event-driven architecture, jump to project 5 and work backwards to fill gaps.
- **Recruiter context**: see [20-recruiter-guide.md](20-recruiter-guide.md) for how to present this work to hiring managers and engineers.

See [02-complexity-scoring-model.md](02-complexity-scoring-model.md) for how the scores were derived.
