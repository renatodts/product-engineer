# ADR-004: Apps pre-wire only config packages, not shared libraries

- **Status:** Accepted
- **Date:** 2026-06-04
- **Deciders:** Renato de Matos
- **Requirement IDs:** MONO-004

## Context

The scaffold creates 17 apps before any of them has business logic. The shared `packages/` set includes domain, AI, auth, and observability libraries intended for the more advanced projects. A "batteries included" scaffold — pre-installing every shared package into every app — would create dependency edges that do not reflect any real need and would couple early projects to abstractions built for later ones.

## Decision

We will have every app pre-wire **only** the two config packages it genuinely needs at scaffold time: `@product-engineer/typescript-config` and `@product-engineer/eslint-config` (as devDependencies). No shared runtime library is pre-installed. Each project adds the shared packages it actually uses as it is built out.

## Consequences

### Positive

- The dependency graph reflects real usage, not scaffold convenience — a Project 1 app does not depend on Project 8's domain abstractions.
- Shared packages can evolve their APIs freely while no real consumer exists, avoiding premature interface lock-in.
- Keeps each project's first implementation session honest: wiring in a shared package is a deliberate, reviewable decision.

### Negative

- There is no instant "everything available" starting point; each project's first session must explicitly add the packages it needs.

### Neutral

- The config packages are the one exception because lint and tsconfig presets are needed before any feature code is written.

## Alternatives Considered

- **Pre-install all shared packages everywhere:** convenient, but manufactures dependency edges with no usage behind them and couples simple projects to advanced abstractions. Rejected.
- **No shared config packages either:** would mean duplicating tsconfig and ESLint setup across 17 apps — the exact boilerplate the config packages exist to remove. Rejected.
