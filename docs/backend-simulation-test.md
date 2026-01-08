# Concurrent Simulation Test Design

## Purpose

Stress the backend with many conflicting operations at the same logical time to uncover race conditions and state inconsistencies. Run without real-time waits and make failures reproducible via a fixed seed.

## Approach (Minimal)

- Run with Vitest in-process (no separate HTTP server process)
  - Use `supertest(server)` to exercise production Express paths (middleware/controllers/services)
- Simulated time is discrete slots (e.g. 30-minute steps)
- Within one slot, execute events concurrently (`Promise.all`); advance time only between slots
- Do not aim for realistic user behavior; focus on high-risk areas (class/schedule)

## Time / Clock

### Time Control (recommended)

Control “current time” in tests via Vitest, without refactoring production code:

- Use `vi.useFakeTimers({ toFake: ["Date"] })` to fake `Date` only (not timeouts/intervals).
- Use `vi.setSystemTime(fakeNow)` to set the current time per simulation slot.
- Because tests run in-process (no separate HTTP server process), no “set time” HTTP API is required.

This approach affects both `Date.now()` and `new Date()` in the Node process, which is sufficient for discrete-time, no-wait simulations.

### Important Caveat: Module-level “now” caching

If the codebase contains patterns like `const now = new Date()` evaluated at module load time, changing the system time later will not update that cached value. For simulation/reproducibility, avoid module-level time snapshots; compute “now” inside the function that needs it.

## Model: Scenario -> Events

### Scenario

- A unit that generates one or more `Event`s for a given time slot `t`
- Simple scenario: single operation (e.g. cancel, rebook)
- Composite scenario: multiple operations designed to collide (e.g. DoubleBooking, AbsenceVsRebook)

`Scenario.generate(state, rng, t) -> Event[]`

### Event

- A single API call (method/path/body/auth)
- Includes an outcome classifier (success / expected-failure / unexpected-failure, etc.)
  - In conflict scenarios, “one request fails with 4xx” can be acceptable

## Bootstrap

- Prepare the minimum data needed to run scenarios (e.g. using recurring-class and month class generation)
- Keep only minimal in-memory state for event generation (IDs, candidate times, etc.)
- The DB is the source of truth; invariants are checked from DB state

## Validation (Invariants)

Do not hardcode the full invariant list in this document; add invariants incrementally as the test evolves.

Example: no double booking — there must not be multiple active `Class` rows for the same `(instructorId, dateTime)`.

## Configuration & Reproducibility

- Log the seed and major parameters (timespan, slot size, scale, scenario mix, concurrency) to enable reruns under the same conditions
