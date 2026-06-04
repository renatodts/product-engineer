# Team Knowledge Copilot — web

**Complexity score:** 60

## Purpose

A retrieval-augmented copilot that answers questions over a team's documents, wikis, and chat history. The web app offers a conversational interface with cited sources and connector management.

## Complexity Breakdown

- **Domain complexity:** High — grounding answers across heterogeneous sources with accurate citations and permissions is demanding.
- **Architecture complexity:** Medium — ingestion, embedding, retrieval, and chat services coordinate behind the UI.
- **Infrastructure complexity:** Medium — a vector store, document connectors, and indexing pipelines must run reliably.

## AI Usage

AI drives retrieval-augmented answering, query rewriting, and source citation over indexed team content. AI-assisted development shapes the chat and connector-management UX.

## Future Roadmap

- [ ] Conversational Q&A with cited sources
- [ ] Document and chat-source connectors
- [ ] Permission-aware retrieval and access controls

> Scaffold only. No business logic yet. Developed via TLC Spec-Driven — see `.specs/`.
