# Normalized Fixture Generator Spec

## Purpose

Define a deterministic normalized-import fixture generator for shared testing.

This spec is for generating normalized import artifacts (CSV set and optional zip) from fixed rules, without randomness, so every developer can reproduce the same dataset from the same parameters.

## Source Control Policy

- Commit:
  - generator code
  - this spec and usage README
- Do not commit:
  - generated normalized `.csv`
  - generated normalized `.zip`

## Required CLI Parameters

All parameters are required:

- `--from YYYY-MM-DD`
- `--completed-until YYYY-MM-DD`
- `--to YYYY-MM-DD`

Date constraints:

- `from <= completed-until <= to`

## Optional CLI Parameters

- `--instructors COUNT` defaults to `10` and must be at least `2`

## Fixed Global Rules

- Timezone is fixed to `Asia/Tokyo` (not configurable).
- Seeded faker generation with a constant seed.
- No dependency on current date/time.
- Same inputs should produce stable outputs for the same faker/package version.

## Dataset Size

- instructors: configured by `--instructors`
- customers: `instructors * 10`
- every customer has 2 children

Derived totals:

- children: `instructors * 20`
- subscriptions: `instructors * 10`
- recurring classes: `instructors * 20` (see plan mapping below)

## Plan Mapping

Use four plans:

- `月2,180円プラン / 2,180 yen/month Plan`: Program Original, weekly 1
- `月3,180円プラン / 3,180 yen/month Plan`: Program Original, weekly 2
- `月13,980円プラン / 13,980 yen/month Plan Native A`: Native A, weekly 2
- `月13,980円プラン / 13,980 yen/month Plan Native B`: Native B, weekly 2

Mapping rule:

- odd customer index -> Program Original weekly 2
- even customer index -> Native A weekly 2

English background values:

- Program Original plans use `english_background = 0`
- Native A uses `english_background = 1`
- Native B uses `english_background = 2`

Child naming rule:

- Child `name` is always a single first name token.
- Do not encode multiple children in one name (no `&`, no `.` composite pattern).

Name style rule:

- Customer names: Japanese-style names.
- Instructor names: English-style names.
- Instructor nicknames: realistic English-style nicknames, deterministic and unique.

Instructor `english_background` alternates by index:

- odd instructor index -> `0`
- even instructor index -> `1`

## Instructor Schedule Patterns

Use two fixed patterns:

- Pattern A (Mon-Fri):
  - times: `16:00`, `16:30`, `17:00`, `17:30`, `18:00`, `18:30`
- Pattern B (Tue-Sat):
  - Tue-Fri times: `18:00`, `18:30`, `19:00`, `19:30`, `20:00`, `20:30`
  - Sat times: `09:00`, `09:30`, `10:00`, `10:30`, `11:00`, `11:30`

Assignment:

- instructor index odd -> Pattern A
- instructor index even -> Pattern B

Sunday has no slots.

## Instructor Fee Rules

Emit one active `instructor_fees.csv` row per instructor.

Field values:

- `currency = PHP`
- `effective_from = --from`
- `effective_to = empty`
- `trial_fee = 75`
- `regular_fee = 100`
- `cancel_fee = 50`
- `cancel_without_notice_fee = 100`

## Instructor Assignment for Recurring Classes

Recurring classes must be distributed across instructors with the same English
background.

Rule:

- Program Original recurring classes use odd-indexed instructors.
- Native A recurring classes use even-indexed instructors.
- Within each background pool, assign subscriptions in strict round-robin order.
- Assign both recurring classes in a subscription to different slots for the same instructor.
- Candidates are sorted by `subscription_ref`, then class sequence index.
- Each instructor has 30 unique schedule slots. Never reuse a slot; fail generation if a pool exceeds capacity.
- With the default 10 instructors, every instructor receives 20 recurring classes and retains 10 open slots for rebooking.

## Recurring Class Generation

For each subscription:

- Create `plan.weekly_class_times` recurring classes.
- Each recurring class is assigned to one instructor by the distribution rule above.
- For each recurring class, assign one weekday/time slot from the instructor's available pattern deterministically.

## Attendance Rules

- `recurring_class_attendance.csv`: both children attend all recurring classes

- `class_attendance.csv`:
  - expanded from recurring class attendance for each generated class instance

## Class Expansion Rules (`classes.csv`)

Expand each recurring class weekly across the target range `[from, to]`:

- First class is the first matching weekday/time on or after `from`.
- Next classes are every 7 days until `to` (inclusive).

Field rules:

- `status`:
  - `completed` when `class.date <= completed-until`
  - `booked` when `class.date > completed-until`
- `rebookable_until`:
  - `class.date_time + 180 days` when `status = booked`
  - empty when `status = completed`
- `is_free_trial`: `false`
- `class_code`: short deterministic unique string (stable for same inputs)

## Other Files

Generator should also emit:

- `events.csv`
- `schedules.csv` with exactly one row:
  - `date = --from`
  - `event_ref = EV0001`
- `system_status.csv`
- plus all other mandatory normalized files required by the importer contract

## Determinism Expectations

Given the same `--from`, `--completed-until`, and `--to`:

- row counts must match
- row content/order must match
- reference keys must match
- generated zip (if produced) should be reproducible

## Local browser preview database

From `backend`, `npm run seed:preview` generates the same normalized fixture and
imports it through the actual admin importer. **This resets the local database's
import target tables**, while preserving admins. Run migrations and
`npm run db:bootstrap` first. The command requires `EMAIL_ENV=develop` and a
`POSTGRES_PRISMA_URL` whose parsed host is `localhost`, `127.0.0.1`, or `::1`;
connection-host override parameters are rejected. An existing bootstrap admin is
required before the reset starts.

```sh
npm run seed:preview -- --changes 10
npm run seed:preview -- --base-date 2026-10-19 --from 2026-07-19 --completed-until 2026-10-18 --to 2027-05-19 --instructors 10 --changes 50
```

All flags are optional. Defaults are today's JST date as `--base-date`, three
calendar months before it as `--from`, the previous day as
`--completed-until`, seven calendar months after it as `--to`, 10 instructors,
and zero change sets. Month offsets clamp to the last valid day. The existing
`fixture:generate:normalized-import` command remains a CSV/ZIP-only generator.
Fixture credentials remain those generated in the CSVs (for example
`cu0001@example.com` / `Temp-cu0001`).

`--changes N` means **N complete six-operation sets**, selecting customers 1, 3,
5, … in generator row order. With 10 instructors there are 100 customers, so
`--changes 50` modifies all 50 odd customers and creates 300 history rows. Even
customers, and odd customers beyond N, retain the imported data. The maximum N is
validated before importing.

Each set calls the real mutation services in this order: customer cancellation,
customer rebooking, admin cancellation of a different original class, admin
rebooking, customer regular schedule update, then admin update of that latest
regular version. The earliest two future booked classes are selected by date and
ID. Replacement slots use the same instructor, ordered by timestamp, with source
and customer-booked timestamps excluded. Regular targets use available recurring
slots with the same instructor and exclude the current weekday/time. They prefer
a distinct third slot; if capacity requires it, the admin may return the schedule to its original weekday/time. Their
first 14-day search window starts 28 days after the base date. The admin search
starts at least 42 days after it and eight days after the first actual occurrence,
with both searches capped at the generated horizon. The selected actual JST date
is passed to the service. Both updates use the service preview token. History
snapshots, attendance relations, credit consumption, and recurring version links come from
the normal services; no history rows are fabricated. Only outbox rows belonging
to the generated six-operation histories are removed, leaving preview history
visible without a pending digest.

For changes, the base date must be today or later in real JST, the import must
start on/before it and complete classes strictly before it, and the generated
horizon must extend at least 60 days after it. Use an explicit base date and the
same flags for deterministic semantic outcomes; database IDs, ID-derived generated
class codes naturally vary. Operation timestamps default to base-date at JST midnight,
with one-minute increments across all sets. Use --changes-start with an ISO datetime
including timezone and --changes-interval-minutes with a positive integer to override
them (for example --changes-start "2026-10-12T09:00:00+09:00"
--changes-interval-minutes 30). These only adjust history occurredAt after real
service operations; class dates and effective dates remain independent. A past base date can generate
an unchanged fixture, but cannot bypass the mutation services' real-time booking rules. The runner logs
each changed customer's ordinal, name, and six operations, verifies exactly six
ordered history kinds per selected customer, checks that untouched customers
have no history, and returns a summary including unchanged customer emails.
