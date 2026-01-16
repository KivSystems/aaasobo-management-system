/*
  Warnings:

  - You are about to drop the `Admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Children` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Children" DROP CONSTRAINT "Children_customerId_fkey";

-- DropForeignKey
ALTER TABLE "ClassAttendance" DROP CONSTRAINT "ClassAttendance_childrenId_fkey";

-- DropForeignKey
ALTER TABLE "RecurringClassAttendance" DROP CONSTRAINT "RecurringClassAttendance_childrenId_fkey";

-- DropTable
DROP TABLE "Admins";

-- DropTable
DROP TABLE "Children";

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3),
    "personalInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Child_customerId_idx" ON "Child"("customerId");

-- CreateIndex
CREATE INDEX "Class_status_idx" ON "Class"("status");

-- CreateIndex
CREATE INDEX "Class_customerId_idx" ON "Class"("customerId");

-- CreateIndex
CREATE INDEX "Class_instructorId_idx" ON "Class"("instructorId");

-- CreateIndex
CREATE INDEX "Class_status_dateTime_idx" ON "Class"("status", "dateTime");

-- CreateIndex
CREATE INDEX "Class_customerId_dateTime_idx" ON "Class"("customerId", "dateTime");

-- CreateIndex
CREATE INDEX "Class_instructorId_dateTime_idx" ON "Class"("instructorId", "dateTime");

-- CreateIndex
CREATE INDEX "Class_customerId_status_dateTime_idx" ON "Class"("customerId", "status", "dateTime");

-- CreateIndex
CREATE INDEX "Class_instructorId_status_dateTime_idx" ON "Class"("instructorId", "status", "dateTime");

-- CreateIndex
CREATE INDEX "Class_recurringClassId_dateTime_idx" ON "Class"("recurringClassId", "dateTime");

-- CreateIndex
CREATE INDEX "Class_rebookableUntil_idx" ON "Class"("rebookableUntil");

-- CreateIndex
CREATE INDEX "ClassAttendance_classId_idx" ON "ClassAttendance"("classId");

-- CreateIndex
CREATE INDEX "ClassAttendance_childrenId_idx" ON "ClassAttendance"("childrenId");

-- CreateIndex
CREATE INDEX "Customer_terminationAt_idx" ON "Customer"("terminationAt");

-- CreateIndex
CREATE INDEX "Instructor_terminationAt_idx" ON "Instructor"("terminationAt");

-- CreateIndex
CREATE INDEX "InstructorAbsence_instructorId_idx" ON "InstructorAbsence"("instructorId");

-- CreateIndex
CREATE INDEX "InstructorAbsence_absentAt_idx" ON "InstructorAbsence"("absentAt");

-- CreateIndex
CREATE INDEX "InstructorSchedule_instructorId_effectiveTo_idx" ON "InstructorSchedule"("instructorId", "effectiveTo");

-- CreateIndex
CREATE INDEX "InstructorSchedule_instructorId_effectiveFrom_idx" ON "InstructorSchedule"("instructorId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "InstructorSchedule_instructorId_timezone_effectiveFrom_idx" ON "InstructorSchedule"("instructorId", "timezone", "effectiveFrom");

-- CreateIndex
CREATE INDEX "RecurringClass_instructorId_endAt_idx" ON "RecurringClass"("instructorId", "endAt");

-- CreateIndex
CREATE INDEX "RecurringClass_subscriptionId_endAt_idx" ON "RecurringClass"("subscriptionId", "endAt");

-- CreateIndex
CREATE INDEX "RecurringClass_endAt_idx" ON "RecurringClass"("endAt");

-- CreateIndex
CREATE INDEX "RecurringClassAttendance_recurringClassId_idx" ON "RecurringClassAttendance"("recurringClassId");

-- CreateIndex
CREATE INDEX "RecurringClassAttendance_childrenId_idx" ON "RecurringClassAttendance"("childrenId");

-- CreateIndex
CREATE INDEX "Subscription_customerId_idx" ON "Subscription"("customerId");

-- AddForeignKey
ALTER TABLE "ClassAttendance" ADD CONSTRAINT "ClassAttendance_childrenId_fkey" FOREIGN KEY ("childrenId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringClassAttendance" ADD CONSTRAINT "RecurringClassAttendance_childrenId_fkey" FOREIGN KEY ("childrenId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
