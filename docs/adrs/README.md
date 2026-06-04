# Architecture Decision Records

The catalogue of accepted and proposed ADRs for this monorepo. See [../17-architecture-decision-records.md](../17-architecture-decision-records.md) for when and how to write one, and [000-template.md](000-template.md) for the template.

| ADR                                    | Title                                             | Status   | Date       |
| -------------------------------------- | ------------------------------------------------- | -------- | ---------- |
| [001](001-monorepo-tooling.md)         | Turborepo + PNPM with a flat package layout       | Accepted | 2026-06-04 |
| [002](002-nestjs-stays-commonjs.md)    | NestJS apps stay CommonJS while the rest is ESM   | Accepted | 2026-06-04 |
| [003](003-test-runner-split.md)        | Three test runners — Vitest, Jest, and Playwright | Accepted | 2026-06-04 |
| [004](004-apps-prewire-config-only.md) | Apps pre-wire only config packages                | Accepted | 2026-06-04 |

ADRs 001–019 are reserved for workspace/monorepo tooling, 020–039 for shared packages, and 040+ for individual projects (see the numbering table in [../17-architecture-decision-records.md](../17-architecture-decision-records.md)).
