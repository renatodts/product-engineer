# AI Workflow Playbooks

This directory contains deep-dive playbooks for AI-augmented engineering in this monorepo. They complement the higher-level documents in `../` — particularly [12-ai-assisted-development.md](../12-ai-assisted-development.md), [03-ai-development-philosophy.md](../03-ai-development-philosophy.md), and [10-testing-guidelines.md](../10-testing-guidelines.md) — by providing step-by-step guidance, copy-pasteable prompts, and concrete anti-patterns for each workflow type.

---

## How These Playbooks Relate to TLC Phases

The TLC Spec-Driven workflow has four phases: **Specify → Design → Tasks → Execute**. Each playbook is aligned to the phase(s) where it has the most leverage. The table below maps each file to the phases it supports and provides a one-line summary.

| Playbook                                             | TLC Phase(s)      | Summary                                                                |
| ---------------------------------------------------- | ----------------- | ---------------------------------------------------------------------- |
| [agent-guidelines.md](agent-guidelines.md)           | All               | Sub-agent delegation, context-budget management, spawn vs. inline      |
| [prompt-engineering.md](prompt-engineering.md)       | All               | Prompt construction principles for this repo's stack and conventions   |
| [feature-generation.md](feature-generation.md)       | Specify → Execute | Generating a feature end-to-end with TLC discipline                    |
| [architecture-review.md](architecture-review.md)     | Design            | AI-assisted architecture review using the Knowledge Verification Chain |
| [test-generation.md](test-generation.md)             | Execute           | Generating Vitest / Jest / Playwright tests per the coverage matrix    |
| [refactoring-playbook.md](refactoring-playbook.md)   | Execute           | Safe AI-assisted refactoring guarded by tests                          |
| [debugging-with-ai.md](debugging-with-ai.md)         | Execute           | Systematic AI debugging workflow                                       |
| [research-workflows.md](research-workflows.md)       | Specify / Design  | The Knowledge Verification Chain in full detail                        |
| [design-doc-generation.md](design-doc-generation.md) | Design            | Producing ADRs and design notes with AI support                        |
| [prd-generation.md](prd-generation.md)               | Specify           | Producing PRDs and feature specs aligned to the TLC Specify phase      |

---

## The Knowledge Verification Chain

Several playbooks reference the **Knowledge Verification Chain** — a discipline for verifying AI-generated claims about libraries, APIs, and technical facts before acting on them. The full chain is documented in [research-workflows.md](research-workflows.md). The abbreviated form used in cross-references throughout these playbooks:

1. **Codebase** — does existing code already answer this?
2. **Project docs** — has this been decided in `docs/`?
3. **Context7** — what does the library's current documentation say?
4. **Web search** — what do current changelogs or community posts say?
5. **Flag as uncertain** — if unresolved, note it in the spec; do not ship until resolved.

---

## Reading Order

If you are new to this repo's AI workflow:

1. Read [03-ai-development-philosophy.md](../03-ai-development-philosophy.md) for the principles.
2. Read [12-ai-assisted-development.md](../12-ai-assisted-development.md) for the TLC workflow overview.
3. Read [agent-guidelines.md](agent-guidelines.md) and [prompt-engineering.md](prompt-engineering.md) as foundation skills.
4. Read the task-specific playbooks as needed.

If you are working on a specific task, jump directly to the relevant playbook using the table above.
