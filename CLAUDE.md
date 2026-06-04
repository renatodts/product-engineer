# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A learning-program monorepo: nine projects of rising complexity (score 10→100), each a real,
shippable app. Projects 1–9 are scaffolded under `apps/` but most contain only stubs — the
foundation (tooling, shared packages, app skeletons) is in place; feature work is just beginning.
The README's project table maps each number prefix to its project and focus.

## SDLC harness (start here)

This is the operating contract. For any non-trivial change, drive it with the **tlc-spec-driven**
skill: a spec or plan is produced **before any code**. The slash commands (`/analyze`, `/implement`,
`/validate`, `/ship`) chain the right skill and the real commands at each phase. Run process and
planning skills first, then implementation skills.

### Unified flow

| Phase                          | Goal                               | Skill (invoke first)                                                             | Commands                                                                                                                                                               | Artifact                                                                                                                      | Gate to advance                                                                                                                               |
| ------------------------------ | ---------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Orient (only if unfamiliar) | Map the relevant slice of the tree | `codenavi`                                                                       | (read only)                                                                                                                                                            | scratch notes                                                                                                                 | none                                                                                                                                          |
| 1. Analysis and Spec           | Decide WHAT, with traceable IDs    | `tlc-spec-driven` (Specify; `the-fool` to red-team risky scope)                  | `/analyze <desc>`                                                                                                                                                      | `.specs/features/<slug>/spec.md` (+ `design.md`/`tasks.md` for Large/Complex) or `.specs/quick/NNN-slug/TASK.md` (Quick mode) | spec or plan exists before any code                                                                                                           |
| 2. Implementation              | Build it in atomic steps           | `tlc-spec-driven` (Execute) + per-stack skill (see decision tree)                | `/implement [slug]`                                                                                                                                                    | code + atomic Conventional Commits                                                                                            | each task "Done when" met                                                                                                                     |
| 3. Local validation            | Prove it locally                   | `gh-fix-ci` / `superpowers:systematic-debugging` on failure                      | `/validate` -> `pnpm format` then `pnpm turbo lint typecheck test build --filter=...[origin/main]`; E2E (opt-in) `pnpm turbo test:e2e` after `pnpm playwright install` | green local sweep                                                                                                             | lint + typecheck + test + build pass; format clean                                                                                            |
| 4. Self-review and PR          | Catch your own bugs, open PR       | `the-fool` (red-team), `security-best-practices` (if auth/data or `shared-auth`) | `/ship` -> `commit-commands:commit-push-pr` (or `gh pr create`)                                                                                                        | PR with Conventional title                                                                                                    | branch is `feat\|fix\|chore/<scope>/<slug>`; commits pass commitlint                                                                          |
| 5. CI and merge                | Pass the merge gate                | `gh-fix-ci` (red CI), `gh-address-comments` (review)                             | CI runs `lint-format` + `type-check` + `unit-tests` -> `ci-gate`                                                                                                       | green `ci-gate`                                                                                                               | `ci-gate` success (it is the merge gate)                                                                                                      |
| 6. Deploy and post-deploy      | Ship to an environment             | none yet                                                                         | none yet                                                                                                                                                               | none                                                                                                                          | **GAP: no CD pipeline or environments exist.** E2E runs post-merge on `main` only. Add a target and a `/deploy` command here when one exists. |

The `--filter=...[origin/main]` scope keeps each phase to changed packages. Run `pnpm format`
(write) before `format:check` (pre-commit hook) so the hook passes; never bypass hooks with
`--no-verify`.

### Decision tree (which skill, which entry phase)

**Default: any non-trivial change starts at Phase 1 with `tlc-spec-driven`.** It auto-sizes depth
(Quick / Medium / Large / Complex), so "start at TLC SDD" does not mean heavyweight.

| Task type                                  | Entry                                | Skill chain after TLC SDD sizing                                                                                                         |
| ------------------------------------------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Bug fix (<=3 files)                        | TLC SDD Quick mode                   | `superpowers:systematic-debugging` -> fix -> `/validate` -> `/ship`                                                                      |
| New admin page or net-new UI (`*-web`)     | TLC SDD Specify                      | `frontend-design` (discovery) -> `react-best-practices` -> `/implement`                                                                  |
| Dashboard / existing-page change (`*-web`) | TLC SDD (Medium)                     | `react-best-practices` + `react-composition-patterns` -> `/validate`                                                                     |
| Form scaffold (`*-web`/`*-mobile`)         | TLC SDD Specify                      | `frontend-design` + `react-composition-patterns`; wire request/response as Zod in `shared-contracts` (ADR-020)                           |
| E2E test only                              | Phase 2/3 (no new spec)              | `playwright-skill` -> `pnpm turbo test:e2e` (ADR-003)                                                                                    |
| Refactor (cross-module)                    | TLC SDD Specify (no behavior change) | `coupling-analysis` / `modular-decomposition` -> heavy `/validate`                                                                       |
| Schema or contract change (`*-api`)        | TLC SDD Specify                      | `domain-analysis` / `tactical-ddd` + `nestjs-modular-monolith`; update `shared-contracts` Zod; keep it CJS-importable (ADR-002, ADR-020) |
| New ADR or RFC                             | n/a                                  | `create-adr` / `create-rfc` -> `docs/adrs/`                                                                                              |
| Mobile (`*-mobile`)                        | TLC SDD Specify                      | `react-native-expert`                                                                                                                    |

## Commands

All tasks run through Turborepo from the repo root (`pnpm@10.11.0`, Node `>=22`):

```bash
pnpm install                          # install workspace deps (use --frozen-lockfile in CI)
pnpm turbo typecheck build test       # the standard verification sweep
pnpm turbo lint                       # ESLint across affected packages (cached)
pnpm format                           # Prettier write across the tree
pnpm format:check                     # Prettier check (run by pre-commit)
pnpm turbo test:e2e                   # Playwright E2E (opt-in; run `pnpm playwright install` first)
```

Scope a task to changed packages with Turbo filters, e.g. `pnpm turbo test --filter=...[origin/main]`.

Per-workspace scripts (run from the workspace dir or via `--filter`):

- **Next.js web apps**: `pnpm dev` (each app pins its own port, e.g. flashcards-web = 3001),
  `test` runs Vitest, `test:e2e` runs Playwright.
- **NestJS api apps**: `pnpm start:dev` (watch mode), `test` runs Jest.
- **Shared packages**: `test` runs Vitest; `build`/`typecheck` are `tsc --noEmit`.

Run a single test: `pnpm --filter <workspace> exec vitest run path/to/file.test.ts`
(or `... exec jest path/to/file.spec.ts` for NestJS apps).

## Architecture and structure

- **`apps/`** — flat workspaces named `<project-number>-<slug>-<app-type>` (e.g.
  `2-invoice-automation-api`). The number prefix makes filesystem sort match the complexity
  progression. App types: `-web` (Next.js App Router), `-api` (NestJS), `-mobile` (Expo).
- **`packages/`** — shared libs, all scoped `@product-engineer/*`, flat (no nested grouping).
  `typescript-config` and `eslint-config` hold the base presets; `ui`, `design-system`,
  `shared-domain`, `shared-utils`, `shared-ai`, `shared-auth`, `shared-observability`,
  `shared-types`, `shared-contracts`, `shared-testing` are runtime libs for the later, more
  complex projects.
- **`docs/`** — numbered guideline docs (`01`–`20`), `docs/adrs/` (Architecture Decision
  Records — the canonical record of cross-cutting decisions), and `docs/ai/` (AI playbooks).
- **`.specs/`** — TLC Spec-Driven session memory: `codebase/` (architecture, conventions,
  stack snapshots), `project/` (PROJECT/ROADMAP/STATE), and `HANDOFF.md`. `STATE.md` is
  cross-session memory; update it when a significant decision/blocker/pattern emerges.
- **`templates/`** — scaffolding templates for new specs, designs, and reviews.

### Decisions that will trip you up if you don't know them

These are settled ADRs (`docs/adrs/`); follow them rather than "fixing" the apparent inconsistency:

- **Dual module system (ADR-002).** Everything is ESM (`"type": "module"`) **except** NestJS
  `*-api` apps, which are deliberately CommonJS (`"module": "CommonJS"`, no `"type": "module"`).
  NestJS relies on `reflect-metadata` and decorator/CLI tooling that assume CJS. Consequence: any
  shared package consumed by an api must be importable from CommonJS (CJS output or dual exports).
- **Three test runners (ADR-003).** Vitest for ESM packages + Next.js apps; Jest + supertest for
  NestJS apps; Playwright for browser E2E. Turbo task names (`test`, `test:e2e`) are uniform so
  the pipeline doesn't care which runner sits underneath — match the runner to the workspace type.
- **Apps pre-wire config only (ADR-004).** Every app depends only on `typescript-config` and
  `eslint-config` at scaffold time. Shared _runtime_ libraries are **not** pre-installed — add a
  shared package to an app deliberately, as a reviewable decision, when the project actually needs it.
- **Share contracts, not domain models (ADR-020).** Rich domain models (entities with invariants,
  value objects) stay **local to each `*-api`** app (in `src/domain/`), never exported to clients.
  The serializable request/response shapes that cross the wire live in
  `@product-engineer/shared-contracts`, defined as **Zod schemas (single source of truth)** and
  consumed by a project's `-web`/`-mobile`/`-api`: the api validates against them, clients infer
  types from them. `shared-types` is for cross-cutting primitives only, not per-project contracts.
  Keep `shared-contracts` framework-neutral so it stays CJS-importable (ADR-002).
- **TypeScript is strict** with `noUncheckedIndexedAccess` and `verbatimModuleSyntax` on. Apps
  extend a preset from `@product-engineer/typescript-config` (`base`/`nextjs`/`nestjs`/`expo`).

## Conventions (enforced by tooling)

- **Conventional Commits**, enforced by commitlint on `commit-msg`. Scope = package/app dir name
  without the `@product-engineer/` or `apps/` prefix, e.g. `feat(ai-flashcards/web): ...`,
  `build(typescript-config): ...`. Types include `feat fix build chore docs test refactor perf ci style`.
- **Branches**: `feat|fix|chore/<scope>/<slug>`, `docs/<slug>`. Trunk-based off `main`; short-lived.
- **Husky hooks**: pre-commit runs `format:check` + `turbo lint`; pre-push runs `turbo typecheck`
  on packages changed vs `origin/main`. Never bypass with `--no-verify` — run `pnpm format` and
  re-stage instead.
- **File naming**: TS source `kebab-case`, React components `PascalCase`, tests `*.test.ts`
  (Vitest) / `*.spec.ts` (Jest/Playwright), docs `NN-kebab-case.md`, ADRs `NNN-kebab-case.md`.
- **Requirement IDs**: structured namespace (`MONO-`, `PKG-`, `APP1-`…`APP9-`, `CI-`) links specs,
  tasks, and ADRs. Sequential, never reused; superseded IDs are marked, not deleted.

## CI

`.github/workflows/ci.yml` runs lint/format, typecheck, and unit tests in parallel (each filtered
to changes vs `HEAD^1`), gated by a `ci-gate` job. E2E runs only on `main` or manual dispatch.
Full docs in `docs/06-repository-conventions.md` and `docs/07-monorepo-architecture.md`.

## Required skills

This repo vendors a curated skill set under `.claude/skills/` (sourced from the `agent-skills`
MCP / `@tech-leads-club/skills-catalog`). Treat these as **mandatory**: before acting on a task
that matches a row below, invoke the named skill with the `Skill` tool and follow it. If several
apply, run process/planning skills first, then implementation skills. Re-vendor or add skills with
`python3 /tmp/install-skills.py` (edit its `TARGETS` list) — don't hand-write skill folders.

### Workflow & planning (use first)

- **tlc-spec-driven** — any feature/project work: Specify → Design → Tasks → Execute, with atomic
  commits and `.specs/` memory. This is the default driver; it owns the `MONO-`/`APP#-` requirement IDs.
- **codenavi** — navigating/orienting in an unfamiliar workspace or the 9-project tree.
- **coding-guidelines** — general guardrails while writing code anywhere in the repo.
- **learning-opportunities** — this is a learning-program repo; use to surface deliberate practice.
- **the-fool** — red-team a plan, ADR, or decision before committing to it.

### Per-stack implementation

- **nestjs-modular-monolith** — `apps/*-api` (CJS NestJS, ADR-002): bounded contexts, DDD, CQRS.
- **react-best-practices** — `apps/*-web` Next.js App Router performance/data-fetching work.
- **react-composition-patterns** — component APIs in `packages/ui` and `packages/design-system`.
- **react-native-expert** — `apps/*-mobile` Expo work (Expo Router, Reanimated, list perf).
- **frontend-design** / **frontend-blueprint** — net-new UI; design discovery before building.

### Architecture & domain

- **domain-analysis**, **domain-identification-grouping** — drawing bounded contexts / service
  boundaries (esp. `packages/shared-domain` and api modules).
- **tactical-ddd** — rich vs anemic domain models in the domain layer.
- **coupling-analysis**, **modular-decomposition**, **modular-design-principles** — keeping shared
  packages and monolith boundaries clean; supports the ADR-004 deliberate-dependency rule.

### Docs & decisions

- **create-adr** — new ADRs in `docs/adrs/` (`NNN-kebab-case.md`).
- **create-rfc** — proposals before a decision is settled.
- **technical-design-doc-creator** — Design-phase TDDs.
- **docs-writer** — the numbered `docs/01`–`20` guideline files.

### CI, quality & security

- **gh-fix-ci** — debugging failing GitHub Actions checks (our CI is GH Actions, not Nx Cloud).
- **gh-address-comments** — addressing PR review comments via `gh`.
- **security-best-practices**, **security-threat-model**, **security-ownership-map** — security
  reviews, threat models, and ownership/bus-factor analysis (esp. `shared-auth` + data-handling apps).
- **accessibility**, **web-quality-audit**, **best-practices**, **seo** — web app quality gates.
- **core-web-vitals**, **perf-web-optimization**, **perf-lighthouse** — Next.js performance work.
- **sentry** — read-only Sentry inspection (pairs with `packages/shared-observability`).

### Tooling

- **playwright-skill**, **chrome-devtools** — browser E2E (ADR-003) and in-browser debugging.
- **mermaid-studio**, **excalidraw-studio** — diagrams for ADRs/docs.
