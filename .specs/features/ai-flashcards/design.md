# AI Flashcards Design

**Spec:** `.specs/features/ai-flashcards/spec.md`
**Context:** `.specs/features/ai-flashcards/context.md`
**Status:** Draft

---

## Architecture Overview

Three apps over one HTTP API and one Postgres database. The api is a NestJS modular monolith
(CJS, ADR-002) with a thin domain layer; clients (Next.js web, Expo mobile) infer their types from
shared Zod contracts and call the api. AI generation sits behind a port so the real Anthropic
adapter is swapped for a deterministic fake in tests.

```mermaid
graph TD
    Web[Next.js web :3001] -->|fetch, types from contracts| API
    Mobile[Expo mobile] -->|fetch, EXPO_PUBLIC_API_URL| API
    subgraph API[NestJS api :4001 - CJS]
      Decks[DecksModule] --> Prisma[(PrismaService)]
      Cards[CardsModule] --> Prisma
      Review[ReviewModule] --> Sm2[domain/sm2 pure fn]
      Review --> Prisma
      Gen[GenerationModule] --> Port[AiCardGenerator port]
      Gen --> Prisma
    end
    Port -->|ANTHROPIC_API_KEY present| Anthropic[AnthropicAiCardGenerator]
    Port -->|tests/CI| Fake[FakeAiCardGenerator]
    Prisma --> PG[(Postgres)]
    API -. validates bodies .-> Contracts[shared-contracts Zod]
    Web -. z.infer .-> Contracts
    Mobile -. z.infer .-> Contracts
```

### Resolved open questions (from spec §9)

| Q                        | Resolution                                                                                                                                                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anthropic model + budget | Default `claude-sonnet-4-6`, `max_tokens: 1024`, low temperature. Model id read from env `ANTHROPIC_MODEL` with that default.                                                                                                                                                |
| Card-count control       | `GenerateRequest` carries optional `maxCards` (1–20, default 10); prompt asks the model to draft up to that many.                                                                                                                                                            |
| Mobile API base URL      | Expo convention: `EXPO_PUBLIC_API_URL` (public env, inlined at build). Defaults to `http://localhost:4001`.                                                                                                                                                                  |
| CI Postgres              | Api integration tests (supertest + Prisma) run against a **Postgres service container** added to the `unit-tests` job for the api workspace. Keeps `ci-gate` honest without a separate pipeline. (Touches `.github/workflows/ci.yml` — track under a `CI-` id at execution.) |

---

## Code Reuse Analysis

### Existing components to leverage

| Component                        | Location                                                                | How to use                                                                           |
| -------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `buildPrompt(parts)`             | `packages/shared-ai/src/index.ts`                                       | Compose system+user prompt for the Anthropic call.                                   |
| `shared-ai` package shell        | `packages/shared-ai`                                                    | Add the port + adapters here (already ESM, has a test).                              |
| `shared-contracts` package shell | `packages/shared-contracts`                                             | Add Zod schemas here (already framework-neutral, CJS-importable target).             |
| TS presets                       | `@product-engineer/typescript-config` (`nestjs`/`nextjs`/`expo`/`base`) | Apps already extend these; no change.                                                |
| NestJS app shell                 | `apps/1-ai-flashcards-api/src/{main,app.module}.ts`                     | Register feature modules in `AppModule`; add `ValidationPipe`/Zod pipe in `main.ts`. |
| Next.js app shell                | `apps/1-ai-flashcards-web/src/app`                                      | Replace stub `page.tsx`; add routes under `app/`.                                    |
| Expo app shell                   | `apps/1-ai-flashcards-mobile/App.tsx`                                   | Build screens; mobile test stubs already exist under `test/stubs`.                   |

### Integration points

| System              | Method                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Postgres            | New `PrismaService` (`OnModuleInit` connect); `DATABASE_URL`. Docker Compose for local.    |
| Anthropic           | `@anthropic-ai/sdk` inside `AnthropicAiCardGenerator` in `shared-ai`; `ANTHROPIC_API_KEY`. |
| Contracts ↔ api     | Zod pipe validates request bodies against `shared-contracts` schemas.                      |
| Contracts ↔ clients | `z.infer<typeof Schema>` for request/response types; no duplicated hand-written types.     |

### ADR-driven constraints

- **ADR-002:** api stays CJS. `shared-contracts` and `shared-ai` must be CJS-importable from the
  api. Both are pure TS (Zod / a thin SDK wrapper); the api's `tsc`/`nest build` transpiles the
  imported sources to CJS. **Risk to verify with a smoke test** (see T1/T2 Done-when).
- **ADR-003:** Jest+supertest for the api, Vitest for packages + web + mobile, Playwright for web E2E.
- **ADR-004:** adding `shared-contracts`/`shared-ai`/`@anthropic-ai/sdk`/`prisma` to apps is a
  deliberate, reviewed dependency addition — call it out in the PR + STATE.md.
- **ADR-020:** only wire shapes live in `shared-contracts`; rich `Deck`/`Card` domain + SM-2 logic
  stay api-local in `src/domain/`.

---

## Components

### shared-contracts (Zod schemas)

- **Purpose:** Single source of truth for all wire shapes.
- **Location:** `packages/shared-contracts/src/`
- **Interfaces (schemas):** `DeckCreateSchema`, `DeckSchema` (+ `cardCount`,`dueCount`),
  `CardCreateSchema`, `CardSchema`, `GenerateRequestSchema` (`notes`, optional `maxCards`),
  `CardSuggestionSchema`, `AcceptSuggestionsSchema`, `ReviewSessionSchema`,
  `GradeRequestSchema` (`grade` int 0–5). Each exports an inferred type.
- **Dependencies:** `zod`. **Reuses:** package shell.

### shared-ai (generation port + adapters)

- **Purpose:** Abstract card generation; real Anthropic vs offline fake.
- **Location:** `packages/shared-ai/src/`
- **Interfaces:**
  - `interface AiCardGenerator { generateCards(notes: string, opts?: { maxCards?: number }): Promise<CardSuggestion[]> }`
  - `class AnthropicAiCardGenerator implements AiCardGenerator` (wraps `@anthropic-ai/sdk`, uses `buildPrompt`)
  - `class FakeAiCardGenerator implements AiCardGenerator` (deterministic from input)
- **Dependencies:** `@anthropic-ai/sdk`. **Reuses:** `buildPrompt`.

### api domain: SM-2 scheduler

- **Purpose:** Pure SM-2 state transition.
- **Location:** `apps/1-ai-flashcards-api/src/domain/sm2.ts`
- **Interface:** `applySm2(state: Sm2State, grade: number, now: Date): Sm2State` where
  `Sm2State = { easeFactor; interval; repetitions; dueAt }`. Algorithm per spec §7 (ease floor 1.3).
- **Dependencies:** none (pure). **Reuses:** nothing — keeps it unit-testable in isolation.

### api modules

| Module                         | Location          | Endpoints                                                  | Reuses                               |
| ------------------------------ | ----------------- | ---------------------------------------------------------- | ------------------------------------ |
| `PrismaModule`/`PrismaService` | `src/prisma/`     | —                                                          | Prisma client                        |
| `DecksModule`                  | `src/decks/`      | `GET/POST /decks`, `DELETE /decks/:id`                     | contracts, Prisma                    |
| `CardsModule`                  | `src/cards/`      | `GET/POST /decks/:id/cards`, `PATCH/DELETE /cards/:id`     | contracts, Prisma                    |
| `ReviewModule`                 | `src/review/`     | `GET /decks/:id/review`, `POST /cards/:id/review`          | `applySm2`, contracts, Prisma        |
| `GenerationModule`             | `src/generation/` | `POST /decks/:id/generate`, `POST /decks/:id/cards:accept` | `AiCardGenerator`, contracts, Prisma |

DI: a provider binds `AiCardGenerator` → `AnthropicAiCardGenerator` when `ANTHROPIC_API_KEY` is set,
else `FakeAiCardGenerator`; tests always inject the fake. Request bodies validated by a global Zod
validation pipe.

### web (Next.js App Router, :3001)

- **Location:** `apps/1-ai-flashcards-web/src/`
- **API client:** `src/lib/api.ts` — typed `fetch` wrapper; types from `shared-contracts`.
- **Routes:** `app/page.tsx` (deck list), `app/decks/[id]/page.tsx` (cards + generate panel),
  `app/decks/[id]/review/page.tsx` (review session).
- **Components:** `DeckList`, `DeckForm`, `CardList`, `CardForm`, `GeneratePanel` (preview/accept +
  failure UX), `ReviewSession` (flip + grade 0–5). Server components fetch; client components handle
  interaction.

### mobile (Expo) — P2

- **Location:** `apps/1-ai-flashcards-mobile/`
- **Screens:** `DecksScreen` (decks + due counts), `ReviewScreen` (flip + grade). API base from
  `EXPO_PUBLIC_API_URL`. Types from `shared-contracts`.

---

## Data Models (Prisma)

```prisma
model Deck {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  cards     Card[]
}

model Card {
  id          String   @id @default(cuid())
  deckId      String
  deck        Deck     @relation(fields: [deckId], references: [id], onDelete: Cascade)
  front       String
  back        String
  easeFactor  Float    @default(2.5)
  interval    Int      @default(0)
  repetitions Int      @default(0)
  dueAt       DateTime @default(now())
  createdAt   DateTime @default(now())
  reviews     Review[]
}

model Review {
  id         String   @id @default(cuid())
  cardId     String
  card       Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  grade      Int
  interval   Int
  easeFactor Float
  reviewedAt DateTime @default(now())
}
```

`cardCount` / `dueCount` on `DeckSchema` are derived (Prisma `_count` / a `dueAt <= now` count), not stored.

---

## Risks & Mitigations (design-level)

| Risk                                                                               | Mitigation                                                                                         |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `@anthropic-ai/sdk` / `shared-ai` ESM imported from CJS api fails at build/runtime | Spike in T2: import the adapter from the api and run a build; keep the wrapper dependency-light.   |
| `shared-contracts` (`"type":"module"`) not CJS-importable                          | T1 adds a smoke test importing the schemas from a CJS context; Zod is dual-published.              |
| Non-deterministic AI breaks tests                                                  | All automated tests inject `FakeAiCardGenerator`; real model only on manual/explicitly-gated runs. |
| Postgres unavailable in CI                                                         | T(CI) adds a Postgres service container to the api `unit-tests` job.                               |
| SM-2 rounding / ease-floor bugs                                                    | T4 is a pure function with table-driven unit tests covering q<3, first reps, ease floor.           |
