# Refactoring Playbook

## Purpose

This playbook defines how to perform safe AI-assisted refactoring in this monorepo. Refactoring — changing code structure without changing observable behaviour — is one of the highest-risk AI tasks because AI is optimistic about behaviour preservation. It will produce refactored code that looks clean but silently changes edge-case behaviour, renames a method that is referenced in tests by string introspection, or removes a guard clause it did not realise was load-bearing.

The safety mechanism is tests. No refactor should be started unless the affected code has sufficient test coverage to detect behaviour changes. This is the guard condition before engaging AI.

---

## When to use

Use this playbook when:

- Cleaning up a domain entity, application service, or utility that has grown tangled.
- Extracting a shared abstraction into a `packages/` library.
- Renaming types, interfaces, or modules to align with updated conventions.
- Migrating from one pattern to another (e.g., callback → promise, class-based → functional, raw fetch → a typed HTTP client).
- Addressing technical debt accumulated during a fast Execute phase.

Do not use this playbook for changes that involve new behaviour — use [feature-generation.md](feature-generation.md) for those.

---

## Example prompts

### Pre-refactor test coverage check

```
Before I refactor [module name], tell me:
1. What are the public methods/exports of this module?
2. For each public interface, what is the minimum set of tests that would detect
   a behaviour regression?
3. Are there any cases where the existing tests would not catch a change?

[Paste the module code]
[Paste the existing test file, if any]

Do not start refactoring yet — I need to confirm coverage first.
```

### Propose a refactor plan (do not implement)

```
I want to refactor [module name] to [goal — e.g., "extract the pricing logic
into a value object", "remove the circular dependency with UserService",
"split this 200-line class into two focused classes"].

[Paste the current code]

Propose a refactor plan as an ordered list of steps. Each step should:
- Be independently safe to apply and commit
- Preserve all existing behaviour
- Be verifiable by running the existing tests after that step

Do not produce code yet — I need to review the plan first.
```

### Execute a single refactor step

```
Execute step [N] from the refactor plan: [step description]

Current code:
[Paste the relevant section]

Existing tests that must still pass after this step:
[Paste or reference the test file]

Constraints:
- Do not change method signatures used in other files unless the plan includes those files
- Do not add new behaviour — this is a pure refactor
- If you find something that needs to change behaviour to fix correctly, flag it
  instead of silently changing it

Output: the refactored code only, no explanation unless I ask.
```

### Rename across the monorepo

```
I need to rename [OldName] to [NewName] across the monorepo.

[OldName] is used in these files: [list]

Before renaming:
1. List every usage of [OldName] across the codebase (imports, type references, string literals, test descriptions)
2. Flag any usage that is NOT a safe mechanical rename (e.g., string-based references, generated types, public API contracts)

After I confirm, produce the renamed code for each file. Do not produce files
for usages you flagged — I will handle those manually.
```

### Extract to a shared package

```
I want to extract [module/type/utility] into the [packages/package-name] shared package.

Current location: [path]
Used by: [list of apps/packages that import it]

Produce:
1. The extracted code in packages/[package-name]/src/[filename].ts
2. The updated index export in packages/[package-name]/src/index.ts
3. The updated imports in each consuming file (just the import line change, not the full file)
4. Any necessary changes to packages/[package-name]/package.json

Ensure the extracted module is tree-shakeable (no side effects at module level).
```

---

## Anti-patterns

- **Starting a refactor without sufficient test coverage.** AI cannot prove behaviour preservation — tests can. If the coverage is insufficient, write tests first (using [test-generation.md](test-generation.md)), then refactor.
- **Asking AI to refactor and add new behaviour in the same step.** This conflates two different activities and makes the diff unreviable. A refactor commit should change no observable behaviour. New behaviour is a separate commit.
- **Refactoring a large file in one AI request.** AI will produce a refactored version that looks complete but has subtle omissions in the parts it did not fit in its context window. Break large refactors into small steps, each confirmed by tests.
- **Accepting a rename without checking for string-based references.** NestJS uses string-based injection tokens. Playwright tests reference text in the UI. Both are invisible to TypeScript's rename refactor. Always ask AI to flag non-mechanical rename candidates before proceeding.
- **Not committing between refactor steps.** If each step produces a clean test-passing state, each step should be committed. This preserves rollback points and makes the final diff readable.
- **Treating "the tests still pass" as proof the refactor is correct.** Tests pass is a necessary condition, not a sufficient one. Review the diff manually for removed guard clauses, changed error handling, and altered control flow — even when tests are green.

---

## Validation checklist

- [ ] Test coverage was assessed before the refactor started — insufficient coverage was addressed with new tests first.
- [ ] A written refactor plan (ordered steps) was reviewed and approved before any code was changed.
- [ ] Each step is an independently committable unit — tests pass after each step.
- [ ] String-based references (NestJS tokens, Playwright selectors, dynamic requires) were checked for the rename/extraction.
- [ ] No new behaviour was introduced in any refactor commit.
- [ ] The diff was reviewed manually after tests passed — looking specifically for removed guards, changed error handling, and altered conditional logic.
- [ ] Each completed step produced one atomic commit with a `refactor:` Conventional Commit message.
- [ ] The final state was verified by running the full test suite for the affected packages (`pnpm turbo test --filter=[package-name]...`).
