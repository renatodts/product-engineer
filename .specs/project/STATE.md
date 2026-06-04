# Persistent State

Cross-session memory for the Product Engineer monorepo. Update this file whenever a
significant decision is made, a blocker is discovered, or a pattern is established.

---

## Recent Decisions

> AD-001…AD-004 are now formalized as `docs/adrs/001`…`004` (Requirement IDs MONO-001…004).
> The ADRs are the canonical record; keep the summaries below in sync if either changes.

### AD-001: Turborepo + PNPM flat packages

- **What:** The monorepo uses Turborepo for task orchestration and PNPM workspaces with a flat
  package layout — all packages under `packages/` at the same depth, all apps under `apps/`.
- **Why:** A single Turborepo pipeline definition and a flat topology keeps the dependency graph
  simple. All packages are peers; no nested grouping or sub-workspaces.
- **Trade-off:** No nested grouping (e.g. `packages/shared/utils`). If the number of packages
  grows substantially, flat naming may become crowded.

### AD-002: NestJS stays CommonJS

- **What:** All NestJS apps (`*-api`) are configured with `"module": "CommonJS"` in their
  tsconfigs. They do not use `.mjs` or `"type": "module"` in their `package.json`.
- **Why:** NestJS decorators, the NestJS CLI, and most NestJS ecosystem packages depend on
  CommonJS semantics. ESM support in NestJS v12 is not yet confirmed stable.
- **Trade-off:** The repo has a dual module system — CommonJS for APIs, ESM for everything else.
  Any shared utility used by a NestJS app must be importable from CommonJS (i.e., either CJS
  build output or dual CJS/ESM exports).

### AD-003: Vitest / Jest / Playwright split

- **What:** Three test runners are used across the monorepo: Vitest for ESM packages and Next.js
  apps, Jest for NestJS CommonJS apps, Playwright for browser end-to-end tests.
- **Why:** Vitest is ESM-native and fast for isolated unit and component tests. Jest is the
  established choice for NestJS (CommonJS, decorator support, supertest integration). Playwright
  is the standard for browser E2E.
- **Trade-off:** Three separate test runner configs to maintain. Turbo task names (`test`,
  `test:e2e`) must paper over the difference so the pipeline stays uniform.

### AD-004: Apps pre-wire only config packages

- **What:** In the scaffold, every app has only `@product-engineer/typescript-config` and
  `@product-engineer/eslint-config` as devDeps. No shared library packages are pre-installed.
- **Why:** Avoid forced coupling between projects. A Project 1 app has no reason to depend on
  domain abstractions needed by Project 8. Each project wires in the shared packages it actually
  needs as it is built out.
- **Trade-off:** Each project's first implementation session must explicitly add shared packages.
  There is no "batteries included" starting point.

### AD-005: Shared contracts package, not shared domain models

> Formalized as `docs/adrs/020` (Requirement ID PKG-001).

- **What:** API contracts (the serializable shapes crossing the wire) live in a dedicated
  `@product-engineer/shared-contracts` package as Zod schemas (single source of truth), consumed by
  a project's `-web`, `-mobile`, and `-api` apps. Rich domain models stay local to each `-api` (in
  `src/domain/`). `shared-types` remains for cross-cutting primitives only.
- **Why:** Up to three consumers (web/mobile/api) must agree on the wire shape; sharing the domain
  model instead would leak server concerns into clients and force the domain across the ESM/CJS
  boundary (ADR-002). A framework-neutral Zod contract gives runtime validation on the api and
  inferred types on the clients from one definition.
- **Trade-off:** Slightly more than a score-10 app strictly needs, and contributors must place each
  type in the right home (contract vs domain vs primitive).

### AD-006: AI Flashcards (Project 1) scope locked

> Spec: `.specs/features/ai-flashcards/spec.md` · decisions: `.specs/features/ai-flashcards/context.md`.
> Requirement IDs APP1-001…APP1-015 (APP1- namespace opened here).

- **What:** Project 1 spans all three apps (api+web+mobile). Persistence is **Postgres + Prisma**;
  AI generation uses the **real Anthropic SDK** behind an `AiCardGenerator` port (offline fake for
  tests); scheduling is **SM-2**. Single-user, **no auth** (no `shared-auth`).
- **Why:** Foundation full-stack vertical exercising AI + a real datastore + shared Zod contracts.
- **Trade-off:** More than a toy score-10 app strictly needs (real DB + real LLM), chosen for
  production-representative practice.
- **Status:** Phase-1 spec + Phase-2 `design.md` and `tasks.md` complete (T1–T16). Resolved opens:
  model `claude-sonnet-4-6`, `maxCards` 1–20 (default 10), mobile `EXPO_PUBLIC_API_URL`, api
  integration tests run against a Postgres service container in CI (new id CI-001). Next: `/implement`.

---

## Active Blockers

None.

---

## Lessons Learned

None yet.

---

## Deferred Ideas

None.

---

## Preferences

None.
