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
- [ ] admins
- [ ] customers
- [ ] instructors
- [ ] instructorSchedule
- [ ] instructorAbsence
- [ ] children
- [ ] classes
- [ ] events
- [ ] plans
- [ ] recurringClass
- [ ] subscriptions
- [ ] jobs

Once all tests are migrated, this directory can be deleted.
