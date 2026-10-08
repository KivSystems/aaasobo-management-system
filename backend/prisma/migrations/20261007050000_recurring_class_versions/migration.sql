ALTER TABLE "RecurringClass" ADD COLUMN "previousRecurringClassId" INTEGER;
CREATE UNIQUE INDEX "RecurringClass_previousRecurringClassId_key" ON "RecurringClass"("previousRecurringClassId");
ALTER TABLE "RecurringClass" ADD CONSTRAINT "RecurringClass_previousRecurringClassId_fkey" FOREIGN KEY ("previousRecurringClassId") REFERENCES "RecurringClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;
