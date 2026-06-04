# 07 — Monorepo Architecture

This document describes the monorepo structure, the Turborepo pipeline, and the PNPM workspace configuration. It is the authoritative reference for understanding how packages and apps relate to each other, how builds are ordered, and how caching works.

Understanding the monorepo architecture is a prerequisite for contributing any package or app. Misconfigured `turbo.json` tasks or incorrect `package.json` `dependencies` vs `devDependencies` are the most common causes of broken builds and incorrect cache hits.

---

## Workspace Layout

```
/
├── apps/
│   ├── 1-ai-flashcards-web/          # Next.js (App Router)
│   ├── 1-ai-flashcards-mobile/       # Expo
│   ├── 1-ai-flashcards-api/          # NestJS
│   ├── 2-invoice-automation-web/
│   ├── 2-invoice-automation-api/
│   ├── 3-life-os-web/
│   ├── 3-life-os-api/
│   ├── 4-financial-os-web/
│   ├── 4-financial-os-api/
│   ├── 5-team-knowledge-copilot-web/
│   ├── 5-team-knowledge-copilot-api/
│   ├── 6-payments-domain-api/
│   ├── 7-ramp-clone-web/
│   ├── 7-ramp-clone-api/
│   ├── 8-personal-erp-web/
│   ├── 8-personal-erp-api/
│   └── 9-enterprise-operating-system/
├── packages/
│   ├── typescript-config/      # Shared tsconfig bases
│   ├── eslint-config/          # Shared ESLint config
│   ├── ui/
│   ├── design-system/
│   ├── shared-types/
│   ├── shared-utils/
│   ├── shared-domain/
│   ├── shared-ai/
│   ├── shared-auth/
│   ├── shared-observability/
│   └── shared-testing/
├── docs/                  # This directory
├── .specs/                # TLC spec-driven memory
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

`apps/` contains all project applications, each as a flat directory whose name is a single-digit project number, a hyphenated project slug, and an app-type suffix (`-web`, `-mobile`, `-api`). `packages/` contains shared code that is consumed by apps. There are eleven packages: two config packages (`typescript-config`, `eslint-config`) and nine library packages (`ui`, `design-system`, `shared-types`, `shared-utils`, `shared-domain`, `shared-ai`, `shared-auth`, `shared-observability`, `shared-testing`).

---

## PNPM Workspaces

`pnpm-workspace.yaml` declares the workspace roots:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Every `package.json` in `apps/` and `packages/` is a workspace package. PNPM hoists shared dependencies to the root `node_modules` while preserving correct isolation. Internal packages are referenced by workspace protocol:

```json
{
  "devDependencies": {
    "@product-engineer/typescript-config": "workspace:*",
    "@product-engineer/eslint-config": "workspace:*"
  }
}
```

The `workspace:*` protocol means "use whatever version is in the workspace" — PNPM resolves this to the local package path. This avoids version mismatch bugs and means config changes are picked up immediately without re-publishing.

---

## Turborepo Pipeline

`turbo.json` defines the task dependency graph. The pipeline controls execution order and what is cached.

### Tasks

| Task        | Depends On | Cached | Description                                  |
| ----------- | ---------- | :----: | -------------------------------------------- |
| `lint`      | `^build`   |  Yes   | ESLint across all packages and apps          |
| `typecheck` | `^build`   |  Yes   | `tsc --noEmit` without build output          |
| `build`     | `^build`   |  Yes   | Compile TypeScript, bundle Next.js/NestJS    |
| `test`      | `^build`   |  Yes   | Vitest (packages, web) and Jest (NestJS API) |
| `test:e2e`  | `^build`   |   No   | Playwright E2E — always re-run               |

### The `^build` Topology

The `^build` dependency means: "run `build` in all dependencies before running this task." This is the Turborepo mechanism for respecting topological order. When `apps/1-ai-flashcards-web` depends on `packages/ui`, Turborepo ensures `packages/ui` is built before the web app is built. Without this, the web app might import stale or missing compiled output.

The same applies to `test` depending on `^build`: the packages under test must be compiled before the test runner can import them.

### Caching

Turborepo caches task outputs in `.turbo/` by default and in a remote cache when configured. Cache keys are derived from:

1. The content hash of all input files (source files, config files)
2. The environment variables listed in `turbo.json` `env` and `globalEnv`
3. The task's dependency graph state

A cache hit means the task's output (e.g., compiled files, lint result) is restored from cache without re-running the task. This makes CI fast after the first run. Cache misses happen when any input file changes, an environment variable changes, or the task configuration changes.

**Important**: do not add files that change on every run (timestamps, lock files with local paths) to `inputs` — this defeats caching.

---

## Module System Split

NestJS API packages use **CommonJS** (`"module": "commonjs"` in `tsconfig`). Everything else — Next.js, Expo, shared packages — uses **ESM** (`"module": "ESNext"` or `"NodeNext"`). This is intentional: NestJS's decorator metadata system requires CommonJS until the ecosystem stabilises on ESM decorators.

The practical consequence: shared packages that need to be consumed by both ESM (web) and CJS (API) targets must either:

1. Ship dual builds (ESM + CJS) — preferred for frequently-shared logic.
2. Use CommonJS exclusively — acceptable for packages that are only ever consumed by NestJS.
3. Avoid the split entirely by keeping domain logic in the API package — acceptable for project-specific logic.

The shared `typescript-config` package provides separate base configs for each context:

- `base.json` — common settings
- `nextjs.json` — Next.js + ESM
- `nestjs.json` — NestJS + CommonJS
- `expo.json` — Expo / React Native

---

## Adding a New App or Package

1. Create the directory as `apps/<project-number>-<project-slug>-<app-type>/` or `packages/<name>/`.
2. Add a `package.json` with the correct `name` (scoped for packages), `scripts`, and `devDependencies` on `@product-engineer/typescript-config` and `@product-engineer/eslint-config`.
3. Extend the correct `tsconfig` base.
4. Run `pnpm install` from the repo root to update the lockfile.
5. Verify that `pnpm turbo build` completes without error from the repo root.

See [06-repository-conventions.md](06-repository-conventions.md) for naming rules.
