# Test Generation

## Purpose

This playbook covers AI-assisted test generation for all three testing frameworks in this monorepo: Vitest (packages and Next.js/Expo), Jest with `@nestjs/testing` (NestJS APIs), and Playwright (Next.js E2E). It maps generated tests to the coverage matrix in [../10-testing-guidelines.md](../10-testing-guidelines.md) and the TDD discipline in the **Execute** phase.

Test generation is one of AI's strongest use cases because the structure of good tests is highly predictable. The risk is that AI generates tests that exercise a code path without testing behaviour — tests that pass even when the code is wrong. The prompts in this playbook are designed to prevent that.

---

## When to use

Use this playbook during the TLC **Execute** phase when:

- Writing the failing test (red) before implementing a new domain entity, value object, application service, or controller.
- Generating a test suite for an existing function that has no coverage.
- Adding edge-case tests to an existing test suite that was written without a comprehensive test plan.
- Generating Playwright tests for a new user-facing flow.

---

## Example prompts

### Vitest unit test — domain entity or value object

```
Write Vitest unit tests for the following [entity / value object]:

[Paste the class or function code]

Context:
- This is a [domain entity / value object] in the [app-name] project (complexity score [N]).
- It enforces these invariants: [list the business rules]
- It is called by: [describe the application service or factory that uses it]
- Known edge cases: [list any edge cases you are aware of]

Test structure:
- One top-level describe block named after the class/function
- Nested describe blocks per method/constructor
- it blocks starting with "should" describing expected behaviour
- Test failure cases as explicitly as success cases
- No mocks unless the class has external dependencies (it should not, it is domain code)
- Coverage target: [70% / 90% / 95%] based on project complexity score

Output: complete .spec.ts file. Follow the conventions from docs/10-testing-guidelines.md.
```

### Jest unit test — NestJS application service

```
Write Jest unit tests for the following NestJS application service.

[Paste the service code]

Context:
- Module system: CommonJS (NestJS)
- The service depends on these injected services: [list with their interfaces]
- The acceptance criteria it satisfies: [APP{N}-NNN — criterion text]
- Integration tests (requiring a real NestJS testing module) should go in test/; unit tests here in src/

Test structure:
- Use jest.fn() or jest.spyOn() to mock the injected dependencies
- Test both the happy path and each failure case (thrown exceptions, rejected promises)
- Each it block asserts one behaviour, not multiple
- describe block named after the service class and the method under test

Output: complete .spec.ts file ready to drop into src/ alongside the service.
```

### Jest integration test — NestJS API endpoint

```
Write a Jest + supertest integration test for the following NestJS controller endpoint.

Endpoint: [METHOD] /[path]
Controller: [paste the controller method]
Service it calls: [describe what the application service does]
Request body: [shape]
Success response: [shape and status code]
Error cases: [list expected error responses and their status codes]

Test structure:
- Use @nestjs/testing createTestingModule with real or in-memory database
- Test each error case with its expected status code and response body shape
- Test the happy path asserting both the response and any side effects
- Reset database state in beforeEach

Output: complete integration spec ready to drop into test/ at the app root.
```

### Playwright E2E test — critical user flow

```
Write a Playwright E2E test for the following user flow in [app-name].

Flow name: [descriptive name]
User story: As a [role], I want to [action], so that [outcome].
Steps:
1. [Step one — describe user action]
2. [Step two]
3. [...]
Expected final state: [what the page should show after the flow completes]
Error path to test: [one realistic failure to include]

Conventions:
- Tests live in e2e/ at the app root
- Run against a locally started production build (pnpm build && pnpm start)
- Use page.getByRole() and page.getByText() selectors (not CSS selectors)
- Assert the final state, not intermediate states

Output: complete Playwright spec file.
```

### Coverage gap analysis

```
Here is the current test file for [module name]:

[Paste existing tests]

And here is the source file:

[Paste source]

Identify:
1. Code branches not covered by the existing tests
2. Edge cases not covered (null inputs, boundary values, concurrent calls)
3. Failure paths that are missing tests

For each gap, provide a suggested it block (not a full test suite — just the new cases).
Prioritise gaps in the domain layer above application layer above infrastructure.
```

---

## Anti-patterns

- **Asking AI to generate tests after the implementation is written.** AI will generate tests that match the implementation's behaviour, not the spec's intent. Write tests before implementation (red before green), as the TDD flow in [../10-testing-guidelines.md](../10-testing-guidelines.md) requires.
- **Generating tests without providing the invariants or acceptance criteria.** Without invariants, AI tests the happy path and ignores the business rules. Always provide the acceptance criteria from the spec.
- **Using CSS selectors in Playwright tests.** CSS selectors break on styling changes. Use `getByRole`, `getByText`, and `getByLabel` to write tests that are resilient to visual refactors.
- **Mocking domain objects in domain unit tests.** Domain entities and value objects have no external dependencies and should not be mocked. If you find yourself mocking inside a domain test, the unit under test has a dependency that should be removed.
- **Writing one test that asserts multiple behaviours.** A test with 5 `expect` calls for 3 different behaviours fails loudly but tells you nothing about which behaviour broke. Keep each `it` block to one conceptual behaviour.
- **Ignoring the coverage matrix thresholds.** The matrix in [../10-testing-guidelines.md](../10-testing-guidelines.md) defines different targets by layer and project complexity. Generating tests that only hit the 40% infrastructure target for a score-90 domain layer is not enough. Provide the project complexity score to AI so it aims at the right target.

---

## Validation checklist

- [ ] Tests were written before implementation code (test file committed before implementation file, or in the same red-step commit).
- [ ] The spec's acceptance criteria are referenced in or quoted in the test prompt.
- [ ] Domain unit tests use the correct framework: Vitest for packages and Next.js, Jest for NestJS.
- [ ] NestJS unit tests are in `src/` (`.spec.ts`); integration tests are in `test/`; E2E tests are in `e2e/`.
- [ ] Playwright tests use role/text/label selectors, not CSS selectors.
- [ ] Each `it` block asserts one behaviour — multiple expects are acceptable only if they all check the same behaviour.
- [ ] Coverage targets match the project complexity score and the layer being tested (see [../10-testing-guidelines.md](../10-testing-guidelines.md)).
- [ ] Failure cases are as explicitly tested as the happy path.
- [ ] AI-generated test files have been reviewed for tests that pass trivially (e.g., `expect(true).toBe(true)`) or test implementation details rather than behaviour.
