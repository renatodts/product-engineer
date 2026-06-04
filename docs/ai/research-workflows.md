# Research Workflows

## Purpose

This playbook documents the **Knowledge Verification Chain** in full — the ordered research discipline used in this repo to verify AI-generated technical claims before acting on them. The chain is referenced throughout these playbooks and in [../03-ai-development-philosophy.md](../03-ai-development-philosophy.md) and [../12-ai-assisted-development.md](../12-ai-assisted-development.md). This is the canonical definition.

The chain exists because AI models are confident by default. Confidence and accuracy are independent variables. The chain replaces confidence with evidence.

---

## When to use

Apply the Knowledge Verification Chain whenever AI provides — or you are about to rely on — any of the following:

- A library API call, method signature, or configuration option.
- A version number or compatibility range (e.g., "this works with Node 22").
- A third-party API behaviour, endpoint path, or response shape.
- A claim about framework-specific patterns (NestJS decorators, Next.js App Router conventions, Expo config plugins).
- Any answer involving a package that was released, significantly changed, or deprecated within the last 2 years.

Do not apply the chain for: general programming concepts, internal business logic, refactoring decisions, or code review. The chain is for external facts that could be wrong due to training cutoff, not for reasoning tasks.

---

## The Five Steps

### Step 1 — Codebase

**Question**: Does the existing code already answer this?

Check first: existing working code is the most reliable source in the repo. If the codebase already uses the library or pattern in question, the answer is there. Look at:

- Existing usages of the library or API in the monorepo (`grep` or IDE search).
- The `package.json` for installed versions.
- Existing test files that exercise the relevant behaviour.
- Existing configuration files (e.g., `turbo.json`, `tsconfig.json`, `vitest.config.ts`).

**When to move to step 2**: the codebase does not have a prior usage of the pattern, or the existing usage may itself be outdated.

---

### Step 2 — Project Docs

**Question**: Has this already been decided in `docs/`?

Check the engineering reference documents in `docs/`:

- [06-repository-conventions.md](../06-repository-conventions.md) for naming and structural patterns.
- [07-monorepo-architecture.md](../07-monorepo-architecture.md) for Turborepo and PNPM conventions.
- [08-ddd-guidelines.md](../08-ddd-guidelines.md) for DDD layering decisions.
- [10-testing-guidelines.md](../10-testing-guidelines.md) for test framework choices.
- `docs/adrs/` for architectural decisions that have been recorded.

**When to move to step 3**: the docs do not cover this, or you need current library documentation beyond what the project docs contain.

---

### Step 3 — Context7

**Question**: What does the library's current documentation say?

Use the Context7 MCP (`resolve-library-id` then `query-docs`) to fetch current documentation for any library, framework, or tool. Context7 provides documentation pulled from the live library sources — it is authoritative for current API shapes, configuration options, and migration guides.

Use Context7 for:

- TypeScript, Node.js, PNPM, Turborepo
- NestJS (decorators, modules, testing module, CLI)
- Next.js (App Router, middleware, config)
- Expo (config plugins, EAS build, managed workflow)
- Vitest, Jest, Playwright (configuration, assertion API)
- Any npm package where the API matters

**How to verify with Context7**:

```
# 1. Find the library ID
resolve-library-id: "nestjs dependency injection"

# 2. Query the specific question
query-docs: libraryId="/nestjs/nest", question="how to use custom injection tokens in NestJS v10"
```

**When to move to step 4**: Context7 does not have documentation for the library, or the question is about a very recent release or community behaviour not captured in the official docs.

---

### Step 4 — Web Search

**Question**: What do current changelogs, release notes, or community posts say?

Use web search for:

- Release notes or migration guides for a specific version.
- Known bugs or breaking changes reported since the library's last major release.
- Community workarounds for issues not covered in official documentation.
- Behaviour that is intentional but not documented (common in fast-moving libraries).

Web search is the fourth step — not the first — because it produces the least reliable signal. Community posts may be outdated, opinionated, or specific to a different configuration than this repo uses.

**When to move to step 5**: web search returns conflicting information, no current results, or results that do not apply to this repo's specific stack combination.

---

### Step 5 — Flag as Uncertain

**If steps 1–4 do not resolve the question**: explicitly flag it as uncertain.

Do not:

- Ship code that relies on an unverified assumption.
- Let AI fill in the gap with a confident guess.

Do:

- Record the uncertainty in the spec: "OPEN QUESTION: [what is uncertain] — must resolve before implementing [APPN-NNN]."
- Add a `TODO(verify):` comment in the code if something must be deferred.
- Raise the open question in the next design or planning session with a human.

Flagging uncertainty is not a failure — it is the honest output of a complete verification chain.

---

## Example prompts

### Explicit chain-step prompt

```
I need to know: [specific technical question about library/API/version]

Please apply the Knowledge Verification Chain:
1. Is there existing usage in this codebase I can paste for you? [yes/no — paste if yes]
2. Check the project docs — I will describe the relevant doc if needed.
3. Use Context7 to find current documentation for [library name].
4. If steps 1–3 are insufficient, note what web search query to run.
5. If still uncertain after all steps, state explicitly what is unknown.

Do not answer from training data alone.
```

### Context7 query prompt

```
Using Context7, find the current documentation for [library name] answering this question:
[specific question]

Return:
1. The relevant documentation excerpt
2. The library ID and version range the docs cover
3. Whether the documented behaviour matches the version installed in this project ([installed version])
4. Any caveats or known differences between versions
```

### Uncertainty flag prompt

```
I was unable to verify [claim] through the codebase, project docs, Context7, and web search.

Record this as an open question in the spec for [APP{N}-NNN]:
"OPEN QUESTION: [what is uncertain, what evidence was sought, what needs resolution]"

Do not implement any code that depends on this claim until the question is resolved.
```

---

## Anti-patterns

- **Using web search (step 4) before Context7 (step 3).** Web search is noisier and less structured. Context7 provides current official documentation from the library source, which is more reliable than community posts for API correctness questions.
- **Treating "I am fairly confident" as a passing state.** The chain produces either verified or flagged-uncertain. There is no "fairly confident" category. If you cannot verify, flag it.
- **Skipping step 1 (codebase) because the answer seems obvious.** If the codebase already uses the pattern correctly, that is the best possible evidence. A 10-second codebase search is almost always faster than a Context7 query.
- **Applying the chain to reasoning tasks.** The chain is for external facts. Whether the aggregate boundary is correct, whether the test is well-structured, or whether the refactor is safe are reasoning tasks — not fact-verification tasks. Applying the chain to reasoning produces bureaucratic overhead without value.
- **Stopping at step 3 when the question is about a very recent release.** Context7 documentation may not cover the last 1–2 releases. For version-specific migration questions, proceed to step 4.
- **Not recording the uncertainty flag in the spec.** An unwritten flag is not a flag. If step 5 is reached, it must be written into the spec so it is visible to future sessions and not accidentally assumed resolved.

---

## Validation checklist

- [ ] Before acting on any AI library API claim, steps 1–2 were checked (codebase and docs).
- [ ] Context7 was queried for any claim involving a library API, configuration option, or version compatibility.
- [ ] The Context7 result matched the installed version in this project (`package.json`).
- [ ] Web search was used only when Context7 was insufficient (not as the default research path).
- [ ] Any claim that could not be verified through steps 1–4 is recorded as an open question in the spec.
- [ ] No code that relies on an unverified claim was committed.
- [ ] The library ID used in Context7 was validated by `resolve-library-id` before `query-docs` was called.
