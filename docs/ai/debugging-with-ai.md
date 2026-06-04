# Debugging with AI

## Purpose

This playbook defines a systematic AI-assisted debugging workflow for this monorepo. Debugging is one of the highest-leverage AI uses in practice — AI can scan stack traces, identify common error patterns, and suggest hypotheses faster than a developer can Google them. But AI debugging without a systematic approach produces a stream of guesses that may obscure the real root cause.

This playbook imposes structure: observe → hypothesise → verify → fix. AI assists at each step but does not skip ahead to "fix it" before the root cause is confirmed.

---

## When to use

Use this playbook when:

- A test is failing and the root cause is not immediately obvious.
- A runtime error occurs in development, CI, or production.
- A behaviour is wrong but no error is thrown (logic bug).
- A performance problem manifests and the bottleneck is unknown.
- An integration with a third-party API is behaving unexpectedly.

---

## Example prompts

### Step 1 — Observe: parse the error

```
Parse the following error and tell me:
1. What file and line is the immediate point of failure?
2. What is the full call chain from the entry point to the failure?
3. What does this error type indicate in general?
4. What information is missing from this stack trace that would help diagnose the root cause?

Error / stack trace:
[Paste error output]

Runtime context:
- Framework: [NestJS / Next.js / Expo / Vitest / Jest / Playwright]
- Node version: 22
- Module system: [ESM / CJS]
- What triggered this: [describe the action or test that caused the error]
```

### Step 2 — Hypothesise: generate root cause candidates

```
Based on this error and context, generate the 3 most likely root causes, ranked by probability.

Error: [paste error type and message]
Stack trace: [paste relevant frames]
Code at the failure point: [paste the relevant function/method]
Recent changes: [list files changed in the last 1–3 commits relevant to this code path]

For each hypothesis:
1. The root cause (one sentence)
2. What would confirm it (what to check or what test to write)
3. What would rule it out

Do not attempt a fix yet — I need to verify the root cause first.
```

### Step 3 — Verify: write a reproduction

```
I want to write the smallest possible reproduction of this bug.

Hypothesis: [the root cause I am verifying]
Current context: [paste the relevant code path]

Write a Vitest (or Jest) test that:
1. Sets up the minimum state needed to trigger the bug
2. Asserts the wrong behaviour (this test should fail when the bug is present)
3. Will pass after a correct fix

Keep the reproduction minimal — no app setup, no database, no HTTP if avoidable.
```

### Step 4 — Fix: propose a targeted fix

```
Root cause confirmed: [state the root cause]

Evidence:
- [describe what confirmed the hypothesis]

Affected code:
[Paste the relevant function/method]

Propose a fix that:
1. Addresses only the confirmed root cause (no scope creep)
2. Does not change the public API of the function unless the API itself is the bug
3. Can be verified by the reproduction test from step 3

Show the diff only — no full file rewrite.
```

### Debugging a flaky test

```
This test is flaky — it passes sometimes and fails other times without code changes.

Test code:
[Paste the test]

Observed failure message (when it fails):
[Paste error message]

Hypotheses to investigate:
1. Is there shared mutable state between tests? (check beforeEach/afterEach)
2. Is there a timing dependency (unresolved promise, unwaited async, real timer)?
3. Is there a test-ordering dependency (does this test rely on state set by another test)?
4. Is there a randomness or date/time dependency?

For each hypothesis, show what to check in the code and how to make the test deterministic.
```

### Debugging a performance problem

```
This operation is slower than expected.

Operation: [describe what it does]
Observed time: [actual] vs expected: [target]
Stack: [NestJS endpoint / Vitest test / Playwright E2E]

Profile data (if available): [paste or describe]

Hypotheses to check:
1. Is there an N+1 query? (paste the ORM calls or SQL if available)
2. Is there a blocking synchronous call in an async context?
3. Is there a missing database index?
4. Is there unnecessary serialisation/deserialisation?

For each, show how to verify and what the fix would look like.
```

---

## Anti-patterns

- **Jumping to "fix it" before the root cause is confirmed.** AI will generate a plausible-looking fix for the observed symptom rather than the root cause. A fix applied without confirmation often masks the bug while leaving the root cause in place.
- **Providing only the error message without the stack trace.** Error messages are often generic. The stack trace is specific. Always provide the full stack trace, the code at the failure point, and the recent changes.
- **Debugging without a reproduction.** If you cannot write a test that reproduces the bug, you do not fully understand the bug. The reproduction is the proof that the hypothesis is correct — not the fix.
- **Accepting a multi-hypothesis fix.** If AI says "the problem might be A or B, so this fix addresses both", that is a sign the root cause is not confirmed. Go back to the verify step.
- **Debugging integration errors by reading logs alone.** Integration errors (API timeouts, unexpected 4xx responses) require checking both sides: the caller's request and the external service's actual response. Apply the Knowledge Verification Chain to any third-party API behaviour — the API may have changed since AI's training data.
- **Fixing a flaky test by adding a `sleep` or increasing a timeout.** These are workarounds that mask timing issues. The correct fix is to make the test deterministic: await the specific event, mock the timer, or eliminate the shared state.

---

## Validation checklist

- [ ] The root cause is confirmed by a failing reproduction test before any fix is applied.
- [ ] The fix addresses only the confirmed root cause — no additional "while I'm here" changes.
- [ ] The reproduction test passes after the fix.
- [ ] The full test suite for the affected package runs green after the fix.
- [ ] For flaky tests: the fix eliminates the source of non-determinism, not just the symptom.
- [ ] For integration errors: the Knowledge Verification Chain was applied to any third-party API behaviour claim.
- [ ] The bug and fix are documented in [../15-ai-failure-cases.md](../15-ai-failure-cases.md) if the root cause was an AI-generated pattern that introduced the bug.
- [ ] The fix is committed as a `fix:` Conventional Commit with the reproduction test in the same commit.
