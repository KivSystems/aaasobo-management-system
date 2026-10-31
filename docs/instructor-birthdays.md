# Instructor birthdays without birth years

Instructor `birthdate` values use `MM-DD`, for example `04-26`. The database column
is a five-character string, not a timestamp. The API and both import paths accept
only this format. Real or dummy birth years are not stored or returned for
instructors. Children's birthdates remain full dates.

The single init migration creates the final schema. Its database constraint and
the shared schema reject impossible month/day combinations and accept `02-29`.
Registration and profile editing ask only for month/day. New normalization, dummy
seeds, and fixture generators output month/day.

Existing main/dev test databases need a one-time manual conversion before using
the new application. Apply `ALTER TABLE "Instructor" ALTER COLUMN "birthdate"
TYPE VARCHAR(5) USING to_char("birthdate", 'MM-DD')`, then add the same check
constraint as the init migration. Prisma does not rerun an already-applied init
migration. Verify the resulting column and constraint before importing data.
Deploy the schema, backend, and frontend together.
