# Conventions

## Naming

### Package names

All workspace packages use the `@product-engineer/` npm scope:

```
@product-engineer/typescript-config
@product-engineer/eslint-config
@product-engineer/ui
@product-engineer/shared-utils
...
```

### App folder names

App folders are numbered with a single digit prefix matching the project number, kebab-case:

```
apps/
  1-ai-flashcards-web/
  1-ai-flashcards-mobile/
  1-ai-flashcards-api/
  2-invoice-automation-web/
  ...
  9-enterprise-operating-system/
```

Suffixes: `-web` for Next.js apps, `-mobile` for Expo apps, `-api` for NestJS apps. Projects
with a single app (e.g. project 9) drop the suffix.

## Commit Messages

This repo enforces [Conventional Commits](https://www.conventionalcommits.org/) via
`commitlint.config.js` at the root (enforced by a Husky `commit-msg` hook).

Format: `<type>(<scope>): <subject>`

### Types

`feat`, `fix`, `build`, `chore`, `ci`, `docs`, `refactor`, `test`, `perf`, `style`, `revert`

### Monorepo scopes

| Scope pattern     | Used for                                                          |
| ----------------- | ----------------------------------------------------------------- |
| `workspace`       | Root-level tooling, configs, `pnpm-workspace.yaml`, `turbo.json`  |
| `packages/<name>` | Changes scoped to a single package (e.g. `packages/shared-utils`) |
| `apps/<name>`     | Changes scoped to a single app (e.g. `apps/1-ai-flashcards-web`)  |
| `specs`           | `.specs/` files (root or per-app)                                 |

### Examples

```
feat(apps/1-ai-flashcards-api): add deck CRUD endpoints
fix(packages/shared-utils): handle null input in formatDate
build(workspace): update turbo.json pipeline
docs(specs): add root TLC spec-driven scaffold
```

## Branching

- `main` — stable trunk; all project work merges here via PR.
- Feature branches: `<type>/<short-description>` (e.g. `feat/flashcards-deck-crud`)
- No long-lived branches per project; use the numbered prefix in the scope instead.

## Requirement ID Namespace Table

Each requirement tracked in `.specs/` files uses a namespaced ID for traceability.

| Prefix  | Scope                                                       |
| ------- | ----------------------------------------------------------- |
| `MONO-` | Workspace and tooling requirements (root-level concerns)    |
| `PKG-`  | Shared package requirements (any package under `packages/`) |
| `APP1-` | Project 1 — AI Flashcards                                   |
| `APP2-` | Project 2 — Invoice Automation                              |
| `APP3-` | Project 3 — Life OS                                         |
| `APP4-` | Project 4 — Financial OS                                    |
| `APP5-` | Project 5 — Team Knowledge Copilot                          |
| `APP6-` | Project 6 — Payments Domain                                 |
| `APP7-` | Project 7 — Ramp Clone                                      |
| `APP8-` | Project 8 — Personal ERP                                    |
| `APP9-` | Project 9 — Enterprise Operating System                     |
| `CI-`   | CI/CD and build pipeline requirements                       |

Within each namespace, IDs are sequential integers: `APP1-001`, `APP1-002`, etc.
