# Backend API Test Strategy

This document summarizes the current decisions for setting up API-level tests for the Express + TypeScript backend using Vitest and PostgreSQL (via Prisma).

---

## 1. Test Scope

- Only API-level tests will be implemented (using Supertest to send requests and verify responses).
- Internal logic tests (service or repository layers) are **not** in scope.
- Tests will run **sequentially** to avoid transaction or data conflicts.

---

## 2. Database Strategy

- Use a **real PostgreSQL** instance for tests.
- Tests connect to the DB via **Prisma**.
- Mocking the database is not used.

---

## 3. Test Environment Setup

- **Testcontainers** is used as the default for test DB setup.
  - Starts a PostgreSQL container automatically at test start.
  - Prisma schema is applied once using `prisma db push`.
- If the environment variable `TEST_DATABASE_URL` is set, the tests will use the provided DB instead (must be a separate test DB/schema).
- CI environments always use Testcontainers.

---

## 4. Vitest Configuration

- `beforeAll` / `afterAll` are used for:
  - Starting/stopping the Postgres container
  - Initializing/disconnecting the Prisma client
- `beforeEach` truncates all tables to maintain test isolation.
- `setup.ts` is included via `vitest.config.ts` → `setupFiles` to ensure `beforeAll` executes **once globally**, even across multiple test files.

---

## 5. Test Data Generation

- **Critical logic / edge cases:** manually created fixtures.
- **Other data (names, emails, ages, etc.):** generated with **Faker**.
  - Optionally, use a fixed seed to maintain reproducibility.
  - Randomized data can be used in a property-testing style to ensure logic robustness.

---

## 6. Test Naming Conventions

- **One `describe` block per method+endpoint combination**
  - Example: `describe("POST /users/authenticate")`, `describe("GET /admins/admin-list/:id")`
  - Nested `describe` blocks can be used for different user types or scenarios
- **Success test names start with "succeed"**
  - Example: `it("succeed with valid credentials")`
- **Failure test names start with "fail"**
  - Example: `it("fail with invalid ID parameter")`, `it("fail for non-existent admin")`
- **Avoid redundant assertions**
  - Don't use `toHaveProperty` for response validation - Zod middleware already validates response schemas
  - Don't use `toHaveLength` when `toEqual` already checks the full array
  - Focus on testing business logic and data correctness, not response structure

---

## 7. Faker Import Pattern

- Use **CommonJS `require`** syntax to avoid warnings:
  ```typescript
  const { faker } = require("@faker-js/faker");
  ```
- Set a **consistent seed** in `setup.ts` for reproducibility:
  ```typescript
  faker.seed(12345);
  ```
- This ensures the same test data is generated across all test runs

---

## 8. Operational Notes

- Clearly define PrismaClient scope and manage connections.
- If seed data is required, insert it after truncating tables.
- Ensure Docker/Testcontainers versions are consistent between environments.
- In CI, consider `TESTCONTAINERS_RYUK_DISABLED` for stability.
- Always disconnect Prisma and stop containers in `afterAll`.

---

This setup ensures a **consistent, reliable, and reproducible API-level testing environment** across local and CI environments.
