# Ramp Clone — api

**Complexity score:** 75

## Purpose

Backend for a corporate spend-management platform covering card issuing, expense capture, approval policies, and accounting integrations. Brings together transactions, budgets, and controls into a single AI-assisted finance operations layer.

## Complexity Breakdown

- **Domain complexity:** High — cards, transactions, expense policies, approvals, reimbursements, and accounting sync with complex business rules.
- **Architecture complexity:** High — multiple coordinated modules, event-driven authorization flows, and integrations with card networks and ledgers.
- **Infrastructure complexity:** Medium — transactional database, message broker, and external provider integrations under business-critical SLAs.

## AI Usage

AI auto-categorizes expenses, enforces policy checks, and drafts spend insights and approval recommendations. AI-assisted development supports policy-engine specs, integration scaffolding, and large-scale generated tests across spend scenarios.

## Future Roadmap

- [ ] Card issuing and transaction authorization flow
- [ ] Expense capture with AI categorization and policy enforcement
- [ ] Approval workflows and accounting-system sync

> Scaffold only. No business logic yet. Developed via TLC Spec-Driven — see `.specs/`.
