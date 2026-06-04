# 03 — AI in the Product Loop

AI is treated in this repo as a first-class engineering collaborator, not as a code-completion autocomplete. The distinction matters: an autocomplete mindset optimises for the speed of individual keystrokes; a collaborator mindset optimises for the quality of decisions made across a project's full lifecycle — specification, design, implementation, review, retrospective.

The framing matters: in a product-engineering loop the scarce resource is deciding _what_ to build and iterating fast enough to find the truth. AI makes code cheap, so it is a multiplier on execution — never a substitute for the product judgment that decides which problem is worth solving.

This document captures the principles that govern how AI tools are used here. They are not abstract ideals — each one was shaped by a failure mode encountered when working without the principle in place. See [15-ai-failure-cases.md](15-ai-failure-cases.md) for concrete examples.

---

## Core Principles

### 1. Specification First, Code Second

AI is most dangerous when it is handed an ambiguous task and asked to fill in the blanks. The most common failure mode in AI-assisted development is not bad code — it is correct code solving the wrong problem. Every non-trivial feature begins with a written specification (using the TLC Spec-Driven workflow) before any AI-generated code is reviewed or merged. Specifications are stored in `.specs/` and are treated as first-class source artefacts.

### 2. The Knowledge Verification Chain

AI models have a training cutoff and cannot access your codebase, your organisation's constraints, or the current state of third-party APIs unless you give that context explicitly. The verification chain defines where to look for authoritative information before trusting an AI answer:

1. **Codebase** — what does the existing code actually do?
2. **These docs** — what has the team already decided?
3. **Context7 (library docs MCP)** — what does the library's current documentation say?
4. **Web search** — what do current release notes, changelogs, or community posts say?
5. **Flag as uncertain** — if none of the above resolves the question, flag it in the spec and do not ship until it is resolved.

This chain exists because AI answers tend to be confident regardless of accuracy. The chain forces evidence before assertion.

### 3. AI Reviews Are Hypotheses, Not Verdicts

When AI reviews code or proposes a refactor, treat the output as a set of hypotheses. Each hypothesis must be evaluated by a human who understands the context, the constraints, and the consequences of being wrong. AI code review is a force-multiplier for finding obvious issues quickly — it is not a substitute for the kind of judgement that comes from owning the system in production.

### 4. Keep Humans in the Loop on Consequential Decisions

Architecture decisions, data model changes, external API integrations, and anything that affects security or billing must have a human decision point. AI can prepare options, summarise trade-offs, and draft the ADR — but the decision is always recorded as a human choice. This creates accountability and makes retrospectives honest.

### 5. Failure Cases Are Assets

When AI produces a wrong answer, a misguided design, or a subtle bug, that case is documented in [15-ai-failure-cases.md](15-ai-failure-cases.md). Failure cases are not embarrassing — they are the most durable learning artefacts in the repo. A well-documented failure case is worth more than ten success cases because it defines the boundary of where the tool can be trusted.

### 6. Context Window Hygiene

AI models are sensitive to context quality. A context window full of irrelevant files produces worse results than a small, curated context. Before any AI-assisted implementation session, identify and load only the files that are directly relevant to the task: the spec, the affected domain, the test file, and the relevant shared package. Remove noise aggressively.

---

## Anti-Patterns to Avoid

| Anti-Pattern                                    | Why It Fails                                                                |
| ----------------------------------------------- | --------------------------------------------------------------------------- |
| "Just generate the whole feature"               | Produces code with implicit assumptions that are invisible until they break |
| Trusting AI on library versions                 | Training data may be months or years old; always verify against Context7    |
| Skipping spec because "it's a small change"     | Small changes in complex systems have large blast radii                     |
| Merging AI-generated code without running tests | Tests are the minimum bar for knowing the code does what it claims          |
| Using AI to explain code you should understand  | Explanation is not understanding; read the source, trace the execution path |

---

## Relationship to TLC Spec-Driven Workflow

The principles above are operationalised through the TLC Spec-Driven workflow described in [12-ai-assisted-development.md](12-ai-assisted-development.md). The workflow defines _how_ these principles are applied in practice, phase by phase.

See also [13-ai-code-review.md](13-ai-code-review.md) for the specific protocol around AI-assisted code review.
