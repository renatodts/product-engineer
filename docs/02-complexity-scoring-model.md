# 02 — Complexity Scoring Model

Every project in this repo carries a single complexity score between 10 and 100. This document explains how that number is derived so that the scores can be applied consistently when new projects are added or existing ones are re-scoped. The score is not a time estimate — a score-50 project might take longer to build than a score-70 project depending on your experience with the domain. It is a structural complexity signal.

The model decomposes complexity into three orthogonal dimensions: **Domain**, **Architecture**, and **Infrastructure**. Each dimension is scored independently, then combined with weights that reflect how much each dimension tends to drive real engineering difficulty in the kinds of products this gym targets.

---

## Dimensions

### Domain Complexity (weight: 40%)

Domain complexity measures how hard the business rules are to model correctly. A CRUD app with no invariants scores low. A payments system with double-entry accounting, regulatory constraints, and multi-currency rounding scores high.

| Score Range | Descriptor                              | Examples                                     |
| ----------- | --------------------------------------- | -------------------------------------------- |
| 1–3         | Simple CRUD, no domain invariants       | Flashcard deck, note list                    |
| 4–5         | Soft rules, single aggregate            | Invoice lifecycle, habit tracker             |
| 6–7         | Hard invariants, multiple aggregates    | Financial ledger, subscription billing       |
| 8–10        | Regulatory, multi-context, cross-domain | Multi-tenant ERP, corporate spend management |

### Architecture Complexity (weight: 35%)

Architecture complexity measures how many moving parts the system has and how they are connected. A single-process monolith scores low. A system with microservices, event buses, sagas, and external integrations scores high.

| Score Range | Descriptor                                              | Examples                                          |
| ----------- | ------------------------------------------------------- | ------------------------------------------------- |
| 1–3         | Single service, REST, no async                          | Basic Next.js + NestJS API                        |
| 4–5         | Background jobs, webhooks, simple queues                | Invoice automation, email workflows               |
| 6–7         | Event-driven, CQRS, external service reliability        | Stripe integration, outbox pattern                |
| 8–10        | Distributed sagas, CQRS + event sourcing, multi-service | Enterprise orchestration, corporate card platform |

### Infrastructure Complexity (weight: 25%)

Infrastructure complexity measures the operational burden: deployment topology, observability requirements, data isolation, and environment management.

| Score Range | Descriptor                                                  | Examples                       |
| ----------- | ----------------------------------------------------------- | ------------------------------ |
| 1–2         | Single environment, Vercel/Railway deploy                   | Side projects, demos           |
| 3–4         | Separate staging, basic CI/CD, managed DB                   | Most SaaS products             |
| 5–7         | Multi-region, feature flags, structured logging + alerting  | Production-grade single-tenant |
| 8–10        | Multi-tenant isolation, distributed tracing, SLO dashboards | Enterprise SaaS                |

---

## Scoring Formula

```
score = round(
  (domain_score × 0.40 +
   architecture_score × 0.35 +
   infrastructure_score × 0.25) × 10
)
```

The result is scaled to the 0–100 range. Scores are then anchored to round numbers (10, 25, 35 …) for readability and adjusted by ±5 to ensure clean separation between projects.

---

## Project Score Breakdown

| #   | Project                     | Domain | Architecture | Infrastructure | Raw Score | Final Score |
| --- | --------------------------- | :----: | :----------: | :------------: | :-------: | :---------: |
| 1   | AI Flashcards               |   2    |      2       |       1        |    17     |     10      |
| 2   | Invoice Automation          |   4    |      4       |       3        |    37     |     25      |
| 3   | Life OS                     |   5    |      4       |       3        |    42     |     35      |
| 4   | Financial OS                |   7    |      5       |       4        |    56     |     50      |
| 5   | Team Knowledge Copilot      |   6    |      6       |       5        |    59     |     60      |
| 6   | Payments Domain             |   8    |      7       |       5        |    70     |     70      |
| 7   | Ramp Clone                  |   8    |      7       |       6        |    73     |     75      |
| 8   | Personal ERP                |   8    |      8       |       7        |    79     |     85      |
| 9   | Enterprise Operating System |   9    |      9       |       9        |    90     |     100     |

---

## Applying the Model to New Projects

When proposing a new project:

1. Score each dimension independently using the tables above.
2. Compute the raw score with the formula.
3. Compare the result to the existing projects to check that it slots in at the right place in the sequence.
4. If the score is within 5 points of an existing project, differentiate the description or adjust the scope until the separation is clear.

See [01-ramp-up-roadmap.md](01-ramp-up-roadmap.md) for how the scores map to the overall learning progression.
