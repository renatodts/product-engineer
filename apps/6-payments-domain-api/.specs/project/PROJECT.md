# Payments Domain — api

**Complexity score:** 70

## Purpose

Core payments service that models payment intents, ledger entries, settlements, and refunds with
strong correctness and idempotency guarantees. Acts as the authoritative money-movement boundary
that other services call into.

## Stack

- Framework: NestJS
- Port: 4006
- Test runner: Jest + supertest
- Module system: CommonJS
