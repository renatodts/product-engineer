# Engineering Reference — Product Engineer

This directory is the living engineering reference for the **Product Engineer** monorepo — a product-engineering gym of 9 projects at rising complexity (10 → 100), used to practice the full build loop (decide what to build, build it, observe, iterate) with AI as a multiplier, and to produce public artifacts for recruiters and engineers.

Every document here is intentionally starter-grade: enough structure and real content to be immediately useful, with room to grow as each project ships.

---

## Journey

How the gym is structured and what it is trying to teach.

| #   | Document                                                           | Purpose                                                                            |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 01  | [Ramp-Up Roadmap](01-ramp-up-roadmap.md)                           | The 9-project 10 → 100 progression with the complexity table                       |
| 02  | [Complexity Scoring Model](02-complexity-scoring-model.md)         | How scores are assigned across domain, architecture, and infrastructure dimensions |
| 03  | [AI in the Product Loop](03-ai-development-philosophy.md)          | Principles for using AI as a tool inside the product-engineering loop              |
| 04  | [Project Selection Rationale](04-project-selection-rationale.md)   | Why these 9 projects and what each one teaches                                     |
| 05  | [Engineering Growth Framework](05-engineering-growth-framework.md) | Skills progression from junior to staff/principal                                  |

---

## Engineering

Conventions, architecture, and cross-cutting technical guidelines.

| #   | Document                                                   | Purpose                                                           |
| --- | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| 06  | [Repository Conventions](06-repository-conventions.md)     | Naming, branching, Conventional Commits, requirement ID namespace |
| 07  | [Monorepo Architecture](07-monorepo-architecture.md)       | Turborepo + PNPM deep dive: pipeline topology, caching            |
| 08  | [DDD Guidelines](08-ddd-guidelines.md)                     | Value objects, entities, aggregates, bounded contexts             |
| 09  | [Event-Driven Guidelines](09-event-driven-guidelines.md)   | Events, queues, sagas, idempotency                                |
| 10  | [Testing Guidelines](10-testing-guidelines.md)             | Vitest/Jest/Playwright split, coverage matrix, TDD flow           |
| 11  | [Observability Guidelines](11-observability-guidelines.md) | Logging, tracing, metrics conventions                             |

---

## AI

How AI is used as a first-class engineering tool in this repo.

| #   | Document                                                 | Purpose                                                                |
| --- | -------------------------------------------------------- | ---------------------------------------------------------------------- |
| 12  | [AI-Assisted Development](12-ai-assisted-development.md) | TLC Spec-Driven workflow overview (Specify → Design → Tasks → Execute) |
| 13  | [AI Code Review](13-ai-code-review.md)                   | Using AI for review; what to trust, what to verify                     |
| 14  | [AI Prompt Library](14-ai-prompt-library.md)             | Reusable prompts with categorised starter set                          |
| 15  | [AI Failure Cases](15-ai-failure-cases.md)               | Documented cases where AI got it wrong and lessons learned             |

See also: [ai/](ai/) for deeper AI playbooks and research patterns.

---

## Records & Templates

Design notes, decision records, and reusable templates.

| #   | Document                                                               | Purpose                                                           |
| --- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 16  | [System Design Notes](16-system-design-notes.md)                       | Running notes on system design topics seeded with starter entries |
| 17  | [Architecture Decision Records](17-architecture-decision-records.md)   | How ADRs work in this repo                                        |
| 18  | [Learning Log Template](18-learning-log-template.md)                   | Reusable per-session learning-log format                          |
| 19  | [Project Retrospective Template](19-project-retrospective-template.md) | Reusable retro format                                             |
| 20  | [Recruiter Guide](20-recruiter-guide.md)                               | How a recruiter or engineer should read this repo                 |

See also: [adrs/](adrs/) for the full ADR catalogue and [../templates/](../templates/) for raw document templates.
