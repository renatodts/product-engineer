# 05 — Engineering Growth Framework

This framework maps the skills exercised by this gym to the canonical engineering career ladder: junior → mid → senior → staff → principal. It is not a performance review rubric — it is a learning map that shows which projects and which engineering practices are most relevant to each level.

The goal is to help you answer the question: "What should I be working on right now, and why does it matter for where I want to go?" The framework is opinionated but not prescriptive. Use it as a compass, not a checklist.

---

## Level Definitions

### Junior Engineer (L1–L2)

A junior engineer can implement well-defined tasks, write tests for their own code, and ship features without breaking existing functionality. They need guidance on design decisions and are still building intuition for trade-offs.

**Gym focus**: Projects 1–2. The goal is to internalise the monorepo workflow, write real tests, and deploy something that works.

**Key skills to build**:

- PNPM workspace navigation and Turborepo pipeline
- Writing Vitest unit tests from scratch
- Reading and following NestJS controller/service/repository pattern
- Using Conventional Commits consistently
- Running the TLC Specify phase independently

### Mid-Level Engineer (L3)

A mid-level engineer owns features end-to-end. They can identify missing tests, notice design smells, and raise concerns about a design before it is built. They are starting to think about the system beyond the task in front of them.

**Gym focus**: Projects 3–4. The goal is to build the first real domain model without guidance, write tests that catch domain-level bugs, and make the first consequential architecture decision.

**Key skills to build**:

- Domain modeling: value objects, entities, aggregate boundaries
- Database transaction discipline (optimistic locking, isolation levels)
- TDD applied to domain logic (not just utility functions)
- Writing ADRs that capture real trade-offs
- Using the Knowledge Verification Chain before asking AI for answers

### Senior Engineer (L4)

A senior engineer designs systems, not just features. They can scope a project from a vague requirement, identify the hardest parts up front, and sequence work to reduce risk early. They mentor others and catch design problems in review.

**Gym focus**: Projects 5–6. The goal is to design an event-driven system from scratch, implement idempotent webhooks, and build a RAG pipeline that is actually useful rather than just technically correct.

**Key skills to build**:

- Event-driven design: events, sagas, outbox pattern
- External service reliability: idempotency keys, retry budgets
- RAG pipeline design: chunking strategy, retrieval quality, hallucination mitigation
- Structured logging and first observability setup
- Code review that teaches rather than just corrects

### Staff Engineer (L5)

A staff engineer sets technical direction across multiple teams or domains. They can identify systemic risks, design for evolution (not just for today's requirements), and communicate technical decisions to non-engineers. They know when to break the rules and why.

**Gym focus**: Projects 7–8. The goal is to model a multi-entity permission system, design cross-domain orchestration without coupling, and reason about reporting pipelines at scale.

**Key skills to build**:

- Multi-entity permission models and role-based access control
- Cross-domain integration patterns (anti-corruption layer, shared kernel, published language)
- Read model aggregation and CQRS
- Architectural trade-off documentation that survives team turnover
- Identifying when a pattern is being over-applied

### Principal Engineer (L6+)

A principal engineer shapes the engineering organisation, not just its systems. They define standards, evaluate build-versus-buy decisions at the platform level, and ensure that the system will be maintainable by people who have not yet been hired.

**Gym focus**: Project 9. The goal is to design a multi-tenant SaaS with real isolation guarantees, instrument it for production observability, and document it as if handing it to a new team.

**Key skills to build**:

- Multi-tenant architecture: schema-per-tenant vs. row-level security vs. separate databases
- SLO definition and error budget management
- Distributed tracing across service boundaries
- Platform-level feature flag design
- Writing engineering strategy documents that outlast the author

---

## Skills Matrix

| Skill                                     | Projects Where It Is Primary |
| ----------------------------------------- | ---------------------------- |
| Monorepo tooling (Turborepo, PNPM)        | 1–2                          |
| REST API design (NestJS)                  | 1–3                          |
| Domain modeling (DDD)                     | 3–5                          |
| Event-driven architecture                 | 5–6                          |
| External service reliability              | 6–7                          |
| RAG / AI product engineering              | 5, 7–9                       |
| Payments and billing                      | 6–7                          |
| Multi-tenant design                       | 9                            |
| Observability (logging, tracing, metrics) | 7–9                          |
| Cross-domain orchestration                | 8–9                          |
| TDD (domain layer)                        | 3–6                          |
| Playwright E2E                            | 2–4                          |

---

## Using This Framework with the TLC Workflow

The TLC Spec-Driven workflow (see [12-ai-assisted-development.md](12-ai-assisted-development.md)) is calibrated to the level of the engineer using it. A junior engineer should spend more time in the Specify phase — writing the spec is itself a learning exercise. A senior engineer should push the Design phase harder, using it to identify the parts of the system that will be genuinely difficult.

See [04-project-selection-rationale.md](04-project-selection-rationale.md) for the reasoning behind why each project was chosen to teach these skills.
