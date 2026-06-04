# 11 — Observability Guidelines

Observability is the ability to understand the internal state of a system from its external outputs. The three pillars — logs, traces, and metrics — are not independent: they are most useful when they are correlated by a shared request ID or trace ID. Observability is introduced gradually in this gym; a score-10 project does not need distributed tracing, but a score-100 project without it is undeployable.

This document defines the conventions for structured logging, distributed tracing, and metrics. It also maps each pillar to the projects where it becomes load-bearing.

---

## Observability Maturity by Complexity Score

| Complexity Score | Minimum Required                                                   |
| :--------------: | ------------------------------------------------------------------ |
|      10–25       | Console logging with request ID                                    |
|      35–50       | Structured JSON logging, error tracking (Sentry or equivalent)     |
|      60–75       | Structured logging + trace ID propagation, basic latency metrics   |
|      85–100      | Full distributed tracing (OpenTelemetry), SLO dashboards, alerting |

---

## Structured Logging

All production log output must be structured JSON, not unformatted strings. Structured logs are machine-readable and can be queried, filtered, and alerted on. Unstructured logs are only useful for reading one line at a time.

### Log Format

```json
{
  "level": "info",
  "timestamp": "2026-01-15T10:23:45.123Z",
  "requestId": "a3f1b2c4-...",
  "traceId": "e7d9f3a1-...",
  "service": "invoice-automation-api",
  "message": "Invoice sent",
  "invoiceId": "inv_abc123",
  "userId": "usr_xyz789",
  "durationMs": 45
}
```

**Conventions**:

- Every log entry includes `level`, `timestamp`, `requestId`, and `service`.
- `traceId` is included at score 60+ where distributed tracing is active.
- Domain IDs (`invoiceId`, `userId`, etc.) are always included on domain-relevant log lines.
- `durationMs` is included on log lines that represent completed operations.
- Never log PII (email addresses, names, payment details). Log IDs instead.
- Log levels: `error` for exceptions; `warn` for recoverable anomalies; `info` for business events; `debug` for development tracing (disabled in production).

### NestJS Logging Setup

Use the `LoggerService` interface with a structured JSON provider (e.g., `pino-http` via `nestjs-pino`). Register it globally in `AppModule` so all HTTP requests are automatically logged with request ID injection.

---

## Distributed Tracing

Distributed tracing is required at complexity scores 85+. Use **OpenTelemetry** (OTLP) as the instrumentation standard. This avoids vendor lock-in and supports any compatible backend (Jaeger, Zipkin, Grafana Tempo, Honeycomb, Datadog, etc.).

### Trace Structure

Every request that enters the system generates a root span. Each significant operation within that request generates a child span. Spans are correlated by `traceId` and `spanId`.

```typescript
// Pseudo-code: creating a span in a NestJS service
const span = tracer.startSpan('invoice.send', {
  attributes: {
    'invoice.id': invoice.id.value,
    'invoice.status': invoice.status,
  },
});
try {
  await this.invoiceRepository.save(invoice);
  span.setStatus({ code: SpanStatusCode.OK });
} catch (err) {
  span.recordException(err);
  span.setStatus({ code: SpanStatusCode.ERROR });
  throw err;
} finally {
  span.end();
}
```

**Conventions**:

- Span names use `noun.verb` format: `invoice.send`, `payment.capture`, `email.dispatch`.
- All external service calls (database, HTTP, queue) are wrapped in spans.
- The `traceId` is propagated in all async events via the event envelope (see [09-event-driven-guidelines.md](09-event-driven-guidelines.md)).

---

## Metrics

Metrics are numerical time-series data used to track the health and performance of the system. They are the foundation of SLO dashboards and alerting.

### Required Metrics by Category

| Category | Metric                                              | Type      |
| -------- | --------------------------------------------------- | --------- |
| HTTP     | Request rate (RPS)                                  | Counter   |
| HTTP     | Latency (p50, p95, p99)                             | Histogram |
| HTTP     | Error rate (4xx, 5xx)                               | Counter   |
| Queue    | Messages consumed per second                        | Counter   |
| Queue    | Queue depth                                         | Gauge     |
| Queue    | Consumer lag                                        | Gauge     |
| Database | Query latency (p95)                                 | Histogram |
| Database | Connection pool utilisation                         | Gauge     |
| Business | Domain-specific (e.g., invoices created per minute) | Counter   |

### SLO Targets (Score 85+)

| SLO              | Target                          |
| ---------------- | ------------------------------- |
| API availability | 99.5% over 30 days              |
| p99 API latency  | < 500ms                         |
| Error rate       | < 0.5% of requests              |
| DLQ depth        | 0 (any non-zero triggers alert) |

### Instrumentation

Use OpenTelemetry metrics SDK (same instrumentation as traces). Export to Prometheus-compatible scrape endpoint or OTLP push. Do not use custom metric libraries — interoperability with existing tooling is more valuable than a slightly nicer API.

---

## Correlation: Tying the Three Pillars Together

The value of observability multiplies when logs, traces, and metrics share a common `traceId`. The workflow for investigating a production issue:

1. **Metrics** alert — latency p99 spike at 14:32 UTC.
2. **Logs** filtered by time range — find `error` level entries in the affected service.
3. **Trace** from the `traceId` in the error log — see the full request lifecycle, which span was slow, which external call timed out.

This workflow requires that `traceId` is injected into every log entry and that metrics include service-level labels that match the service names in traces.

See [09-event-driven-guidelines.md](09-event-driven-guidelines.md) for how trace context is propagated across async event boundaries.
