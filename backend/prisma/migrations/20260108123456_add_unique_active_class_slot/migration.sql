-- Prevent instructor double booking for active classes.
-- Note: Prisma schema cannot express partial unique indexes, so this is raw SQL.
CREATE UNIQUE INDEX "Class_instructorId_dateTime_unique_active"
ON "Class" ("instructorId", "dateTime")
WHERE
  "instructorId" IS NOT NULL
  AND "dateTime" IS NOT NULL
  AND "status" IN ('booked', 'rebooked');

