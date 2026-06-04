# Architecture Review

## Purpose

This playbook covers how to use AI assistance for architecture review during the TLC **Design** phase. Architecture review is one of AI's weaker areas — it requires holistic system understanding that AI cannot derive from code alone — but AI is genuinely useful for reviewing specific properties: layering violations, aggregate boundary soundness, integration point failure modes, and alternatives the author may not have considered.

The Knowledge Verification Chain (see [research-workflows.md](research-workflows.md)) is mandatory for any AI-assisted architecture review that involves library choices, third-party integrations, or version-sensitive API behaviours. AI architectural opinions about libraries are only as reliable as the training data — which may be years out of date.

---

## When to use

Use this playbook when:

- Reviewing a design proposal during the TLC Design phase before the task list is written.
- Evaluating whether a proposed aggregate boundary respects the DDD guidelines in [../08-ddd-guidelines.md](../08-ddd-guidelines.md).
- Checking whether an event-driven design follows the event sourcing and saga conventions in [../09-event-driven-guidelines.md](../09-event-driven-guidelines.md).
- Drafting or reviewing an Architecture Decision Record (ADR) before finalising it.
- Identifying failure modes that the design author may have missed.

---

## Example prompts

### Review aggregate boundaries

```
Review the following aggregate design against DDD principles.

Aggregate: [name and brief description]
Business invariants it enforces: [list]
Methods that change state: [list]
Entities inside this aggregate: [list]
Entities outside (separate aggregates) it references by ID: [list]

Check for:
1. Is the aggregate too large? (Would it become a concurrency bottleneck under load?)
2. Are all invariants owned by this aggregate, or do some require coordination with another aggregate?
3. Are there entities inside the aggregate that should be separate aggregates?
4. Are references to other aggregates by ID only (not by direct object reference)?

Provide specific findings with the line of reasoning — not generic DDD advice.
```

### Review integration failure modes

```
I am designing an integration between [service A] and [service B] in the
[app-name] application. The interaction is [describe the interaction].

Review this design for failure modes:
1. What happens if [service B] is unavailable when [service A] calls it?
2. What happens if the call succeeds but the response is never received?
3. Is the operation idempotent? If not, what happens on retry?
4. Are there race conditions if two instances run concurrently?
5. What does the system state look like after a partial failure?

For each failure mode, suggest a mitigation.
```

### Draft an ADR

```
Draft an Architecture Decision Record for the following decision.

Decision: [one sentence — what was decided]
Context: [what situation required a decision; what constraints apply]
Options considered:
  - Option A: [description]
  - Option B: [description]
  - Option C: [description, if applicable]
Decision rationale: [why this option over the others]
Consequences: [what this makes easier; what this makes harder; what must be monitored]

Follow the ADR format used in this repo:
docs/adrs/ with front-matter: Status, Date, Deciders, Context, Decision, Consequences.
Use plain language — the audience is engineers joining 6 months from now.
```

### Review layering compliance

```
Review the following file structure and imports for layering violations.

Expected layer order (no upward imports): domain → application → infrastructure → presentation

[Paste the file tree or relevant import statements]

Identify any import that violates the layer order and suggest how to fix it.
Also flag any domain entity that leaks into the infrastructure or presentation layer
without going through an application service or a mapper.
```

### Verify library choice against current documentation

```
I am considering using [library name] version [X.Y.Z] for [purpose].
The version installed in this repo is [installed version].

Before I accept this recommendation:
1. Check Context7 for the current documentation of [library name].
2. Confirm that the API patterns proposed match the installed version.
3. Flag any known breaking changes between [installed version] and the current release.
4. If you cannot confirm any of the above, say so explicitly.
```

---

## Anti-patterns

- **Accepting AI architecture recommendations without applying the Knowledge Verification Chain.** AI will confidently recommend library versions and API patterns that may be outdated. Always verify any library-specific claim through Context7 before recording it in a design decision or ADR.
- **Using AI to make the architecture decision.** AI can surface trade-offs, enumerate failure modes, and draft the ADR — but the decision is always recorded as a human choice. An ADR that says "AI recommended this" is not an ADR.
- **Reviewing architecture in isolation from the spec.** Architecture review without the acceptance criteria is incomplete. The design must satisfy the spec — feed the relevant acceptance criteria to the review prompt.
- **Skipping failure-mode analysis because the happy path looks good.** The happy path is not the architecture. Failure modes define the real complexity of an integration. Use the integration failure modes prompt for every new external integration.
- **Treating aggregate boundary review as optional at low complexity scores.** Even a score-10 project has aggregates. Getting boundaries wrong at score 10 makes the score-30 evolution much harder. Review boundaries for every new aggregate, regardless of project complexity.
- **Reviewing a design that is already implemented.** Design review belongs in the Design phase, before the task list is written. Reviewing an implementation is a code review, not a design review — the feedback is more expensive to act on.

---

## Validation checklist

- [ ] The review prompt includes the relevant spec acceptance criteria, not just the code or design sketch.
- [ ] The Knowledge Verification Chain was applied to any library, framework, or API claim in the design.
- [ ] Aggregate boundaries were checked: no entities that should be separate aggregates, all invariants inside the aggregate that owns them, references to other aggregates by ID only.
- [ ] Integration failure modes were reviewed: unavailability, partial failure, concurrent execution, idempotency.
- [ ] Layering compliance was checked: no upward imports, no domain types leaking into infrastructure or presentation without a mapper.
- [ ] If an ADR was drafted, it records the human decision — not an AI recommendation.
- [ ] The ADR draft has a Status (`Draft`), Date, and named Deciders before it is merged.
- [ ] All open questions surfaced during review are recorded in the spec and assigned for resolution before the task list is written.
