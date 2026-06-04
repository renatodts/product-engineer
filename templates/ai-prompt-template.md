# AI Prompt: [Short Name for This Prompt]

> **When to use:** Fill this out when you want a reusable, reviewable prompt — not a one-off chat message. Well-designed prompts are version-controlled, testable, and shareable. Use this template for prompts that will be called from code, run repeatedly, or shared with the team.

---

## 1. Meta

**Prompt name:** [Short slug, e.g. `generate-commit-message`]
**Author:** [Name]
**Date:** [YYYY-MM-DD]
**Model target:** [e.g. claude-sonnet-4-6, gpt-4o, any]
**Prompt type:** `Zero-shot` | `Few-shot` | `Chain-of-thought` | `Tool use` | `Agentic`

---

## 2. Goal

[One or two sentences: what should the model produce? Frame it as an output, not an activity. Example: "Given a git diff, produce a Conventional Commits commit message of at most 72 characters on the subject line."]

**Success looks like:** [How will you know the output is good? Tie to measurable criteria where possible.]

---

## 3. Context to Provide

> List the runtime context the caller must inject into the prompt. This becomes the input contract.

| Variable / slot         | Type / format              | Required? | Description                          |
| ----------------------- | -------------------------- | --------- | ------------------------------------ |
| `{{[variable_name]}}`   | [string / JSON / markdown] | Yes / No  | [What it is and where it comes from] |
| `{{[variable_name_2]}}` | [string]                   | Yes       | [Description]                        |

**System prompt context** (if applicable):
[Describe the persona or system prompt the model should operate under, e.g. "You are a senior TypeScript engineer reviewing code for a Turborepo monorepo."]

---

## 4. Prompt Body

> Write the full prompt below. Use `{{variable}}` placeholders for dynamic content. Include instructions, constraints, and output format expectations inline.

```
[System prompt — optional]
You are [persona / role].

[User / human turn]
[Task description with injected context]

{{[variable_name]}}

[Output format instructions]
Respond with [format: JSON object / markdown list / plain paragraph / etc.].
[Specific structure if JSON or structured output:]
{
  "[field]": "[description]",
  "[field2]": "[description]"
}

[Constraints]
- [Constraint 1: e.g. "Do not include reasoning in the output."]
- [Constraint 2: e.g. "If the input is ambiguous, ask one clarifying question instead of guessing."]
```

---

## 5. Expected Output Shape

[Paste or describe a representative ideal output. This is the "golden example" used to validate the prompt and onboard new users.]

```
[Example output — use realistic but non-sensitive data]
```

**Edge cases:**

| Input condition               | Expected output behavior                             |
| ----------------------------- | ---------------------------------------------------- |
| [Empty / null input]          | [Model should return X / refuse / ask for more info] |
| [Ambiguous input]             | [Model should clarify before proceeding]             |
| [Input outside stated domain] | [Model should decline and explain why]               |

---

## 6. Validation Checklist

Run through this list before shipping the prompt to production or sharing with the team.

- [ ] Output matches expected shape on the golden example above.
- [ ] Model handles each edge case correctly (see §5).
- [ ] Prompt has been tested with at least [N] diverse real inputs.
- [ ] Token budget is acceptable: estimated [N] input tokens + [N] output tokens per call.
- [ ] No sensitive data (PII, secrets, internal URLs) is hardcoded in the prompt body.
- [ ] Variable slots are clearly documented in §3 so callers know what to inject.
- [ ] Constraints in §4 prevent the most common failure modes observed during testing.

---

## 7. Anti-patterns

> Document failure modes you discovered while designing or testing this prompt, so future editors know what not to do.

- **[Anti-pattern 1]:** [What it looks like] — [why it fails] — [how the current prompt guards against it].
- **[Anti-pattern 2]:** [Description] — [failure mode] — [mitigation].
- **[Anti-pattern 3 — common LLM pitfall]:** [e.g. "Asking for JSON and prose in the same message causes the model to mix formats."] — [Fix: separate into two prompts or use structured output mode.]

---

## 8. Version History

| Version | Date         | Author | Change summary         |
| ------- | ------------ | ------ | ---------------------- |
| 1.0     | [YYYY-MM-DD] | [Name] | Initial version        |
| 1.1     | [YYYY-MM-DD] | [Name] | [What changed and why] |
