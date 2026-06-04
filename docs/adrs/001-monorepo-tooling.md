# ADR-001: Turborepo + PNPM with a flat package layout

- **Status:** Accepted
- **Date:** 2026-06-04
- **Deciders:** Renato de Matos
- **Requirement IDs:** MONO-001

## Context

The gym hosts nine projects of rising complexity, each with multiple apps (web, api, mobile) plus a set of shared packages. We need a single repository that keeps all of this buildable, testable, and cacheable from day one, without forcing a heavy workspace structure before there is any business logic to justify it.

Two axes had to be decided together: the task orchestrator and the package topology.

## Decision

We will use **Turborepo** for task orchestration and **PNPM workspaces** for dependency management, with a **flat package layout** — every package lives directly under `packages/` at the same depth, and every app lives directly under `apps/`. There is no nested grouping (no `packages/shared/utils`).

App directories follow `<project-number>-<project-slug>-<app-type>` so filesystem sort order matches the complexity progression.

## Consequences

### Positive

- A single Turborepo pipeline definition covers the whole repo; caching and affected-only runs come for free.
- All packages are peers, so the dependency graph stays legible — there is no hidden hierarchy to reason about.
- PNPM's content-addressed store keeps install size low across 17 apps and 11 packages.

### Negative

- A flat `packages/` directory can become crowded as the number of shared packages grows; naming discipline (the `shared-*` prefix) is the only grouping mechanism.
- No sub-workspace isolation: a careless dependency can couple two unrelated projects unless reviewed (see [ADR-004](004-apps-prewire-config-only.md)).

### Neutral

- If crowding ever becomes a real problem, PNPM supports nested workspace globs, so this decision is reversible without changing the orchestrator.

## Alternatives Considered

- **Nx instead of Turborepo:** richer generators and dependency-graph tooling, but heavier configuration and a larger conceptual surface than a learning repo needs at this stage. Turborepo's pipeline model is enough.
- **npm/yarn workspaces:** workable, but slower installs and no content-addressed store; PNPM is the better fit for many small packages.
- **Nested package grouping (`packages/shared/*`):** premature. It adds path depth and workspace-glob complexity to solve a crowding problem that does not exist yet.
