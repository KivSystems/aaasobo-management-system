-- CreateTable
CREATE TABLE "InstructorSchedule" (
    "id" SERIAL NOT NULL,
    "instructorId" INTEGER NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,

    CONSTRAINT "InstructorSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructorSlot" (
    "scheduleId" INTEGER NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TIME NOT NULL,

    CONSTRAINT "InstructorSlot_pkey" PRIMARY KEY ("scheduleId","weekday","startTime")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstructorSchedule_instructorId_effectiveTo_key" ON "InstructorSchedule"("instructorId", "effectiveTo");

-- AddForeignKey
ALTER TABLE "InstructorSchedule" ADD CONSTRAINT "InstructorSchedule_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructorSlot" ADD CONSTRAINT "InstructorSlot_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "InstructorSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
