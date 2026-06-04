# Life OS — api

**Complexity score:** 35

## Purpose

Backend for a personal "operating system" that unifies tasks, notes, habits, and goals into a single planning layer with AI-assisted prioritization and daily review. Aims to be the system of record for an individual's day-to-day execution.

## Complexity Breakdown

- **Domain complexity:** Medium — several interrelated domains (tasks, projects, habits, journals) with linking and recurrence rules.
- **Architecture complexity:** Medium — modular feature boundaries and scheduled jobs for reminders and rollups, but still a single deployable.
- **Infrastructure complexity:** Low — one primary database with a job scheduler; no multi-service coordination yet.

## AI Usage

AI summarizes daily activity, proposes prioritized plans, and surfaces neglected goals from accumulated context. AI-assisted development drives module scaffolding, recurrence-logic specs, and generated tests across domains.

## Future Roadmap

- [ ] Unified task, note, and habit data model
- [ ] AI daily-planning and review endpoints
- [ ] Recurrence engine and reminder scheduling

> Scaffold only. No business logic yet. Developed via TLC Spec-Driven — see `.specs/`.
