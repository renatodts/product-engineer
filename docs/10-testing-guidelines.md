# 10 — Testing Guidelines

Testing in this monorepo is split across three frameworks that each serve a distinct purpose. Using the wrong tool for the job produces tests that are slow, brittle, or so abstract they provide no real confidence. This document defines which framework to use where, what coverage targets mean here, and how TDD is applied.

The philosophy is: tests should make you confident enough to deploy without a manual check. A test suite that achieves 90% coverage but does not catch the last three production incidents is not a good test suite. Coverage is a lagging indicator; the quality of assertions is the leading indicator.

---

## Framework Split

| Framework      | Where Used                      | What It Tests                                  |
| -------------- | ------------------------------- | ---------------------------------------------- |
| **Vitest**     | `packages/`, Next.js apps, Expo | Unit and integration tests for ESM code        |
| **Jest**       | NestJS API apps                 | Unit and integration tests for CJS/NestJS code |
| **Playwright** | Next.js web apps                | End-to-end browser tests                       |

### Vitest (ESM — packages and web)

Vitest is the default for all non-NestJS code. It is faster than Jest for ESM projects because it does not require a CommonJS transform step and supports native ESM imports.

Configure in `vitest.config.ts` at the package root. Use `@vitest/coverage-v8` for coverage reports.

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // or 'jsdom' for React component tests
    coverage: {
      provider: 'v8',
      thresholds: { lines: 80 },
    },
  },
});
```

### Jest (CommonJS — NestJS APIs)

NestJS requires CommonJS. Jest is well-integrated with the NestJS testing module and is the standard choice for NestJS projects. Use `@nestjs/testing` for creating test modules.

Keep unit tests in `src/` next to the files they test (`.spec.ts`). Keep integration tests (those that spin up a NestJS app with a real database) in `test/` at the app root.

### Playwright (E2E — Next.js web)

Playwright tests are the most expensive to write and the slowest to run. Reserve them for the critical user journeys that represent real user value: creating an invoice, completing a payment, logging in. Do not use Playwright to test UI styling or component internals — that belongs in Vitest with `@testing-library/react`.

Playwright tests live in `e2e/` at the app root and run against a locally started production build (`pnpm build && pnpm start`).

---

## Test Coverage Matrix

The coverage target varies by project complexity and code layer. Higher complexity projects require more coverage in the domain layer because the cost of bugs is higher.

| Layer                                        | Score 10–25 | Score 35–60 | Score 70–100 |
| -------------------------------------------- | :---------: | :---------: | :----------: |
| Domain (value objects, entities, aggregates) |     70%     |     90%     |     95%      |
| Application services                         |     60%     |     80%     |     90%      |
| Infrastructure (repositories, adapters)      |     40%     |     60%     |     70%      |
| Controllers / resolvers                      |     50%     |     70%     |     80%      |
| E2E (critical paths covered)                 |  1–2 flows  |  3–5 flows  |  5–10 flows  |

Coverage thresholds are enforced in CI for the domain layer. Infrastructure and controller coverage is tracked but not gated (infrastructure tests tend to be expensive to maintain at high coverage).

---

## TDD Flow

Test-Driven Development is mandatory for domain layer code (value objects, entities, aggregates, application services) at complexity scores 35 and above. It is recommended but not mandatory at lower scores.

### Red → Green → Refactor

1. **Red**: write a test that describes the desired behaviour. Run it — it must fail. If it does not fail, the test is not testing anything.
2. **Green**: write the minimum production code to make the test pass. Do not over-engineer the implementation at this stage.
3. **Refactor**: clean up the implementation without changing behaviour. Run the tests after every refactor step.

### What to Test First

Start with the happy path of the most important invariant in the aggregate. For `Invoice`: can I create a valid invoice and send it? Then test the failure cases: can I send an invoice that is already sent? Can I create an invoice with no line items?

Work outward from the domain to the application service to the controller. Each layer should have its own tests that use fakes/mocks for the layer below.

---

## Test Structure Conventions

```
src/
  domain/
    entities/
      invoice.entity.ts
      invoice.entity.spec.ts   # Domain unit tests — alongside source
  application/
    invoice.service.ts
    invoice.service.spec.ts    # Application unit tests
test/
  invoice.integration.spec.ts  # Integration test (NestJS testing module + DB)
e2e/
  invoice-creation.spec.ts     # Playwright E2E
```

**Conventions**:

- Test files are co-located with the source file they test (`.spec.ts` suffix), except integration tests (`test/`) and E2E tests (`e2e/`).
- Tests use `describe` blocks to group related cases. The `describe` name is the unit under test. The `it` name starts with "should" and describes the expected behaviour.
- No production code in test files, no test utilities in production files.
- Database state is reset between integration tests. Use `beforeEach` or `afterEach` to truncate tables or roll back transactions.

See [12-ai-assisted-development.md](12-ai-assisted-development.md) for how the TLC workflow integrates TDD into the Execute phase.
