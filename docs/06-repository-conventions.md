# 06 — Repository Conventions

Consistent conventions reduce cognitive overhead and make the repository legible to anyone who has not worked in it before — including your future self six months from now. This document defines the naming, branching, commit, and requirement-tracking conventions used across the entire monorepo.

These conventions are enforced by tooling where possible (commitlint, ESLint, Prettier, Husky pre-commit hooks) and by code review where not. When a convention is ambiguous, prefer the option that is most legible in a diff.

---

## Package and App Naming

All published packages use the `@product-engineer/` scope. Internal packages follow a flat name:

```
@product-engineer/typescript-config
@product-engineer/eslint-config
@product-engineer/ui
@product-engineer/shared-domain
@product-engineer/shared-utils
```

Apps in `apps/` use a flat `<project-number>-<project-slug>-<app-type>` directory name:

```
apps/1-ai-flashcards-web/
apps/1-ai-flashcards-api/
apps/2-invoice-automation-web/
apps/2-invoice-automation-api/
apps/5-team-knowledge-copilot-mobile/
```

The number prefix ensures filesystem-level sort order matches the complexity progression.

---

## Branching Strategy

The repository uses a simplified trunk-based development model:

| Branch                 | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `main`                 | Production-ready at all times; protected |
| `feat/<scope>/<slug>`  | Feature branches; short-lived (<1 week)  |
| `fix/<scope>/<slug>`   | Bug fix branches                         |
| `chore/<scope>/<slug>` | Tooling, dependencies, config            |
| `docs/<slug>`          | Documentation changes only               |

Branch scope mirrors the Conventional Commits type (see below). Delete branches immediately after merge. Never commit directly to `main` except during initial scaffolding phases.

---

## Conventional Commits

All commit messages must conform to the [Conventional Commits](https://www.conventionalcommits.org/) specification. This is enforced by `commitlint` on every commit.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | When to Use                                            |
| ---------- | ------------------------------------------------------ |
| `feat`     | A new user-facing feature                              |
| `fix`      | A bug fix                                              |
| `build`    | Build system, Turborepo pipeline, package.json changes |
| `chore`    | Maintenance not affecting src or tests                 |
| `docs`     | Documentation only                                     |
| `test`     | Tests only (no production code change)                 |
| `refactor` | Code restructure with no behaviour change              |
| `perf`     | Performance improvements                               |
| `ci`       | CI/CD pipeline changes                                 |
| `style`    | Formatting, whitespace (no logic change)               |

### Scope

Scope identifies the affected area. Use the package or app directory name without the `@product-engineer/` prefix or `apps/` prefix:

- `feat(ai-flashcards/web):`
- `fix(invoice-automation/api):`
- `build(typescript-config):`
- `docs(monorepo):`

### Breaking Changes

Append `!` after the type/scope: `feat(payments/api)!:`. Add a `BREAKING CHANGE:` footer with the migration path.

---

## Requirement ID Namespace

All requirements, tasks, and acceptance criteria tracked in `.specs/` and in ADRs use a structured ID namespace to enable cross-document linking and traceability.

| Prefix  | Scope                                      | Example    |
| ------- | ------------------------------------------ | ---------- |
| `MONO-` | Workspace-level tooling and infrastructure | `MONO-001` |
| `PKG-`  | Shared packages (`packages/`)              | `PKG-012`  |
| `APP1-` | Project 1 — AI Flashcards                  | `APP1-003` |
| `APP2-` | Project 2 — Invoice Automation             | `APP2-007` |
| `APP3-` | Project 3 — Life OS                        | `APP3-001` |
| `APP4-` | Project 4 — Financial OS                   | `APP4-015` |
| `APP5-` | Project 5 — Team Knowledge Copilot         | `APP5-002` |
| `APP6-` | Project 6 — Payments Domain                | `APP6-009` |
| `APP7-` | Project 7 — Ramp Clone                     | `APP7-004` |
| `APP8-` | Project 8 — Personal ERP                   | `APP8-001` |
| `APP9-` | Project 9 — Enterprise OS                  | `APP9-011` |
| `CI-`   | CI/CD pipeline and GitHub Actions          | `CI-003`   |

IDs are sequential within each prefix and never reused. When a requirement is superseded, the old ID is marked `[SUPERSEDED by XXX-NNN]` rather than deleted.

---

## File Naming Conventions

| Context           | Convention                     | Example                       |
| ----------------- | ------------------------------ | ----------------------------- |
| TypeScript source | `kebab-case`                   | `invoice-service.ts`          |
| React components  | `PascalCase`                   | `InvoiceCard.tsx`             |
| Test files        | Same name + `.test` or `.spec` | `invoice-service.test.ts`     |
| E2E tests         | `kebab-case.spec.ts`           | `invoice-creation.spec.ts`    |
| Documentation     | `NN-kebab-case.md`             | `07-monorepo-architecture.md` |
| ADRs              | `NNN-kebab-case.md`            | `001-monorepo-tooling.md`     |

---

## Pre-Commit Hook Behaviour

The Husky pre-commit hook runs two checks on every commit:

1. `pnpm format:check` — Prettier across the whole tree (TS, TSX, JS, JSX, JSON, MD).
2. `pnpm turbo lint` — ESLint via Turborepo (cached; only re-runs affected packages).

If either check fails, the commit is blocked. To fix: run `pnpm format` then re-stage the formatted files before committing. Never use `--no-verify`.

See [07-monorepo-architecture.md](07-monorepo-architecture.md) for the full Turborepo pipeline and caching behaviour.
