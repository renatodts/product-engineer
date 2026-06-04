# 18 — Learning Log Template

A learning log is a short, structured record of what happened in a development session: what you worked on, what you learned, what blocked you, and what you want to carry forward to the next session. It takes 5–10 minutes to write and prevents the most common form of knowledge loss in solo projects: forgetting what you figured out last week.

Learning logs are personal and informal. They are not code reviews, not retrospectives, and not status reports. They are thinking-on-paper that helps you re-enter a session without losing 30 minutes to remembering where you were.

Logs are stored in `.specs/<project-name>/logs/YYYY-MM-DD.md`. They are committed to the repository because they are part of the project's learning record.

---

## Template

Copy this template for each session.

```markdown
# Learning Log — YYYY-MM-DD

**Project**: [project name]
**Session duration**: [approximate]
**Phase**: [Specify | Design | Tasks | Execute | Retrospective]

## What I worked on

[2–4 sentences describing the specific task or area. Be concrete — "worked on the invoice
service" is less useful than "implemented the `send()` method on the Invoice aggregate
and wrote 8 unit tests covering the happy path and 5 error cases."]

## What I learned

[Bullet list of specific learnings — things you did not know at the start of the session.
These can be technical (a Vitest API you discovered), domain (an invariant you had wrong),
or process (an AI prompt that worked particularly well).]

-
-
-

## What blocked me

[What slowed you down or stopped you? Include AI failures here — if AI produced wrong output,
describe it so it can be added to 15-ai-failure-cases.md if it is a recurring pattern.]

-
-

## What I want to carry forward

[Things you noticed but did not have time to address. Technical debt you are accepting.
Questions you want to answer next session. Future refactors you want to remember.]

-
-

## Links

[Links to relevant commits, specs, ADRs, or PRs created or modified in this session.]

-
```

---

## Usage Guidance

**When to write a log**: at the end of any session longer than 30 minutes. For shorter sessions, a single-sentence note in the relevant spec file is sufficient.

**When to review old logs**: at the start of a new session on the same project, skim the last 2–3 logs. The "carry forward" section of the last log is your todo list for this session.

**What makes a good log**: specificity. "Learned about aggregates" is not useful. "Learned that aggregate roots should only hold references to other aggregates by ID, not by object composition — discovered this when I tried to load an Account that included 10,000 Transactions" is useful.

**What to do with recurring blockers**: if the same type of blocker appears in 3 or more logs, it is a systemic issue. Raise it as a process change, document it in [15-ai-failure-cases.md](15-ai-failure-cases.md) if AI-related, or open a task to fix the root cause.

See [19-project-retrospective-template.md](19-project-retrospective-template.md) for the end-of-project retrospective format, which synthesises lessons from multiple learning logs.
