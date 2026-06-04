# Financial OS — api

**Complexity score:** 50

## Purpose

Backend for a personal-finance platform that aggregates accounts and transactions, categorizes spending, and produces budgets, forecasts, and AI-driven insights. Serves as the financial system of record for individuals or households.

## Complexity Breakdown

- **Domain complexity:** Medium — accounts, transactions, categories, budgets, and forecasts with reconciliation and double-entry-style integrity rules.
- **Architecture complexity:** Medium — clear module boundaries plus background ingestion and categorization pipelines.
- **Infrastructure complexity:** Medium — a transactional database, scheduled sync jobs, and third-party aggregator integrations.

## AI Usage

AI categorizes transactions, detects unusual spend, and generates plain-language financial summaries and forecasts. AI-assisted development covers categorization-rule specs, integration adapters, and broad test generation over financial edge cases.

## Future Roadmap

- [ ] Account and transaction ingestion with categorization
- [ ] Budgeting and cash-flow forecasting endpoints
- [ ] AI insights and anomaly detection over spending history

> Scaffold only. No business logic yet. Developed via TLC Spec-Driven — see `.specs/`.
