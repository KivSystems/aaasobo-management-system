/*
  Warnings:

  - You are about to drop the column `isRebookable` on the `Class` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'rebooked';

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "isRebookable",
ADD COLUMN     "classCode" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
