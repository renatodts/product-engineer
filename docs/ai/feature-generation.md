# Feature Generation

## Purpose

This playbook walks through AI-assisted feature generation end-to-end, from the first prompt in the Specify phase to a committed, tested implementation in the Execute phase. It operationalises the TLC Spec-Driven workflow (Specify → Design → Tasks → Execute) for this monorepo's stack.

Feature generation is the highest-risk AI-assisted workflow because it touches all four phases. The most common failure mode is skipping Specify and going straight to code — producing an implementation that is technically correct but solves the wrong problem or violates an unstated constraint. Every step in this playbook exists to prevent that.

---

## When to use

Use this playbook when:

- Adding a new feature to any of the 9 projects in this monorepo.
- Extending an existing feature with new behaviour that requires a spec update.
- Implementing a feature from a backlog item or a GitHub issue.

Do not use this playbook for bug fixes (use [debugging-with-ai.md](debugging-with-ai.md)) or pure refactors with no behaviour change (use [refactoring-playbook.md](refactoring-playbook.md)).

---

## Example prompts

### Phase 1 — Specify: write the initial spec

```
I am starting the Specify phase for a new feature.

Project: [app name], complexity score [10–100]
Feature: [one-sentence description of the feature]
Problem it solves: [who has the problem and what happens without this feature]

Produce a feature specification with these sections:
1. Problem statement (2–3 sentences)
2. Acceptance criteria (bulleted; each criterion must be independently verifiable)
3. Non-goals (what this feature explicitly does not do)
4. Open questions (what is still unclear before design can begin)

Use requirement ID prefix APP{N}- starting at APP{N}-001.
Do not propose an implementation yet — specification only.
```

### Phase 1 — Specify: find missing acceptance criteria

```
Review this feature specification and identify acceptance criteria that are missing.

[Paste the spec]

For each gap, provide:
1. The scenario not covered
2. Why it matters (what goes wrong without it)
3. A suggested criterion in the same format as the existing ones

Focus on: edge cases, failure modes, concurrent access, and security boundaries.
```

### Phase 2 — Design: propose architecture options

```
I am in the Design phase for [feature name] (APP{N}-001 through APP{N}-00X).

Spec summary:
[Paste the acceptance criteria]

Stack: TypeScript, NestJS (CJS), Next.js (ESM), PNPM monorepo.

Propose 2–3 architecture options for implementing this feature. For each option:
1. Brief description of the approach
2. Data model changes required
3. Integration points with existing aggregates or services
4. Key trade-offs (what it makes easier, what it makes harder)
5. Failure modes to handle

Do not choose an option — present the trade-offs so I can decide.
```

### Phase 3 — Tasks: decompose into atomic tasks

```
I have chosen [Option N] from the design phase for [feature name].

Design decision: [one-sentence summary of the chosen approach]

Decompose the implementation into atomic tasks. Each task must:
- Have a single verb describing the action (Implement, Add, Refactor, Write tests for)
- Scope to a single file or a single cohesive set of changes
- Have a verification criterion (how I know it is done)
- Reference the requirement ID it satisfies

Order tasks to respect the DDD layer dependency:
domain entity → value objects → application service → repository interface →
infrastructure adapter → controller/resolver → tests → E2E (if applicable)
```

### Phase 4 — Execute: implement a single task

```
I am executing task [TASK-ID]: [task description]

Requirement: [APP{N}-NNN — acceptance criterion text]

Context files:
[Paste or reference: spec excerpt, affected entity, existing service, test file]

Step 1: Write the failing test first (red).
Step 2: Show me the minimal implementation to make it pass (green).
Step 3: Suggest any refactor opportunities after green.

Do not skip step 1 — I need to see the test before the implementation.
```

---

## Anti-patterns

- **Asking AI to "build the full feature" without going through Specify first.** This produces code with implicit assumptions that are invisible until integration time. The Specify phase exists to make assumptions explicit before any code is written.
- **Starting Design before Specify is done.** Design decisions made without clear acceptance criteria will be revised or discarded. Complete the spec — including open questions — before proposing an architecture.
- **Generating a task list without a design decision.** Tasks flow from design. A task list without a design context produces a flat to-do list, not a properly sequenced implementation plan.
- **Implementing multiple tasks in one AI session without commits between them.** Atomic tasks should produce atomic commits. Running 5 tasks before committing makes the diff unreviable and breaks traceability to requirement IDs.
- **Trusting AI-generated type signatures without checking existing domain types.** AI will invent types that conflict with existing ones. Always paste the existing aggregate or value object definitions when generating new code that interacts with them.
- **Skipping the test-first step in Execute.** Writing tests after implementation means the tests follow the implementation, not the spec. The test is the first check that the implementation matches the acceptance criterion.

---

## Validation checklist

- [ ] A spec file exists at `.specs/<project>/<feature>.spec.md` with requirement IDs before any code is written.
- [ ] Acceptance criteria are independently verifiable (not "works correctly" or "is fast").
- [ ] Open questions from Specify were resolved before Design began.
- [ ] A design option was explicitly chosen and the choice is recorded in the spec or an ADR draft.
- [ ] The task list is ordered by layer dependency (domain before application before infrastructure before presentation).
- [ ] Each task has a verification criterion and a requirement ID.
- [ ] Tests were written before implementation code for each task (red before green).
- [ ] Each task produced one atomic commit with a Conventional Commit message referencing the requirement ID.
- [ ] All acceptance criteria from the spec have a corresponding passing test.
