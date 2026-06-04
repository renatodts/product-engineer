---
description: Phase 1 Analysis and Spec - drive TLC SDD to produce a spec or plan before any code
argument-hint: <feature or ticket description>
---

You are running Phase 1 (Analysis and Spec) of the SDLC harness in CLAUDE.md.

Goal: decide WHAT to build and capture it with traceable requirement IDs, before writing any code.

1. Invoke the `tlc-spec-driven` skill with the Skill tool. Let it auto-size the scope
   (Quick / Medium / Large / Complex). Do not force a heavyweight pipeline onto a small change.
2. If this touches an unfamiliar part of the tree, invoke `codenavi` first to orient (read only).
3. For risky or ambiguous scope, red-team the plan with the `the-fool` skill before locking it.
4. Produce the artifact and stop:
   - Quick mode: `.specs/quick/NNN-slug/TASK.md`
   - Medium/Large/Complex: `.specs/features/<slug>/spec.md` (plus `design.md` / `tasks.md` only
     when the skill says the scope needs them).
5. Use the requirement ID namespace already in the repo (`MONO-`, `PKG-`, `APP1-`..`APP9-`, `CI-`).

Do NOT write feature code in this phase. Output the spec path and a one-line summary of scope and
the requirement IDs created.

Ticket: $ARGUMENTS
