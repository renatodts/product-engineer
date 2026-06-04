# Project: Product Engineer

## Vision

Product Engineer is a **product-engineering gym** — a monorepo containing 9 real-world projects
of increasing complexity (scores 10 → 100) for practicing the full product loop: talk to the user,
decide what to build, build it, observe, iterate. Each project is a complete,
production-representative system built with modern tools and developed using the TLC Spec-Driven
workflow, with AI used as a multiplier rather than the identity of the work.

The goal is not just to ship features, but to develop fluency in the full lifecycle: product
sense, spec-first thinking, test-driven implementation, AI-assisted execution, and clean commit
discipline — across progressively harder domains. Code is cheap; clarity and judgment are expensive.

## Goals

1. **Learn by doing** — each project adds meaningful complexity over the last; nothing is a toy
   example.
2. **AI as a multiplier** — every project deliberately uses AI tools for spec generation,
   test scaffolding, and code review, while ownership of what to build stays human.
3. **Production-grade scaffolding** — shared configs, consistent tooling, and quality gates from
   day one.
4. **Spec-driven memory** — persistent `.specs/` directories in every app capture decisions,
   architecture, and state so sessions can resume without context loss.

## Tech Stack

| Concern                     | Choice                                                                   |
| --------------------------- | ------------------------------------------------------------------------ |
| Monorepo orchestration      | Turborepo (pipeline caching + task graph)                                |
| Workspace manager           | PNPM workspaces                                                          |
| Language                    | TypeScript 5.x                                                           |
| Runtime                     | Node.js 22                                                               |
| Web framework               | Next.js (App Router)                                                     |
| Mobile framework            | Expo (React Native)                                                      |
| API framework               | NestJS                                                                   |
| Unit testing (web/packages) | Vitest                                                                   |
| Unit testing (API)          | Jest + supertest                                                         |
| E2E testing                 | Playwright                                                               |
| Shared configs              | `@product-engineer/typescript-config`, `@product-engineer/eslint-config` |

## Complexity Progression

| #   | Project                     | Complexity Score |
| --- | --------------------------- | ---------------- |
| 1   | AI Flashcards               | 10               |
| 2   | Invoice Automation          | 25               |
| 3   | Life OS                     | 35               |
| 4   | Financial OS                | 50               |
| 5   | Team Knowledge Copilot      | 60               |
| 6   | Payments Domain             | 70               |
| 7   | Ramp Clone                  | 75               |
| 8   | Personal ERP                | 85               |
| 9   | Enterprise Operating System | 100              |

## Key Constraints

**NestJS is CommonJS.** NestJS apps stay in CommonJS because of decorator stability and the
NestJS CLI. ESM support in NestJS v12 is not yet confirmed. All other code (packages, Next.js
apps, Expo, Vitest configs) is ESM. This creates a dual module system in the repo and must be
respected in every tsconfig and test runner config.

**Apps pre-wire only the two config packages.** In the scaffold state, every app only installs
`@product-engineer/typescript-config` and `@product-engineer/eslint-config` as devDeps. No
shared library packages (e.g. `@product-engineer/ui`, `@product-engineer/shared-utils`) are
pre-wired into apps. Each project adds shared packages as its own requirements dictate. This
avoids forced coupling between projects at different complexity levels.
