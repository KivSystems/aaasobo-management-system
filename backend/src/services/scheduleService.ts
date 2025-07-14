import { prisma } from "../../prisma/prismaClient";

// Fetch all schedules
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

// Delete selected schedules
export const deleteSchedules = async (dateList: string[]) => {
  try {
    return await prisma.schedule.deleteMany({
      where: {
        date: {
          in: dateList,
        },
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to delete schedules.");
  }
};

// Register selected schedules
export const registerSchedules = async (
  dataList: { date: string; eventId: number }[],
) => {
  try {
    return await prisma.schedule.createMany({
      data: dataList,
      skipDuplicates: true,
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to register schedules.");
  }
};

// Update selected schedules
export const updateSchedules = async (
  startDate: string,
  endDate: string,
  eventId: number,
) => {
  try {
    return await prisma.schedule.updateMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      data: {
        eventId: eventId,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to update schedules.");
  }
};
