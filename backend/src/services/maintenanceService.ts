import { prisma } from "../../prisma/prismaClient";

// Fetch the current system status
export const getSystemStatus = async () => {
  try {
    // Fetch the system status from the database.
    const data = await prisma.systemStatus.findUnique({
      where: { id: 1 },
      select: { status: true },
    });
    if (!data) {
      throw new Error("System status not found.");
    }
    const systemStatus = data.status;
    return systemStatus;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch system status.");
  }
};

// Update system status
export const updateSystemStatus = async () => {
  try {
    // Update the system status in the database.
    const result = await prisma.systemStatus.update({
      where: { id: 1 },
      data: {
        status:
          (
            await prisma.systemStatus.findUnique({
              where: { id: 1 },
              select: { status: true },
            })
          )?.status === "Running"
            ? "Stop"
            : "Running",
      },
    });
    return result;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to update system status.");
  }
};
