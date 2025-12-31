/*
  Warnings:

  - You are about to drop the column `introductionURL` on the `Instructor` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Instructor_introductionURL_key";

-- AlterTable
ALTER TABLE "Instructor" DROP COLUMN "introductionURL";
