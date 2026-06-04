# 20 — Recruiter Guide

This document explains how to read this repository if you are a recruiter, hiring manager, or engineer evaluating this work. It describes what the repo is, what it demonstrates, and where to look for evidence of specific skills.

If you are short on time: start with [01-ramp-up-roadmap.md](01-ramp-up-roadmap.md) to understand the structure, then navigate to the highest-numbered completed project and read its retrospective in `.specs/<project-name>/retrospective.md`.

---

## What This Repository Is

This is a personal product-engineering gym — a monorepo of 9 software projects at rising complexity (scored 10 → 100) built to develop and demonstrate the full product loop: deciding what to build, building it, observing, and iterating, with AI used as a multiplier. It is not a tutorial repository or a fork of existing projects. Every system is designed from scratch with real product decisions, real engineering trade-offs, and real production concerns.

The projects are real products: an AI-powered flashcard app, an invoice automation system, a financial operating system, a payments platform, and eventually a multi-tenant enterprise operating system. They are built to production standards within the time constraints of a self-directed learning project.

---

## What This Repository Demonstrates

### Engineering Fundamentals

- **Monorepo tooling**: Turborepo + PNPM workspaces with a multi-stage pipeline (lint → typecheck → build → test → E2E). See [07-monorepo-architecture.md](07-monorepo-architecture.md).
- **TypeScript discipline**: strict mode, shared tsconfig, no `any` in production code (enforced by ESLint). See [06-repository-conventions.md](06-repository-conventions.md).
- **Testing**: Vitest (ESM packages/web), Jest (NestJS APIs), and Playwright (E2E). Coverage targets enforced in CI. See [10-testing-guidelines.md](10-testing-guidelines.md).
- **Conventional Commits + commitlint**: every commit is typed, scoped, and machine-readable. Run `git log --oneline` in any project directory.

### Domain-Driven Design

Projects 3–9 apply DDD tactical patterns with increasing depth: value objects, entities, aggregate roots, domain events, bounded contexts, anti-corruption layers. The progression is intentional — DDD is introduced where it earns its complexity, not as a dogma applied uniformly.

See [08-ddd-guidelines.md](08-ddd-guidelines.md) for the conventions and any completed project's domain layer for the implementation.

### AI as a Multiplier

This repo treats AI as a multiplier on execution — a tool with a defined workflow (TLC Spec-Driven: Specify → Design → Tasks → Execute), explicit failure cases, and a prompt library — while ownership of what to build stays human. The approach is pragmatic: AI is used where it has leverage (spec drafting, code review, test generation), not where it is unreliable (domain correctness, architecture fitness, consequential product decisions).

See [12-ai-assisted-development.md](12-ai-assisted-development.md), [13-ai-code-review.md](13-ai-code-review.md), and [15-ai-failure-cases.md](15-ai-failure-cases.md).

### Production Engineering Practices

Higher-complexity projects introduce observability (structured logging, distributed tracing, SLO dashboards), event-driven architecture (outbox pattern, sagas, idempotency), and multi-tenant design. These are not architectural buzzwords dropped into a README — they are implemented, documented in ADRs, and reflected in the project's testing and operational runbooks.

---

## Where to Look for Evidence of Specific Skills

| Skill                          | Where to Look                                            |
| ------------------------------ | -------------------------------------------------------- |
| TypeScript + NestJS API design | `apps/0N-<project>/api/src/` for any completed project   |
| Next.js App Router             | `apps/0N-<project>/web/src/app/`                         |
| Domain modeling (DDD)          | Projects 3+, `src/domain/` directories                   |
| Event-driven architecture      | Projects 5+, `src/infrastructure/messaging/`             |
| Testing discipline             | Any `*.spec.ts` file; coverage reports in CI             |
| AI workflow                    | `.specs/<project>/` for specs, tasks, and retrospectives |
| Architecture decisions         | `docs/adrs/`                                             |
| Production observability       | Projects 7+, `src/infrastructure/observability/`         |
| Monorepo / build tooling       | `turbo.json`, `pnpm-workspace.yaml`, `packages/`         |

---

## How to Evaluate the Work

### Signal: the retrospectives

The project retrospectives in `.specs/<project-name>/retrospective.md` are honest reflections on what was hard, what the AI got wrong, and what technical debt was accepted and why. An engineer who can reflect honestly on their own work and extract lessons is more valuable than one who can only describe successes.

### Signal: the ADRs

The ADRs in `docs/adrs/` show how architectural decisions were made. An ADR that documents genuine trade-offs (including the downsides of the chosen option) demonstrates mature engineering judgement.

### Signal: the commit history

`git log --oneline` in any completed project shows atomic commits, Conventional Commit types, and requirement ID traceability. This is operational evidence of the workflow described in [06-repository-conventions.md](06-repository-conventions.md).

### Signal: the AI failure cases

`docs/15-ai-failure-cases.md` documents cases where AI produced incorrect output and the lessons drawn. An engineer who can identify the limits of their tools and build processes to compensate is ready for production systems.

---

## Questions This Repo Is Designed to Answer

- Can this engineer design a system, not just implement one?
- Does this engineer understand trade-offs, or do they just apply patterns?
- Can this engineer work effectively with AI tools while maintaining technical ownership?
- Does this engineer write tests that catch real bugs, or tests that just pass?
- Does this engineer leave the codebase better than they found it?

If the work in this repository does not answer all of these questions for you, I would welcome a conversation. Contact details are in the GitHub profile linked from this repo.
