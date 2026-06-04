# AI Flashcards — web

**Complexity score:** 10

## Purpose

A study companion that turns notes and source material into spaced-repetition flashcards. The web app surfaces decks, review sessions, and AI-generated card suggestions.

## Complexity Breakdown

- **Domain complexity:** Low — flashcards, decks, and a single spaced-repetition review loop are well-understood concepts.
- **Architecture complexity:** Low — a single Next.js app talking to one API with no cross-service orchestration.
- **Infrastructure complexity:** Low — stateless front end plus a single datastore; no streaming or multi-region needs.

## AI Usage

AI generates draft flashcards from pasted text and grades free-text answers. Development leans on AI-assisted scaffolding for the simple UI and review flow.

## Future Roadmap

- [ ] Deck list and card review UI wired to the API
- [ ] AI-assisted card generation from pasted notes
- [ ] Spaced-repetition scheduling with progress tracking

> Scaffold only. No business logic yet. Developed via TLC Spec-Driven — see `.specs/`.
