# ADR-002: NestJS apps stay CommonJS while the rest of the repo is ESM

- **Status:** Accepted
- **Date:** 2026-06-04
- **Deciders:** Renato de Matos
- **Requirement IDs:** MONO-002

## Context

The repository standardises on ESM — Next.js apps, Expo, and every shared package use `"type": "module"` and ESM-native tooling. NestJS, however, leans on `reflect-metadata`, decorator emit, and a CLI ecosystem that assume CommonJS semantics. Forcing NestJS into ESM at scaffold time risks subtle runtime and tooling breakage before any feature exists.

## Decision

We will keep all NestJS apps (`*-api`) on **CommonJS**: `"module": "CommonJS"` in their tsconfig, no `"type": "module"` in their `package.json`. The rest of the monorepo stays ESM. This makes the repo deliberately dual-module.

## Consequences

### Positive

- NestJS decorators, the Nest CLI, and the bulk of the Nest ecosystem work without workarounds.
- Jest + `ts-jest` + supertest (the conventional Nest test stack) run cleanly without ESM transform gymnastics.

### Negative

- The repo carries two module systems. Any shared package consumed by a NestJS app must be importable from CommonJS — i.e. it needs CJS-compatible output or dual CJS/ESM exports.
- Contributors must remember which side of the boundary they are on when wiring a shared package into an api.

### Neutral

- This is revisited when NestJS ESM support is confirmed stable in the version we run; the boundary is documented so the migration scope is known in advance.

## Alternatives Considered

- **Force NestJS to ESM now:** possible but fragile — decorator metadata and several Nest ecosystem packages still assume CJS. Not worth the risk before there is business logic.
- **Make the whole repo CommonJS:** would harmonise the module system but drag Next.js and modern ESM-only libraries backward. The cost lands on the majority of the repo to suit one framework.
