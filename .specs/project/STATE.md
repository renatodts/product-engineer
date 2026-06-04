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
