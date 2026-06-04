---
description: Phase 2 Implementation - execute the spec with TLC SDD and the right per-stack skill
argument-hint: [feature slug]
---

You are running Phase 2 (Implementation) of the SDLC harness in CLAUDE.md.

Precondition: a spec or plan from `/analyze` exists in `.specs/`. If none exists, stop and run
`/analyze` first.

1. Invoke `tlc-spec-driven` (Execute). It always lists atomic steps inline before editing; if that
   listing reveals more than 5 steps or complex dependencies, create a formal `tasks.md` first.
2. Invoke the per-stack skill that matches the target (see the decision tree in CLAUDE.md):
   - `apps/*-api` (NestJS, CJS): `nestjs-modular-monolith` (+ `tactical-ddd` / `domain-analysis`
     for domain or schema work; update Zod in `shared-contracts`, keep it CJS-importable).
   - `apps/*-web` (Next.js): `react-best-practices`; net-new UI also `frontend-design`; component
     APIs also `react-composition-patterns`.
   - `apps/*-mobile` (Expo): `react-native-expert`.
   - `packages/ui`, `packages/design-system`: `react-composition-patterns`.
3. Honor the ADRs: ADR-002 (NestJS stays CJS), ADR-004 (add a shared package only when needed,
   as a deliberate choice), ADR-020 (contracts as Zod in `shared-contracts`, not domain models).
4. Commit in atomic Conventional Commits. Scope = dir name without the `@product-engineer/` or
   `apps/` prefix, e.g. `feat(ai-flashcards/web): ...`. Never use `--no-verify`.

When each task's "Done when" is met, hand off to `/validate`.

Feature: $ARGUMENTS
