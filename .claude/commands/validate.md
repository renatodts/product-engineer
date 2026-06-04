---
description: Phase 3 Local validation - format, lint, typecheck, test, build (scoped to changes)
---

You are running Phase 3 (Local validation) of the SDLC harness in CLAUDE.md. Run the real gate
commands and do not advance until they are all green.

1. Format the tree so the pre-commit hook will pass:

   pnpm format

2. Run the local sweep, scoped to packages changed versus main:

   pnpm turbo lint typecheck test build --filter=...[origin/main]

3. Only if the change touches a `*-web` user flow and E2E is in scope, run (opt-in):

   pnpm playwright install   # first run only
   pnpm turbo test:e2e

To run a single test while iterating:
- Vitest (packages, `*-web`):  pnpm --filter <workspace> exec vitest run path/to/file.test.ts
- Jest (`*-api`):              pnpm --filter <workspace> exec jest path/to/file.spec.ts

On failure, invoke `superpowers:systematic-debugging` (or `gh-fix-ci` patterns) before retrying;
do not bypass hooks with `--no-verify`. Report a pass/fail line per gate. When all pass, hand off
to `/ship`.
