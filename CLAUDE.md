# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A learning-program monorepo: nine projects of rising complexity (score 10→100), each a real,
shippable app. Projects 1–9 are scaffolded under `apps/` but most contain only stubs — the
foundation (tooling, shared packages, app skeletons) is in place; feature work is just beginning.
The README's project table maps each number prefix to its project and focus.

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
  `shared-types`, `shared-testing` are runtime libs for the later, more complex projects.
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
