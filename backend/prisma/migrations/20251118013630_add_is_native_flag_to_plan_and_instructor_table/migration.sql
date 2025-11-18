/*
  Warnings:

  - Added the required column `isNative` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isNative` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN     "isNative" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "isNative" BOOLEAN NOT NULL;
