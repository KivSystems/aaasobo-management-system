import { prisma } from "../../prisma/prismaClient";

// Fetch all admins information
export const getAllSchedules = async () => {
  try {
    return await prisma.schedule.findMany({
      orderBy: {
        date: "asc",
      },
      include: {
        event: true,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch schedules.");
  }
};
