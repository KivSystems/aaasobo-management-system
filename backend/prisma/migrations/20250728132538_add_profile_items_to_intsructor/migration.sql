/*
  Warnings:

  - Added the required column `birthdate` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `favoriteFood` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hobby` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lifeHistory` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `messageForKids` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skill` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workingTime` to the `Instructor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN     "birthdate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "favoriteFood" TEXT NOT NULL,
ADD COLUMN     "hobby" TEXT NOT NULL,
ADD COLUMN     "lifeHistory" TEXT NOT NULL,
ADD COLUMN     "messageForKids" TEXT NOT NULL,
ADD COLUMN     "skill" TEXT NOT NULL,
ADD COLUMN     "workingTime" TEXT NOT NULL;
