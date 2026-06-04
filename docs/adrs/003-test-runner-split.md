# ADR-003: Three test runners — Vitest, Jest, and Playwright

- **Status:** Accepted
- **Date:** 2026-06-04
- **Deciders:** Renato de Matos
- **Requirement IDs:** MONO-003

## Context

The repo spans ESM packages, ESM Next.js apps, CommonJS NestJS apps, and browser flows. No single test runner is the best fit for all four. The module-system split established in [ADR-002](002-nestjs-stays-commonjs.md) means the api side and the rest of the repo already diverge at the runtime level, which the test tooling has to respect.

## Decision

We will use **three test runners**, selected by workspace type:

- **Vitest** — ESM shared packages and Next.js apps (unit and component tests).
- **Jest** + supertest — NestJS CommonJS apps.
- **Playwright** — browser end-to-end tests.

Turbo task names (`test`, `test:e2e`) are uniform across workspaces so the pipeline does not need to know which runner sits underneath.

## Consequences

### Positive

- Each workspace uses the runner that matches its module system and ecosystem, so configuration stays idiomatic rather than coerced.
- Vitest is ESM-native and fast for the majority of packages; Jest keeps the well-trodden NestJS testing path intact.
- A single `turbo run test` invocation fans out across all runners.

### Negative

- Three runner configurations to maintain and keep in sync as conventions evolve.
- Contributors need to know which runner a given workspace uses before writing tests.

### Neutral

- The uniform Turbo task names mean a future consolidation (e.g. if Vitest fully covers the Nest case) would not change the developer-facing commands.

## Alternatives Considered

- **Vitest everywhere:** appealing for uniformity, but running NestJS (CJS, decorator-heavy, supertest) under Vitest is friction-prone and diverges from the documented Nest testing path.
- **Jest everywhere:** would force ESM packages and Next.js through Jest's heavier ESM transform setup, giving up Vitest's speed and native ESM support for no gain.
