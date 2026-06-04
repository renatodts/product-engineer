# 08 — DDD Guidelines

Domain-Driven Design (DDD) is used in this repo as a practical tool for managing complexity, not as a theoretical framework to be applied uniformly. The tactical patterns (value objects, entities, aggregates, bounded contexts) are introduced as complexity scores rise — project 1 needs none of them, project 4 needs most of them, and project 9 requires the full vocabulary.

This document defines how each DDD concept is applied in this codebase, with conventions that are specific to the TypeScript + NestJS stack used here. It is not a comprehensive DDD tutorial — for that, see Eric Evans' book. This is a conventions reference for engineers who already understand the concepts and need to know how they are implemented here.

---

## When to Apply DDD

| Complexity Score | DDD Investment                                                                                                           |
| :--------------: | ------------------------------------------------------------------------------------------------------------------------ |
|      10–25       | No DDD. Simple service + repository pattern is sufficient.                                                               |
|      35–50       | Tactical DDD: value objects and entities in the domain layer. Aggregate boundaries identified but not strictly enforced. |
|      60–75       | Full tactical DDD: aggregates with invariant enforcement, domain events, application services.                           |
|      85–100      | Strategic DDD: explicit bounded contexts, context maps, anti-corruption layers at integration points.                    |

Applying full DDD to a score-10 project is over-engineering. Not applying it to a score-70 project is under-engineering. The scoring model in [02-complexity-scoring-model.md](02-complexity-scoring-model.md) is the guide.

---

## Value Objects

A value object is an immutable object defined entirely by its attributes. It has no identity — two value objects with the same attributes are equal.

```typescript
// Good: Money is defined by amount + currency, not by an ID
export class Money {
  constructor(
    readonly amount: number,
    readonly currency: 'USD' | 'EUR' | 'GBP',
  ) {
    if (amount < 0) throw new Error('Money amount cannot be negative');
  }

  add(other: Money): Money {
    if (other.currency !== this.currency) throw new Error('Currency mismatch');
    return new Money(this.amount + other.amount, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
```

**Conventions**:

- Value objects are `readonly` — no setters.
- All validation occurs in the constructor and throws on invalid input.
- Value objects live in `src/domain/value-objects/`.
- Name them after the concept they represent, not their attributes (`Money`, not `AmountWithCurrency`).

---

## Entities

An entity is an object with a persistent identity. Two entities with the same attributes but different IDs are not equal.

```typescript
export class Invoice {
  constructor(
    readonly id: InvoiceId,
    private _status: InvoiceStatus,
    private _lineItems: LineItem[],
  ) {}

  get status(): InvoiceStatus {
    return this._status;
  }

  send(): void {
    if (this._status !== InvoiceStatus.Draft) {
      throw new Error('Only draft invoices can be sent');
    }
    this._status = InvoiceStatus.Sent;
    // Raise domain event here
  }
}
```

**Conventions**:

- Entity IDs are typed value objects, not raw strings: `InvoiceId`, not `string`.
- Entities enforce their own invariants — the service layer must not contain business rule logic.
- Entities live in `src/domain/entities/`.
- Methods that change state are verbs that describe the business action (`send()`, `approve()`, `cancel()`), not setters (`setStatus()`).

---

## Aggregates

An aggregate is a cluster of entities and value objects with a single root entity (the aggregate root) that controls all access and enforces consistency boundaries.

**Aggregate root rules**:

1. External code only holds references to the aggregate root, never to internal entities.
2. All state changes go through the aggregate root.
3. The aggregate root is responsible for maintaining all invariants within its boundary.
4. An aggregate is loaded and saved as a whole unit.

**Sizing aggregates**: start small. An aggregate that is too large (contains too many entities) becomes a concurrency bottleneck and a cognitive burden. If two entities rarely change together, they probably belong in separate aggregates.

**Conventions**:

- One repository per aggregate root (not one per entity).
- Aggregate roots raise domain events to communicate changes outside the boundary.
- Aggregates live in `src/domain/aggregates/<aggregate-name>/`.

---

## Domain Events

Domain events represent something that happened in the domain. They are raised by aggregate roots and consumed by event handlers in the application or infrastructure layer.

```typescript
export class InvoiceSent {
  readonly occurredAt: Date;

  constructor(readonly invoiceId: InvoiceId) {
    this.occurredAt = new Date();
  }
}
```

**Conventions**:

- Domain events are past-tense nouns: `InvoiceSent`, `PaymentReceived`, `UserRegistered`.
- Domain events are immutable value objects.
- Events live in `src/domain/events/`.
- The dispatch mechanism (in-process EventEmitter for simple cases, outbox pattern for cross-service) is an infrastructure concern, not a domain concern.

---

## Bounded Contexts

A bounded context is a boundary within which a particular domain model applies. The same word may mean different things in different bounded contexts (a "customer" in a billing context is not the same object as a "customer" in a support context).

At lower complexity scores, the whole application is a single bounded context. At scores 85–100, explicit bounded contexts with defined integration points are required.

**Context integration patterns** (in order of increasing coupling):

1. **Shared kernel** — a small, shared model that multiple contexts use (avoid unless unavoidable).
2. **Published language** — a stable, versioned API contract between contexts.
3. **Anti-corruption layer (ACL)** — a translation layer that protects a context from the language of another context.
4. **Conformist** — one context adopts another's model (use only when the other context is a stable, external system).

See [09-event-driven-guidelines.md](09-event-driven-guidelines.md) for how domain events are used to integrate bounded contexts asynchronously.
