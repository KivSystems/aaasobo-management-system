# Old Test Files (Backup)

This directory contains the original test files that use mocked Prisma database.

## Status

These tests are kept as reference during the migration to real database testing with Testcontainers.

## Running Old Tests

These tests are excluded from the default test run. To run them:

1. Temporarily move the test file back to `src/test/`
2. Run the specific test
3. Move it back to `test.bak/`

Or temporarily remove `**/test.bak/**` from the exclude list in `vitest.config.mts`.

## Migration Progress

- [x] users (migrated to `src/test/users.test.ts`)
- [x] admins (migrated to `src/test/admins.test.ts`)
- [x] customers (migrated to `src/test/customers.test.ts`)
- [x] instructors (migrated to `src/test/instructors.test.ts`)
- [x] instructorSchedule (migrated to `src/test/instructors/schedules.test.ts`)
- [x] instructorAbsence (migrated to `src/test/instructors/absences.test.ts`)
- [x] children (migrated to `src/test/children.test.ts`)
<<<<<<< HEAD
- [x] classes
- [x] events (migrated to `src/test/events.test.ts`)
- [x] plans (migrated to `src/test/plans.test.ts`)
||||||| parent of 710ea096 (test(backend): migrate events & plans tests to real DB (#375))
- [ ] classes
- [ ] events
- [ ] plans
=======
- [ ] classes
- [x] events (migrated to `src/test/events.test.ts`)
- [x] plans (migrated to `src/test/plans.test.ts`)
>>>>>>> 710ea096 (test(backend): migrate events & plans tests to real DB (#375))
- [ ] recurringClass
- [ ] subscriptions
- [ ] jobs

Once all tests are migrated, this directory can be deleted.
