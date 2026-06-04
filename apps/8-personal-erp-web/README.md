# Personal ERP — web

**Complexity score:** 85

## Purpose

A unified resource-planning system for an individual or small operation, spanning finances, projects, assets, and contacts. The web app ties these modules together with shared reporting and automation.

## Complexity Breakdown

- **Domain complexity:** High — modeling finances, projects, inventory, and relationships in one consistent system is broad and deep.
- **Architecture complexity:** High — many interdependent modules share entities and must remain transactionally coherent.
- **Infrastructure complexity:** High — cross-module reporting, automations, and integrations require durable, coordinated services.

## AI Usage

AI automates cross-module workflows, summarizes status across domains, and surfaces planning recommendations. AI-assisted development helps manage the breadth of interconnected modules.

## Future Roadmap

- [ ] Core modules for finance, projects, and contacts
- [ ] Cross-module reporting and dashboards
- [ ] AI-driven automations and planning suggestions

> Scaffold only. No business logic yet. Developed via TLC Spec-Driven — see `.specs/`.
