# Backend Simulation Test: Double-booking issue and fix plan

## Plan change (new direction)

Before building a higher-level “simulation orchestrator”, we will first create a small set of **focused concurrent tests** for major error-prone scenarios (double booking, etc.).

Once those scenario tests are in place and passing (i.e., we have correctness guarantees + stable error mapping), we can then proceed to the broader simulation test described in `docs/backend-simulation-test.md`.

## Current problem (what the simulation surfaced)

When multiple `POST /classes/:id/rebook` requests run concurrently, we can end up with **instructor double-booking** (multiple active `Class` rows with the same `(instructorId, dateTime)`).

There are two root causes:

1. **Race in `rebookClassController`**
   - The controller checks conflicts via `checkInstructorConflicts(instructorId, dateTime)` *before* the write transaction.
   - Under concurrency, two requests can both pass the check (neither has committed yet) and both proceed to insert.

2. **No DB-level constraint**
   - The database currently does not make it *physically impossible* to have two active classes for the same `(instructorId, dateTime)`.
   - Without a constraint, the second transaction can still insert a duplicate even if the application “tries” to prevent it.

Related (but separate) issue:

- Under high contention, PostgreSQL can abort one transaction with a retryable serialization/write-conflict error (`SQLSTATE 40001`, surfaced by Prisma as `P2034` or `DriverAdapterError: TransactionWriteConflict`). Retrying the transaction avoids returning 500 for transient conflicts, but **retry alone does not prevent double-booking**.

## Why retry alone doesn’t guarantee “only one succeeds”

Retry handles transient DB aborts. It does **not**:

- re-run the controller’s pre-checks, nor
- enforce uniqueness at the DB layer.

So after A commits, B may retry and still successfully insert the same `(instructorId, dateTime)` unless the DB rejects it.

## Recommended fix (make double-booking impossible)

Bottom line:
- A **DB constraint is a must** if we want a hard guarantee.
- The current pre-check approach is **not meaningful for correctness** under concurrency; we should refactor the rebook flow so correctness does not depend on it.

## Current test (expected to fail until fixed)

We have a minimal concurrent test that expresses the desired behavior and currently fails:
- `backend/src/test/simulation/doubleBookingRebook.test.ts`

This test is intentionally “red” right now and will become “green” once we implement the DB constraint + error mapping for rebook.

### 1) Add a DB constraint (preferred)

Add a **partial unique index** on `Class(instructorId, dateTime)` for “active” statuses.

Example (PostgreSQL):

```sql
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS
  class_instructor_datetime_unique_active
ON "Class" ("instructorId", "dateTime")
WHERE
  "instructorId" IS NOT NULL
  AND "dateTime" IS NOT NULL
  AND status IN ('booked', 'rebooked');
```

Notes:
- This enforces the invariant at the database boundary (strongest guarantee).
- It allows historical/non-active statuses to coexist if desired (adjust status list to match business rules).
- Prisma schema can’t express partial unique indexes directly; it should be added via a SQL migration.

### 2) Map constraint violations to a deterministic 4xx

When the unique index triggers, Prisma will typically throw a “unique constraint violation” error (often `P2002`).

Handle this and return a consistent business error (e.g. `400 { errorType: "instructor conflict" }`) rather than 500.

Where to implement:
- Controller: `backend/src/controllers/classesController.ts` (wrap `rebookClass(...)` and catch/translate)
- or Service: `backend/src/services/classesService.ts` (throw a domain error the controller maps to 4xx)

### 3) Clean up the rebook process (don’t rely on pre-checks)

Goal: ensure the “one succeeds, others fail” outcome is driven by the DB + transaction, not a best-effort pre-check.

Suggested approach:
- Treat pre-checks as **UX hints only** (optional) and be prepared for them to be wrong under concurrency.
- Make the write path authoritative:
  - attempt the rebook transaction
  - if the DB unique index rejects it, return `400 instructor conflict`

This refactor can be implemented incrementally:
1. Add the unique index.
2. Catch/translate unique violations to `400 instructor conflict`.
3. Optionally remove `checkInstructorConflicts(...)` (or keep it only to return a faster “likely conflict” response, while still expecting unique violations to happen).

### 4) (Optional) Move conflict detection into the write transaction

With the DB constraint in place, this becomes optional for correctness, but can improve UX by returning a cleaner error before doing extra work.

Options include:
- explicit locking (`SELECT ... FOR UPDATE`) on a “slot” row (if a slot table exists),
- PostgreSQL advisory locks keyed by `(instructorId, dateTime)`,
- or a transactional check + insert where the insert is still protected by the unique index.

## Acceptance criteria

- Under concurrent rebooking attempts to the same `(instructorId, dateTime)`:
  - exactly one request returns `201`,
  - others return a deterministic 4xx (“instructor conflict”),
  - database contains **no** duplicates for active statuses.

## How to validate

- Run the simulation and assert invariants:
  - `cd backend && SIM_ASSERT_INVARIANTS=1 npm run test -- src/test/simulation/concurrent-simulation.test.ts`
- Ensure the simulation also sees no 500s for contention (retry still helps here).

## PR scope (this PR)

Focus only on **double-booking prevention on rebook**:
- add DB constraint (partial unique index)
- translate unique violations to a deterministic 4xx (e.g. instructor conflict)
- make `backend/src/test/simulation/doubleBookingRebook.test.ts` pass

After this, add more concurrent scenario tests, then return to the high-level simulation test.
