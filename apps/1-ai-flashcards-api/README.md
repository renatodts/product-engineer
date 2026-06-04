# AI Flashcards — api

**Complexity score:** 10

## Purpose

Backend for an AI-assisted flashcard study tool that turns notes or topics into question/answer decks and schedules reviews. Exposes simple CRUD endpoints for decks and cards plus an AI generation endpoint.

## Complexity Breakdown

- **Domain complexity:** Low — a handful of entities (decks, cards, reviews) with straightforward spaced-repetition rules.
- **Architecture complexity:** Low — a single service with one datastore and one outbound AI call; no cross-service orchestration.
- **Infrastructure complexity:** Low — stateless API, one database, no event bus or background workers required.

## AI Usage

AI generates flashcard pairs from user-supplied source material and suggests review difficulty. AI-assisted development is used mainly for spec and test generation given the small surface area.

## Future Roadmap

- [ ] CRUD endpoints for decks and cards backed by a database
- [ ] AI deck-generation endpoint from raw notes
- [ ] Spaced-repetition scheduling and review history

> Scaffold only. No business logic yet. Developed via TLC Spec-Driven — see `.specs/`.
