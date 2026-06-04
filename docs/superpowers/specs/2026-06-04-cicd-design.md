# CI/CD Pipeline Design

**Date:** 2026-06-04
**Status:** Approved

---

## Overview

A GitHub Actions CI/CD pipeline for the `product-engineer` pnpm + Turborepo monorepo. The pipeline enforces code quality (format, lint, type safety, tests) on every pull request and runs the full suite including Playwright E2E on every push to `main`. Turborepo affected-package detection keeps CI fast as the monorepo grows.

---

## Triggers

| Event | Jobs Run |
|---|---|
| `pull_request` (opened, synchronize, reopened) | `lint-format`, `type-check`, `unit-tests`, `ci-gate` |
| `push` to `main` | `lint-format`, `type-check`, `unit-tests`, `ci-gate`, `e2e` |
| `workflow_dispatch` | Same as push to main |

---

## Job Graph

```
         ┌─────────────────┐
         │   lint-format   │──┐
         └─────────────────┘  │
         ┌─────────────────┐  ├──▶ ci-gate ──▶ e2e (main only)
         │   type-check    │──┤
         └─────────────────┘  │
         ┌─────────────────┐  │
         │   unit-tests    │──┘
         └─────────────────┘
```

`lint-format`, `type-check`, and `unit-tests` run in parallel. `ci-gate` is the single required status check registered in GitHub branch protection — it depends on all three. `e2e` runs only after `ci-gate` passes on `main` and `workflow_dispatch`.

---

## Shared Job Setup

Every job runs this setup sequence before its specific steps:

1. `actions/checkout` with `fetch-depth: 0` — full history required for Turborepo's `...[HEAD^1]` affected detection
2. `pnpm/action-setup` — installs the pnpm version declared in `package.json#packageManager`
3. `actions/setup-node` with pnpm store cache
4. `pnpm install --frozen-lockfile`
5. Set `TURBO_TOKEN` and `TURBO_TEAM` environment variables from GitHub secrets for Vercel Remote Cache

---

## Job Definitions

### `lint-format`

```
pnpm format:check
turbo lint --filter=...[HEAD^1]
commitlint --from origin/main --to HEAD
```

- Prettier validates formatting across the full tree (`**/*.{ts,tsx,js,jsx,json,md}`)
- ESLint runs only on affected packages via Turborepo
- commitlint validates every commit in the PR conforms to Conventional Commits — catches any commit that bypassed the local `commit-msg` hook with `--no-verify`

### `type-check`

```
turbo typecheck --filter=...[HEAD^1]
```

Runs `tsc --noEmit` on all affected packages and apps.

### `unit-tests`

```
turbo test --filter=...[HEAD^1]
```

Runs Vitest (packages, Next.js apps) and Jest (NestJS APIs) on affected packages. Coverage thresholds are enforced per-package inside `vitest.config.ts` / `jest.config.ts` per the testing guidelines in `docs/10-testing-guidelines.md`. CI fails if any threshold is breached.

### `ci-gate`

```yaml
needs: [lint-format, type-check, unit-tests]
steps:
  - run: echo "All checks passed"
```

A no-op aggregation job. The only status check added to GitHub branch protection. Decouples branch protection rules from the number of parallel jobs — adding or renaming jobs never requires updating branch protection settings.

### `e2e`

```
needs: [ci-gate]
if: github.ref == 'refs/heads/main' || github.event_name == 'workflow_dispatch'
turbo test:e2e --filter=...[HEAD^1]
```

- Runs Playwright tests on affected Next.js web apps only
- Each app is built (`pnpm build`) and served (`pnpm start`) before Playwright runs
- Playwright browsers installed via `npx playwright install --with-deps chromium`
- Scoped to affected apps so a change to `shared-auth` only triggers E2E for apps that depend on it

---

## Turborepo Remote Cache

All jobs share a Vercel Remote Cache authenticated via:

```
TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
```

Cache is shared across parallel jobs within the same run and across runs, so a job that hits cache for an unchanged package skips execution entirely. Setup: create a Vercel account (free), run `npx turbo login` and `npx turbo link`, then add the token and team slug as GitHub repository secrets.

---

## Pre-commit Hooks (Local)

Husky is already configured. The design keeps existing hooks and adds one:

| Hook | Command | Purpose |
|---|---|---|
| `pre-commit` | `pnpm format:check` + `pnpm turbo lint` | Block commits with formatting or lint errors |
| `commit-msg` | `pnpm exec commitlint --edit "$1"` | Enforce Conventional Commits locally |
| `pre-push` *(new)* | `turbo typecheck --filter=...[origin/main]` | Catch type errors before pushing to CI |

The pre-commit hook stays cheap (seconds). The pre-push hook does the slightly heavier typecheck but with Turborepo caching remains fast. Unit tests and E2E are CI-only.

---

## Commit Convention

Conventional Commits is enforced at two layers:

- **Local:** `commit-msg` Husky hook via `@commitlint/cli` + `@commitlint/config-conventional` (already in place)
- **CI:** `commitlint --from origin/main --to HEAD` in the `lint-format` job validates all commits in the PR, catching any that bypassed the hook

Allowed types per `docs/06-repository-conventions.md`: `feat`, `fix`, `build`, `chore`, `docs`, `test`, `refactor`, `perf`, `ci`, `style`. Breaking changes use the `!` suffix and a `BREAKING CHANGE:` footer.

---

## Files to Create

```
.github/
  workflows/
    ci.yml           # Single workflow — all jobs defined here
.husky/
  pre-push           # New hook: turbo typecheck --filter=...[origin/main]
```

No existing files are modified. The `commitlint.config.js` and existing Husky hooks remain unchanged.

---

## GitHub Branch Protection Settings

On the `main` branch:

- Required status checks: `ci-gate` (only this one)
- Require branches to be up to date before merging: yes
- Require pull request reviews: recommended (1 reviewer minimum)
- Do not allow bypassing the above settings

---

## Secrets Required

| Secret | Description |
|---|---|
| `TURBO_TOKEN` | Vercel Remote Cache API token |
| `TURBO_TEAM` | Vercel team slug (from `turbo link`) |
