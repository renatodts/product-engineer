# Handoff

Use this file to capture the state of work at the end of a session so the next session can
resume without context loss.

---

## Date

2026-06-05

## Current Feature / Task

**Project 1 — AI Flashcards** (`.specs/features/ai-flashcards/`). Implementation via TLC SDD.
Phases 1 (Foundation), 2 (API), 3 (Web), and CI (T16) are **done, verified, and pushed as two
open PRs**. Only **Phase 4 mobile (T14–T15)** remains.

## Completed (all gates green, atomic commits)

Branch `feat/ai-flashcards/foundation` → **PR #6** (backend), CI green:

- T1 `shared-contracts` Zod schemas `ad9ef71`
- T2 `shared-ai` AiCardGenerator port + FakeAiCardGenerator `5e3dd77`
- T4 SM-2 scheduler `2421df9`
- T3 Prisma + Postgres + PrismaService `dffd9f7`
- T5 DecksModule `5ae6b1f` · T6 CardsModule `9a8ab59` · T7 ReviewModule `a6586b5`
- T8b Anthropic adapter `e8dc50e` · T8 GenerationModule `f725fce`
- T16 Postgres service in CI `cb924df` + `passThroughEnv` fix for DATABASE_URL
- Backend tests: **81 green** (23 contracts + 13 shared-ai + 45 api unit+integration).

Branch `feat/ai-flashcards/web` (stacked on foundation) → **PR #7** (web), CI green:

- T9 api client `8cf2368` · T10 deck list `c6f7295` · T11 card mgmt `cfaa4f7`
- T12 generation panel `7793281` · T13 review session `55a723a`
- Web tests: **26 unit + 8 Playwright E2E green**, `next build` clean.

## In Progress

None. Both PRs are complete and awaiting review/merge.

## Pending (not started)

**Phase 4 — Mobile (Expo), branch off `feat/ai-flashcards/web` (or `main` after merges):**

- **T14** mobile decks screen — list decks + due counts from the api, using `EXPO_PUBLIC_API_URL`
  (default `http://localhost:4001`). Reuse contracts types. Vitest component test with the existing
  RN stubs under `apps/1-ai-flashcards-mobile/test/stubs`. Gate: full.
- **T15** mobile review screen — flip due cards, grade 0–5, post to api. Depends on T14. Gate: full.

Mobile has **no `/api` proxy** (it's not a web server) — the mobile api client calls
`EXPO_PUBLIC_API_URL` directly, so the api host must be reachable from the device/emulator.
See the T14/T15 task definitions in `tasks.md`.

## Merge order

Merge **#6 first**, then **#7** (its base auto-retargets to `main` so the web diff goes clean).
The mobile PR should branch from whatever is latest (`main` after merges, else `feat/ai-flashcards/web`).

## Blockers

- **BL-001** (pre-existing, in STATE.md): shared `typescript-config` preset's `outDir` makes every
  `*-api` `nest build` emit into `packages/typescript-config/dist/`. Not gated by `ci-gate`; needs a
  separate `build(typescript-config)` fix. Do NOT let it block mobile work.

## Environment / how to resume

- **Postgres** runs locally via `apps/1-ai-flashcards-api/docker-compose.yml` (host port **5433**).
  Start: `docker compose up -d` from the api dir. Dev DB `flashcards`; tests use `flashcards_test`.
- **Local env files (gitignored, recreate if missing):**
  - `apps/1-ai-flashcards-api/.env` → `DATABASE_URL=postgresql://flashcards:flashcards@localhost:5433/flashcards?schema=public`
  - `apps/1-ai-flashcards-api/.env.test` → same but `/flashcards_test`
- Test DB must exist + be migrated:
  `docker exec ai-flashcards-postgres psql -U flashcards -d flashcards -c "CREATE DATABASE flashcards_test;"`
  then `DATABASE_URL=...flashcards_test pnpm --filter @product-engineer/1-ai-flashcards-api exec prisma migrate deploy`.
- **Playwright** browsers: `pnpm --filter @product-engineer/1-ai-flashcards-web exec playwright install chromium` once.
- Gates: `pnpm turbo lint typecheck test --filter=<workspace>`; web also `... build` + `... test:e2e`.
  Run `pnpm format` before committing (pre-commit runs `format:check` + lint; never `--no-verify`).

## Conventions learned this build (apply for mobile)

- Jest (api) runs **serially** (`maxWorkers: 1`) because integration suites share one Postgres DB.
- Web/api consume the ESM-TS `shared-*` packages fine in Vitest/Jest (pnpm symlinks resolve outside
  `node_modules`); **Next** app code must use **extensionless** relative imports.
- SPEC_DEVIATIONs (documented in code): per-route Zod pipe (not global); accept route `/cards/accept`.
- ADR-004 deliberate deps already added: api←`prisma`,`@prisma/client`,`zod`,`dotenv`,`shared-contracts`,`shared-ai`;
  shared-contracts←`zod`; shared-ai←`@anthropic-ai/sdk`; web←`shared-contracts` (type-only).

## Uncommitted Changes

None — working tree clean.

## Branch

`feat/ai-flashcards/web` (current). `feat/ai-flashcards/foundation` also present. Both pushed.
