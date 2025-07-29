-- Migration: Convert InstructorSchedule Date columns to DateTime with JST midnight conversion
-- This migration ensures all existing Date values are converted to proper JST midnight DateTime values

-- Step 1: Add temporary columns for new DateTime values
ALTER TABLE "InstructorSchedule"
ADD COLUMN "effectiveFrom_new" TIMESTAMP(3),
ADD COLUMN "effectiveTo_new" TIMESTAMP(3);

-- Step 2: Convert existing DateTime data to JST midnight (09:00 UTC)
-- Since columns are already TIMESTAMP(3), we need to ensure they represent JST midnight
-- Extract the date part and set time to 09:00:00.000 UTC (JST midnight)
UPDATE "InstructorSchedule"
SET "effectiveFrom_new" = (DATE("effectiveFrom") || ' 09:00:00.000')::timestamp AT TIME ZONE 'UTC';

-- For effectiveTo: Convert to JST midnight (only if not null)
UPDATE "InstructorSchedule"
SET "effectiveTo_new" = (DATE("effectiveTo") || ' 09:00:00.000')::timestamp AT TIME ZONE 'UTC'
WHERE "effectiveTo" IS NOT NULL;

-- Step 3: Verify all conversions are JST midnight (09:00 UTC)
-- This check ensures data integrity - all times should be 09:00:00.000
DO $$
BEGIN
    -- Check effectiveFrom values
    IF EXISTS (
        SELECT 1 FROM "InstructorSchedule"
        WHERE EXTRACT(hour FROM "effectiveFrom_new") != 9
           OR EXTRACT(minute FROM "effectiveFrom_new") != 0
           OR EXTRACT(second FROM "effectiveFrom_new") != 0
    ) THEN
        RAISE EXCEPTION 'Data integrity error: Some effectiveFrom values are not JST midnight (09:00 UTC)';
    END IF;

    -- Check effectiveTo values (where not null)
    IF EXISTS (
        SELECT 1 FROM "InstructorSchedule"
        WHERE "effectiveTo_new" IS NOT NULL
          AND (EXTRACT(hour FROM "effectiveTo_new") != 9
               OR EXTRACT(minute FROM "effectiveTo_new") != 0
               OR EXTRACT(second FROM "effectiveTo_new") != 0)
    ) THEN
        RAISE EXCEPTION 'Data integrity error: Some effectiveTo values are not JST midnight (09:00 UTC)';
    END IF;

    RAISE NOTICE 'Data conversion verification passed: All values are JST midnight (09:00 UTC)';
END $$;

-- Step 4: Drop old Date columns
ALTER TABLE "InstructorSchedule"
DROP COLUMN "effectiveFrom",
DROP COLUMN "effectiveTo";

-- Step 5: Rename new columns to original names
ALTER TABLE "InstructorSchedule"
RENAME COLUMN "effectiveFrom_new" TO "effectiveFrom";

ALTER TABLE "InstructorSchedule"
RENAME COLUMN "effectiveTo_new" TO "effectiveTo";

-- Step 6: Add NOT NULL constraint to effectiveFrom (it should never be null)
ALTER TABLE "InstructorSchedule"
ALTER COLUMN "effectiveFrom" SET NOT NULL;

-- Step 7: Recreate the unique constraint (it may have been dropped during column operations)
-- Note: This constraint ensures only one active schedule per instructor
ALTER TABLE "InstructorSchedule"
DROP CONSTRAINT IF EXISTS "InstructorSchedule_instructorId_effectiveTo_key";

ALTER TABLE "InstructorSchedule"
ADD CONSTRAINT "InstructorSchedule_instructorId_effectiveTo_key"
UNIQUE ("instructorId", "effectiveTo");

-- Step 8: Add helpful comment about the JST midnight constraint
COMMENT ON COLUMN "InstructorSchedule"."effectiveFrom" IS
'Schedule effective start date as DateTime. Must always be JST midnight (09:00 UTC) to ensure consistent day-boundary transitions.';

COMMENT ON COLUMN "InstructorSchedule"."effectiveTo" IS
'Schedule effective end date as DateTime. Must always be JST midnight (09:00 UTC) when not null. NULL indicates active schedule.';

-- Final verification
DO $$
DECLARE
    row_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO row_count FROM "InstructorSchedule";
    RAISE NOTICE 'Migration completed successfully. Processed % InstructorSchedule records.', row_count;
END $$;
