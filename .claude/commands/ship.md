---
description: Phase 4 Self-review and PR - red-team, then commit, push, and open a PR
---

You are running Phase 4 (Self-review and PR) of the SDLC harness in CLAUDE.md.

Precondition: `/validate` is green locally.

1. Red-team your own change with the `the-fool` skill: assume it is broken, look for the bug,
   missing edge cases, and ADR violations. If the change touches auth, sessions, or data handling
   (especially `packages/shared-auth` or a data app), also invoke `security-best-practices`.
2. Confirm the branch name matches `feat|fix|chore/<scope>/<slug>` (or `docs/<slug>`). Rename if not.
3. Open the PR with the `commit-commands:commit-push-pr` skill (or `gh pr create`). Ensure every
   commit message passes commitlint (Conventional Commits, correct scope). Never use `--no-verify`.
4. After the PR is open, the CI runs `lint-format` + `type-check` + `unit-tests` -> `ci-gate`
   (the merge gate). If CI is red, invoke `gh-fix-ci`. For reviewer comments, invoke
   `gh-address-comments`. E2E runs post-merge on `main` only.

Note: there is no deploy stage yet (see the GAP in the SDLC harness table). Stop after the PR is
green; do not attempt a deploy.

Return the PR URL.
