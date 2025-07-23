import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/prismaClient";

export const deleteAttendancesByChildId = async (
  tx: Prisma.TransactionClient,
  childId: number,
) => {
  try {
    // Delete the Child data.
    const deletedAttendances = await tx.classAttendance.deleteMany({
      where: { childrenId: childId },
    });

    return deletedAttendances;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to delete class attendances.");
  }
};

export const deleteAttendancesByClassId = async (
  classId: number,
  tx?: Prisma.TransactionClient,
) => {
  const db = tx ?? prisma;
  await db.classAttendance.deleteMany({
    where: { classId },
  });
};

export const createAttendances = async (
  classId: number,
  childrenIds: number[],
  tx: Prisma.TransactionClient,
) => {
  await tx.classAttendance.createMany({
    data: childrenIds.map((childId) => ({
      classId,
      childrenId: childId,
    })),
  });
};
