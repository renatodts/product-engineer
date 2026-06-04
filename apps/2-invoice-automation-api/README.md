# Invoice Automation — api

**Complexity score:** 25

## Purpose

Backend that ingests invoices (uploads or email), extracts structured line items with AI, and routes them through an approval and payment-tracking workflow. Reduces manual data entry for accounts-payable teams.

## Complexity Breakdown

- **Domain complexity:** Medium — invoices, vendors, line items, and approval states with validation and reconciliation rules.
- **Architecture complexity:** Low — primarily a request/response API with an AI extraction step; minimal internal service boundaries.
- **Infrastructure complexity:** Low — one database plus blob storage for documents; no distributed transactions.

## AI Usage

AI performs OCR/structured extraction of invoice fields and flags anomalies such as duplicate or mismatched totals. AI-assisted development supports schema design, extraction-prompt iteration, and test generation for parsing edge cases.

## Future Roadmap

- [ ] Document upload and AI field-extraction pipeline
- [ ] Vendor matching and duplicate detection
- [ ] Approval workflow with status tracking and notifications

> Scaffold only. No business logic yet. Developed via TLC Spec-Driven — see `.specs/`.
