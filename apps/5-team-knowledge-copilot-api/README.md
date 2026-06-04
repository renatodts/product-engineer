# Team Knowledge Copilot — api

**Complexity score:** 60

## Purpose

Backend for a retrieval-augmented assistant that indexes a team's documents, wikis, and chat history and answers questions with cited sources. Provides search, ingestion, and conversational endpoints over an organization's knowledge base.

## Complexity Breakdown

- **Domain complexity:** High — documents, chunks, embeddings, permissions, and conversations with source-grounding and citation guarantees.
- **Architecture complexity:** Medium — ingestion, embedding, and retrieval pipelines coordinated behind a query API, but within one service.
- **Infrastructure complexity:** Medium — a vector store alongside the primary database plus background indexing workers.

## AI Usage

AI embeds and retrieves relevant context, then generates grounded, cited answers and summaries from team content. AI-assisted development is used for RAG-pipeline specs, prompt and chunking strategy iteration, and retrieval-quality test generation.

## Future Roadmap

- [ ] Document ingestion and embedding pipeline
- [ ] Permission-aware retrieval and cited Q&A endpoint
- [ ] Conversation memory and feedback-driven re-ranking

> Scaffold only. No business logic yet. Developed via TLC Spec-Driven — see `.specs/`.
