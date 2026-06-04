# Payments Domain — api

**Complexity score:** 70

## Purpose

Core payments service that models payment intents, ledger entries, settlements, and refunds with strong correctness and idempotency guarantees. Acts as the authoritative money-movement boundary that other services call into.

## Complexity Breakdown

- **Domain complexity:** High — payment lifecycles, double-entry ledgers, idempotency, refunds, and dispute states with strict invariants.
- **Architecture complexity:** High — event-driven state machines, outbox/idempotency patterns, and integrations with external payment processors.
- **Infrastructure complexity:** Medium — a transactional database and message broker, with careful but single-region operational requirements.

## AI Usage

AI assists in generating exhaustive state-transition and reconciliation tests and in reviewing invariants for ledger correctness. AI-assisted development focuses on formalizing money-movement specs and catching edge cases rather than runtime inference.

## Future Roadmap

- [ ] Payment-intent state machine with idempotency keys
- [ ] Double-entry ledger and settlement endpoints
- [ ] Refund, reversal, and dispute handling with audit trail

> Scaffold only. No business logic yet. Developed via TLC Spec-Driven — see `.specs/`.
