# 04 — Project Selection Rationale

The nine projects in this gym were not selected by picking interesting product ideas at random. Each one was chosen to teach a specific cluster of engineering skills that cannot be fully learned from courses or books — they require building something that actually works, has real failure modes, and demands real trade-off decisions.

This document explains the selection criteria and what each project is specifically designed to teach. It also explains what was deliberately left out and why.

---

## Selection Criteria

A project was included if it met at least three of these criteria:

1. **Domain teaches something** — the business rules are non-trivial enough to require deliberate domain modeling.
2. **Architecture teaches something** — the system requires a pattern (event-driven, CQRS, multi-tenant, etc.) that cannot be learned from a tutorial.
3. **AI use is natural** — there is at least one meaningful place where AI augments the product, not just a token LLM call bolted on.
4. **Recruiter-recognisable** — the product name or domain is immediately legible to a hiring engineer or recruiter without explanation.
5. **Builds on the previous project** — the project reuses or extends at least one concept from a lower-numbered project, creating compounding learning.

---

## Project-by-Project Rationale

### Project 1 — AI Flashcards (score: 10)

**What it teaches**: monorepo basics, first API call to an LLM, first test suite, first deployment. This project exists to eliminate all the friction of a blank canvas. You ship something real — a working flashcard app with AI-generated cards — before any architectural complexity enters the picture.

**Why this domain**: spaced repetition is a concrete, well-understood product with a clear value proposition. There is no ambiguous business logic, which means all cognitive load is on the tooling and workflow.

**AI use**: generating flashcard content from a topic or document using a language model.

### Project 2 — Invoice Automation (score: 25)

**What it teaches**: background jobs, document parsing, email workflows, and the first encounter with eventual consistency. Invoices must be created, sent, and marked paid — each step can fail independently.

**Why this domain**: invoicing is universal (every business has it), the workflow is linear enough to model without DDD, and the failure modes (duplicate sends, lost webhooks) are instructive without being catastrophic.

**AI use**: extracting structured data from uploaded invoice documents using a language model.

### Project 3 — Life OS (score: 35)

**What it teaches**: multi-entity state management, real-time sync, and the first serious aggregate design challenge. A life OS (habits, goals, tasks, journals) is surprisingly hard to model correctly because the entities are deeply interrelated and users have strong opinions about consistency.

**Why this domain**: personal productivity apps are familiar to every developer, which means the learning is entirely in the engineering — there is no need to learn the domain itself.

**AI use**: weekly review generation, goal progress analysis, habit streaks summarised with insights.

### Project 4 — Financial OS (score: 50)

**What it teaches**: double-entry accounting, ledger correctness, database transaction discipline, and what "data integrity" means when errors cannot be undone. This is the first project where a bug in the domain model is genuinely expensive.

**Why this domain**: personal finance is learnable without a fintech background. The accounting invariants (debits equal credits) are strict and testable, which makes TDD mandatory rather than optional.

**AI use**: categorising transactions, generating spending insights, forecasting cash flow.

### Project 5 — Team Knowledge Copilot (score: 60)

**What it teaches**: RAG pipelines, vector databases, multi-user permissions, and the complexity of making AI useful in a collaborative context. The first project where AI is not a side feature but the core product.

**Why this domain**: knowledge management is an unsolved problem in every organisation. Building a working copilot forces you to confront chunking, embedding, retrieval quality, and hallucination mitigation — the real problems of production RAG.

**AI use**: document ingestion, semantic search, question answering over a team knowledge base.

### Project 6 — Payments Domain (score: 70)

**What it teaches**: Stripe integration depth, webhook reliability, idempotency, outbox pattern, and the first saga. Payments is the domain where correctness failures have direct financial consequences.

**Why this domain**: payments is the single most common reason engineers get hired into fintech. Understanding Stripe, handling webhooks safely, and building a correct ledger is a high-signal portfolio item.

**AI use**: fraud signal detection, subscription churn prediction, anomaly flagging.

### Project 7 — Ramp Clone (score: 75)

**What it teaches**: approval workflows, corporate card lifecycle, spend controls, and multi-entity permission models. The first project with a genuine enterprise product mental model.

**Why this domain**: Ramp is a well-known, publicly visible product that engineers and recruiters recognise. A working clone demonstrates product thinking alongside engineering depth.

**AI use**: spend categorisation, policy violation detection, expense report generation.

### Project 8 — Personal ERP (score: 85)

**What it teaches**: cross-domain orchestration, read model aggregation, reporting pipelines, and the cost of coupling. An ERP consolidates data from multiple domains (finance, HR, inventory, CRM) and must present a coherent view without creating a distributed monolith.

**Why this domain**: ERP is where enterprise software engineers spend most of their careers. Understanding the architectural pressures of cross-domain integration is a principal-level skill.

**AI use**: business intelligence queries in natural language, anomaly detection across domains.

### Project 9 — Enterprise Operating System (score: 100)

**What it teaches**: multi-tenancy, tenant data isolation, SLO dashboards, distributed tracing, feature flags, and what "operating a product at enterprise scale" actually means. This project is the capstone — every skill from the previous eight projects is required.

**Why this domain**: "enterprise operating system" is a deliberately abstract name. The product is whatever the engineer decides it should be within the enterprise context — the constraint is the architecture, not the domain.

**AI use**: full observability copilot, natural-language alerting, cross-tenant trend analysis.

---

## What Was Left Out and Why

| Category            | Excluded                                  | Reason                                                                                       |
| ------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| Games               | Any game app                              | Rendering loops and game state are important but orthogonal to backend/fullstack engineering |
| Mobile-first        | A standalone React Native app             | Mobile is included as a layer within projects, not as a standalone domain                    |
| Infrastructure-only | A Kubernetes operator, a Terraform module | Valuable, but infrastructure-as-a-product is a separate discipline                           |
| Data engineering    | A data pipeline or analytics platform     | Important but requires a different toolchain and would dilute the fullstack focus            |

See [01-ramp-up-roadmap.md](01-ramp-up-roadmap.md) for the progression and [05-engineering-growth-framework.md](05-engineering-growth-framework.md) for how the projects map to career levels.
