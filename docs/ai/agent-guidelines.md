# Agent Guidelines

## Purpose

This playbook defines how AI agents operate in this monorepo: when to delegate to sub-agents, how to manage context budgets, and the decision rule for spawning a new agent versus handling work inline. These guidelines apply to any agentic AI tool used in the repo (Claude Code, Cursor Agent, GitHub Copilot Workspace, etc.).

The goal is to keep agents effective without letting them become expensive, slow, or unpredictably destructive. An agent that spawns sub-agents for every small task is slower and harder to audit than one that does the work inline. An agent that never delegates runs out of context and produces degraded output on long tasks.

---

## When to use

Use this playbook:

- Before starting any agentic session that may span more than one file or one logical step.
- When an agent pauses and asks whether to spawn sub-agents.
- When designing a prompt chain or a multi-step automated workflow.
- When an agent-generated result is lower quality than expected and you suspect context overflow.

---

## Example prompts

### Spawn decision check

```
Before you proceed, tell me: will this task require reading more than 5 files or
producing more than 3 distinct output artefacts? If yes, propose a sub-agent
breakdown where each sub-agent has a single clear responsibility and writes its
output to a named artefact. Wait for my approval before spawning.
```

### Sub-agent scoping

```
I need to implement [feature] in the [app-name] app. Break this into sub-agents
using these constraints:
- Each sub-agent has exactly one responsibility (e.g., "write domain entity",
  "write application service", "write controller", "write tests").
- Each sub-agent receives only the files it needs — no whole-repo dumps.
- Each sub-agent outputs to a named file. Sub-agents do not call each other.
- List the sub-agents and their file inputs/outputs before starting.
```

### Context-budget reset

```
Your context is getting long. Before continuing, summarise the decisions made so
far in 5 bullet points, then discard all intermediate reasoning and continue from
that summary. Load only [list specific files] for the next step.
```

### Inline-vs-spawn decision prompt

```
For the task "[task description]", answer these questions:
1. How many files must be read to complete this? (estimate)
2. How many distinct output files will be produced?
3. Does this task have subtasks that are independent of each other?

If reads > 5 OR outputs > 3 OR independent subtasks exist: propose a sub-agent plan.
Otherwise: proceed inline and explain why inline is appropriate.
```

---

## Anti-patterns

- **Spawning sub-agents for tasks that take under 2 minutes inline.** Sub-agent setup adds latency and coordination overhead. Reserve delegation for genuinely parallel or context-heavy work.
- **Dumping the whole repo into a sub-agent's context.** Each sub-agent should receive the minimum files needed for its specific task. Noise in context degrades output quality.
- **Sub-agents writing to the same file concurrently.** Concurrent writes cause conflicts. Assign each sub-agent a distinct output file or a distinct named section.
- **Forgetting to checkpoint before a long agentic run.** Before any session that may run 10+ minutes, establish a written checkpoint: the goal, the current state, and the plan. This makes recovery possible if the session is interrupted.
- **Trusting agent-generated code without review.** Sub-agents produce code at speed, not at correctness. Every sub-agent output must be reviewed before committing, just like any other AI-generated code.
- **Using sub-agents to work around context limits instead of reducing context.** If you are spawning sub-agents because the context is too long, the real fix is to trim the context — load fewer files, use summaries, and close completed tasks.
- **Letting an agent make architecture decisions without a human checkpoint.** Agents can propose and draft; humans decide. Any task that involves an ADR-worthy choice must pause for human review before proceeding.

---

## Validation checklist

- [ ] The task scope has been assessed before deciding inline vs. spawn (reads, outputs, independence).
- [ ] Each sub-agent has a single stated responsibility and knows its input files.
- [ ] Sub-agents write to distinct output artefacts; no concurrent writes to the same file.
- [ ] A written checkpoint exists before any agentic run longer than ~10 minutes.
- [ ] Context passed to each agent contains only relevant files (no whole-repo dumps).
- [ ] Sub-agent outputs have been reviewed by a human before staging.
- [ ] Any agent-surfaced architecture decision has a human decision point before implementation proceeds.
- [ ] Context-budget warnings have been acted on (summarise + reset) rather than ignored.
