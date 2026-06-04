# 17 — Architecture Decision Records

An Architecture Decision Record (ADR) is a short document that captures an important architectural decision: the context that led to it, the options considered, the decision made, and its consequences. ADRs are the institutional memory of technical decisions. They answer the question "why is the code this way?" for engineers who join later — including your future self six months from now.

This document defines how ADRs work in this repo, when to write one, and how to maintain them over time. The ADR catalogue lives in [adrs/](adrs/).

---

## When to Write an ADR

Write an ADR when:

- You are choosing between two or more technically valid approaches and the choice has lasting consequences.
- You are adopting a new library, framework, or external service.
- You are departing from the conventions documented in this `docs/` directory.
- You are making a decision that will be expensive to reverse (data model changes, API contracts, authentication design).
- You want to record a decision that was made collaboratively so that future engineers understand it was deliberate, not accidental.

Do not write an ADR for:

- Routine implementation choices (which variable name, which loop construct).
- Decisions that are fully covered by existing conventions in this documentation.
- Explorations that have not yet resulted in a decision — use a spec file in `.specs/` for that.

---

## ADR Format

All ADRs use the template in [adrs/000-template.md](adrs/000-template.md), reproduced here:

```markdown
# ADR-NNN: [Short title of decision]

- **Status:** [Proposed | Accepted | Superseded by ADR-NNN | Deprecated]
- **Date:** YYYY-MM-DD
- **Deciders:** [names or roles of people involved in the decision]
- **Requirement IDs:** [e.g., MONO-001]

## Context

[2–4 sentences describing the situation that required a decision.
What is the problem? What constraints existed?]

## Decision

[The change we are making, stated in active voice: "We will…"]

## Consequences

### Positive

- [What this makes easier or better]

### Negative

- [What this makes harder or constrains]

### Neutral

- [Follow-on note or reversibility consideration]

## Alternatives Considered

- **[Option B]:** [brief description and why rejected]
- **[Option C]:** [brief description and why rejected]
```

[adrs/000-template.md](adrs/000-template.md) is the single source of truth; if the two ever diverge, the file in `adrs/` wins.

---

## ADR Numbering and Naming

ADRs are numbered sequentially starting at `001`. The filename is `NNN-kebab-case-title.md` where the title matches the ADR heading.

| ADR Number | Scope                          | Example                             |
| ---------- | ------------------------------ | ----------------------------------- |
| 001–019    | Workspace / monorepo tooling   | `001-monorepo-tooling-choice.md`    |
| 020–039    | Shared packages                | `020-typescript-config-strategy.md` |
| 040–059    | Project 1 (AI Flashcards)      | `040-flashcard-storage-backend.md`  |
| 060–079    | Project 2 (Invoice Automation) | —                                   |
| ...        | ...                            | —                                   |
| 180+       | Project 9 (Enterprise OS)      | —                                   |

Numbers are never reused. When an ADR is superseded, its status is updated to `Superseded by ADR-NNN` and a new ADR is written.

---

## ADR Lifecycle

```
Proposed → Accepted → [Superseded | Deprecated]
```

- **Proposed**: the decision is being considered. The ADR is written and shared for input before a final decision is made.
- **Accepted**: the decision has been made and is in effect.
- **Superseded**: the decision has been replaced by a newer ADR. The old ADR is kept for historical context.
- **Deprecated**: the decision no longer applies (e.g., the technology was removed) but was not replaced by a new decision.

---

## Using AI to Draft ADRs

AI is well-suited to drafting ADRs once you have identified the decision, options, and rationale. Use the ADR prompt from [14-ai-prompt-library.md](14-ai-prompt-library.md) and then review the draft against these criteria:

1. Does the context section accurately describe the situation without editorialising?
2. Are the options balanced — does each one get a fair description?
3. Is the rationale for the chosen option honest about the trade-offs?
4. Are the consequences (both positive and negative) specific, not generic?

A good ADR is honest about trade-offs. An ADR that only lists positives for the chosen option is not credible and will not be trusted by future readers.

See [adrs/](adrs/) for the current catalogue of ADRs.
