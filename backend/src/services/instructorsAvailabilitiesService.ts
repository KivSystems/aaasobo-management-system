import { prisma } from "../../prisma/prismaClient";
import {
  FREE_TRIAL_BOOKING_HOURS,
  REGULAR_REBOOKING_HOURS,
} from "../helper/commonUtils";
import { nHoursLater } from "../helper/dateUtils";

type InstructorAvailability = {
  instructorId?: number;
  dateTime: Date;
};

/**
 * Fetches a specific instructor's available time slots starting 3 hours from now.
 * Only includes slots where:
 * - The instructor is not marked as unavailable
 * - There are no existing classes that are booked or rebooked at those times
 * - Excludes any instructor availability falling on dates marked as events named "AaasoBo! Holiday".
 *   This exclusion is based on matching the date (ignoring time) between InstructorAvailability.dateTime and Schedule.date.
 */
export const getCalendarAvailabilities = async (instructorId: number) => {
  const effectiveFrom = nHoursLater(REGULAR_REBOOKING_HOURS);

  const availableSlots = await prisma.$queryRaw<InstructorAvailability[]>`
    SELECT ia."dateTime"
    FROM "InstructorAvailability" ia
    WHERE ia."instructorId" = ${instructorId}
      AND ia."dateTime" >= ${effectiveFrom.toISOString()}::timestamp
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
      AND NOT EXISTS (
        SELECT 1 FROM "Schedule" s
        JOIN "Event" e ON e."id" = s."eventId"
        WHERE ia."dateTime"::date = s."date"
          AND e."name" = 'AaasoBo! Holiday'
      )
  `;

  const formattedAvailabilities = availableSlots.map((availability) => {
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

/**
 * Fetches all instructors' available time slots between now (+3 hours) and a given date (rebookableUntil).
 * Only includes slots where:
 * - The instructor is not marked as unavailable
 * - There are no existing classes that are booked or rebooked at those times
 * - Excludes any instructor availability falling on dates marked as events named "お休み / No Class".
 *   This exclusion is based on matching the date (ignoring time) between InstructorAvailability.dateTime and Schedule.date.
 */
export const getInstructorAvailabilities = async (
  rebookableUntil: Date,
  isFreeTrial: boolean,
): Promise<InstructorAvailability[]> => {
  const effectiveFrom = isFreeTrial
    ? nHoursLater(FREE_TRIAL_BOOKING_HOURS)
    : nHoursLater(REGULAR_REBOOKING_HOURS);

  const availableSlots = await prisma.$queryRaw<InstructorAvailability[]>`
    SELECT ia."instructorId", ia."dateTime"
    FROM "InstructorAvailability" ia
    WHERE ia."dateTime" BETWEEN ${effectiveFrom.toISOString()}::timestamp AND ${rebookableUntil.toISOString()}::timestamp
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
      AND NOT EXISTS (
      SELECT 1 FROM "Schedule" s
      JOIN "Event" e ON e."id" = s."eventId"
      WHERE ia."dateTime"::date = s."date"
        AND e."name" = 'お休み / No Class'
    )
  `;

  return availableSlots;
};
