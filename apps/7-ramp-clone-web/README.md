# Ramp Clone — web

**Complexity score:** 75

## Purpose

A corporate spend-management platform covering cards, expenses, reimbursements, and accounting sync. The web app provides spend dashboards, approval flows, and policy controls for finance teams.

## Complexity Breakdown

- **Domain complexity:** High — card issuing, expense policy, reimbursements, and ledger reconciliation are intricate financial domains.
- **Architecture complexity:** High — payments, ledger, policy, and accounting-integration services must stay consistent.
- **Infrastructure complexity:** Medium — payment processing and accounting connectors demand reliable, auditable pipelines.

## AI Usage

AI extracts receipt data, enforces spend policies, and flags out-of-policy or fraudulent transactions. AI-assisted development supports the multi-surface finance UI.

## Future Roadmap

- [ ] Spend dashboard with card and expense feeds
- [ ] AI receipt matching and policy enforcement
- [ ] Approval workflows and accounting sync

> Scaffold only. No business logic yet. Developed via TLC Spec-Driven — see `.specs/`.
