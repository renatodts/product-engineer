# Context — AI Flashcards (Project 1)

> Decisions captured during the Specify/Discuss step (Phase 1). These resolve the gray areas that
> were ambiguous from the repo alone and lock the boundaries the spec is written against.

| #   | Decision               | Choice                              | Rationale                                                                                  |
| --- | ---------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | Spec scope             | **All three apps** (api+web+mobile) | One coherent product surface for the first project; clients consume the same contracts.    |
| 2   | Persistence            | **Postgres + Prisma**               | Production-representative; real migrations and durability. Run via Docker locally + CI.    |
| 3   | AI card generation     | **Real Anthropic SDK** (Claude)     | `@product-engineer/shared-ai` wraps `@anthropic-ai/sdk`; generation endpoint calls Claude. |
| 4   | Spaced-repetition algo | **SM-2 (Anki-style)**               | Ease factor + interval from a 0–5 grade; the canonical, well-documented algorithm.         |

## Assumptions (defensible defaults — flag if wrong)

- **Single-user, no authentication.** Score-10 README scopes complexity as Low and auth was not
  requested. `shared-auth` is **not** wired in (respects ADR-004). Multi-user/auth is out of scope
  and deferred to a later project. All decks/cards belong to an implicit single owner.
- **AI offline in tests/CI.** Real Anthropic calls require `ANTHROPIC_API_KEY`; the generator is
  behind a port so unit/integration tests and CI run against a deterministic fake (no network, no
  key). Only a manual/local run or an explicitly-gated job hits the real model.
- **shared-contracts is the single source of truth** for wire shapes (Zod), per ADR-020. Rich
  domain models (Deck/Card/SM-2 state) stay local to the api in `src/domain/`.

## Out-of-band dependencies introduced

- New runtime deps added deliberately (ADR-004): `@product-engineer/shared-contracts` and
  `@product-engineer/shared-ai` into the api; `@product-engineer/shared-contracts` into web/mobile.
- New infra: a Postgres instance (Docker Compose for local; service container for any DB-backed CI job).
- New env: `DATABASE_URL` (api), `ANTHROPIC_API_KEY` (api, real-AI runs only).
