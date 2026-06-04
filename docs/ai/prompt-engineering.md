# Prompt Engineering

## Purpose

This playbook covers prompt construction principles specific to this monorepo's stack (Turborepo + PNPM, TypeScript 5.x, NestJS, Next.js, Expo, Vitest/Jest/Playwright) and workflows (TLC Spec-Driven, Conventional Commits, DDD, the `MONO-`/`PKG-`/`APP{N}-`/`CI-` requirement ID namespace).

Generic prompt advice ("be specific", "give examples") is omitted. This document only covers patterns that are distinctive to working in this repo.

---

## When to use

Use this playbook:

- Before writing a new prompt for a task type you have not done before in this repo.
- When a prompt is producing low-quality or inconsistent output and you need to diagnose why.
- When on-boarding a new AI tool and establishing baseline prompt patterns for it.

---

## Example prompts

### Loading codebase conventions explicitly

```
You are working in a TypeScript monorepo with the following conventions:
- Package manager: PNPM with workspaces
- Build orchestrator: Turborepo
- ESM everywhere except NestJS apps (which use CommonJS)
- Vitest for packages and Next.js; Jest + @nestjs/testing for NestJS; Playwright for E2E
- Conventional Commits: feat/fix/refactor/docs/test/build/ci/chore
- DDD layering: domain → application → infrastructure → presentation
- Requirement IDs: APP{N}-NNN (e.g., APP3-001)
- TLC phases: Specify → Design → Tasks → Execute

Given these constraints, [your actual task here].
```

### Anchoring to TLC phase

```
I am in the [Specify | Design | Tasks | Execute] phase for [feature name].
In this phase, the expected output is [spec / design notes / task list / code].
Do not produce output appropriate to a later phase.

[Paste relevant context: spec excerpt, design notes, task description]

[Your question or request]
```

### Scoping context to the minimum viable set

```
I need help with [specific task]. Load only these files:
- [path/to/file1] — [why it's relevant]
- [path/to/file2] — [why it's relevant]

Do not load or reference any other files unless you need to and ask me first.
```

### Requiring the Knowledge Verification Chain before answering

```
Before answering any question about library APIs or version compatibility:
1. Check if existing code in this codebase already does this (I will paste it if needed).
2. Verify against Context7 documentation.
3. If you cannot verify, say explicitly: "I cannot verify this — please check [source]."

Do not state library API details confidently without verification.
```

### Generating output in the repo's format

```
Generate a [NestJS service | Vitest test suite | ADR | spec] that follows
these conventions from this codebase:

[Paste the relevant convention excerpt from docs/ or an existing example file]

Match the naming, structure, and comment style of the example exactly.
Output the file contents only — no explanation unless I ask for it.
```

---

## Anti-patterns

- **Omitting the module system.** NestJS apps use CommonJS; everything else uses ESM. Failing to specify this causes AI to generate `import`/`export` syntax in NestJS files or `require()` calls in Vitest tests. Always state the module system when generating code.
- **Using "write a full implementation" as the task.** This produces code that fills in gaps with assumptions. Prefer incremental prompts: spec first, skeleton second, implementation third, tests fourth.
- **Asking for code without providing the affected layer.** "Write a user service" produces a flat class. "Write the application service layer for the User aggregate following DDD layering (domain → application → infrastructure)" produces code that fits the architecture.
- **Omitting existing types and interfaces.** AI will invent types that conflict with existing ones. Always paste or reference the existing domain types when asking for implementation code.
- **Not specifying the requirement ID prefix.** AI will generate requirement IDs in an arbitrary format. Explicitly state the prefix (`APP3-`, `MONO-`, etc.) and the starting number.
- **Asking a general question when you need a repo-specific answer.** "How do I test a NestJS controller?" gets you a generic tutorial. "How do I test a NestJS controller in this repo given `test/` conventions and Jest + supertest?" gets you a useful answer.

---

## Validation checklist

- [ ] The prompt specifies the module system (ESM or CJS) for any code generation task.
- [ ] The current TLC phase is stated when asking for specification, design, or implementation output.
- [ ] Context is scoped to the minimum relevant files — no whole-repo dumps.
- [ ] The relevant convention excerpt or example file is included when asking for structured output (ADR, spec, test, service).
- [ ] The requirement ID prefix is stated for any spec or task list generation.
- [ ] Library API claims in AI responses have been verified via the Knowledge Verification Chain (see [research-workflows.md](research-workflows.md)) before acting on them.
- [ ] The prompt asks for one type of output at a time (not "spec + design + tasks + implementation" in one go).
