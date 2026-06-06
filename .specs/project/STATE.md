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
- **Status:** Backend complete on branch `feat/ai-flashcards/foundation` (PR open).
  Phase-1 Foundation: T1 `ad9ef71`, T2 `5e3dd77`, T4 `2421df9`, T3 `dffd9f7`. Phase-2 API:
  T5 `5ae6b1f`, T6 `9a8ab59`, T7 `a6586b5`, T8b `e8dc50e`, T8 `f725fce`. CI: T16 `cb924df`
  (Postgres service for api integration tests). **81 tests green** (23 contracts + 13 shared-ai +
  45 api), `--frozen-lockfile` clean. Deliberate deps (ADR-004): `zod`→shared-contracts;
  `prisma`+`@prisma/client`+`zod`+`dotenv`+`shared-contracts`+`shared-ai` →api;
  `@anthropic-ai/sdk`→shared-ai. **Remaining: Phase-3 web (T9–T13), Phase-4 mobile (T14–T15).**
  Local Postgres on host port 5433 (`docker compose up -d`); tests use a `flashcards_test` DB via
  gitignored `.env.test`. Deviations: per-route Zod pipe (not global); accept route `/cards/accept`
  (not `cards:accept`) — both marked SPEC_DEVIATION in code.
- **Phase-3 Web complete** on branch `feat/ai-flashcards/web` (PR #7, stacked on #6). T9 api client
  `8cf2368`, T10 deck list `c6f7295`, T11 cards `cfaa4f7`, T12 generation `7793281`, T13 review
  `55a723a`. **26 web unit tests + 8 Playwright E2E green**, `next build` clean. Web↔api via a Next
  `/api` rewrite proxy (no CORS); E2E stubs the api via Playwright route interception (no backend
  needed). Deliberate dep: `shared-contracts` (type-only). App imports are extensionless (Next can't
  resolve `.js`-on-`.ts`). PRs #6 and #7 merged to `main` (admin-merged; CI green, self-approval
  blocked by GitHub).
- **Phase-4 Mobile complete** on branch `feat/ai-flashcards/mobile` (off `main`). T14 decks screen
  `751888c`, T15 review screen `ecb2f67`. **11 mobile unit tests green**, `tsc --noEmit` clean.
  Mobile calls the api directly via `EXPO_PUBLIC_API_URL` (default `http://localhost:4001`) — no
  proxy (it is not a web server). Two-screen flow (decks → review) via local state; a native router
  is deliberately deferred (ADR-004) — two screens don't justify expo-router + its test stubs.
  Deliberate deps: `shared-contracts` (types) + `react-test-renderer` (dev). RN test stubs extended
  (Pressable/FlatList/SafeAreaView/ActivityIndicator/StyleSheet) so react-test-renderer can mount
  the tree under Node/Vitest; vitest `include` now matches `*.test.ts` too. **Project 1 feature-complete
  across all three apps.**

---

## Active Blockers

### BL-001: NestJS `nest build` emits to the wrong directory (pre-existing, repo-wide)

- **What:** `packages/typescript-config/nestjs.json` sets `"outDir": "./dist"`. TypeScript resolves
  a relative `outDir` from an extended config **relative to the preset file's own directory**, so
  every `*-api` app's `nest build` emits into `packages/typescript-config/dist/` instead of
  `apps/<app>/dist/`. The build still exits 0 (so `ci-gate` stays green); the only signal is Turbo's
  "no output files found for task …#build" warning.
- **Impact:** No api produces a runnable `dist/`. Does not affect dev (`nest start`), tests
  (ts-jest), typecheck, or the current gate — but blocks any `node dist/main` / container run.
- **Fix (separate task):** a `build(typescript-config)` change — move `outDir`/`rootDir` out of the
  shared preset into each app's `tsconfig.build.json`, verified across all nine api apps. Out of
  scope for APP1 foundation; surfaced during T3.

---

## Lessons Learned

- **TS `extends` resolves `outDir`/`rootDir` relative to the file that DECLARES them**, not the leaf
  consuming config. Shared tsconfig presets should leave output paths to the leaf config. Surfaced
  via BL-001 while wiring Prisma into the api build (T3).

---

## Deferred Ideas

None.

---

## Preferences

None.
