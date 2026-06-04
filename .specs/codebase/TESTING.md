# Testing

## Test Coverage Matrix

| Layer              | Required test | Framework        |
| ------------------ | ------------- | ---------------- |
| NestJS service     | unit          | Jest             |
| NestJS controller  | integration   | Jest + supertest |
| React component    | unit          | Vitest           |
| Shared util/domain | unit          | Vitest           |
| Package export     | unit          | Vitest           |
| Web app user flow  | e2e           | Playwright       |

## Framework Assignment Rationale

**Vitest** is used for all ESM code: shared packages, Next.js apps, Expo. It is ESM-native,
fast, and has a Jest-compatible API that makes migration easy if needed.

**Jest** is used for NestJS apps because NestJS depends on CommonJS semantics (decorators,
reflect-metadata, the NestJS CLI test helpers). Jest handles CommonJS with no extra
configuration. Supertest is used alongside Jest for HTTP-level controller integration tests.

**Playwright** is used for browser E2E. It runs against a running Next.js dev server and tests
real user flows end-to-end.

## Gate Check Commands

These are the real commands defined in `package.json` / `turbo.json`. Do not use others.

| Gate                             | Command                          | When to use                                      |
| -------------------------------- | -------------------------------- | ------------------------------------------------ |
| Quick (lint + types)             | `pnpm turbo lint typecheck`      | Before every commit; fast feedback               |
| Full (lint + types + unit tests) | `pnpm turbo lint typecheck test` | Before opening a PR                              |
| E2E (browser tests)              | `pnpm turbo test:e2e`            | Opt-in; requires `pnpm playwright install` first |
| Build                            | `pnpm turbo build`               | Before merging; validates production build       |

## Parallelism Assessment

**Unit tests (Vitest and Jest) are parallel-safe.** Each test file runs in its own worker with
no shared process state, no shared database, and no shared filesystem. Running the full test
suite with `--parallel` or across Turborepo workspaces concurrently is safe.

**Playwright E2E tests are NOT parallel-safe by default.** They share a single dev server
process. Running multiple E2E suites concurrently against the same server risks port conflicts
and race conditions. E2E tests should run one project at a time, or use separate ports configured
per project.

## Test File Conventions

| App type    | Unit test location  | E2E test location                    |
| ----------- | ------------------- | ------------------------------------ |
| Packages    | `src/**/*.test.ts`  | N/A                                  |
| Next.js web | `src/**/*.test.tsx` | `e2e/**/*.spec.ts`                   |
| Expo mobile | `src/**/*.test.tsx` | N/A (use Detox if needed; not wired) |
| NestJS api  | `src/**/*.spec.ts`  | N/A (supertest covers integration)   |
