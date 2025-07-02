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

// Update the selected event
export const updateEvent = async (id: number, name: string, color: string) => {
  try {
    // Update the event data.
    const event = await prisma.event.update({
      where: {
        id,
      },
      data: {
        name,
        color,
      },
    });
    return event;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to update the event data.");
  }
};
