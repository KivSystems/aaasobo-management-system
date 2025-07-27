import { prisma } from "../../prisma/prismaClient";

export const getInstructorSchedules = async (instructorId: number) => {
  try {
    return await prisma.instructorSchedule.findMany({
      where: { instructorId },
      orderBy: { effectiveFrom: "desc" },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch instructor schedule versions.");
  }
};

export const getScheduleWithSlots = async (scheduleId: number) => {
  try {
    return await prisma.instructorSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        slots: { orderBy: [{ weekday: "asc" }, { startTime: "asc" }] },
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch schedule with slots.");
  }
};

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
      // Find the currently active schedule (effectiveTo: null)
      // Note: This should be findUnique since we have @@unique([instructorId, effectiveTo]),
      // but Prisma doesn't support null values in compound unique constraints with findUnique.
      // Using findFirst is safe here as the DB constraint ensures uniqueness.
      const currentActiveSchedule = await tx.instructorSchedule.findFirst({
        where: {
          instructorId: data.instructorId,
          effectiveTo: null,
        },
      });

      // If there's an active schedule, end it
      if (currentActiveSchedule) {
        await tx.instructorSchedule.update({
          where: { id: currentActiveSchedule.id },
          data: { effectiveTo: data.effectiveFrom },
        });
      }

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
