# 13 — AI Code Review

AI-assisted code review is one of the highest-leverage uses of AI in the development workflow — and one of the most misused. The leverage comes from speed: AI can scan a diff for obvious issues in seconds. The misuse comes from treating AI review as a substitute for human judgement on consequential decisions.

This document defines the protocol for AI code review in this repo: what to ask for, how to interpret the output, and what always requires a human eye.

---

## The AI Review Protocol

### Step 1 — Prepare the Context

AI review quality is directly proportional to context quality. Before invoking a review:

1. Provide the diff or the specific files changed.
2. Include the relevant spec or requirement IDs so the reviewer can check correctness, not just style.
3. Mention any constraints that are not visible in the code (e.g., "this must be idempotent because it is called from a queue consumer").

A review without context produces generic feedback. A review with context produces targeted findings.

### Step 2 — Ask for Specific Review Types

Different review types surface different issues. Use explicit review requests:

| Review Type   | Ask For                                                       | AI Strength                        |
| ------------- | ------------------------------------------------------------- | ---------------------------------- |
| Correctness   | "Does this implementation match the spec?"                    | Medium — needs spec context        |
| Security      | "Are there injection risks, broken auth, or exposed secrets?" | High — pattern-based               |
| Performance   | "Are there N+1 queries, missing indexes, or blocking calls?"  | High — pattern-based               |
| Test coverage | "Are there missing edge cases or untested failure paths?"     | High                               |
| Domain logic  | "Does this correctly enforce the aggregate invariants?"       | Low — needs domain knowledge       |
| Architecture  | "Does this follow the layering conventions?"                  | Medium — needs conventions context |

### Step 3 — Evaluate Each Finding as a Hypothesis

Every AI finding is a hypothesis. For each finding:

1. **Verify** — can you reproduce the issue or confirm it exists?
2. **Contextualise** — is the issue real in this codebase, given the constraints?
3. **Prioritise** — is this a blocker, a nice-to-have, or a false positive?
4. **Document false positives** — if AI repeatedly raises a false positive for a valid pattern in this codebase, note it in [15-ai-failure-cases.md](15-ai-failure-cases.md) so future reviewers do not waste time re-evaluating it.

---

## What AI Review Does Well

- **Finding obvious bugs**: null dereferences, incorrect boolean logic, off-by-one errors, missing error handling.
- **Security patterns**: SQL injection vectors, missing input validation, insecure defaults, secrets in code.
- **Test gap detection**: "this function has 4 branches; the tests only cover 2 of them."
- **Style and convention enforcement**: naming, formatting, import order (though these are better handled by Prettier and ESLint before review).
- **Documentation quality**: are the comments accurate? Are the function signatures self-documenting?

---

## What AI Review Does Poorly

- **Domain correctness**: whether the business rule is correct requires knowing the business. AI does not know your domain.
- **Architecture fitness**: whether this design will hold up under real load requires understanding the system holistically.
- **Trade-off decisions**: AI can enumerate trade-offs but cannot make the call on what matters for your situation.
- **Performance under real conditions**: AI can identify anti-patterns (N+1 queries) but cannot predict whether a given query will be slow on your data distribution.
- **Security at the design level**: AI can find injection vulnerabilities but may miss authentication and authorisation design flaws that require understanding the system's threat model.

---

## Review Checklist for AI-Generated Code

When reviewing code that was written by AI (or heavily assisted by AI), apply additional scrutiny to:

- [ ] Does the code actually match the spec? (AI fills in ambiguities with assumptions)
- [ ] Are there implicit dependencies that are not expressed in the imports?
- [ ] Are library API calls correct for the version used in this project? (Use Context7 to verify)
- [ ] Are error cases handled, or does AI-generated code assume the happy path?
- [ ] Are there magic strings or hardcoded values that should be constants or configuration?
- [ ] Does the test actually test the behaviour, or does it just exercise the code path?

---

## Integrating AI Review into the Development Loop

AI review is most valuable as a **pre-commit check**, not as a replacement for pull request review. The workflow:

1. Implement the task (test → implement → refactor).
2. Run AI review on the diff before staging.
3. Address findings (or document why they are false positives).
4. Stage and commit.
5. Human pull request review focuses on architecture, domain correctness, and trade-offs — the things AI cannot assess.

This two-stage approach keeps AI in its area of strength (pattern matching on code) and humans in their area of strength (judgement on consequences).

See [03-ai-development-philosophy.md](03-ai-development-philosophy.md) for the principles behind this approach and [15-ai-failure-cases.md](15-ai-failure-cases.md) for cases where AI review produced incorrect findings.
