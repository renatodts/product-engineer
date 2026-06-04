# Integrations

## Active External Services

None. The scaffold has no running external services.

## Planned Infrastructure (Docker Compose stubs)

The following services are documented here as future integrations. Docker Compose files exist as
placeholders in individual app directories but are not running. No connection strings, secrets,
or service clients are wired up yet.

### PostgreSQL

- **Purpose:** Primary relational database for API apps.
- **Used by:** All `*-api` apps once built out.
- **Status:** Docker Compose stub — not running.
- **Notes:** Each project gets its own database schema / database name to avoid coupling.

### Redis

- **Purpose:** Caching and job queue (BullMQ or similar).
- **Used by:** API apps with background processing (projects 3+).
- **Status:** Docker Compose stub — not running.

### Vector Store (TBD)

- **Purpose:** Embedding storage for RAG pipelines.
- **Candidates:** pgvector (Postgres extension), Qdrant.
- **Used by:** Projects 5+ (Team Knowledge Copilot and above).
- **Status:** Not yet selected or scaffolded.

### AI Provider (LLM API)

- **Purpose:** Large language model calls for all AI-assisted features.
- **Candidates:** Anthropic Claude, OpenAI.
- **Used by:** All projects.
- **Status:** No API key configuration wired. Will be added when first project is built.

## Integration Notes

When an integration is activated for a project:

1. Add the service to the project's Docker Compose file.
2. Document the connection details in the app's `.specs/codebase/INTEGRATIONS.md`.
3. Use environment variables via `.env.local` (never commit secrets).
4. Update the root `INTEGRATIONS.md` to mark the service as active.
