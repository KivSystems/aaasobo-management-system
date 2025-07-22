/*
  Warnings:

  - Made the column `classCode` on table `Class` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Class` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Class" ALTER COLUMN "classCode" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;
