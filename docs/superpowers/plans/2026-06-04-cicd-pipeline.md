# CI/CD Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Actions CI pipeline and a `pre-push` Husky hook that enforce code quality automatically on every pull request and push to `main`.

**Architecture:** A single `ci.yml` workflow fans out three parallel jobs (`lint-format`, `type-check`, `unit-tests`) that converge at a no-op `ci-gate` job — the sole required status check in GitHub branch protection. An `e2e` job runs after `ci-gate` only on `main` and `workflow_dispatch`. All jobs use Turborepo affected-package detection (`--filter=...[HEAD^1]`) and share a Vercel Remote Cache.

**Tech Stack:** GitHub Actions, Turborepo, pnpm, Husky, Playwright, Vitest, Jest, commitlint, Prettier, ESLint

---

## Files

| Action | Path | Purpose |
|---|---|---|
| Create | `.github/workflows/ci.yml` | Full CI workflow — all 5 jobs |
| Create | `.husky/pre-push` | Pre-push hook: typecheck affected packages before pushing |

No existing files are modified.

---

## Task 1: Add the `pre-push` Husky hook

**Files:**
- Create: `.husky/pre-push`

- [ ] **Step 1: Create the hook file**

```bash
cat > .husky/pre-push << 'EOF'
pnpm turbo typecheck --filter=...[origin/main]
EOF
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x .husky/pre-push
```

- [ ] **Step 3: Verify the hook runs**

Make a small change to a TypeScript file (e.g., add a blank line to `packages/shared-utils/src/index.ts`), stage and commit it, then run:

```bash
git push --dry-run
```

Expected: Turborepo runs `typecheck` for affected packages and exits 0. If no `shared-utils` changes, run the hook directly:

```bash
bash .husky/pre-push
```

Expected: Turborepo exits 0 (may print "No tasks were executed" if nothing is affected relative to `origin/main`).

- [ ] **Step 4: Revert the scratch change if you made one**

```bash
git checkout -- packages/shared-utils/src/index.ts
```

- [ ] **Step 5: Commit**

```bash
git add .husky/pre-push
git commit -m "ci: add pre-push typecheck hook"
```

---

## Task 2: Create the GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

### Context

- `pnpm/action-setup@v4` reads `packageManager` from `package.json` automatically — no version input needed.
- `fetch-depth: 0` is required so Turborepo can compute the full git ancestry needed for `--filter=...[HEAD^1]`.
- `ci-gate` uses `if: always()` so it always runs even when upstream jobs fail. Without `if: always()`, a failed upstream job causes `ci-gate` to be skipped — and GitHub branch protection treats "skipped" differently from "failed", which can let broken PRs through.
- `commitlint --from origin/main --to HEAD` only runs on `pull_request` events. On `push` to `main` the commits are already merged and there is nothing to lint between `origin/main` and `HEAD`.
- The `e2e` job condition combines the trigger check with `needs.ci-gate.result == 'success'` because `if: always()` on `ci-gate` means it can pass or fail — `e2e` must only run when it passed.

- [ ] **Step 1: Create the workflow directory**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Write the workflow file**

Create `.github/workflows/ci.yml` with the following content:

```yaml
name: CI

on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches: [main]
  workflow_dispatch:

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

jobs:
  lint-format:
    name: Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm turbo lint --filter=...[HEAD^1]
      - name: Validate commit messages
        if: github.event_name == 'pull_request'
        run: pnpm exec commitlint --from origin/main --to HEAD

  type-check:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo typecheck --filter=...[HEAD^1]

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo test --filter=...[HEAD^1]

  ci-gate:
    name: CI Gate
    runs-on: ubuntu-latest
    needs: [lint-format, type-check, unit-tests]
    if: always()
    steps:
      - name: Check all jobs passed
        run: |
          if [[ "${{ needs.lint-format.result }}" != "success" || \
                "${{ needs.type-check.result }}" != "success" || \
                "${{ needs.unit-tests.result }}" != "success" ]]; then
            echo "One or more checks failed:"
            echo "  lint-format: ${{ needs.lint-format.result }}"
            echo "  type-check:  ${{ needs.type-check.result }}"
            echo "  unit-tests:  ${{ needs.unit-tests.result }}"
            exit 1
          fi
          echo "All checks passed"

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [ci-gate]
    if: >
      (github.ref == 'refs/heads/main' || github.event_name == 'workflow_dispatch')
      && needs.ci-gate.result == 'success'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps chromium
      - run: pnpm turbo test:e2e --filter=...[HEAD^1]
```

- [ ] **Step 3: Validate the YAML syntax**

```bash
# Install actionlint if not present
brew install actionlint   # macOS
# or: go install github.com/rhysd/actionlint/cmd/actionlint@latest

actionlint .github/workflows/ci.yml
```

Expected: no errors. Common issues actionlint catches: invalid expression syntax, unknown action inputs, missing `if: always()` on gate jobs.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions CI pipeline"
```

---

## Task 3: Configure Vercel Remote Cache

This task produces no files — it sets up the external secrets the workflow depends on.

- [ ] **Step 1: Link the repo to Vercel Remote Cache**

Run from the repo root (requires a Vercel account — free tier is sufficient):

```bash
npx turbo login
npx turbo link
```

Follow the prompts. `turbo link` will print the team slug you need in the next step.

- [ ] **Step 2: Get the TURBO_TOKEN**

Go to [vercel.com/account/tokens](https://vercel.com/account/tokens), create a token with a descriptive name like `product-engineer-ci`, and copy it.

- [ ] **Step 3: Add secrets to the GitHub repository**

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret name | Value |
|---|---|
| `TURBO_TOKEN` | The token from Step 2 |
| `TURBO_TEAM` | The team slug printed by `turbo link` (e.g. `my-team`) |

- [ ] **Step 4: Verify cache works on the next CI run**

After the next push, check the GitHub Actions log for any job. Look for a line like:

```
Remote cache: 5 cached, 0 missed
```

If you see `TURBO_TOKEN` warnings or auth errors, double-check the secret names match exactly (`TURBO_TOKEN`, `TURBO_TEAM` — case-sensitive).

---

## Task 4: Configure GitHub Branch Protection

This task has no code — it configures the repository on GitHub.

- [ ] **Step 1: Push the CI files to `main` and wait for the first run to complete**

The `ci-gate` status check must have run at least once before GitHub can register it as a required check.

```bash
git push origin main
```

Wait for the Actions run to finish at `github.com/<org>/<repo>/actions`.

- [ ] **Step 2: Enable branch protection on `main`**

Go to your GitHub repository → **Settings** → **Branches** → **Add branch ruleset** (or **Add rule** on older UI):

- Branch name pattern: `main`
- Require status checks to pass before merging: **enabled**
  - Required status check: `CI Gate` (search by the job `name:` field, not the job ID)
- Require branches to be up to date before merging: **enabled**
- Do not allow bypassing the above settings: **enabled**

- [ ] **Step 3: Verify protection works**

Open a draft PR with a deliberate lint error (e.g., an unused import in any `.ts` file). Confirm that:
- The `lint-format` job fails
- The `ci-gate` job fails
- The merge button is blocked

Fix the error, push again, and confirm all jobs go green and the merge button becomes available.
