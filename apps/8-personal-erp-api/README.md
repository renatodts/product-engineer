# Personal ERP — api

**Complexity score:** 85

## Purpose

Backend for an all-in-one personal enterprise resource planner spanning finances, projects, assets, contacts, documents, and scheduling. Unifies every personal operational domain into one integrated, AI-orchestrated system of record.

## Complexity Breakdown

- **Domain complexity:** High — many tightly interconnected domains (ledger, projects, inventory/assets, CRM, documents, calendar) sharing cross-cutting rules.
- **Architecture complexity:** High — modular bounded contexts, event-driven workflows, and AI orchestration coordinating actions across domains.
- **Infrastructure complexity:** High — transactional and vector stores, message broker, background workers, and multiple external integrations operating together.

## AI Usage

AI orchestrates cross-domain workflows, summarizes state across modules, and proposes actions spanning finances, projects, and scheduling. AI-assisted development is central for context mapping, per-module spec generation, and integration test coverage across the whole system.

## Future Roadmap

- [ ] Bounded-context modules with a shared event backbone
- [ ] Cross-domain AI orchestration and summarization endpoints
- [ ] Unified search and reporting across all personal domains

> Scaffold only. No business logic yet. Developed via TLC Spec-Driven — see `.specs/`.
