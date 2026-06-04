# Feature Spec: AI Flashcards (Project 1)

---

## 1. Overview

**Feature name:** AI Flashcards — spaced-repetition study tool with AI-generated cards
**Author:** Renato de Matos
**Date:** 2026-06-04
**Status:** `Draft`
**Requirement category:** APP1 (Project 1 — AI Flashcards)
**Apps in scope:** `1-ai-flashcards-api` (NestJS/CJS), `1-ai-flashcards-web` (Next.js), `1-ai-flashcards-mobile` (Expo)
**Decisions:** see [context.md](./context.md) — all-three-apps, Postgres+Prisma, real Anthropic SDK, SM-2.

---

## 2. Problem Statement

A learner has notes and source material but no efficient way to retain them. Manually writing
flashcards is tedious, and reviewing them without a scheduling system wastes time on cards already
known while neglecting weak ones. AI Flashcards turns pasted notes into question/answer cards and
schedules reviews with SM-2 so the learner spends effort where it matters. As Project 1 (score 10)
it is the foundation project: a complete full-stack vertical (api + web + mobile) exercising
AI-assisted generation, a real datastore, and shared Zod contracts end-to-end.

---

## 3. Goals

- A learner can create decks and cards, and have cards drafted from pasted notes by Claude.
- A learner can run a review session that shows only **due** cards and reschedules each via SM-2.
- One set of **Zod contracts** in `@product-engineer/shared-contracts` is the source of truth the
  api validates against and web/mobile infer their types from (ADR-020).
- Data persists in **Postgres via Prisma**; the AI provider sits behind a port so tests/CI run offline.
- The whole vertical passes the standard gate (`lint typecheck test build`) and the api has
  integration tests for CRUD, generation (faked), and the SM-2 scheduler.

## 4. Out of Scope

> If something is not mentioned here, assume it is in-scope.

- **Authentication / multi-user.** Single implicit owner only. No `shared-auth`, no login, no
  per-user data partitioning. (Deferred — later project.)
- **Offline-first / local sync** on mobile. Mobile reads from the api over the network.
- **Rich media cards** (images, audio, LaTeX). Cards are plain front/back text.
- **Deck sharing, import/export (Anki .apkg), tags, search.**
- **Streaming AI responses / token-by-token UI.** Generation is a single request/response.
- **Background jobs / notifications** (e.g. "cards due" push). Review surfaces due cards on demand.
- **Rate limiting, quotas, billing** around the AI endpoint.
- **CD / deployment.** No environment exists yet (harness Phase 6 gap).

---

## 5. User Stories

Priority: **P1** must-have, **P2** important-but-deferrable, **P3** nice-to-have.

| ID       | Priority | Story                                                                                                 | App     |
| -------- | -------- | ----------------------------------------------------------------------------------------------------- | ------- |
| APP1-001 | P1       | As a learner, I want to create, rename, and delete decks so I can organize study topics.              | api     |
| APP1-002 | P1       | As a learner, I want to add, edit, and delete cards (front/back) in a deck so I control my material.  | api     |
| APP1-003 | P1       | As a learner, I want to paste notes and get draft cards from AI so I don't write every card by hand.  | api     |
| APP1-004 | P1       | As a learner, I want a review session that returns only cards due today so I don't waste effort.      | api     |
| APP1-005 | P1       | As a learner, I want each reviewed card rescheduled by SM-2 from my 0–5 grade so timing adapts to me. | api     |
| APP1-006 | P1       | As a developer, I want all request/response shapes defined once as Zod contracts shared by clients.   | pkg     |
| APP1-007 | P1       | As a developer, I want decks/cards/reviews persisted in Postgres via Prisma so data survives restart. | api     |
| APP1-008 | P1       | As a developer, I want AI generation behind a port with a real Anthropic adapter and an offline fake. | pkg/api |
| APP1-009 | P1       | As a learner on web, I want to see my decks and create/delete them.                                   | web     |
| APP1-010 | P1       | As a learner on web, I want to view and manage the cards in a deck.                                   | web     |
| APP1-011 | P1       | As a learner on web, I want to paste notes, preview AI-suggested cards, and accept the ones I want.   | web     |
| APP1-012 | P1       | As a learner on web, I want to run a review session: flip each due card and grade it 0–5.             | web     |
| APP1-013 | P2       | As a learner on mobile, I want to see my decks and how many cards are due.                            | mobile  |
| APP1-014 | P2       | As a learner on mobile, I want to run a review session: flip due cards and grade them.                | mobile  |
| APP1-015 | P2       | As a learner, I want clear feedback when AI generation fails so I can retry or add cards manually.    | web     |

---

## 6. Acceptance Criteria

Format: `WHEN [trigger] THEN system SHALL [observable behavior]`.

### APP1-001 — Deck CRUD

- WHEN a deck is created with a non-empty `name` THEN the api SHALL persist it and return it with an `id` and `createdAt`.
- WHEN a deck list is requested THEN the api SHALL return all decks, each with a `cardCount` and a `dueCount`.
- WHEN a deck is deleted THEN the api SHALL delete the deck and all its cards and reviews (cascade) and return 204.
- WHEN a deck is created with an empty/whitespace `name` THEN the api SHALL reject with 400 and a validation message.

### APP1-002 — Card CRUD

- WHEN a card is created in an existing deck with non-empty `front` and `back` THEN the api SHALL persist it with default SM-2 state (`easeFactor=2.5`, `interval=0`, `repetitions=0`, `dueAt=now`) and return it.
- WHEN a card is edited THEN the api SHALL update `front`/`back` without altering its SM-2 scheduling state.
- WHEN a card is created in a non-existent deck THEN the api SHALL return 404.
- WHEN a card is deleted THEN the api SHALL remove it and its review history.

### APP1-003 — AI card generation

- WHEN notes text and a target deck are submitted THEN the api SHALL call the AI generator and return an array of `{ front, back }` **suggestions** (not yet persisted).
- WHEN the caller accepts a subset of suggestions THEN the api SHALL persist those as cards in the deck (reusing APP1-002 rules).
- WHEN the notes text is empty or exceeds the max length THEN the api SHALL reject with 400 before any AI call.
- WHEN the AI provider errors or times out THEN the api SHALL return 502 with a stable error code and SHALL NOT persist partial results.

### APP1-004 — Due review session

- WHEN a review session is requested for a deck THEN the api SHALL return only cards whose `dueAt <= now`, ordered by `dueAt` ascending.
- WHEN no cards are due THEN the api SHALL return an empty list (not an error).

### APP1-005 — SM-2 scheduling

- WHEN a card is reviewed with grade `q` (integer 0–5) THEN the api SHALL update the card's SM-2 state per the algorithm in §7 and set `dueAt = now + interval days`.
- WHEN `q < 3` THEN the api SHALL reset `repetitions` to 0 and set `interval` to 1 (relearn), while still applying the ease-factor update.
- WHEN `q` is outside 0–5 or non-integer THEN the api SHALL reject with 400 and leave the card unchanged.
- WHEN a card is reviewed THEN the api SHALL append a review log row (`cardId`, `grade`, `reviewedAt`, resulting `interval`/`easeFactor`).

### APP1-006 — Shared Zod contracts

- WHEN any api endpoint receives a body THEN it SHALL validate against the matching Zod schema from `@product-engineer/shared-contracts` and reject invalid bodies with 400.
- WHEN web/mobile call the api THEN their request/response TypeScript types SHALL be **inferred** from the same schemas (no hand-written duplicate types).
- The contracts package SHALL remain framework-neutral and CJS-importable (ADR-002/ADR-020).

### APP1-007 — Postgres + Prisma persistence

- WHEN the api starts THEN it SHALL connect to Postgres using `DATABASE_URL`.
- The Prisma schema SHALL model `Deck`, `Card` (with SM-2 fields), and `Review`, with cascade delete from `Deck → Card → Review`.
- WHEN migrations are applied to an empty database THEN they SHALL create the full schema and SHALL be reversible/re-runnable in CI.

### APP1-008 — AI port + adapters

- The `@product-engineer/shared-ai` package SHALL export an `AiCardGenerator` port (`generateCards(notes, opts): Promise<CardSuggestion[]>`).
- WHEN `ANTHROPIC_API_KEY` is present THEN the api SHALL bind the Anthropic adapter; tests SHALL bind a deterministic fake.
- The fake SHALL return predictable suggestions from input so generation flows are testable offline with zero network.

### APP1-009 — Web deck list

- WHEN the decks page loads THEN it SHALL list decks with name, card count, and due count, fetched from the api.
- WHEN the learner creates/deletes a deck THEN the list SHALL reflect the change without a full reload.

### APP1-010 — Web card management

- WHEN a deck is opened THEN its cards SHALL be listed with front/back and the learner can add/edit/delete cards.

### APP1-011 — Web AI generation flow

- WHEN the learner pastes notes and submits THEN suggested cards SHALL be shown for review **before** saving.
- WHEN the learner selects suggestions and confirms THEN only the selected cards SHALL be created in the deck.

### APP1-012 — Web review session

- WHEN a review session starts THEN due cards SHALL be presented one at a time showing the front; the back is revealed on demand.
- WHEN the learner grades a card 0–5 THEN the next due card SHALL appear; at the end a short summary SHALL be shown.

### APP1-013 / APP1-014 — Mobile decks & review

- WHEN the mobile app loads THEN it SHALL list decks with due counts from the api.
- WHEN a review session is started on mobile THEN due cards SHALL be flippable and gradable 0–5, posting results to the api.

### APP1-015 — AI failure feedback (web)

- WHEN generation fails THEN the web app SHALL show a non-blocking error with a retry action and SHALL keep any manually-entered cards intact.

---

## 7. Design Notes

> High-level only; full architecture is the Phase-2 Design step (`design.md`).

**Domain (api-local, `src/domain/`):** `Deck`, `Card`, `Review`. SM-2 state lives on `Card`:
`easeFactor` (default 2.5, floor 1.3), `interval` (days), `repetitions`, `dueAt`.

**SM-2 update (grade `q` in 0–5):**

```
if q < 3:
    repetitions = 0
    interval = 1
else:
    if repetitions == 0: interval = 1
    elif repetitions == 1: interval = 6
    else: interval = round(interval * easeFactor)
    repetitions += 1
easeFactor = max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
dueAt = now + interval days
```

**Contracts (`shared-contracts`, Zod):** `DeckCreate`, `Deck`, `CardCreate`, `Card`,
`GenerateRequest`, `CardSuggestion`, `AcceptSuggestions`, `ReviewSession`, `GradeRequest`. Clients
infer types via `z.infer`; the api validates with these schemas.

**AI (`shared-ai`):** `AiCardGenerator` port; `AnthropicAiCardGenerator` (wraps `@anthropic-ai/sdk`,
Claude) + `FakeAiCardGenerator` for tests. Prompt built via existing `buildPrompt`.

**API surface (indicative):** `GET/POST /decks`, `DELETE /decks/:id`, `GET/POST /decks/:id/cards`,
`PATCH/DELETE /cards/:id`, `POST /decks/:id/generate`, `POST /decks/:id/cards:accept`,
`GET /decks/:id/review`, `POST /cards/:id/review`.

**Clients:** web (Next.js App Router, port 3001) — decks, deck detail, generate, review routes.
Mobile (Expo) — decks list + review screens, P2.

---

## 8. Dependencies & Risks

| Dependency / Risk                                       | Mitigation                                                                                          |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Anthropic SDK in a CJS NestJS app (ADR-002)             | `shared-ai` exposes a CJS-importable port; verify `@anthropic-ai/sdk` imports under CJS in a spike. |
| Postgres available locally and in CI                    | Docker Compose locally; Postgres service container for any DB-backed CI job.                        |
| `shared-contracts` must stay CJS-importable (ADR-020)   | Zod-only, no ESM-only deps; add a CJS import smoke test.                                            |
| Non-deterministic AI output breaks tests                | All automated tests use `FakeAiCardGenerator`; real model only on manual/gated runs.                |
| SM-2 edge cases (rounding, ease floor)                  | Unit-test the scheduler as a pure function with table-driven cases.                                 |
| Adding shared deps to apps is a deliberate ADR-004 step | Record the additions in the PR description and STATE.md.                                            |

---

## 9. Open Questions

- [ ] Anthropic model id and token budget for generation (resolve in Design; default to latest Sonnet).
- [ ] Should `generate` allow choosing how many cards to draft, or always let the model decide? (Design.)
- [ ] Mobile API base-URL/config strategy for Expo (resolve when starting APP1-013/014).
- [ ] Does CI run the api integration tests against a Postgres service container, or only on `main`? (Design/CI.)

---

## 10. References

- ADR-002 (dual module system), ADR-003 (three test runners), ADR-004 (deliberate deps), ADR-020 (share contracts not domain).
- `context.md` (Phase-1 decisions), root `README.md` project table, app `README.md`s.
- CLAUDE.md SDLC harness; `.specs/codebase/CONVENTIONS.md` (APP1- requirement-ID namespace).
