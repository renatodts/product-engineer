# Stack

## Workspace Management

| Tool      | Version                          | Role                                                   |
| --------- | -------------------------------- | ------------------------------------------------------ |
| PNPM      | 9.x (via `packageManager` field) | Package manager and workspace manager                  |
| Turborepo | Latest                           | Task orchestration, build caching, pipeline definition |

## Languages and Runtimes

| Language/Runtime | Version | Notes                                            |
| ---------------- | ------- | ------------------------------------------------ |
| TypeScript       | 5.x     | All source code; strict mode via shared tsconfig |
| Node.js          | 22      | Runtime for Next.js and NestJS processes         |

## Frameworks by App Type

| App type      | Framework            | Notes                                            |
| ------------- | -------------------- | ------------------------------------------------ |
| Web (browser) | Next.js (App Router) | React 19, ESM                                    |
| Mobile        | Expo (React Native)  | React 18 (Expo SDK constraint), managed workflow |
| API           | NestJS               | CommonJS; decorators; modular architecture       |

## Test Tooling

| Layer                            | Runner           | Config location                    |
| -------------------------------- | ---------------- | ---------------------------------- |
| Shared packages (unit)           | Vitest           | `vitest.config.ts` per package     |
| Next.js apps (unit/component)    | Vitest           | `vitest.config.ts` per app         |
| NestJS apps (unit + integration) | Jest + supertest | `jest.config.js` per app           |
| Web E2E                          | Playwright       | `playwright.config.ts` per web app |

## Code Quality

| Tool                 | Config package                        | Scope          |
| -------------------- | ------------------------------------- | -------------- |
| ESLint               | `@product-engineer/eslint-config`     | All workspaces |
| Prettier             | Root `.prettierrc` / shareable config | All files      |
| TypeScript           | `@product-engineer/typescript-config` | All workspaces |
| Conventional Commits | `commitlint.config.js` (root)         | All commits    |

## External Services

No external services are active in the scaffold. The following are planned as Docker Compose
stubs for use during local development once individual projects are built out:

- **PostgreSQL** — primary relational database for API apps
- **Redis** — caching / job queue
- **Vector store** (TBD, likely pgvector or Qdrant) — for RAG projects (5+)

Docker Compose files are placeholders; no containers are running.
