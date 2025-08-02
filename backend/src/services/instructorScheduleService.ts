import { prisma } from "../../prisma/prismaClient";
import { Prisma } from "@prisma/client";
import { addDays, format, startOfDay, endOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { TZDate } from "@date-fns/tz";

type InstructorSchedule = Prisma.InstructorScheduleGetPayload<{
  include: { slots: true };
}>;

type InstructorSlot = Prisma.InstructorSlotGetPayload<{}>;

interface AvailableSlot {
  dateTime: string;
}

// Extract time string (HH:MM) from DateTime
const extractTimeFromDateTime = (dateTime: Date): string => {
  return dateTime.toISOString().substring(11, 16);
};

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
    const schedule = await prisma.instructorSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        slots: { orderBy: [{ weekday: "asc" }, { startTime: "asc" }] },
      },
    });

    if (!schedule) {
      return null;
    }

    // Transform startTime from DateTime to time string
    return {
      ...schedule,
      slots: schedule.slots.map((slot) => ({
        ...slot,
        startTime: extractTimeFromDateTime(slot.startTime),
      })),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch schedule with slots.");
  }
};

export const createInstructorSchedule = async (data: {
  instructorId: number;
  effectiveFrom: Date;
  timezone: string;
  slots: Array<{
    weekday: number;
    startTime: string; // HH:MM format
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
          timezone: data.timezone,
        },
      });

      await tx.instructorSlot.createMany({
        data: data.slots.map((slot) => ({
          scheduleId: schedule.id,
          weekday: slot.weekday,
          startTime: new Date(`1970-01-01T${slot.startTime}:00.000Z`),
        })),
      });

      const createdSchedule = await tx.instructorSchedule.findUnique({
        where: { id: schedule.id },
        include: { slots: true },
      });

      if (!createdSchedule) {
        throw new Error("Failed to retrieve created schedule");
      }

      // Transform startTime from DateTime to time string
      return {
        ...createdSchedule,
        slots: createdSchedule.slots.map((slot) => ({
          ...slot,
          startTime: extractTimeFromDateTime(slot.startTime),
        })),
      };
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to create schedule version.");
  }
};

const findEffectiveSchedule = (
  schedules: InstructorSchedule[],
  targetDate: Date,
): InstructorSchedule | undefined => {
  return schedules.find((s) => {
    const targetDateStr = format(targetDate, "yyyy-MM-dd");

    // Create TZDate objects representing the dates in the schedule timezone
    const effectiveFromDateStr = format(s.effectiveFrom, "yyyy-MM-dd");
    const effectiveFromTZ = new TZDate(
      `${effectiveFromDateStr}T00:00:00`,
      s.timezone,
    );
    const effectiveFromUtcStr = format(effectiveFromTZ, "yyyy-MM-dd");

    const effectiveToUtcStr = s.effectiveTo
      ? (() => {
          const effectiveToDateStr = format(s.effectiveTo, "yyyy-MM-dd");
          const effectiveToTZ = new TZDate(
            `${effectiveToDateStr}T00:00:00`,
            s.timezone,
          );
          return format(effectiveToTZ, "yyyy-MM-dd");
        })()
      : null;

    return (
      effectiveFromUtcStr <= targetDateStr &&
      (effectiveToUtcStr === null || targetDateStr < effectiveToUtcStr)
    );
  });
};

const generateSlotsForDay = (
  utcDate: Date,
  schedule: InstructorSchedule,
  absentDateTimes: Set<string>,
): AvailableSlot[] => {
  const timezone = schedule.timezone;

  const zonedDate = toZonedTime(utcDate, timezone);
  const weekday = zonedDate.getDay();
  const dateStr = format(zonedDate, "yyyy-MM-dd");

  const slotsForDay = schedule.slots.filter(
    (slot: InstructorSlot) => slot.weekday === weekday,
  );

  const daySlots: AvailableSlot[] = [];
  for (const slot of slotsForDay) {
    const slotTimeStr = extractTimeFromDateTime(slot.startTime);
    // Create a date object in the target timezone and convert to UTC
    const dateTimeStr = `${dateStr}T${slotTimeStr}:00`;
    const utcDateTime = fromZonedTime(dateTimeStr, timezone);
    const utcDateTimeISO = utcDateTime.toISOString();

    if (!absentDateTimes.has(utcDateTimeISO)) {
      daySlots.push({ dateTime: utcDateTimeISO });
    }
  }

  return daySlots;
};

export const getInstructorAvailableSlots = async (
  instructorId: number,
  start: Date,
  end: Date,
) => {
  try {
    const [allSchedules, absences] = await Promise.all([
      prisma.instructorSchedule.findMany({
        where: { instructorId },
        include: {
          slots: { orderBy: [{ weekday: "asc" }, { startTime: "asc" }] },
        },
        orderBy: { effectiveFrom: "asc" },
      }),
      prisma.instructorAbsence.findMany({
        where: {
          instructorId,
          absentAt: { gte: start, lt: end },
        },
      }),
    ]);

    const absentDateTimes = new Set(
      absences.map((absence) => absence.absentAt.toISOString()),
    );

    const availableSlots: AvailableSlot[] = [];

    for (let current = start; current < end; current = addDays(current, 1)) {
      const effectiveSchedule = findEffectiveSchedule(allSchedules, current);

      if (effectiveSchedule) {
        const daySlots = generateSlotsForDay(
          current,
          effectiveSchedule,
          absentDateTimes,
        );

        const filteredSlots = daySlots.filter((slot) => {
          const slotDate = new Date(slot.dateTime);
          return start <= slotDate && slotDate < end;
        });

        availableSlots.push(...filteredSlots);
      }
    }

    return availableSlots;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch instructor available slots.");
  }
};
