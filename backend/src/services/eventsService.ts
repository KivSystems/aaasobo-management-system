import { prisma } from "../../prisma/prismaClient";

// Register a new event in the DB
export const registerEvent = async (data: { name: string; color: string }) => {
  await prisma.event.create({ data });

  return;
};

// Fetch all event data.
export const getAllEvents = async () => {
  try {
    return await prisma.event.findMany();
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch events.");
  }
};

// Fetch the event using the ID
export async function getEventById(id: number) {
  try {
    return prisma.event.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch event.");
  }
}
