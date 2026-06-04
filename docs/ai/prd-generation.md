# PRD Generation

## Purpose

This playbook covers AI-assisted production of Product Requirements Documents (PRDs) and feature specifications during the TLC **Specify** phase. In this repo, "PRD" and "feature spec" are used interchangeably — both refer to the written specification stored in `.specs/<project>/<feature>.spec.md` that defines the problem, acceptance criteria, non-goals, and open questions before any design or code is produced.

The spec is not a requirements document in the traditional sense — it is a thinking tool. Writing it is how you discover what you do not know. AI accelerates the first draft and challenges the completeness of the criteria, but the engineer owns the spec and every decision in it.

For the canonical spec file format, see [../../templates/feature-spec-template.md](../../templates/feature-spec-template.md).

---

## When to use

Use this playbook when:

- Starting a new feature in any of the 9 projects (use the `APP{N}-` requirement ID prefix for the relevant project).
- Refining a backlog item or GitHub issue into a spec that is precise enough to enter Design.
- Reviewing a spec for completeness before the Design phase begins.
- Generating a lightweight spec for a bug fix that is complex enough to warrant acceptance criteria (typically score 35+ projects).

Do not use this playbook for architecture decisions (use [design-doc-generation.md](design-doc-generation.md)) or task decomposition (that is the Tasks phase, after Design).

---

## Example prompts

### Write the initial spec from a feature description

```
I am starting the Specify phase for a feature in [app-name] (complexity score [N]).

Feature brief: [one or two sentences describing what the feature should do]
User: [who uses this feature — role or persona]
Problem: [what goes wrong or is missing without this feature]
Constraints: [anything the implementation must respect — performance, security, API contracts]

Produce a feature specification with these sections:
1. Problem statement (2–3 sentences, no solution language)
2. Acceptance criteria (bulleted; each item must be independently verifiable by a test or a user action)
3. Non-goals (what this feature explicitly does not do — at least 3 items)
4. Open questions (what must be resolved before Design can begin)

Requirement ID prefix: APP{N}-
Starting ID: APP{N}-001

Do not propose an implementation, data model, or library choice.
Specification only.
```

### Challenge a spec for completeness

```
Review this feature specification and challenge its completeness.

[Paste the spec]

Check for:
1. Acceptance criteria that are not independently verifiable (vague or untestable)
2. Missing criteria for known edge cases (empty state, concurrent access, error cases)
3. Missing criteria for security boundaries (authentication, authorisation, input validation)
4. Non-goals that are too broad or ambiguous
5. Open questions that are actually answerable from the existing codebase or docs

For each finding, quote the specific section and suggest a concrete improvement.
Do not rewrite the whole spec — just identify the gaps.
```

### Convert a GitHub issue into a spec

```
Convert this GitHub issue into a feature specification for the Specify phase.

Issue title: [title]
Issue body:
[Paste the issue text]

Labels / context: [any labels or linked issues]

Produce:
1. A cleaned-up problem statement (separate the symptom from the root cause if they are conflated)
2. Acceptance criteria extracted from the issue's "expected behaviour" or derived from the symptom description
3. Non-goals derived from the issue scope
4. Open questions — things the issue mentions but does not resolve

Requirement ID prefix: APP{N}-
Starting ID: APP{N}-[next available number in this project's spec]

Flag any requirement in the issue that is too vague to write a verifiable criterion for.
```

### Write acceptance criteria for a non-functional requirement

```
Write acceptance criteria for the following non-functional requirement.

Requirement: [describe the performance, reliability, security, or accessibility requirement]
Feature context: [what feature does this apply to?]
Current baseline: [what is the current behaviour or absence of behaviour?]

Each criterion must be:
- Measurable (has a threshold or condition that can be checked)
- Testable (can be verified by a test, a tool, or a defined procedure)
- Scoped (applies to a specific part of the system, not "the whole app")

Requirement ID prefix: APP{N}-
```

### Generate open questions for a complex feature

```
I have written a spec for [feature name] but I suspect there are open questions I have not surfaced.

Spec:
[Paste the acceptance criteria and non-goals]

Generate a list of open questions by considering:
1. Data ownership: who owns each piece of data this feature creates or modifies?
2. Concurrency: what happens if two users trigger this simultaneously?
3. Failure recovery: what is the user experience if a step in this flow fails?
4. Rollback: can this feature be safely disabled after it ships?
5. Dependencies: does this feature depend on another feature that is not yet built?
6. Regulatory/compliance: are there data retention, privacy, or audit requirements?

Flag only genuine unknowns — do not generate questions that the spec already answers.
```

---

## Anti-patterns

- **Writing acceptance criteria that include implementation language.** "The service should call `UserRepository.findById`" is not an acceptance criterion — it is an implementation constraint. Acceptance criteria describe observable behaviour, not code structure.
- **Accepting a spec with untestable criteria.** "The UI should be fast" is not verifiable. "The page load time for the invoice list should be under 2 seconds on a 4G connection" is verifiable. Challenge every criterion with "how would I write a test for this?"
- **Entering Design before open questions are resolved.** Design decisions built on unresolved assumptions produce fragile architectures. Every open question must be answered or explicitly deferred (with an owner and a deadline) before Design begins.
- **Treating non-goals as optional.** Non-goals prevent scope creep during Design and Execute. "We are not building a bulk export in this iteration" is a boundary that the Design must respect. A spec without non-goals is incomplete.
- **Generating requirement IDs in a different namespace.** Use the repo's `APP{N}-` prefix for app features, `PKG-` for shared package requirements, `MONO-` for monorepo infrastructure, and `CI-` for pipeline requirements. Mixing namespaces makes traceability harder.
- **Letting AI decide what the non-goals are.** Non-goals are strategic decisions about what is out of scope. AI will generate plausible-sounding non-goals based on common patterns. Review every non-goal and confirm it reflects an actual scope decision, not a default assumption.

---

## Validation checklist

- [ ] The spec exists at `.specs/<project>/<feature>.spec.md` before Design begins.
- [ ] Every acceptance criterion is independently verifiable — each could be the basis for a test.
- [ ] Non-goals are specific enough to act as scope boundaries during Design (not "we are not building everything else").
- [ ] Open questions are assigned for resolution and are not left as permanent unknowns.
- [ ] Requirement IDs use the correct prefix for this project (`APP{N}-`, `PKG-`, `MONO-`, `CI-`).
- [ ] The spec was reviewed for completeness — specifically: edge cases, concurrent access, error cases, and security boundaries.
- [ ] The spec does not contain implementation language (library names, class names, API paths) in the acceptance criteria unless the implementation choice is itself the requirement.
- [ ] The spec format follows [../../templates/feature-spec-template.md](../../templates/feature-spec-template.md).
