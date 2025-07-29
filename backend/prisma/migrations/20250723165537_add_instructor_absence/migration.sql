-- CreateTable
CREATE TABLE "InstructorAbsence" (
    "instructorId" INTEGER NOT NULL,
    "absentAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructorAbsence_pkey" PRIMARY KEY ("instructorId","absentAt")
);

-- AddForeignKey
ALTER TABLE "InstructorAbsence" ADD CONSTRAINT "InstructorAbsence_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
