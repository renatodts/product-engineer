# 19 — Project Retrospective Template

A project retrospective is a structured reflection written at the end of a completed project (or at the end of a major milestone within a project). It synthesises the learning logs from the project into a durable record of what worked, what did not, what to carry forward, and what the next project should do differently.

Retrospectives are not post-mortems — they are not triggered by failures. They are a standard practice at the end of every project, regardless of how well it went. A project that went smoothly has lessons too: what made it smooth, and how do you replicate that?

The retrospective for each project is stored at `.specs/<project-name>/retrospective.md`. For the raw template file, see [../templates/project-retrospective-template.md](../templates/project-retrospective-template.md).

---

## Template

```markdown
# Project Retrospective — [Project Name]

**Complexity score**: [10–100]
**Date completed**: YYYY-MM-DD
**Duration**: [wall-clock time from first commit to "done"]
**Author**: [your name]

---

## What We Built

[2–3 sentences describing the final product. What does it do? What is the stack?
What is the most interesting technical feature? Write this as if explaining to
an engineer who has not seen the project.]

---

## What Went Well

[Specific things that worked. Not platitudes ("the team communicated well") — concrete
practices, decisions, or tools that made the project easier or better.]

-
-
- ***

## What Was Harder Than Expected

[Specific things that took longer, were more complex, or required re-work.
For each item, briefly note why it was harder than expected.]

| What | Why it was harder |
| ---- | ----------------- |
|      |                   |

---

## AI Collaboration Highlights

[Where did AI work particularly well in this project? What prompts were most effective?
What patterns of use produced the best results?]

-
- ***

## AI Collaboration Failures

[Where did AI mislead or produce wrong output? For each significant failure,
note whether it has been added to docs/15-ai-failure-cases.md.]

| Failure | Lesson | Added to failure cases? |
| ------- | ------ | :---------------------: |
|         |        |        Yes / No         |

---

## Technical Debt Accepted

[Things you knowingly left imperfect. For each item: what it is, why it was accepted,
and what the cleanup path is.]

| Debt Item | Reason Accepted | Cleanup Path |
| --------- | --------------- | ------------ |
|           |                 |              |

---

## Architectural Decisions Made

[ADRs written during this project. List them with a one-line summary of the decision.]

| ADR                             | Decision |
| ------------------------------- | -------- |
| [ADR-NNN](../adrs/NNN-title.md) |          |

---

## Skills Developed

[Specific skills that improved during this project. Be honest — this is for your own
calibration, not for an audience. Map to the levels in docs/05-engineering-growth-framework.md
if useful.]

-
- ***

## Recommendations for the Next Project

[Concrete advice for yourself before starting the next project. What setup to do
first, what to avoid, what to do differently.]

-
- ***

## One-Paragraph Summary

[Write a paragraph you could include in a portfolio or share with a recruiter.
Describe what you built, the most interesting engineering challenge, and what it demonstrates.
See docs/20-recruiter-guide.md for the audience context.]
```

---

## Facilitation Notes

If doing the retrospective alone (most common in this gym), work through each section in order. Do not skip sections because they feel empty — "nothing to report" is itself useful data. If a section genuinely has no content after 2 minutes of reflection, write "N/A — [one sentence why]."

The most valuable sections for future projects are **What Was Harder Than Expected** and **Recommendations for the Next Project**. Invest the most time there.

The retrospective should take 30–60 minutes for a project of any complexity. If it takes less than 15 minutes, the reflection is not deep enough.
