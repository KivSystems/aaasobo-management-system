/*
  Warnings:

  - Added the required column `timezone` to the `InstructorSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InstructorSchedule" ADD COLUMN     "timezone" TEXT NOT NULL,
ALTER COLUMN "effectiveFrom" SET DATA TYPE DATE,
ALTER COLUMN "effectiveTo" SET DATA TYPE DATE;
