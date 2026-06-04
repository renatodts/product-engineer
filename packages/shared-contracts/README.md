# @product-engineer/shared-contracts

API contracts shared across a project's apps — the serializable request/response shapes that cross
the wire between the `-web`, `-mobile`, and `-api` workspaces.

Contracts are defined as **Zod schemas as the single source of truth**: the api validates inbound
payloads against the schema at its boundary, while web and mobile infer their TypeScript types from
the same schema. This package is framework-neutral (no UI, no server-framework imports) so it stays
CommonJS-importable by NestJS apps (ADR-002).

**Share contracts, not domain models.** Rich domain entities with behaviour and invariants stay
local to each `-api` app. See [ADR-020](../../docs/adrs/020-shared-contracts-not-domain-models.md)
and [docs/08-ddd-guidelines.md](../../docs/08-ddd-guidelines.md).

> No real contracts yet. Added per project as needed (ADR-004). Zod is added as a dependency when
> the first contract is defined.
