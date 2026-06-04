# Product Engineer

> A product-engineering gym: own the full loop — talk to the user, decide what to build, build, observe, iterate.

Nine real-world projects of rising complexity — built with AI assistance, shipped as public portfolio artifacts — to train the engineering judgment that matters in 2026 and beyond.

## Vision

Reading about software engineering is not the same as doing it. This repository is a structured learning program where every project is a real artifact: a working application, a proper monorepo package, tested code, and documented decisions.

A Product Engineer owns the full loop — talk to the user, decide what to build, build it, observe what happens, iterate. The bottleneck is no longer how fast you can write code; with AI, code is cheap. The bottleneck is deciding _what_ to build and iterating fast enough to find the truth. AI is the multiplier that makes that loop run faster — a tool, not the identity of the work.

The goal is not just to ship features. It is to build the depth of judgment — product sense, architecture, testing, observability, and domain modelling — that distinguishes someone who can find and solve the right problem from someone who can prompt their way to a prototype.

## Complexity Levels

Projects are scored from 10 to 100. The score reflects cumulative complexity across three axes:

- **Domain complexity** — how deep the business logic runs (CRUD vs. event-driven vs. financial ledgers vs. enterprise multi-tenancy)
- **Architectural complexity** — number of moving parts, integration surface, separation of concerns required
- **Infrastructure complexity** — deployment, observability, scaling concerns, data consistency guarantees

A score-10 project is intentionally approachable: one domain, one integration, conventional patterns. A score-100 project demands production-grade thinking across every axis simultaneously. Each step up is deliberate — new concepts are introduced one layer at a time.

## Projects

| Score | Project                     | Focus                                              |
| ----- | --------------------------- | -------------------------------------------------- |
| 10    | AI Flashcards               | AI integration basics, full-stack scaffolding      |
| 25    | Invoice Automation          | Document processing, background jobs, webhooks     |
| 35    | Life OS                     | Personal productivity domain, relational modelling |
| 50    | Financial OS                | Multi-currency, ledger design, data integrity      |
| 60    | Team Knowledge Copilot      | RAG pipelines, vector search, multi-tenancy basics |
| 70    | Payments Domain             | DDD, idempotency, event-driven architecture        |
| 75    | Ramp Clone                  | Complex UI, role-based access, spend management    |
| 85    | Personal ERP                | Process orchestration, module boundaries, CQRS     |
| 100   | Enterprise Operating System | Large-scale architecture, platform engineering     |

## How AI Fits the Build Loop

Every project follows the **TLC Spec-Driven** workflow:

1. **Specify** — define requirements, constraints, and success criteria
2. **Design** — produce a technical design doc with ADRs for key decisions
3. **Tasks** — break the design into atomic, verifiable implementation tasks
4. **Execute** — implement task by task with verification gates

Memory across sessions lives in [`.specs/`](.specs/) — handoff docs, codebase snapshots, and project context that let AI agents resume work without losing context.

Reusable AI playbooks live in [`docs/ai/`](docs/ai/README.md), covering prompt engineering, feature generation, test generation, debugging, and architecture review. The broader philosophy is documented in [`docs/12-ai-assisted-development.md`](docs/12-ai-assisted-development.md).

## Repository Structure

```
product-engineer/
├── apps/                          # 17 application workspaces (flat, single-digit prefix)
│   ├── 1-ai-flashcards-web/       # Next.js App Router
│   ├── 1-ai-flashcards-mobile/    # Expo
│   ├── 1-ai-flashcards-api/       # NestJS
│   ├── 2-invoice-automation-web/
│   ├── 2-invoice-automation-api/
│   └── ...                        # same pattern through project 9
│
├── packages/                      # 12 shared packages (all @product-engineer/*)
│   ├── typescript-config/         # Base tsconfig presets
│   ├── eslint-config/             # Shared ESLint rules
│   ├── ui/                        # Shared React component library
│   ├── design-system/             # Design tokens and theme
│   ├── shared-types/              # Cross-cutting TypeScript types
│   ├── shared-contracts/          # API contracts (Zod) shared across web/mobile/api
│   ├── shared-utils/              # Pure utility functions
│   ├── shared-domain/             # Domain primitives (Value Objects, etc.)
│   ├── shared-ai/                 # AI client wrappers and utilities
│   ├── shared-auth/               # Auth helpers
│   ├── shared-observability/      # Logging, tracing, metrics
│   └── shared-testing/            # Test factories and helpers
│
├── docs/                          # Engineering reference docs
│   ├── ai/                        # AI playbooks and agent guidelines
│   ├── adrs/                      # Architecture Decision Records
│   └── *.md                       # Numbered guideline docs (01–20)
│
├── templates/                     # Scaffolding templates for new apps/packages
└── .specs/                        # TLC Spec-Driven session memory
```

## Getting Started

**Prerequisites**

- Node.js `>=22`
- pnpm `10.11.0` — install with `npm install -g pnpm@10.11.0`

**Install**

```bash
pnpm install
```

**Build, typecheck, and test**

```bash
pnpm turbo typecheck build test
```

**End-to-end tests** (opt-in)

```bash
pnpm playwright install
pnpm turbo test:e2e
```

## Learning Philosophy

Building beats reading. Tutorials demonstrate; projects reveal.

Every project in this repo exists because real complexity only shows up when the whole system runs — when a background job fails silently, when a ledger entry violates a constraint under concurrency, when a RAG pipeline returns hallucinated citations, when a role check has a gap you did not think to test.

The goal is deliberate exposure: pick a project at the right difficulty, build it end to end, hit the real problems, make the real decisions, and write down what you learned. Repeat at the next level.

AI tooling is part of the curriculum, not a shortcut around it. Using AI well requires knowing enough to review what it produces, to write the spec that guides it, and to catch the plausible-but-wrong output. That judgment is what this gym builds.

See [`docs/03-ai-development-philosophy.md`](docs/03-ai-development-philosophy.md) and [`docs/05-engineering-growth-framework.md`](docs/05-engineering-growth-framework.md) for the full reasoning.

## Progress Tracking

- [x] Foundation — monorepo scaffold, tooling, shared packages, app stubs
- [ ] Score 10 — AI Flashcards
- [ ] Score 25 — Invoice Automation
- [ ] Score 35 — Life OS
- [ ] Score 50 — Financial OS
- [ ] Score 60 — Team Knowledge Copilot
- [ ] Score 70 — Payments Domain
- [ ] Score 75 — Ramp Clone
- [ ] Score 85 — Personal ERP
- [ ] Score 100 — Enterprise Operating System

## License

[MIT](./LICENSE)
