# ADR-020: Shared contracts package, not shared domain models

- **Status:** Accepted
- **Date:** 2026-06-04
- **Deciders:** Renato de Matos
- **Requirement IDs:** PKG-001

## Context

Across the program, most projects have multiple apps that must agree on the shape of data crossing the wire: a `-web` (Next.js) and frequently a `-mobile` (Expo) client talking to a `-api` (NestJS) server. There are two distinct kinds of "type" these apps could share, and conflating them is a classic way to leak backend concerns into frontends:

- **Domain model** — entities with behaviour and invariants (a `Deck` enforcing a non-empty title, a `Card` that knows it belongs to exactly one deck), value objects, and domain services. This is server-side business logic.
- **Contract** — the plain, serializable request/response shapes (DTOs) that the api exposes and clients consume.

Sharing a rich domain model across the wire drags server-only concerns into the client and forces the ESM↔CommonJS boundary (ADR-002) onto the domain layer. Sharing nothing lets client and server type definitions drift apart silently. With up to three consumers of one api (web, mobile, api itself), an agreed contract earns its keep.

## Decision

We will keep the two concerns in separate homes:

- **Rich domain models stay local to each `-api` app** (inside the NestJS module, e.g. `src/domain/`). They are never exported to clients.
- **API contracts live in a dedicated `@product-engineer/shared-contracts` package**, consumed by the `-web`, `-mobile`, and `-api` workspaces of a project. `@product-engineer/shared-types` is reserved for cross-cutting primitives (`Id`, `Timestamped`), not per-project contracts.

Contracts are defined as **Zod schemas as the single source of truth**: the api validates inbound payloads against the schema at its boundary; web and mobile infer their TypeScript types from the same schema. `shared-contracts` stays framework-neutral — no UI and no server-framework imports — so it remains CommonJS-importable by NestJS apps (ADR-002). Per ADR-004 the package is wired into an app deliberately when the project needs it; it is not pre-installed.

## Consequences

### Positive

- Clients and server cannot drift: one schema defines the wire shape for every consumer.
- Runtime validation on the api boundary and static types on the clients come from a single definition — no duplicated or hand-mirrored DTOs.
- Backend concerns stay backend: behaviour and invariants never ship to the client, and the domain layer is free of the ESM/CJS sharing constraint.
- A framework-neutral contract package sidesteps the dual-module friction that sharing a domain model would create.

### Negative

- A score-10 app technically needs less than this; establishing the pattern is a small upfront cost paid for the precedent it sets across projects 1–9.
- Contributors must consciously place a type in the right home (contract vs domain vs primitive) rather than defaulting to one shared bucket.

### Neutral

- `shared-contracts` starts as an empty stub like the other shared packages; contracts are added per project.
- Zod is added as a dependency of `shared-contracts` when the first contract is defined, not at scaffold time.

## Alternatives Considered

- **Fold contracts into `shared-types`:** simpler, but mixes per-project, churn-prone contracts with stable cross-cutting primitives, and all nine projects' contracts pile into one package over time. Rejected in favour of a dedicated package with a single responsibility.
- **Share the rich domain model directly:** lets clients reuse domain logic, but leaks server concerns into frontends, forces the domain layer across the ESM/CJS boundary, and couples clients to internal model changes. Rejected.
- **Share nothing; hand-write DTOs on each side:** zero shared package, but client and server types drift silently and every contract change must be mirrored by hand in up to three places. Rejected.

## Links

- Builds on [ADR-002](002-nestjs-stays-commonjs.md) (CJS-importability constraint) and [ADR-004](004-apps-prewire-config-only.md) (deliberate wiring).
- See [docs/08-ddd-guidelines.md](../08-ddd-guidelines.md) for the contract/domain boundary in the DDD context.
