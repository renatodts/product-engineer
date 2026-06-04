# Structure

## Directory Tree (3 levels)

```
product-engineer/
├── .specs/                         # Root TLC spec-driven memory
│   ├── project/
│   │   ├── PROJECT.md
│   │   ├── ROADMAP.md
│   │   └── STATE.md
│   ├── codebase/
│   │   ├── ARCHITECTURE.md
│   │   ├── CONVENTIONS.md
│   │   ├── INTEGRATIONS.md
│   │   ├── STACK.md
│   │   ├── STRUCTURE.md
│   │   ├── TESTING.md
│   │   └── CONCERNS.md
│   └── HANDOFF.md
├── apps/
│   ├── 1-ai-flashcards-web/        # Next.js, complexity 10, port 3001
│   ├── 1-ai-flashcards-mobile/     # Expo, complexity 10
│   ├── 1-ai-flashcards-api/        # NestJS, complexity 10, port 4001
│   ├── 2-invoice-automation-web/   # Next.js, complexity 25, port 3002
│   ├── 2-invoice-automation-api/   # NestJS, complexity 25, port 4002
│   ├── 3-life-os-web/              # Next.js, complexity 35, port 3003
│   ├── 3-life-os-api/              # NestJS, complexity 35, port 4003
│   ├── 4-financial-os-web/         # Next.js, complexity 50, port 3004
│   ├── 4-financial-os-api/         # NestJS, complexity 50, port 4004
│   ├── 5-team-knowledge-copilot-web/  # Next.js, complexity 60, port 3005
│   ├── 5-team-knowledge-copilot-api/  # NestJS, complexity 60, port 4005
│   ├── 6-payments-domain-api/      # NestJS, complexity 70, port 4006
│   ├── 7-ramp-clone-web/           # Next.js, complexity 75, port 3007
│   ├── 7-ramp-clone-api/           # NestJS, complexity 75, port 4007
│   ├── 8-personal-erp-web/         # Next.js, complexity 85, port 3008
│   ├── 8-personal-erp-api/         # NestJS, complexity 85, port 4008
│   └── 9-enterprise-operating-system/  # Next.js, complexity 100, port 3009
├── packages/
│   ├── typescript-config/          # Shared tsconfig bases
│   ├── eslint-config/              # Shared ESLint flat configs
│   ├── ui/                         # React component library (Button, Card, Text)
│   ├── design-system/              # Design tokens
│   ├── shared-types/               # Cross-cutting TypeScript types
│   ├── shared-utils/               # Pure utility functions
│   ├── shared-domain/              # Domain primitives (ValueObject, Entity)
│   ├── shared-ai/                  # Prompt builder and AI helpers
│   ├── shared-auth/                # Auth types and JWT helpers
│   ├── shared-observability/       # Structured logger
│   └── shared-testing/             # Test factories and fixtures
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── package.json
```

## Where Things Live

| Thing                          | Location                         |
| ------------------------------ | -------------------------------- |
| TypeScript config bases        | `packages/typescript-config/`    |
| ESLint config compositions     | `packages/eslint-config/`        |
| Shared React UI components     | `packages/ui/`                   |
| Design tokens                  | `packages/design-system/`        |
| Cross-cutting TypeScript types | `packages/shared-types/`         |
| Pure utility functions         | `packages/shared-utils/`         |
| Domain base classes            | `packages/shared-domain/`        |
| AI prompt helpers              | `packages/shared-ai/`            |
| Auth types and JWT             | `packages/shared-auth/`          |
| Structured logger              | `packages/shared-observability/` |
| Test factories                 | `packages/shared-testing/`       |
| Web apps                       | `apps/*-web/`                    |
| Mobile apps                    | `apps/*-mobile/`                 |
| API apps                       | `apps/*-api/`                    |
| Per-app spec memory            | `apps/*/.specs/`                 |
| Root spec memory               | `.specs/`                        |
| Turborepo pipeline             | `turbo.json`                     |
| PNPM workspace definition      | `pnpm-workspace.yaml`            |
