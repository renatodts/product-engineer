# 09 — Event-Driven Guidelines

Event-driven architecture is introduced progressively in this repo. Projects 1–4 use synchronous request/response patterns. From project 5 onwards, asynchronous events become necessary to handle external service reliability, cross-service communication, and eventual consistency. By project 9, event-driven patterns are the dominant integration mechanism.

This document defines the conventions for events, queues, sagas, and idempotency. It is a conventions reference, not a theoretical overview. For the theoretical foundations, the canonical reference is the combination of [08-ddd-guidelines.md](08-ddd-guidelines.md) (domain events) and the patterns from Martin Fowler's "Enterprise Integration Patterns."

---

## When to Use Events

Not every inter-service call should be an event. Overusing events creates systems that are hard to trace and debug. Use the following decision matrix:

| Scenario                                                | Preferred Pattern                    |
| ------------------------------------------------------- | ------------------------------------ |
| Query that needs an immediate response                  | Synchronous REST or GraphQL          |
| Command that modifies state in the same bounded context | Direct service call (in-process)     |
| Command that triggers work in another bounded context   | Domain event → async handler         |
| External webhook received (Stripe, GitHub, etc.)        | Idempotent event handler + outbox    |
| Long-running workflow across multiple services          | Saga (choreography or orchestration) |
| Fan-out to multiple consumers                           | Pub/sub topic                        |

---

## Event Envelope

All events published to a queue or message broker use a standard envelope:

```typescript
interface EventEnvelope<T> {
  id: string; // UUID v4 — used for idempotency
  type: string; // e.g. "invoice.sent"
  aggregateId: string; // ID of the root entity that raised the event
  aggregateType: string; // e.g. "Invoice"
  occurredAt: string; // ISO 8601 UTC
  version: number; // Starts at 1; increment on schema change
  payload: T;
}
```

**Conventions**:

- `type` uses `dot.notation` in lowercase: `invoice.sent`, `payment.received`.
- `id` is the idempotency key — consumers use it to deduplicate.
- `version` is incremented when the payload schema changes in a breaking way. Consumers must handle old and new versions during the migration window.

---

## Outbox Pattern

The outbox pattern solves the "dual write" problem: writing to the database and publishing to a message broker in the same logical transaction. Without the outbox, a crash between the two writes produces an inconsistent state.

### How It Works

1. The aggregate root raises a domain event.
2. The application service saves the aggregate state **and** appends the event to an `outbox` table in the **same database transaction**.
3. A background relay process reads unpublished events from the outbox and publishes them to the broker.
4. On successful publish, the relay marks the event as published.

```sql
CREATE TABLE outbox (
  id          UUID PRIMARY KEY,
  type        TEXT NOT NULL,
  payload     JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ
);
```

**Conventions**:

- All cross-service events at complexity scores 60+ use the outbox pattern.
- The relay polls the outbox table. Polling interval: 1 second in production, configurable via environment variable.
- Events older than 7 days that are still unpublished trigger an alert.

---

## Idempotency

At-least-once delivery is the default guarantee of most message brokers. This means consumers will occasionally receive the same event more than once. Every event handler must be idempotent — processing the same event twice must produce the same result as processing it once.

### Idempotency Strategies

| Strategy                  | When to Use                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| **Natural idempotency**   | The operation is inherently safe to repeat (e.g., `SET balance = X`) |
| **Idempotency key table** | Store processed event IDs; skip if already seen                      |
| **Conditional update**    | `UPDATE WHERE status = 'pending'` — only succeeds once               |
| **Upsert**                | `INSERT ... ON CONFLICT DO UPDATE` for creation events               |

For external webhooks (Stripe, etc.), always use the provider's event ID as the idempotency key and store it in a `processed_events` table with a unique constraint.

---

## Sagas

A saga is a sequence of local transactions coordinated across multiple services. Each step publishes an event; the next step reacts to that event. If a step fails, compensating transactions reverse the completed steps.

### Choreography vs. Orchestration

| Approach      | Description                                                         | Use When                                                |
| ------------- | ------------------------------------------------------------------- | ------------------------------------------------------- |
| Choreography  | Each service reacts to events independently; no central coordinator | Simple linear flows (2–3 steps)                         |
| Orchestration | A saga orchestrator sends commands to each service and tracks state | Complex flows with branching, compensation, or timeouts |

**Conventions**:

- Saga state is persisted in a `sagas` table. Never rely on in-memory saga state.
- Every compensating transaction is tested independently.
- Sagas have a timeout. Stalled sagas (no progress after N minutes) are flagged for manual review.
- Saga IDs are stored on all related entities for traceability.

---

## Dead Letter Queues

Every consumer queue has a corresponding dead letter queue (DLQ). Messages that fail after `maxRetries` attempts are moved to the DLQ. DLQ messages are not processed automatically — they require human inspection and either reprocessing or discarding.

**Conventions**:

- `maxRetries`: 3 for most consumers; 5 for payment-related consumers.
- DLQ messages trigger a `high` severity alert within 5 minutes.
- DLQ message format includes the original envelope plus `failureReason` and `attemptCount`.

See [11-observability-guidelines.md](11-observability-guidelines.md) for how DLQ metrics are surfaced in dashboards.
