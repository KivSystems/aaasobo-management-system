import { prisma } from "../../prisma/prismaClient";

export const getInstructorAbsences = async (instructorId: number) => {
  try {
    return await prisma.instructorAbsence.findMany({
      where: { instructorId },
      orderBy: { absentAt: "asc" },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch instructor absences.");
  }
};

export const addInstructorAbsence = async (data: {
  instructorId: number;
  absentAt: Date;
}) => {
  try {
    return await prisma.instructorAbsence.create({
      data: {
        instructorId: data.instructorId,
        absentAt: data.absentAt,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to add instructor absence.");
  }
};

export const removeInstructorAbsence = async (
  instructorId: number,
  absentAt: Date,
) => {
  try {
    return await prisma.instructorAbsence.delete({
      where: {
        instructorId_absentAt: {
          instructorId,
          absentAt,
        },
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to remove instructor absence.");
  }
};
