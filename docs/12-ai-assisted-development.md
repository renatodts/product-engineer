# 12 — AI-Assisted Development

The TLC Spec-Driven workflow is the primary framework for AI-assisted development in this repo. It was designed to address the most common failure mode of AI-augmented engineering: getting high-quality code that solves the wrong problem, or correct code that is poorly integrated into the existing system because the AI did not have enough context.

The workflow has four phases: **Specify → Design → Tasks → Execute**. The depth invested in each phase scales automatically with task complexity — a quick bug fix might spend 30 seconds in Specify and skip Design entirely; a new feature in a score-70 project might spend hours in Specify and Design before a single line of code is written.

---

## Phase Overview

```
Specify → Design → Tasks → Execute
   ↑                           |
   └─── retro/lessons loop ────┘
```

### Phase 1 — Specify

**Goal**: produce an unambiguous written specification before any code is written or designed.

The specification answers: what is the problem? Who has it? What does success look like? What are the acceptance criteria? What are the non-goals (what are we explicitly not doing)?

A spec in `.specs/` is a TLC memory artefact. It persists across sessions and is updated as understanding evolves. A spec is not a requirements document — it is a thinking tool. Writing it is how you discover what you do not know yet.

**AI role in Specify**: AI helps explore the problem space, ask clarifying questions, and check for completeness. AI does not own the spec — the engineer does. The spec captures human decisions, not AI suggestions.

**Output**: a `.specs/<project>/<feature>.spec.md` file with requirements (using the `APPN-` namespace), acceptance criteria, and explicit non-goals.

### Phase 2 — Design

**Goal**: choose the architecture and data model before writing code.

The design answers: what are the bounded contexts involved? What is the aggregate structure? What are the integration points? What are the failure modes? What are the alternatives considered and rejected?

For non-trivial features, the design phase produces an ADR draft (see [17-architecture-decision-records.md](17-architecture-decision-records.md)) and a sequence diagram or data model sketch.

**AI role in Design**: AI is strongest here. It can propose alternatives, identify missing failure modes, compare pattern trade-offs, and draft the ADR. Use the Knowledge Verification Chain (see [03-ai-development-philosophy.md](03-ai-development-philosophy.md)) to validate any AI-proposed library versions or third-party API behaviours.

**Output**: design notes appended to the spec file, plus an ADR draft for consequential decisions.

### Phase 3 — Tasks

**Goal**: decompose the design into atomic, independently verifiable implementation tasks.

Each task has:

- A single verb describing the action (`Implement`, `Add`, `Refactor`, `Write tests for`)
- A clear scope (which file, layer, or component)
- A verification criterion (how you know it is done)
- A requirement ID tracing back to the spec

Tasks are ordered to respect dependencies (infrastructure before domain, domain before application service, application service before controller).

**AI role in Tasks**: AI is useful for task decomposition and for identifying dependencies between tasks. The task list is reviewed by the engineer before execution begins.

**Output**: a task list in the spec file, each task with an ID, description, verification criterion, and requirement traceability.

### Phase 4 — Execute

**Goal**: implement the tasks in order, with a test-first discipline.

For each task:

1. Write the test (red).
2. Implement the minimum code to pass (green).
3. Refactor.
4. Commit (atomic commit per task, following Conventional Commits).

**AI role in Execute**: AI assists with implementation, spots syntax errors, suggests refactors, and reviews diffs. AI-generated code is always reviewed by the engineer before staging. Do not commit code you cannot explain.

**Output**: committed code with tests, linked to requirement IDs in the commit message where non-trivial.

---

## Knowledge Verification Chain

When any AI-generated answer involves a library API, a version, a third-party integration, or a technical claim that you cannot verify from the existing codebase:

1. Check the **codebase** — does existing code do this?
2. Check **these docs** — has this already been decided?
3. Check **Context7** — what does the library's current documentation say?
4. Check **web search** — what do current changelogs or community posts say?
5. **Flag as uncertain** — if unresolved, note the uncertainty in the spec and do not ship until resolved.

The chain is ordered by reliability and cost. Do not skip to step 4 before trying step 1.

---

## TLC Memory in `.specs/`

The `.specs/` directory is the persistent memory of the TLC workflow. It stores:

- Feature specs (pre-implementation)
- Design notes and ADR drafts
- Task lists with completion status
- Retrospective notes and lessons learned

`.specs/` is committed to the repository. It is the audit trail of how decisions were made. Engineers joining the project can read `.specs/` to understand the context and reasoning behind the code.

See [03-ai-development-philosophy.md](03-ai-development-philosophy.md) for the principles that underpin this workflow and [13-ai-code-review.md](13-ai-code-review.md) for AI review conventions.
