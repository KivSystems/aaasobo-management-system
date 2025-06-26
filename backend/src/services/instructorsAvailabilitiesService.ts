import { prisma } from "../../prisma/prismaClient";
import { nHoursLater } from "../helper/dateUtils";

export const getCalendarAvailabilities = async (instructorId: number) => {
  const effectiveFrom = nHoursLater(3);

  // Get the instructor's unavailable dateTimes from Class table
  const bookedOrCanceledTimeSlots = await prisma.class.findMany({
    where: {
      instructorId: instructorId,
      dateTime: {
        gte: effectiveFrom,
      },
      status: {
        // TODO: once the updateClass service function has been updated, remove "canceledByInstructor"
        in: ["booked", "rebooked", "canceledByInstructor"],
      },
    },
    select: {
      dateTime: true,
    },
  });

  // Get the instructor's unavailable dateTimes from InstructorUnavailability table
  const unavailableTimeSlots = await prisma.instructorUnavailability.findMany({
    where: {
      instructorId: instructorId,
      dateTime: {
        gte: effectiveFrom,
      },
    },
    select: {
      dateTime: true,
    },
  });

  // Combine those unavailable dateTimes
  const unavailableDateTimes = [
    ...bookedOrCanceledTimeSlots.map((record) => record.dateTime),
    ...unavailableTimeSlots.map((record) => record.dateTime),
  ];

  // Get the instructor's available dateTimes by excluding unavailable time slots
  const availabilities = await prisma.instructorAvailability.findMany({
    where: {
      instructorId: instructorId,
      dateTime: {
        gte: effectiveFrom,
        notIn: unavailableDateTimes, // Exclude the records of unavailable dateTimes
      },
    },
    orderBy: {
      dateTime: "asc",
    },
  });

  const formattedAvailabilities = availabilities.map((availability) => {
    const start = availability.dateTime;
    const end = new Date(new Date(start).getTime() + 25 * 60000).toISOString();

    return {
      start,
      end,
      title: "No booked class",
      color: "#A2B098",
    };
  });

  return formattedAvailabilities;
};

type InstructorAvailability = {
  instructorId: number;
  dateTime: Date;
};

/**
 * Fetches all instructors' available time slots between now (+3 hours) and a given date (rebookableUntil).
 * Only includes slots where:
 * - The instructor is not marked as unavailable
 * - There are no existing classes that are booked or rebooked at those times
 */
export const getInstructorAvailabilities = async (
  rebookableUntil: Date,
): Promise<InstructorAvailability[]> => {
  const effectiveFrom = nHoursLater(3);

  const availableSlots = await prisma.$queryRaw<InstructorAvailability[]>`
    SELECT ia."instructorId", ia."dateTime"
    FROM "InstructorAvailability" ia
    WHERE ia."dateTime" BETWEEN ${effectiveFrom} AND ${rebookableUntil}
      AND NOT EXISTS (
        SELECT 1 FROM "InstructorUnavailability" iu
        WHERE iu."instructorId" = ia."instructorId"
          AND iu."dateTime" = ia."dateTime"
      )
      AND NOT EXISTS (
        SELECT 1 FROM "Class" c
        WHERE c."instructorId" = ia."instructorId"
          AND c."dateTime" = ia."dateTime"
          AND c."status" IN ('booked', 'rebooked')
      )
  `;

  return availableSlots;
};
