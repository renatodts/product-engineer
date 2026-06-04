# 14 — AI Prompt Library

This document is a living collection of reusable prompts for AI-assisted development tasks in this repo. Prompts are organised by category and each entry includes the prompt template, the expected output type, and any context that must be provided for the prompt to work well.

Good prompts are specific about context, explicit about output format, and honest about constraints. A vague prompt is not faster than a specific one — it just produces output that requires more re-work.

For the prompt template format used when creating new entries, see [../templates/ai-prompt-template.md](../templates/ai-prompt-template.md).

---

## Category: Specification

### Write a Feature Spec

```
You are helping specify a feature for a TypeScript + NestJS + Next.js monorepo.

Context:
- Project: [project name, complexity score]
- Feature: [one-sentence description]
- Relevant existing code: [paste key files or describe the current state]
- Constraints: [anything the design must respect]

Produce a feature specification with the following sections:
1. Problem statement (2–3 sentences)
2. Acceptance criteria (bulleted, each verifiable)
3. Non-goals (what we are explicitly not doing)
4. Open questions (what is still unclear)

Use requirement IDs with prefix [APP{N}-], starting at [APP{N}-NNN].
Do not propose a solution in this phase — specification only.
```

**Output**: draft spec for `.specs/<project>/<feature>.spec.md`
**Must provide**: project name, feature description, relevant code context

---

### Identify Missing Acceptance Criteria

```
Review this feature specification and identify any acceptance criteria that are missing:

[paste spec]

For each missing criterion, explain:
1. The scenario it covers
2. Why it matters (what could go wrong without it)
3. A suggested criterion in the same format as the existing ones

Focus on edge cases, failure modes, and security boundaries.
```

**Output**: list of proposed additions to the spec
**Must provide**: the spec file content

---

## Category: Domain Modeling

### Design an Aggregate

```
Design a DDD aggregate for the following domain concept in a TypeScript + NestJS codebase.

Domain concept: [name and description]
Business rules that must be enforced: [list the invariants]
Related aggregates: [list other aggregates it interacts with]
Project complexity score: [10–100]

Produce:
1. The aggregate root entity class (TypeScript, with invariant enforcement in methods)
2. Any value objects required
3. Domain events raised by state-changing methods
4. Notes on aggregate boundaries (what is and is not inside this aggregate)

Follow these conventions:
- Value objects are readonly and validate in the constructor
- Entity methods are business-action verbs, not setters
- Domain events are past-tense nouns
```

**Output**: TypeScript class skeletons for the aggregate and supporting types
**Must provide**: domain concept description, invariants, related aggregates

---

### Review Aggregate Boundary Decisions

```
I have designed the following aggregate structure for [domain description]:

[paste aggregate code or description]

Review the aggregate boundaries against these criteria:
1. Is the aggregate too large? (Would it become a concurrency bottleneck?)
2. Are invariants correctly placed? (Are all invariants inside the aggregate that owns them?)
3. Are any entities inside the aggregate that should be separate aggregates?
4. Are domain events raised at the right points?

Provide specific recommendations, not general advice.
```

---

## Category: Implementation

### Generate a NestJS Service Skeleton

```
Generate a NestJS service class for the following application service:

Service name: [name]
Responsibility: [one sentence]
Dependencies: [list of injected services/repositories]
Methods to implement: [list with signature and behaviour]

Follow these conventions from this codebase:
- CommonJS module system (NestJS)
- Constructor injection with @Injectable()
- Methods return domain entities or throw domain exceptions
- No business logic in the service — delegate to the aggregate
```

**Output**: `[name].service.ts` skeleton with method stubs and JSDoc
**Must provide**: service responsibility, dependencies, method signatures

---

### Write Tests for an Existing Function

```
Write Vitest unit tests for the following function:

[paste function code]

Context:
- This function is [describe what it does and why]
- It is called by [describe the calling context]
- Edge cases to cover: [list any known edge cases]

Test structure conventions:
- describe block named after the function
- it blocks starting with "should"
- No mocks unless the function has external dependencies
- Test failure cases as explicitly as success cases
```

**Output**: `.spec.ts` file with complete test suite
**Must provide**: function code, calling context, known edge cases

---

## Category: Code Review

### Review a Diff for Correctness and Security

```
Review the following diff for correctness and security issues.

Spec context: [paste relevant acceptance criteria]
Constraints: [idempotency requirements, performance requirements, etc.]

[paste diff]

For each issue found:
1. Quote the specific line(s)
2. Describe the problem
3. Suggest a fix
4. Label the severity: BLOCKER | MAJOR | MINOR | SUGGESTION

Return only real issues — do not fill the review with style suggestions
that Prettier and ESLint already enforce.
```

---

## Category: Documentation

### Draft an ADR

```
Draft an Architecture Decision Record (ADR) for the following decision.

Decision: [one sentence describing what was decided]
Context: [what was the situation that required a decision?]
Options considered: [list the alternatives that were evaluated]
Decision outcome: [which option was chosen and why]
Consequences: [what does this make easier? what does this make harder?]

Follow the ADR format used in this repo (see docs/17-architecture-decision-records.md).
Use plain language — the audience is engineers who will join this project in 6 months.
```

**Output**: draft for `docs/adrs/NNN-kebab-case.md`

---

## Maintaining This Library

Add a new prompt when:

- You find yourself writing the same prompt context from scratch more than twice.
- A prompt produces consistently high-quality output for a specific task type.

Remove or update a prompt when:

- The codebase conventions it references have changed.
- The prompt consistently produces output that requires significant re-work.
- A better prompt has been documented.

Each prompt entry should include the category, a clear name, the template, the expected output, and what context must be provided.
