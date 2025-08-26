/*
  Warnings:

  - You are about to drop the column `inactiveAt` on the `Instructor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admins" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Instructor" DROP COLUMN "inactiveAt",
ADD COLUMN     "terminationAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
