# Instructor birthdays without birth years

Instructor `birthdate` values use `MM-DD`, for example `04-26`. The database column
is a five-character string, not a timestamp. The API and both import paths accept
only this format. Real or dummy birth years are not stored or returned for
instructors. Children's birthdates remain full dates.

The single init migration creates the final schema. Its database constraint and
the shared schema reject impossible month/day combinations and accept `02-29`.
Registration and profile editing ask only for month/day. New normalization, dummy
seeds, and fixture generators output month/day.

Before release, replace the main/dev test databases with the final schema from
this migration, then import the prepared data packages. Retain admin login
accounts so the imports can be performed and verified. There is no compatibility
or conversion path for existing instructor birthdates.
