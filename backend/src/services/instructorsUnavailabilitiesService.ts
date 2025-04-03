import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/prismaClient";

export async function getInstructorUnavailabilities(instructorId: number) {
  try {
    return await prisma.instructorUnavailability.findMany({
      where: { instructorId },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch instructor unavailabilities.");
  }
}

export async function createInstructorUnavailability(
  instructorId: number,
  dateTime: Date,
) {
  try {
    await prisma.instructorUnavailability.create({
      data: { instructorId, dateTime },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to create instructor unavailability.");
  }
}

export async function getValidInstructorUnavailabilities(
  tx: Prisma.TransactionClient,
  instructorId: number,
  date: Date,
) {
  try {
    return await tx.instructorUnavailability.findMany({
      where: { instructorId, dateTime: { gte: date } },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch valid instructor unavailabilities.");
  }
}
