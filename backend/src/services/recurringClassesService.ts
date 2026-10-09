import { loadRecurringClassConflictChecker } from "./recurringClassConflictService";
import { createHash } from "node:crypto";
import { loadCalendarClasses } from "./schedulePreviewService";
import type { SchedulePreview } from "../../../shared/schemas/schedulePreview";
import { prisma } from "../../prisma/prismaClient";
import { Prisma, RecurringClass, Class } from "@prisma/client";
import {
  getJstDateAtUtcMidnight,
  JAPAN_TIME_DIFF,
  nDaysLater,
  nHoursBefore,
} from "../utils/dateUtils";
import {
  NO_CLASS_EVENT_NAME,
  REBOOKABLE_NO_CLASS_EVENT_NAME,
} from "../utils/commonUtils";
import { getSchedulesByEventNameAndDate } from "./scheduleService";

interface CreateRegularClassParams {
  instructorId: number;
  weekday: number;
  startTime: string;
  customerId: number;
  childrenIds: number[];
  subscriptionId: number;
  startDate: string;
  timezone: string;
}

interface UpdateRegularClassParams
  extends Omit<CreateRegularClassParams, "subscriptionId"> {
  recurringClassId: number;
  previewToken?: string;
}

export const createRegularClass = async (params: CreateRegularClassParams) => {
  return await prisma.$transaction(async (tx) => {
    return await createRecurringClass(tx, params);
  });
};

// Simple recurring class creation for subscription setup
export const createNewRecurringClass = async (
  tx: Prisma.TransactionClient,
  subscriptionId: number,
) => {
  return await tx.recurringClass.create({
    data: {
      subscriptionId: subscriptionId,
    },
  });
};

function timeStringToDate(timeString: string): Date {
  const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const [, hours, minutes] = timeMatch;
    return new Date(`1970-01-01T${hours.padStart(2, "0")}:${minutes}:00.000Z`);
  }
  throw new Error(`Invalid time format: "${timeString}". Use "HH:MM" format.`);
}

function getNextWeekdayOccurrence(
  startDate: Date,
  targetWeekday: number,
  time: string,
): Date {
  const [hours, minutes] = time.split(":").map(Number);

  const result = new Date(startDate);

  const currentWeekday = result.getUTCDay();
  const daysUntilTarget = (targetWeekday - currentWeekday + 7) % 7;
  result.setUTCDate(result.getUTCDate() + daysUntilTarget);

  result.setUTCHours(hours - JAPAN_TIME_DIFF, minutes, 0, 0);

  return result;
}

async function conflictingRegularClassExists(
  tx: Prisma.TransactionClient,
  instructorId: number,
  weekday: number,
  startTime: string,
  startDate: Date,
  excludeId = -1,
): Promise<boolean> {
  const hasConflict = await loadRecurringClassConflictChecker(tx, instructorId);
  return hasConflict(weekday, startTime, startDate, excludeId);
}

function createWeeklyDates(start: Date, end: Date): Date[] {
  const dates = [];
  const current = new Date(start);

  while (current < end) {
    dates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 7); // Weekly recurrence
  }

  return dates;
}

function getRecurringClassTerminationCutoff(endDate: Date): Date {
  return nHoursBefore(
    JAPAN_TIME_DIFF,
    new Date(
      Date.UTC(
        endDate.getUTCFullYear(),
        endDate.getUTCMonth(),
        endDate.getUTCDate(),
      ),
    ),
  );
}

export async function terminateRecurringClass(
  tx: Prisma.TransactionClient,
  recurringClassId: number,
  endDate: Date,
  deletionCutoff = getRecurringClassTerminationCutoff(endDate),
): Promise<RecurringClass> {
  const existing = await tx.recurringClass.findUniqueOrThrow({
    where: { id: recurringClassId },
  });
  const terminatedRecurringClass = await tx.recurringClass.update({
    where: { id: recurringClassId },
    data: {
      endAt:
        existing.endAt && existing.endAt < endDate ? existing.endAt : endDate,
    },
  });

  // Delete future classes
  await tx.class.deleteMany({
    where: {
      recurringClassId,
      dateTime: { gte: deletionCutoff },
    },
  });
  // ClassAttendance records will be cascade deleted automatically

  return terminatedRecurringClass;
}

async function findAvailableInstructorSlot(
  tx: Prisma.TransactionClient,
  instructorId: number,
  weekday: number,
  startTime: string,
  effectiveDate: Date,
) {
  return await tx.instructorSlot.findFirst({
    where: {
      weekday,
      startTime: timeStringToDate(startTime),
      schedule: {
        instructorId,
        effectiveFrom: { lte: effectiveDate },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: effectiveDate } }],
      },
    },
    include: {
      schedule: true,
    },
  });
}

function getClassGenerationEnd(
  firstOccurrence: Date,
  existingDates: Date[] = [],
): Date {
  const end = new Date(firstOccurrence);
  end.setMonth(end.getMonth() + 3);
  for (const date of existingDates) {
    const throughExistingWeek = nDaysLater(7, date);
    if (throughExistingWeek > end) end.setTime(throughExistingWeek.getTime());
  }
  return end;
}

async function createRecurringClass(
  tx: Prisma.TransactionClient,
  params: CreateRegularClassParams,
  generationEnd?: Date,
  previousRecurringClassId?: number,
): Promise<{ recurringClass: RecurringClass; createdClasses: Class[] }> {
  const {
    instructorId,
    weekday,
    startTime,
    customerId,
    childrenIds,
    subscriptionId,
    startDate,
    timezone,
  } = params;

  if (timezone !== "Asia/Tokyo") {
    throw new Error("Only Asia/Tokyo timezone is supported");
  }

  const subscription = await tx.subscription.findUnique({
    where: { id: subscriptionId },
  });
  if (!subscription || subscription.customerId !== customerId)
    throw new Error("Regular class not found");
  if (subscription.endAt)
    throw new Error("Subscription no longer accepts regular classes");

  const startDateObj = new Date(startDate);

  // Check if instructor is available
  const availableSlot = await findAvailableInstructorSlot(
    tx,
    instructorId,
    weekday,
    startTime,
    startDateObj,
  );

  if (!availableSlot) {
    throw new Error("Instructor is not available at the requested time slot");
  }

  // Calculate first occurrence for startAt
  const firstOccurrence = getNextWeekdayOccurrence(
    startDateObj,
    weekday,
    startTime,
  );
  if (firstOccurrence < subscription.startAt)
    throw new Error("Regular class cannot start before subscription");

  // Check for conflicting regular classes
  const hasConflict = await conflictingRegularClassExists(
    tx,
    instructorId,
    weekday,
    startTime,
    firstOccurrence,
  );

  if (hasConflict) {
    throw new Error("Regular class already exists at this time slot");
  }

  const recurringClass = await tx.recurringClass.create({
    data: {
      instructorId,
      subscriptionId,
      startAt: firstOccurrence,
      endAt: null,
      previousRecurringClassId,
    },
  });

  await tx.recurringClassAttendance.createMany({
    data: childrenIds.map((childId) => ({
      recurringClassId: recurringClass.id,
      childrenId: childId,
    })),
  });

  const endDate = generationEnd ?? getClassGenerationEnd(firstOccurrence);

  const createdClasses = await createClassesUntil(tx, recurringClass, endDate, {
    customerId,
    childrenIds,
  });

  return { recurringClass, createdClasses };
}

async function createClassesUntil(
  tx: Prisma.TransactionClient,
  recurringClass: RecurringClass,
  endDate: Date,
  classParams: { customerId: number; childrenIds: number[] },
): Promise<Class[]> {
  // Generate all dates for the period
  if (!recurringClass.startAt) {
    throw new Error("RecurringClass startAt cannot be null");
  }
  // Create all classes initially with "booked" status
  if (!recurringClass.instructorId) {
    throw new Error("RecurringClass instructorId cannot be null");
  }

  const planned = await planClassDates(
    tx,
    recurringClass.instructorId,
    recurringClass.startAt,
    endDate,
  );
  if (planned.length === 0) return [];
  const createdClasses = await tx.class.createManyAndReturn({
    data: planned.map((slot, index) => ({
      instructorId: recurringClass.instructorId!,
      customerId: classParams.customerId,
      recurringClassId: recurringClass.id,
      subscriptionId: recurringClass.subscriptionId,
      dateTime: slot.dateTime,
      status: slot.status,
      canceledAt: slot.status === "booked" ? null : new Date(),
      rebookableUntil: nDaysLater(180, slot.dateTime),
      updatedAt: new Date(),
      classCode: `${recurringClass.id}-${index}`,
    })),
  });
  await tx.classAttendance.createMany({
    data: createdClasses.flatMap((c) =>
      classParams.childrenIds.map((childrenId) => ({
        classId: c.id,
        childrenId,
      })),
    ),
  });

  return createdClasses;
}

async function filterNoClassDates(
  tx: Prisma.TransactionClient,
  dates: Date[],
): Promise<Date[]> {
  if (dates.length === 0) {
    return dates;
  }

  const noClassDates = await getSchedulesByEventNameAndDate(
    NO_CLASS_EVENT_NAME,
    new Date(dates[0].toISOString().slice(0, 10)),
    new Date(dates[dates.length - 1].getTime() + 24 * 60 * 60 * 1000),
    tx,
  );
  const noClassDateKeys = new Set(
    noClassDates.map((schedule) => schedule.date.toISOString().slice(0, 10)),
  );

  return dates.filter(
    (date) => !noClassDateKeys.has(date.toISOString().slice(0, 10)),
  );
}

async function planClassDates(
  tx: Prisma.TransactionClient,
  instructorId: number,
  start: Date,
  end: Date,
  removedIds: number[] = [],
) {
  const dates = await filterNoClassDates(tx, createWeeklyDates(start, end));
  if (!dates.length) return [];
  const [conflicts, absences, closures] = await Promise.all([
    tx.class.findMany({
      where: {
        instructorId,
        dateTime: { in: dates },
        status: { in: ["booked", "rebooked", "completed"] },
        id: { notIn: removedIds },
      },
    }),
    tx.instructorAbsence.findMany({
      where: { instructorId, absentAt: { in: dates } },
    }),
    getSchedulesByEventNameAndDate(
      REBOOKABLE_NO_CLASS_EVENT_NAME,
      new Date(dates[0].toISOString().slice(0, 10)),
      new Date(dates[dates.length - 1].getTime() + 86400000),
      tx,
    ),
  ]);
  return dates.map((dateTime) => ({
    dateTime,
    status:
      conflicts.some((c) => c.dateTime?.getTime() === dateTime.getTime()) ||
      absences.some((a) => a.absentAt.getTime() === dateTime.getTime())
        ? ("canceledByInstructor" as const)
        : closures.some(
              (c) =>
                c.date.toISOString().slice(0, 10) ===
                dateTime.toISOString().slice(0, 10),
            )
          ? ("canceledByAdmin" as const)
          : ("booked" as const),
  }));
}

export const getRegularClassById = async (recurringClassId: number) => {
  try {
    const recurringClass = await prisma.recurringClass.findUnique({
      where: { id: recurringClassId },
      include: {
        instructor: { omit: { password: true } },
        subscription: true,
        recurringClassAttendance: {
          include: {
            children: true,
          },
        },
        classes: {
          orderBy: { dateTime: "asc" },
          take: 1, // Just get the first class to derive schedule info
        },
      },
    });

    if (!recurringClass) {
      throw new Error("Recurring class not found");
    }

    return recurringClass;
  } catch (error) {
    console.error("Error getting recurring class by ID:", error);
    throw error;
  }
};

export const getRegularClassesBySubscriptionId = async (
  subscriptionId: number,
  status?: "active" | "history",
) => {
  const whereCondition = {
    subscriptionId,
    instructorId: { not: null },
    startAt: { not: null },
    ...(status === "active" && { endAt: null }),
    ...(status === "history" && { endAt: { not: null } }),
  };

  const recurringClasses = await prisma.recurringClass.findMany({
    where: whereCondition,
    include: {
      instructor: { omit: { password: true } },
      recurringClassAttendance: { include: { children: true } },
    },
    orderBy: [{ startAt: "asc" }, { endAt: "asc" }],
  });

  return recurringClasses.map((recurringClass) => {
    const {
      id,
      startAt,
      instructorId,
      instructor,
      recurringClassAttendance,
      endAt,
    } = recurringClass;

    const childrenIds = recurringClassAttendance.map(
      (attendance) => attendance.childrenId,
    );

    const displayEndAt = endAt && new Date(endAt);
    displayEndAt?.setDate(displayEndAt.getDate() - 1);

    return {
      id,
      dateTime: startAt,
      instructorId,
      instructor,
      childrenIds,
      recurringClassAttendance,
      endAt: displayEndAt ? displayEndAt : null,
    };
  });
};

export const getRecurringClassesHistoryCountBySubscriptionId = async (
  subscriptionId: number,
) => {
  return prisma.recurringClass.count({
    where: {
      subscriptionId,
      instructorId: { not: null },
      startAt: { not: null },
      endAt: { not: null },
    },
  });
};

async function prepareRegularClassChange(
  tx: Prisma.TransactionClient,
  params: UpdateRegularClassParams,
) {
  const {
    recurringClassId,
    instructorId,
    weekday,
    startTime,
    startDate,
    timezone,
    customerId,
    childrenIds,
  } = params;
  if (timezone !== "Asia/Tokyo")
    throw new Error("Only Asia/Tokyo timezone is supported");
  const existing = await tx.recurringClass.findUnique({
    where: { id: recurringClassId },
    include: { subscription: true },
  });
  if (
    !existing ||
    !existing.subscription ||
    existing.subscription.customerId !== customerId
  )
    throw new Error("Regular class not found");
  if (existing.subscription.endAt)
    throw new Error("Subscription no longer accepts regular classes");
  if (existing.endAt) throw new Error("Regular class not found");
  const children = await tx.child.findMany({
    where: { id: { in: childrenIds }, customerId },
    orderBy: { id: "asc" },
  });
  if (children.length !== new Set(childrenIds).size)
    throw new Error("Regular class not found");
  const startDateObj = new Date(startDate);
  if (
    !Number.isFinite(startDateObj.getTime()) ||
    startDateObj < nDaysLater(7, getJstDateAtUtcMidnight())
  )
    throw new Error("Start date must be at least one week from today");
  const firstOccurrence = getNextWeekdayOccurrence(
    startDateObj,
    weekday,
    startTime,
  );
  if (firstOccurrence < existing.subscription.startAt)
    throw new Error("Regular class cannot start before subscription");
  if (existing.startAt) {
    const existingJstDate = new Date(
      existing.startAt.getTime() + JAPAN_TIME_DIFF * 60 * 60 * 1000,
    );
    if (firstOccurrence < getRecurringClassTerminationCutoff(existingJstDate))
      throw new Error("Regular class change cannot precede its start date");
  }
  if (
    !(await findAvailableInstructorSlot(
      tx,
      instructorId,
      weekday,
      startTime,
      startDateObj,
    ))
  )
    throw new Error("Instructor is not available at the requested time slot");
  if (
    await conflictingRegularClassExists(
      tx,
      instructorId,
      weekday,
      startTime,
      firstOccurrence,
      recurringClassId,
    )
  )
    throw new Error("Regular class already exists at this time slot");
  const { rows, events } = await loadCalendarClasses(tx, customerId);
  const cutoff = getRecurringClassTerminationCutoff(
    getJstDateAtUtcMidnight(firstOccurrence),
  );
  const removedClasses = rows.filter(
    (c) => c.recurringClassId === recurringClassId && c.dateTime! >= cutoff,
  );
  const removedIds = removedClasses.map((c) => c.id);
  const end = getClassGenerationEnd(
    firstOccurrence,
    removedClasses.map((c) => c.dateTime!),
  );
  const planned = await planClassDates(
    tx,
    instructorId,
    firstOccurrence,
    end,
    removedIds,
  );
  const instructor = await tx.instructor.findUniqueOrThrow({
    where: { id: instructorId },
  });
  const calendar: SchedulePreview = {
    before: events,
    after: [
      ...events.filter((c) => !removedIds.includes(Number(c.id))),
      ...planned.map((c) => ({
        id: `new:${c.dateTime.toISOString()}`,
        dateTime: c.dateTime.toISOString(),
        instructorId,
        childrenIds: children.map((c) => c.id),
        instructorName: instructor.nickname,
        instructorIcon: instructor.icon,
        childrenNames: children.map((c) => c.name),
        regularStartAt: firstOccurrence.toISOString(),
        status: c.status,
      })),
    ],
  };
  const input = {
    recurringClassId,
    instructorId,
    weekday,
    startTime,
    startDate,
    timezone,
    customerId,
    childrenIds: [...childrenIds].sort((a, b) => a - b),
  };
  const previewToken = createHash("sha256")
    .update(JSON.stringify({ input, calendar, endAt: existing.endAt }))
    .digest("hex");
  return {
    existing,
    subscriptionId: existing.subscription.id,
    firstOccurrence,
    generationEnd: end,
    deletionCutoff: cutoff,
    calendar,
    previewToken,
  };
}

export const previewRegularClassChange = async (
  params: UpdateRegularClassParams,
) =>
  prisma.$transaction(
    async (tx) => {
      const { calendar, previewToken, firstOccurrence } =
        await prepareRegularClassChange(tx, params);
      return {
        calendar,
        previewToken,
        effectiveAt: firstOccurrence.toISOString(),
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

export const updateRegularClass = async (params: UpdateRegularClassParams) =>
  prisma.$transaction(
    async (tx) => {
      const prepared = await prepareRegularClassChange(tx, params);
      if (params.previewToken && params.previewToken !== prepared.previewToken)
        throw new Error("Schedule changed. Review the preview again.");
      const oldRecurringClass = await terminateRecurringClass(
        tx,
        params.recurringClassId,
        prepared.firstOccurrence,
        prepared.deletionCutoff,
      );
      const { recurringClass: newRecurringClass, createdClasses } =
        await createRecurringClass(
          tx,
          { ...params, subscriptionId: prepared.subscriptionId },
          prepared.generationEnd,
          params.recurringClassId,
        );
      return { oldRecurringClass, newRecurringClass, createdClasses };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

// Fetch recurring classes After endAt or endAt is null
export const getValidRecurringClasses = async (
  tx: Prisma.TransactionClient,
  date: Date,
) => {
  try {
    const recurringClasses = await tx.recurringClass.findMany({
      where: { OR: [{ endAt: { gte: date } }, { endAt: null }] },
      include: { subscription: true, recurringClassAttendance: true },
    });

    return recurringClasses;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch recurring classes.");
  }
};

// Fetch recurring classes After endAt or endAt is null by instructor id
export const getValidRecurringClassesByInstructorId = async (
  instructorId: number,
  date: Date,
) => {
  try {
    const recurringClasses = await prisma.recurringClass.findMany({
      where: { instructorId, OR: [{ endAt: { gte: date } }, { endAt: null }] },
    });

    return recurringClasses;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch recurring classes.");
  }
};

// Get subscription by recurring class ID
export const getSubscriptionByRecurringClassId = async (
  recurringClassId: number,
) => {
  try {
    const recurringClass = await prisma.recurringClass.findUnique({
      where: { id: recurringClassId },
      include: {
        subscription: {
          include: {
            customer: true,
            plan: true,
          },
        },
      },
    });
    return recurringClass?.subscription || null;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to get subscription by recurring class ID.");
  }
};
