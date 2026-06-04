# 15 — AI Failure Cases

This document is a running record of cases where AI produced incorrect, misleading, or actively harmful output during development in this repo. Documenting failures is not about criticism — it is about building calibration. Each entry defines the boundary of what AI can be trusted to do unsupervised in this codebase.

A well-documented failure case is more valuable than ten success cases. Success cases confirm what AI is good at; failure cases define where human verification is mandatory.

Every entry includes: the context, what AI produced, why it was wrong, and the lesson learned.

---

## Failure Case 001 — Stale Library API

**Date**: project scaffold phase
**Task**: asked AI to generate a NestJS dynamic module registration using `forRootAsync`
**What AI produced**: code using `ConfigService` injection with the `useFactory` pattern, but with a `ConfigModule.forRoot` import that used an option (`envFilePath` as a string) that was valid in NestJS Config v1 but deprecated in v2 in favour of an array.

**Why it was wrong**: the AI's training data reflected the v1 API. The project uses `@nestjs/config` v3, where passing a bare string to `envFilePath` triggers a deprecation warning and, in strict mode, a runtime error.

**How it was caught**: Context7 lookup of `@nestjs/config` documentation showed the current API expected `envFilePath` to be `string | string[]`.

**Lesson**: any AI-generated code that includes a library API call must be verified against current library documentation before committing. Do not assume that "it looks reasonable" means it is correct. Use the Knowledge Verification Chain.

**Mitigation**: added "verify library API version" as a checklist item in the Execute phase of the TLC workflow.

---

## Failure Case 002 — Missing Idempotency in Webhook Handler

**Date**: Payments Domain planning phase (illustrative pre-build example)
**Task**: asked AI to implement a Stripe webhook handler for `payment_intent.succeeded`
**What AI produced**: a handler that immediately created a payment record in the database on event receipt, without checking whether the event had already been processed.

**Why it was wrong**: Stripe delivers webhooks with at-least-once semantics. Under normal conditions, a webhook may be delivered 2–3 times in the first few seconds. The AI-generated handler would create duplicate payment records, double-crediting user accounts.

**How it was caught**: during spec review, the acceptance criteria included "must be idempotent with respect to the Stripe event ID." The AI-generated code did not satisfy this criterion. The reviewer cross-referenced [09-event-driven-guidelines.md](09-event-driven-guidelines.md) which requires idempotency key tables for all webhook handlers.

**Lesson**: AI-generated code for event or webhook handlers almost always omits idempotency handling. This is a systematic gap, not an occasional miss. Treat any AI-generated handler as idempotency-incomplete until proven otherwise.

**Mitigation**: added "idempotency handling present" as a mandatory code review checklist item for all queue consumers and webhook handlers.

---

## Failure Case 003 — Aggregate Boundary Confusion in Multi-Entity Domain

**Date**: Financial OS design phase (illustrative pre-build example)
**Task**: asked AI to design the aggregate structure for a personal finance system with accounts, transactions, and budgets
**What AI produced**: a single `FinancialProfile` aggregate root containing `Account`, `Transaction`, and `Budget` entities — all nested under one root with shared state.

**Why it was wrong**: this design creates a concurrency bottleneck (every transaction update locks the entire financial profile), violates the principle of keeping aggregates small, and makes the Transaction and Budget lifecycles impossible to evolve independently. In a real system, a user might have thousands of transactions; loading all of them to add a new one is prohibitive.

**How it was caught**: during design review, the aggregate size heuristic in [08-ddd-guidelines.md](08-ddd-guidelines.md) was applied: "start small, separate entities that rarely change together." `Transaction` and `Budget` are independently updated — they should be separate aggregates with references by ID, not by composition.

**Lesson**: AI tends to produce "everything in one aggregate" designs because it mirrors class hierarchy thinking. For any domain with entities that update independently or at different frequencies, the AI-proposed aggregate design must be reviewed against the aggregate sizing heuristics before implementation starts.

**Mitigation**: include the aggregate sizing heuristic ("entities that rarely change together belong in separate aggregates") as explicit context in any prompt asking AI to design a domain model.

---

## Template for New Entries

When adding a new failure case:

```markdown
## Failure Case NNN — [Short Title]

**Date**: [when this occurred — project name or phase]
**Task**: [what were you asking AI to do?]
**What AI produced**: [describe the output]
**Why it was wrong**: [explain the error, with technical detail]
**How it was caught**: [what review step or verification caught it?]
**Lesson**: [one-paragraph generalisation — what class of tasks does this affect?]
**Mitigation**: [what process or checklist change prevents recurrence?]
```

Do not delete old entries. If a failure case no longer applies (e.g., a library fixed the underlying issue), mark it `[RESOLVED as of version X.Y]` and note why it is no longer relevant.
