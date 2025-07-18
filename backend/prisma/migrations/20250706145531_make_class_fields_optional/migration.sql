-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_recurringClassId_fkey";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_subscriptionId_fkey";

-- AlterTable
ALTER TABLE "Class" ALTER COLUMN "instructorId" DROP NOT NULL,
ALTER COLUMN "recurringClassId" DROP NOT NULL,
ALTER COLUMN "dateTime" DROP NOT NULL,
ALTER COLUMN "subscriptionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_recurringClassId_fkey" FOREIGN KEY ("recurringClassId") REFERENCES "RecurringClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
