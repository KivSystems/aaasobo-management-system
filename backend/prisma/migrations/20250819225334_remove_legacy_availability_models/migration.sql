/*
  Warnings:

  - You are about to drop the `InstructorAvailability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InstructorRecurringAvailability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InstructorUnavailability` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InstructorAvailability" DROP CONSTRAINT "InstructorAvailability_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "InstructorAvailability" DROP CONSTRAINT "InstructorAvailability_instructorRecurringAvailabilityId_fkey";

-- DropForeignKey
ALTER TABLE "InstructorRecurringAvailability" DROP CONSTRAINT "InstructorRecurringAvailability_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "InstructorUnavailability" DROP CONSTRAINT "InstructorUnavailability_instructorId_fkey";

-- DropTable
DROP TABLE "InstructorAvailability";

-- DropTable
DROP TABLE "InstructorRecurringAvailability";

-- DropTable
DROP TABLE "InstructorUnavailability";
