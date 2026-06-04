# Known Concerns

Scaffold gaps and known issues that require attention as projects are built out. Each entry
includes evidence and a recommended fix approach.

---

## CONCERN-001: NestJS ESM Deferred

**Evidence:** NestJS apps use `"module": "CommonJS"` in their tsconfigs. ESM support in
NestJS v12 is not yet confirmed stable upstream.

**Impact:** The repo has a dual module system. Any shared library consumed by a NestJS app must
either be published with a CommonJS build or use dual CJS/ESM exports. Pure ESM packages will
fail to import from NestJS apps.

**Fix approach:** When a shared library package needs to be consumed by a NestJS app, configure
the package with dual exports (`exports` field in `package.json` with `.cjs` and `.mjs` outputs).
Revisit when NestJS v12 officially lands ESM support.

---

## CONCERN-002: Expo on React 18 While Web Apps Use React 19

**Evidence:** The Expo SDK is pinned to React 18 by the managed workflow. Next.js web apps
target React 19.

**Impact:** The `@product-engineer/ui` package and any shared React components must be
compatible with both React 18 and React 19. Using React 19-only APIs (e.g., `use()` hook,
server components) in shared components will break the Expo app.

**Fix approach:** Keep shared UI components in `@product-engineer/ui` compatible with React 18. React 19-specific features belong in web-only components under the Next.js app, not in the
shared `ui` package.

---

## CONCERN-003: Playwright Browsers Not Installed

**Evidence:** Playwright is listed as a devDependency but `pnpm playwright install` has not been
run in the repo.

**Impact:** Running `pnpm turbo test:e2e` will fail with a "browser not found" error until
browsers are installed.

**Fix approach:** Run `pnpm playwright install` locally before running E2E tests. In CI, add a
step to run `pnpm playwright install --with-deps` before the E2E task. This is intentionally
not run as part of the default `pnpm install` to avoid downloading large browser binaries on
every CI agent.

---

## CONCERN-004: Dockerfiles Are Placeholders

**Evidence:** Dockerfile and Docker Compose stubs exist in app directories but contain no
functional content. No images have been built or pushed.

**Impact:** The `docker-compose up` command will not produce working services. Apps cannot be
run in a containerized environment yet.

**Fix approach:** Implement Dockerfiles per project as it is built out. Next.js apps should use
the standalone output mode. NestJS apps should copy only the `dist/` folder and `node_modules`.

---

## CONCERN-005: No CI Provider Wired

**Evidence:** There is no `.github/workflows/`, `.circleci/`, or equivalent CI config in the
repo.

**Impact:** Quality gates (`pnpm turbo lint typecheck test build`) are enforced locally via
Husky pre-commit hooks but not on pull requests or main branch.

**Fix approach:** Add a GitHub Actions workflow (or equivalent) that runs `pnpm turbo lint
typecheck test build` on push to `main` and on pull requests. Add a separate opt-in E2E job that
runs `pnpm turbo test:e2e` on demand or on scheduled runs.
