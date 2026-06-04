# 16 — System Design Notes

This is a running notebook of system design topics encountered while building the projects in this gym. Entries are informal — they are working notes, not polished essays. Each entry records a topic that came up, the key insight or decision, and links to where it manifests in the codebase or in the formal documentation.

The notebook is ordered by the project where the topic first became relevant. Add new entries at the end of the relevant project section as you work through the gym.

---

## Project 1–2: Foundation Topics

### On Monorepo vs. Polyrepo

**Context**: choosing the repository structure at the start of the gym.

The monorepo wins for this gym for a specific reason: shared packages. When `@product-engineer/typescript-config` is used by 17 apps, a monorepo means one change to the config propagates everywhere with a single commit. In a polyrepo, that is 17 pull requests.

The cost of a monorepo is tooling complexity. Turborepo makes this manageable — the pipeline, caching, and task ordering are explicit and auditable in `turbo.json`. The tradeoff is: if you have not invested in understanding `turbo.json`, the repo will feel like a black box.

**Insight**: the monorepo decision is load-bearing at complexity scores 60+ where shared domain logic starts to emerge. At score 10, either would work. Design for where you are going, not where you are.

**Reference**: [07-monorepo-architecture.md](07-monorepo-architecture.md)

---

### On Choosing NestJS for APIs

**Context**: selecting the API framework for all projects.

NestJS was chosen because it enforces structure. A junior engineer joining a NestJS project knows where to look for things (controllers, services, modules, DTOs) without reading the entire codebase first. Express gives more flexibility but produces more variation in project structure.

The cost: NestJS is CommonJS in a world moving to ESM. This creates the module system split documented in [07-monorepo-architecture.md](07-monorepo-architecture.md). For this gym, the split is manageable. For a production system where you are shipping an npm package that needs to work in both contexts, it is worth re-evaluating.

**Insight**: framework choices are primarily social decisions. NestJS wins in teams because it is opinionated. It loses in single-developer projects where the structure is overhead. This gym is a learning environment — the structure is the point.

---

## Project 3–4: Domain Modeling Topics

### On When to Start Using Value Objects

**Context**: deciding at what complexity level to introduce DDD tactical patterns.

The temptation at score 35 is to skip value objects because "it's just a number." The problem: a `number` for `amount` and a `number` for `quantity` are both `number` — TypeScript will let you assign one to the other. A `Money` value object and a `Quantity` value object are distinct types. This eliminates a class of type-level bugs that otherwise only surface at runtime.

The test for "should this be a value object": if you have two things of the same primitive type in the same domain, and they are not interchangeable, they should be value objects.

**Reference**: [08-ddd-guidelines.md](08-ddd-guidelines.md)

---

### On Database Transaction Scope and Aggregate Boundaries

**Context**: implementing the Financial OS ledger.

An aggregate is saved as a whole unit — one repository, one transaction. When you have two aggregates that need to change together (e.g., a `Transfer` creates a debit on one `Account` and a credit on another), you have three options:

1. Use a database transaction that updates both aggregates atomically (simple but couples them at the database layer).
2. Use an outbox/saga pattern (correct but adds complexity).
3. Redesign so the operation belongs to one aggregate (sometimes the right answer, sometimes not possible).

At score 50 (Financial OS), option 1 is acceptable. At score 70+ where the aggregates might be in different services or even different databases, option 2 becomes mandatory.

**Reference**: [09-event-driven-guidelines.md](09-event-driven-guidelines.md)

---

## Project 5–6: Integration and Reliability Topics

### On Choosing Between Choreography and Orchestration

**Context**: designing the payment saga in the Payments Domain project.

Choreography (each service reacts to events independently) feels simpler but becomes hard to reason about as the number of steps grows. When a payment involves: charge authorisation → fraud check → ledger debit → notification → receipt generation, choreography means the flow is distributed across 5 event handlers with no single place to see the whole picture.

Orchestration (a saga coordinator sends commands and tracks state) adds a component but centralises visibility. For flows with 4+ steps or any branching/compensation logic, orchestration is easier to debug and extend.

**Rule of thumb**: if you cannot draw the full flow on a whiteboard without consulting 5 different service codebases, use an orchestrator.

**Reference**: [09-event-driven-guidelines.md](09-event-driven-guidelines.md)

---

## Project 7–9: Enterprise Topics

_(To be populated as these projects are built.)_

---

## Adding New Entries

Add entries to the relevant project section as you encounter them. Format:

```markdown
### On [Topic]

**Context**: [what situation prompted this note?]

[2–4 paragraphs of working notes]

**Reference**: [link to the formal doc or ADR that captures the decision]
```

Keep entries focused on the insight, not on exhaustive background. If a topic warrants more depth, it belongs in a dedicated document (a guideline, an ADR, or a spec).
