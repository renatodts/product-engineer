# Feature Spec: [Feature Name]

> **When to use:** Fill this out before writing a single line of code. Captures the _why_, _what_, and _boundaries_ of a feature so the team shares the same understanding. Reference requirement IDs from this doc in commits and PR descriptions.

---

## 1. Overview

**Feature name:** [Short, imperative name — e.g. "User authentication via OAuth"]
**Author:** [Your name]
**Date:** [YYYY-MM-DD]
**Status:** `Draft` | `In Review` | `Approved` | `Implemented`
**Requirement category:** [MONO | PKG | APP1…APP9 | CI] — determines ID prefix below

---

## 2. Problem Statement

[One paragraph: what pain or opportunity does this address? Be concrete. Include evidence (user feedback, metrics, bug reports) where available.]

---

## 3. Goals

- [Goal 1 — measurable outcome]
- [Goal 2]

## 4. Out of Scope

> List explicitly. If something is not mentioned here it may be assumed in-scope.

- [Thing that sounds related but won't be done now]
- [Deferred idea — link to follow-up ticket if exists]

---

## 5. User Stories

Use priority labels: **P1** = must-have for launch, **P2** = important but deferrable, **P3** = nice-to-have.

| ID       | Priority | Story                                           | Notes                     |
| -------- | -------- | ----------------------------------------------- | ------------------------- |
| [CAT]-01 | P1       | As a [role], I want [action] so that [benefit]. | [Constraint or edge case] |
| [CAT]-02 | P1       | As a [role], I want [action] so that [benefit]. |                           |
| [CAT]-03 | P2       | As a [role], I want [action] so that [benefit]. |                           |
| [CAT]-04 | P3       | As a [role], I want [action] so that [benefit]. |                           |

> **ID pattern:** `[CATEGORY]-[NN]` where CATEGORY is the prefix from §1 and NN is a two-digit sequence number. Example: `APP3-01`.

---

## 6. Acceptance Criteria

Each criterion uses the format: `WHEN [event/trigger] THEN system SHALL [observable behavior]`.

### [CAT]-01 — [Story title]

- WHEN [event] THEN system SHALL [behavior].
- WHEN [edge case event] THEN system SHALL [safe/graceful behavior].

### [CAT]-02 — [Story title]

- WHEN [event] THEN system SHALL [behavior].
- WHEN [invalid input is provided] THEN system SHALL [return error / reject / fallback].

### [CAT]-03 — [Story title]

- WHEN [event] THEN system SHALL [behavior].

> Add one subsection per story. Keep criteria testable — a QA engineer should be able to write a test without asking follow-up questions.

---

## 7. Design Notes

[Optional. Sketch the approach at a high level — algorithm, data flow, component layout. Link to a fuller architecture review doc if needed (`templates/architecture-review-template.md`).]

---

## 8. Dependencies & Risks

| Dependency / Risk               | Owner         | Mitigation                         |
| ------------------------------- | ------------- | ---------------------------------- |
| [External API / team / package] | [Team/person] | [Fallback plan or spike needed]    |
| [Performance risk]              | [Owner]       | [Benchmark gate, e.g. p99 < 200ms] |

---

## 9. Open Questions

- [ ] [Question that must be resolved before implementation starts]
- [ ] [Question that can be resolved during implementation]

---

## 10. References

- [Link to related ADR / RFC / issue / PR]
- [Link to design mockup or Figma]
