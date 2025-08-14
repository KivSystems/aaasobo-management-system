-- DropForeignKey
ALTER TABLE "ClassAttendance" DROP CONSTRAINT "ClassAttendance_classId_fkey";

-- AddForeignKey
ALTER TABLE "ClassAttendance" ADD CONSTRAINT "ClassAttendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
