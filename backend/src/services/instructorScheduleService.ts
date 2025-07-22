import { prisma } from "../../prisma/prismaClient";

// Get all schedule versions for an instructor (without slot details)
export const getInstructorSchedules = async (instructorId: number) => {
  try {
    return await prisma.instructorSchedule.findMany({
      where: { instructorId },
      orderBy: { effectiveFrom: "asc" },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch instructor schedule versions.");
  }
};

// Get all slots for a specific schedule
export const getScheduleSlots = async (scheduleId: number) => {
  try {
    return await prisma.instructorSlot.findMany({
      where: { scheduleId },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch schedule slots.");
  }
};

// Create a new schedule version for an instructor
export const createInstructorSchedule = async (data: {
  instructorId: number;
  effectiveFrom: Date;
  slots: Array<{
    weekday: number;
    startTime: Date;
  }>;
}) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // Find current active schedule to end it
      const currentActiveSchedule = await tx.instructorSchedule.findUnique({
        where: {
          instructorId_effectiveTo: {
            instructorId: data.instructorId,
            effectiveTo: null as any, // Currently active (no end date)
          },
        },
      });

      // If there's an active schedule, end it
      if (currentActiveSchedule) {
        // Set end date to new schedule start (half-open interval)
        await tx.instructorSchedule.update({
          where: { id: currentActiveSchedule.id },
          data: { effectiveTo: data.effectiveFrom },
        });
      }

      // Create the new schedule
      const schedule = await tx.instructorSchedule.create({
        data: {
          instructorId: data.instructorId,
          effectiveFrom: data.effectiveFrom,
          effectiveTo: null,
        },
      });

      await tx.instructorSlot.createMany({
        data: data.slots.map((slot) => ({
          scheduleId: schedule.id,
          weekday: slot.weekday,
          startTime: slot.startTime,
        })),
      });

      // Return the created schedule with slots
      return await tx.instructorSchedule.findUnique({
        where: { id: schedule.id },
        include: { slots: true },
      });
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to create schedule version.");
  }
};
