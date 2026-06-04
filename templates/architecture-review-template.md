# Architecture Review: [Change Title]

> **When to use:** Any change that crosses package or app boundaries, introduces a new dependency, alters a public API contract, or affects runtime performance/scalability. Fill this out and get sign-off before implementation begins.

---

## 1. Context

**Author:** [Your name]
**Date:** [YYYY-MM-DD]
**Status:** `Draft` | `In Review` | `Approved` | `Superseded`
**Related spec:** [Link to feature-spec-template.md or requirement ID, e.g. APP2-03]
**Reviewers:** [Names / GitHub handles of required approvers]

### Background

[2–4 sentences: what is the system today, and what pressures or requirements are driving this change? Give reviewers enough context to evaluate the proposal without needing to read the full spec.]

---

## 2. Current Architecture

[Describe the relevant slice of the system as it exists today. Diagrams, bullet lists, or prose are all fine. Focus on the parts this change touches.]

```
[Optional: ASCII diagram or mermaid block of current state]
```

**Key observations / pain points:**

- [Why the current design is insufficient for the new requirement]
- [Technical debt or constraint that constrains options]

---

## 3. Proposed Change

[Describe the new design clearly enough that an engineer can implement it from this doc alone. Include a before/after if helpful.]

```
[Optional: diagram of proposed state]
```

**What is changing:**

- [Package / module / service A]: [what changes]
- [Package / module / service B]: [what changes]

**What is NOT changing** (clarify to prevent scope creep):

- [Component X] remains unchanged.
- [Existing API Y] is preserved as-is.

---

## 4. Component Interfaces

> Define the contracts that cross package or service boundaries. Include TypeScript types, REST endpoints, event schemas, or CLI flags — whichever is relevant.

### [Interface / API name]

```typescript
// Example: exported type from a shared package
export interface [InterfaceName] {
  [field]: [type]; // [description]
}
```

### [Second interface if applicable]

```typescript
// [description]
```

**Versioning / backward compatibility:** [Will existing consumers break? How will migration be handled?]

---

## 5. Reuse

> Before building new, enumerate what already exists in the repo that can be reused or extended.

| Existing asset                    | Location                     | How it will be reused / extended |
| --------------------------------- | ---------------------------- | -------------------------------- |
| [Package / utility / config]      | `packages/[name]`            | [Extend, wrap, or consume as-is] |
| [Shared tsconfig / eslint config] | `packages/config-typescript` | [Inherit without modification]   |
| [Other existing artifact]         | [Path]                       | [Usage description]              |

If nothing is reused, justify why a net-new implementation is warranted.

---

## 6. Risks

| Risk                                  | Likelihood   | Impact   | Mitigation                              |
| ------------------------------------- | ------------ | -------- | --------------------------------------- |
| [Breaking change to shared interface] | Medium       | High     | [Versioned export + deprecation notice] |
| [Performance regression]              | Low          | High     | [Benchmark in CI, rollback plan]        |
| [Increased bundle size]               | Medium       | Medium   | [Bundle analysis step in CI]            |
| [Third-party dependency risk]         | [Likelihood] | [Impact] | [Pin version, vendor if critical]       |

---

## 7. Decision

**Chosen approach:** [Restate the option selected from any alternatives considered]

**Alternatives considered:**

1. **[Alternative A]** — [brief description]. Rejected because [reason].
2. **[Alternative B]** — [brief description]. Rejected because [reason].

**Approvals:**

| Reviewer        | Decision                     | Date         | Notes     |
| --------------- | ---------------------------- | ------------ | --------- |
| [Name / handle] | Approved / Changes requested | [YYYY-MM-DD] | [Comment] |

---

## 8. Follow-up Tasks

- [ ] [Implementation task linked to a ticket or requirement ID]
- [ ] [Update documentation / CLAUDE.md if conventions change]
- [ ] [Migration guide if existing consumers are affected]
