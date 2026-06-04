# AGENTS.md

Entry point for any coding agent (Codex, Gemini CLI, and others). The single source of truth is
[CLAUDE.md](./CLAUDE.md): read its "SDLC harness (start here)" section first, then follow it. This
file is a thin pointer so non-Claude runtimes land in the same flow.

## What this repo is

A learning-program monorepo (Turborepo + pnpm workspaces, `pnpm@10.11.0`, Node `>=22`): nine
projects of rising complexity under `apps/`, shared libs under `packages/`. Most apps are stubs.

## The flow (see CLAUDE.md for the full table)

For any non-trivial change, produce a spec or plan before any code. Phases:

1. Analysis and Spec -> write `.specs/features/<slug>/spec.md` or `.specs/quick/NNN-slug/TASK.md`.
2. Implementation -> atomic Conventional Commits.
3. Local validation -> `pnpm format` then `pnpm turbo lint typecheck test build --filter=...[origin/main]`.
4. Self-review and PR -> branch `feat|fix|chore/<scope>/<slug>`; open the PR.
5. CI and merge -> `lint-format` + `type-check` + `unit-tests` -> `ci-gate` (the merge gate).
6. Deploy -> none yet (no CD pipeline or environments exist).

## Commands (real, copy-pasteable)

```bash
pnpm install                                                  # --frozen-lockfile in CI
pnpm format                                                   # Prettier write (run before commit)
pnpm turbo lint typecheck test build --filter=...[origin/main]  # local validation sweep
pnpm turbo test:e2e                                          # Playwright E2E (opt-in; run `pnpm playwright install` first)
pnpm --filter <workspace> exec vitest run path/to/file.test.ts  # single Vitest test (packages, *-web)
pnpm --filter <workspace> exec jest path/to/file.spec.ts        # single Jest test (*-api)
```

## Skills and ADRs

This repo vendors a curated skill set under `.claude/skills/`; the decision tree in CLAUDE.md routes
each task type to the right one (default driver: `tlc-spec-driven`). Honor the settled ADRs in
`docs/adrs/` (notably ADR-002 NestJS stays CommonJS, ADR-004 deliberate shared-package deps, ADR-020
contracts as Zod in `shared-contracts`). Never bypass git hooks with `--no-verify`; run `pnpm format`
and re-stage instead.
