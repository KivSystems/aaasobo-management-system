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

export const getInstructorAvailableSlots = async (
  instructorId: number,
  startDate: string,
  endDate: string,
) => {
  try {
    const schedules = await prisma.instructorSchedule.findMany({
      where: {
        instructorId,
        // Interval overlap detection: max(startDate, effectiveFrom) < min(endDate, effectiveTo)
        // This formula is mathematically equivalent to:
        // startDate < effectiveTo AND effectiveFrom < endDate
        //
        // Since we can't use max/min functions in Prisma where clause, we decompose:
        // 1. effectiveFrom < endDate (schedule starts before range ends)
        effectiveFrom: { lt: new Date(endDate) },
        // 2. startDate < effectiveTo OR effectiveTo is null (schedule ends after range starts, or is infinite)
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gt: new Date(startDate) } },
        ],
      },
      include: {
        slots: { orderBy: [{ weekday: "asc" }, { startTime: "asc" }] },
      },
      orderBy: { effectiveFrom: "asc" },
    });

    // Generate available slots for each day in the requested period
    const availableSlots = [];
    // Treat input dates as JST (add 9 hours to convert from UTC)
    const startDateObj = new Date(startDate + "T09:00:00Z");
    const endDateObj = new Date(endDate + "T09:00:00Z");
    const currentDate = new Date(startDateObj);

    while (currentDate < endDateObj) {
      // Extract date string in JST
      const currentDateString = currentDate.toISOString().split("T")[0];

      // Find the schedule that is effective for this specific date
      const effectiveSchedule = schedules.find((s) => {
        const effectiveFrom = s.effectiveFrom.toISOString().split("T")[0];
        const effectiveTo = s.effectiveTo
          ? s.effectiveTo.toISOString().split("T")[0]
          : null;

        // Check if current date is within the schedule's effective period
        return (
          effectiveFrom <= currentDateString &&
          (effectiveTo === null || currentDateString < effectiveTo)
        );
      });

      if (effectiveSchedule) {
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
        const jstDateString = currentDate.toISOString().split("T")[0];

        // Find slots for this day of the week
        const slotsForDay = effectiveSchedule.slots.filter(
          (slot) => slot.weekday === dayOfWeek,
        );

        for (const slot of slotsForDay) {
          const utcTime = slot.startTime;
          const utcTimeString = utcTime.toISOString().substring(11, 19); // Extract HH:MM:SS

          const slotDateTimeJST = `${jstDateString}T${utcTimeString}Z`;
          const slotDateTime = new Date(slotDateTimeJST);

          // Assert that the weekday matches the actual day of week from the dateTime
          if (slotDateTime.getUTCDay() !== dayOfWeek) {
            throw new Error(
              `Weekday assertion failed: dateTime weekday (${slotDateTime.getUTCDay()}) does not match expected weekday (${dayOfWeek})`,
            );
          }

          availableSlots.push({
            dateTime: slotDateTime.toISOString(),
            weekday: dayOfWeek,
            startTime: slot.startTime.toISOString(),
          });
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableSlots;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch instructor available slots.");
  }
};
