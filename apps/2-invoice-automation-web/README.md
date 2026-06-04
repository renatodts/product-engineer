# Invoice Automation — web

**Complexity score:** 25

## Purpose

A workspace for ingesting invoices, extracting line items, and routing them through approval. The web app lets users upload documents, review extracted fields, and track payment status.

## Complexity Breakdown

- **Domain complexity:** Medium — invoice parsing, tax handling, and approval rules introduce real-world edge cases.
- **Architecture complexity:** Low — a focused front end over a single extraction-and-approval API.
- **Infrastructure complexity:** Low — document upload plus a datastore; no heavy event processing yet.

## AI Usage

AI performs document field extraction and flags anomalies such as duplicate or mismatched invoices. AI-assisted development accelerates the upload and review interfaces.

## Future Roadmap

- [ ] Invoice upload and AI field-extraction review screen
- [ ] Approval workflow with status tracking
- [ ] Anomaly and duplicate-detection alerts

> Scaffold only. No business logic yet. Developed via TLC Spec-Driven — see `.specs/`.
