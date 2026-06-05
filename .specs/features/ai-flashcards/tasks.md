# AI Flashcards Tasks

**Design:** `.specs/features/ai-flashcards/design.md`
**Spec:** `.specs/features/ai-flashcards/spec.md`
**Status:** Draft

> Gate commands (from TESTING.md): **quick** = `pnpm turbo lint typecheck`, **full** =
> `pnpm turbo lint typecheck test`, **e2e** = `pnpm turbo test:e2e`, **build** = `pnpm turbo build`.
> Scope each with `--filter=<workspace>` while iterating. Run `pnpm format` before committing.

---

## Execution Plan

### Phase 1 — Foundation (parallel)

```
T1 (contracts) ─┐
T2 (ai port)  ─┼─→ Phase 2
T3 (prisma)   ─┘
T4 (sm2)      ─┘  (pure, independent)
```

### Phase 2 — API (mostly sequential on T1/T3)

```
T1,T3 ──→ T5 (decks) ──→ T6 (cards) ──┬─→ T7 (review)        [needs T4]
                                       └─→ T8 (generation)    [needs T2]
T2 ──→ T8b (anthropic adapter) ──→ T8
```

### Phase 3 — Web (parallel after T9)

```
T1 ──→ T9 (api client) ──┬─→ T10 (decks)
                         ├─→ T11 (cards)
                         ├─→ T12 (generate)
                         └─→ T13 (review)
```

### Phase 4 — Mobile P2

```
T9-pattern ──→ T14 (decks screen) ──→ T15 (review screen)
```

### Phase 5 — CI

```
T7,T8 ──→ T16 (Postgres CI)
```

---

## Task Breakdown

### T1: shared-contracts Zod schemas [P] — ✅ Done (commit `ad9ef71`)

**What:** Define all wire-shape Zod schemas + inferred types.
**Where:** `packages/shared-contracts/src/` (replace stub `index.ts`; add `package.json` dep `zod`)
**Depends on:** None · **Reuses:** package shell · **Requirement:** APP1-006
**Tools:** context7 (`zod`) · Skill: NONE
**Done when:**

- [ ] Schemas: Deck(Create), Card(Create), GenerateRequest, CardSuggestion, AcceptSuggestions, ReviewSession, GradeRequest
- [ ] Each exports `z.infer` type; `GradeRequest.grade` is int 0–5; names non-empty
- [ ] CJS-import smoke test passes (schemas importable from a CommonJS context) — ADR-002/020
- [ ] Gate passes: `pnpm turbo lint typecheck test --filter=@product-engineer/shared-contracts`

**Tests:** unit (Vitest) · **Gate:** full

---

### T2: shared-ai generation port + fake [P] — ✅ Done (commit `5e3dd77`)

**What:** `AiCardGenerator` port + `FakeAiCardGenerator` (deterministic).
**Where:** `packages/shared-ai/src/` · **Depends on:** None · **Reuses:** `buildPrompt` · **Requirement:** APP1-008
**Tools:** NONE · Skill: NONE
**Done when:**

- [ ] `AiCardGenerator` interface + `CardSuggestion` type exported
- [ ] `FakeAiCardGenerator` returns deterministic suggestions from input (respects `maxCards`)
- [ ] Unit tests cover fake output shape + `maxCards` cap
- [ ] Gate passes: `pnpm turbo lint typecheck test --filter=@product-engineer/shared-ai`

**Tests:** unit (Vitest) · **Gate:** full

---

### T3: Prisma + Postgres setup — ✅ Done (commit `dffd9f7`; migration authored offline via `migrate diff`, Docker daemon unavailable to apply live)

**What:** Prisma schema (Deck/Card/Review), initial migration, `PrismaService`/`PrismaModule`, Docker Compose, `DATABASE_URL`.
**Where:** `apps/1-ai-flashcards-api/{prisma/,src/prisma/,docker-compose.yml,.env.example}` (+ deps `prisma`,`@prisma/client`)
**Depends on:** None · **Reuses:** api shell · **Requirement:** APP1-007
**Tools:** context7 (`prisma`) · Skill: `nestjs-modular-monolith`
**Done when:**

- [ ] Schema models Deck/Card/Review with `Deck→Card→Review` cascade delete + SM-2 fields on Card
- [ ] Migration creates full schema on an empty DB; `prisma generate` wired into build
- [ ] `PrismaService` connects on `OnModuleInit`; registered in `AppModule`
- [ ] `docker-compose.yml` brings up Postgres; `.env.example` documents `DATABASE_URL`
- [ ] Gate passes: `pnpm turbo lint typecheck build --filter=@product-engineer/1-ai-flashcards-api`

**Tests:** none (config layer) · **Gate:** build

---

### T4: SM-2 scheduler (pure) [P] — ✅ Done (commit `2421df9`)

**What:** `applySm2(state, grade, now)` per spec §7.
**Where:** `apps/1-ai-flashcards-api/src/domain/sm2.ts` (+ `sm2.spec.ts`)
**Depends on:** None · **Reuses:** nothing · **Requirement:** APP1-005
**Tools:** NONE · Skill: NONE
**Done when:**

- [ ] Implements ease/interval/repetitions update + `dueAt = now + interval days`
- [ ] Table-driven tests: q<3 reset, repetitions 0→1→6, ease floor 1.3, invalid grade rejected by caller
- [ ] Gate passes: `pnpm turbo lint typecheck test --filter=@product-engineer/1-ai-flashcards-api`

**Tests:** unit (Jest) · **Gate:** full

---

### T5: DecksModule (CRUD) — ✅ Done (commit `5ae6b1f`)

**What:** `GET/POST /decks`, `DELETE /decks/:id` with `cardCount`/`dueCount`; Zod validation pipe.
**Where:** `apps/1-ai-flashcards-api/src/decks/` (+ global Zod pipe in `main.ts`)
**Depends on:** T1, T3 · **Reuses:** contracts, PrismaService · **Requirement:** APP1-001
**Tools:** context7 (`nestjs`) · Skill: `nestjs-modular-monolith`
**Done when:**

- [ ] Endpoints behave per AC: create validates non-empty name (400), list returns counts, delete cascades (204)
- [ ] Service unit tests + controller integration tests (supertest)
- [ ] Gate passes: `pnpm turbo lint typecheck test --filter=@product-engineer/1-ai-flashcards-api`

**Tests:** unit + integration (Jest + supertest) · **Gate:** full

---

### T6: CardsModule (CRUD) — ✅ Done (commit `9a8ab59`)

**What:** `GET/POST /decks/:id/cards`, `PATCH/DELETE /cards/:id`; new cards get default SM-2 state.
**Where:** `apps/1-ai-flashcards-api/src/cards/`
**Depends on:** T1, T3, T5 · **Reuses:** contracts, PrismaService · **Requirement:** APP1-002
**Tools:** context7 (`nestjs`) · Skill: `nestjs-modular-monolith`
**Done when:**

- [ ] Create on missing deck → 404; new card defaults `ease=2.5/interval=0/reps=0/dueAt=now`
- [ ] Edit updates front/back without touching SM-2 state; delete removes review history
- [ ] Service unit tests + controller integration tests
- [ ] Gate passes: `... test --filter=@product-engineer/1-ai-flashcards-api`

**Tests:** unit + integration · **Gate:** full

---

### T7: ReviewModule (due session + grade) — ✅ Done (commit `a6586b5`)

**What:** `GET /decks/:id/review` (due cards) + `POST /cards/:id/review` (apply SM-2, log review).
**Where:** `apps/1-ai-flashcards-api/src/review/`
**Depends on:** T1, T3, T4, T6 · **Reuses:** `applySm2`, contracts, PrismaService · **Requirement:** APP1-004, APP1-005
**Tools:** context7 (`nestjs`) · Skill: `nestjs-modular-monolith`
**Done when:**

- [ ] Review session returns only `dueAt<=now` ordered asc; empty list when none due
- [ ] Grade outside 0–5 → 400, card unchanged; valid grade updates SM-2 + appends Review row
- [ ] Service unit tests + controller integration tests
- [ ] Gate passes: `... test --filter=@product-engineer/1-ai-flashcards-api`

**Tests:** unit + integration · **Gate:** full

---

### T8b: Anthropic adapter [P after T2] — ✅ Done (commit `e8dc50e`)

**What:** `AnthropicAiCardGenerator` wrapping `@anthropic-ai/sdk`; CJS-import smoke from api.
**Where:** `packages/shared-ai/src/` (+ dep `@anthropic-ai/sdk`)
**Depends on:** T2 · **Reuses:** `buildPrompt` · **Requirement:** APP1-008
**Tools:** context7 (`@anthropic-ai/sdk`) · Skill: NONE
**Done when:**

- [ ] Adapter calls Claude (`ANTHROPIC_MODEL` default `claude-sonnet-4-6`, `max_tokens 1024`), parses JSON to `CardSuggestion[]`
- [ ] Unit test mocks the SDK (no network); verifies prompt build + parse + error path
- [ ] Imports cleanly from a CJS context (ADR-002 spike resolved)
- [ ] Gate passes: `... test --filter=@product-engineer/shared-ai`

**Tests:** unit (Vitest, SDK mocked) · **Gate:** full

---

### T8: GenerationModule (generate + accept) — ✅ Done (commit `f725fce`; accept route is `/cards/accept`, see SPEC_DEVIATION)

**What:** `POST /decks/:id/generate` (suggestions, not persisted) + `POST /decks/:id/cards:accept` (persist selected).
**Where:** `apps/1-ai-flashcards-api/src/generation/` (+ DI binding key→adapter, else fake)
**Depends on:** T1, T2, T3, T6, T8b · **Reuses:** `AiCardGenerator`, contracts, PrismaService · **Requirement:** APP1-003, APP1-008
**Tools:** context7 (`nestjs`) · Skill: `nestjs-modular-monolith`
**Done when:**

- [ ] Empty/oversized notes → 400 before any AI call; provider error/timeout → 502, nothing persisted
- [ ] Accept persists only selected suggestions as cards (APP1-002 rules)
- [ ] DI injects fake in tests, Anthropic when `ANTHROPIC_API_KEY` set
- [ ] Service unit tests + controller integration tests (fake generator)
- [ ] Gate passes: `... test --filter=@product-engineer/1-ai-flashcards-api`

**Tests:** unit + integration · **Gate:** full

---

### T9: web API client

**What:** Typed `fetch` wrapper; request/response types inferred from contracts.
**Where:** `apps/1-ai-flashcards-web/src/lib/api.ts` (+ dep `@product-engineer/shared-contracts`)
**Depends on:** T1 · **Reuses:** contracts · **Requirement:** APP1-006
**Tools:** NONE · Skill: `react-best-practices`
**Done when:**

- [ ] Functions for decks/cards/generate/review; types via `z.infer` (no duplicate hand-written types)
- [ ] Unit test for client (mocked fetch)
- [ ] Gate passes: `... test --filter=@product-engineer/1-ai-flashcards-web`

**Tests:** unit (Vitest) · **Gate:** full

---

### T10: web deck list [P]

**What:** Decks page: list (name/cardCount/dueCount), create, delete.
**Where:** `apps/1-ai-flashcards-web/src/app/page.tsx` + `components/DeckList`,`DeckForm` (+ `e2e/decks.spec.ts`)
**Depends on:** T9 · **Reuses:** api client · **Requirement:** APP1-009
**Tools:** NONE · Skill: `react-best-practices`, `react-composition-patterns`, `playwright-skill`
**Done when:**

- [ ] List reflects create/delete without full reload; component unit test + E2E flow
- [ ] Gate passes: `... test --filter=...web` and `... test:e2e --filter=...web`

**Tests:** unit + e2e · **Gate:** full + e2e

---

### T11: web card management [P]

**What:** Deck detail card list + add/edit/delete.
**Where:** `apps/1-ai-flashcards-web/src/app/decks/[id]/page.tsx` + `components/CardList`,`CardForm` (+ e2e)
**Depends on:** T9 · **Reuses:** api client · **Requirement:** APP1-010
**Tools:** NONE · Skill: `react-best-practices`, `playwright-skill`
**Done when:**

- [ ] CRUD works against api; component unit test + E2E
- [ ] Gate passes: `... test` + `... test:e2e` (`--filter=...web`)

**Tests:** unit + e2e · **Gate:** full + e2e

---

### T12: web generation panel [P]

**What:** Paste notes → preview suggestions → accept subset; non-blocking failure + retry.
**Where:** `apps/1-ai-flashcards-web/src/app/decks/[id]/` + `components/GeneratePanel` (+ e2e)
**Depends on:** T9 · **Reuses:** api client · **Requirement:** APP1-011, APP1-015
**Tools:** NONE · Skill: `react-best-practices`, `playwright-skill`
**Done when:**

- [ ] Suggestions shown before save; only selected persisted; failure shows retry + keeps manual cards
- [ ] Component unit test + E2E (api/generator stubbed)
- [ ] Gate passes: `... test` + `... test:e2e`

**Tests:** unit + e2e · **Gate:** full + e2e

---

### T13: web review session [P]

**What:** Review UI: one due card at a time, reveal back, grade 0–5, end summary.
**Where:** `apps/1-ai-flashcards-web/src/app/decks/[id]/review/page.tsx` + `components/ReviewSession` (+ e2e)
**Depends on:** T9 · **Reuses:** api client · **Requirement:** APP1-012
**Tools:** NONE · Skill: `react-best-practices`, `playwright-skill`
**Done when:**

- [ ] Flip + grade advances to next due card; summary at end; component unit test + E2E
- [ ] Gate passes: `... test` + `... test:e2e`

**Tests:** unit + e2e · **Gate:** full + e2e

---

### T14: mobile decks screen (P2)

**What:** Expo screen listing decks + due counts from api.
**Where:** `apps/1-ai-flashcards-mobile/` (screen + api client using `EXPO_PUBLIC_API_URL`)
**Depends on:** T1 (T9 as pattern) · **Reuses:** contracts · **Requirement:** APP1-013
**Tools:** NONE · Skill: `react-native-expert`
**Done when:**

- [ ] Decks render with due counts; component unit test (Vitest + existing RN stubs)
- [ ] Gate passes: `... test --filter=@product-engineer/1-ai-flashcards-mobile`

**Tests:** unit (Vitest) · **Gate:** full

---

### T15: mobile review screen (P2)

**What:** Expo review flow: flip due cards, grade 0–5, post to api.
**Where:** `apps/1-ai-flashcards-mobile/` (review screen)
**Depends on:** T14 · **Reuses:** mobile api client · **Requirement:** APP1-014
**Tools:** NONE · Skill: `react-native-expert`
**Done when:**

- [ ] Flip + grade posts review; component unit test
- [ ] Gate passes: `... test --filter=...mobile`

**Tests:** unit (Vitest) · **Gate:** full

---

### T16: Postgres in CI

**What:** Add a Postgres service container to the api `unit-tests` job so integration tests run in CI.
**Where:** `.github/workflows/ci.yml`
**Depends on:** T7, T8 · **Reuses:** existing CI matrix · **Requirement:** CI-001 (new)
**Tools:** `gh-fix-ci` · Skill: NONE
**Done when:**

- [ ] api integration tests run green against the service container; `ci-gate` stays the merge gate
- [ ] No other workspace job is slowed by the DB (scoped to api)

**Tests:** n/a (pipeline) · **Gate:** ci-gate green

---

## Pre-Approval Validation

### Check 2 — Diagram ↔ Definition cross-check

| Task    | Diagram predecessors | `Depends on`    | Match |
| ------- | -------------------- | --------------- | ----- |
| T1      | none                 | None            | ✅    |
| T2      | none                 | None            | ✅    |
| T3      | none                 | None            | ✅    |
| T4      | none                 | None            | ✅    |
| T5      | T1,T3                | T1,T3           | ✅    |
| T6      | T5 (+T1,T3)          | T1,T3,T5        | ✅    |
| T7      | T6 (+T4)             | T1,T3,T4,T6     | ✅    |
| T8b     | T2                   | T2              | ✅    |
| T8      | T6,T8b (+T2)         | T1,T2,T3,T6,T8b | ✅    |
| T9      | T1                   | T1              | ✅    |
| T10–T13 | T9                   | T9              | ✅    |
| T14     | T1/T9-pattern        | T1              | ✅    |
| T15     | T14                  | T14             | ✅    |
| T16     | T7,T8                | T7,T8           | ✅    |

### Check 3 — Test co-location vs TESTING.md matrix

| Task    | Layer created     | Matrix requires    | Task `Tests`       | Match |
| ------- | ----------------- | ------------------ | ------------------ | ----- |
| T1      | package export    | unit               | unit               | ✅    |
| T2      | package export    | unit               | unit               | ✅    |
| T3      | config/Prisma     | none               | none               | ✅    |
| T4      | domain (pure)     | unit               | unit               | ✅    |
| T5      | NestJS svc+ctrl   | unit + integration | unit + integration | ✅    |
| T6      | NestJS svc+ctrl   | unit + integration | unit + integration | ✅    |
| T7      | NestJS svc+ctrl   | unit + integration | unit + integration | ✅    |
| T8b     | package export    | unit               | unit               | ✅    |
| T8      | NestJS svc+ctrl   | unit + integration | unit + integration | ✅    |
| T9      | web lib           | unit               | unit               | ✅    |
| T10–T13 | React + user flow | unit + e2e         | unit + e2e         | ✅    |
| T14     | React component   | unit               | unit               | ✅    |
| T15     | React component   | unit               | unit               | ✅    |
| T16     | CI pipeline       | n/a                | n/a                | ✅    |

### Check 1 — Granularity

Each task is one module / one package surface / one screen / one pipeline change with a single
verifiable outcome. T5–T8 bundle a module's controller+service+tests intentionally (one bounded
context per task) — acceptable for score-10; split per-endpoint only if a task balloons.

---

## Parallelism summary

- **Phase 1:** T1, T2, T3, T4 all `[P]` (independent). Unit tests parallel-safe.
- **Phase 2:** sequential chain T5→T6→{T7,T8}; T8b parallel after T2.
- **Phase 3:** T10–T13 all `[P]` after T9. **E2E is NOT parallel-safe** (shared dev server) — run web E2E one project at a time even though the build tasks are parallel.
- **Phase 4/5:** T15 after T14; T16 last.

## Suggested commit slices (Conventional Commits)

`feat(shared-contracts)` · `feat(shared-ai)` · `build(ai-flashcards/api): prisma` ·
`feat(ai-flashcards/api): decks|cards|review|generation` · `feat(ai-flashcards/web): ...` ·
`feat(ai-flashcards/mobile): ...` · `ci: postgres service for api tests`.
