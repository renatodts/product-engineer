# Design Doc Generation

## Purpose

This playbook covers AI-assisted production of design documents during the TLC **Design** phase. "Design documents" here means two artefacts: **design notes** appended to the spec file and **Architecture Decision Records (ADRs)** for consequential decisions (see [../17-architecture-decision-records.md](../17-architecture-decision-records.md)).

Design documents are not generated — they are written with AI assistance. The distinction matters: AI proposes options, surfaces trade-offs, and drafts text; the engineer decides, edits, and owns the artefact. An ADR that is entirely AI-generated and not critically reviewed is worthless as a decision record because the reasoning has not been validated by a human who understands the consequences.

---

## When to use

Use this playbook when:

- You have completed the Specify phase for a feature and are entering Design.
- You need to record a consequential decision (data model change, new external dependency, major pattern choice) as an ADR.
- You are reviewing an existing design doc and need to fill gaps (missing failure modes, missing alternatives).
- You are generating a sequence diagram or data model sketch to accompany design notes.

---

## Example prompts

### Generate design notes from a spec

```
I am in the Design phase for [feature name]. The spec is:

[Paste the spec — problem statement, acceptance criteria, non-goals]

Produce design notes covering:
1. Bounded contexts involved (which aggregates and services are touched)
2. Data model changes required (new entities, changed fields, new relationships)
3. Sequence of calls for the primary acceptance-criteria flow (numbered steps)
4. Integration points with external systems (if any)
5. Failure modes for each integration point
6. Options considered with their trade-offs (at least 2 options)
7. Open questions before this design can be finalised

Do not choose between options — present trade-offs so I can decide.
```

### Draft an ADR

```
Draft an Architecture Decision Record for the following decision.

Title: [descriptive title, max 60 characters]
Status: Draft
Date: [today's date]
Deciders: [names or roles]

Context:
[What situation required a decision? What constraints apply?
What would happen if no decision were made?]

Options considered:
- Option A: [title] — [2-sentence description]
  - Pros: [bullet list]
  - Cons: [bullet list]
- Option B: [title] — [2-sentence description]
  - Pros: [bullet list]
  - Cons: [bullet list]

Decision: [which option was chosen and the primary reason]

Consequences:
- Positive: [what this makes easier]
- Negative: [what this makes harder]
- Risks to monitor: [what to watch after this decision is implemented]

Output: a complete ADR file formatted for docs/adrs/NNN-kebab-case.md.
Use plain language — the audience is engineers who join this project 6 months from now.
```

### Fill in missing failure modes

```
This design doc is missing failure mode analysis. Review it and add a section
covering failure modes for each integration point.

Design doc:
[Paste the design notes]

For each integration point:
1. What happens if the external service is unavailable?
2. What happens if the call succeeds but the caller crashes before processing the response?
3. Is the operation idempotent? If not, what is the retry behaviour?
4. Is there a partial-success state that leaves the system inconsistent?

Add these to the design doc as a "Failure Modes" section.
```

### Generate a sequence diagram (Mermaid)

````
Generate a Mermaid sequence diagram for the following interaction:

Actors: [list the systems, services, or components involved]
Flow:
[Describe the steps — who calls what, what response is expected]
Error path:
[Describe what happens on failure]

Output: a Mermaid ```sequenceDiagram block, ready to embed in a markdown file.
Keep labels short and accurate — do not invent steps that were not described.
````

### Identify missing alternatives in a design

```
This design proposes [Option A] for [the problem]. Review it and identify
at least two alternative approaches that were not considered.

Design:
[Paste the design notes]

For each alternative:
1. Brief description
2. Key trade-off vs Option A (what it makes better and worse)
3. Why it might be preferred in a different context
4. Why it is likely not the right choice for this specific context

I will decide whether to include these alternatives in the ADR.
```

---

## Anti-patterns

- **Producing an ADR without a human decision.** The ADR records a human decision and the reasoning behind it. If the "Decision" section says "AI recommended Option B", the ADR is not valid. The decision must be a named human choice.
- **Writing design notes after the implementation is complete.** Post-implementation design docs are rationalisation, not design. The value of the Design phase is constraining the implementation before it is written. Design notes after the fact have no influence on the code.
- **Skipping design notes for "small" features.** Small features in complex systems (score 35+) often have large blast radii. The Design phase does not need to produce a lengthy document — even three bullet points on bounded contexts and failure modes are enough.
- **Accepting AI-generated trade-off analysis without verifying library claims.** AI will describe trade-offs between libraries with confident specifics that may be outdated. Apply the Knowledge Verification Chain (see [research-workflows.md](research-workflows.md)) to any library-specific trade-off claim before recording it in a design doc.
- **Generating a sequence diagram without first writing the prose description.** Mermaid diagrams generated from vague descriptions tend to invent steps. Write the prose sequence first, then ask AI to convert it to Mermaid.
- **Not recording rejected options in the ADR.** The value of an ADR is not just what was decided — it is why the alternatives were rejected. An ADR with only the chosen option will be re-litigated repeatedly as new engineers join and ask why the other options were not used.

---

## Validation checklist

- [ ] Design notes exist for the feature before the task list is written (Design precedes Tasks in the TLC workflow).
- [ ] The design notes cover: bounded contexts, data model changes, call sequence, integration points, failure modes, and at least two options with trade-offs.
- [ ] Any ADR has Status, Date, Deciders, Context, Options, Decision, and Consequences sections.
- [ ] The Decision section in the ADR names the engineer who made the call — not "AI" or "the tool".
- [ ] Rejected options are recorded with their reasons for rejection.
- [ ] Library-specific claims in design notes or ADRs have been verified via the Knowledge Verification Chain.
- [ ] Sequence diagrams were generated from a written prose description, not from a vague prompt.
- [ ] The ADR file is named `NNN-kebab-case.md` and placed in `docs/adrs/`.
- [ ] Open questions that could not be resolved during Design are recorded in the spec for resolution before the task list is finalised.
