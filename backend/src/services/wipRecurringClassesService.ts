import { prisma } from "../../prisma/prismaClient";
import { JAPAN_TIME_DIFF, nHoursLater } from "../helper/dateUtils";
import { Prisma, RecurringClass, Class } from "@prisma/client";

export interface CreateRegularClassParams {
  instructorId: number;
  weekday: number;
  startTime: string;
  customerId: number;
  childrenIds: number[];
  subscriptionId: number;
  startDate: string;
  timezone: string;
}

export interface UpdateRegularClassParams extends CreateRegularClassParams {
  recurringClassId: number;
}

export const createRegularClass = async (params: CreateRegularClassParams) => {
  return await prisma.$transaction(async (tx) => {
    return await createRecurringClass(tx, params);
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

  if (daysUntilTarget === 0 && result.getUTCHours() >= hours) {
    result.setUTCDate(result.getUTCDate() + 7);
  } else {
    result.setUTCDate(result.getUTCDate() + daysUntilTarget);
  }

  result.setUTCHours(hours - JAPAN_TIME_DIFF, minutes, 0, 0);

  return result;
}

async function conflictingRegularClassExists(
  tx: Prisma.TransactionClient,
  instructorId: number,
  weekday: number,
  startTime: string,
  startDateObj: Date,
  excludeRecurringClassId?: number,
): Promise<boolean> {
  const whereClause: Prisma.RecurringClassWhereInput = {
    instructorId,
    OR: [{ endAt: { gte: startDateObj } }, { endAt: null }],
    ...(excludeRecurringClassId && { id: { not: excludeRecurringClassId } }),
  };

  const conflictingRegularClass = await tx.recurringClass.findFirst({
    where: whereClause,
  });

  if (conflictingRegularClass) {
    const existingWeekday = conflictingRegularClass.startAt?.getUTCDay();
    const existingHours = conflictingRegularClass.startAt?.getUTCHours();
    const existingMinutes = conflictingRegularClass.startAt?.getUTCMinutes();

    const [requestedHours, requestedMinutes] = startTime.split(":").map(Number);
    const utcHours = (requestedHours - JAPAN_TIME_DIFF + 24) % 24;

    if (
      existingWeekday === weekday &&
      existingHours === utcHours &&
      existingMinutes === requestedMinutes
    ) {
      return true;
    }
  }

  return false;
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

// Terminate existing RecurringClass functions
export async function terminateRecurringClass(
  tx: Prisma.TransactionClient,
  recurringClassId: number,
  endDate: Date,
): Promise<RecurringClass> {
  // Update RecurringClass endAt
  const terminatedRecurringClass = await tx.recurringClass.update({
    where: { id: recurringClassId },
    data: { endAt: endDate },
  });

  // Find future classes to delete
  const classesToDelete = await findFutureClassesToDelete(
    tx,
    recurringClassId,
    endDate,
  );

  // Delete classes (ClassAttendance will be cascade deleted)
  if (classesToDelete.length > 0) {
    await deleteClasses(tx, classesToDelete);
  }

  return terminatedRecurringClass;
}

export async function findFutureClassesToDelete(
  tx: Prisma.TransactionClient,
  recurringClassId: number,
  fromDate: Date,
): Promise<number[]> {
  const classes = await tx.class.findMany({
    where: {
      recurringClassId,
      dateTime: { gte: fromDate },
    },
    select: { id: true },
  });

  return classes.map((c: { id: number }) => c.id);
}

export async function deleteClasses(
  tx: Prisma.TransactionClient,
  classIds: number[],
): Promise<void> {
  await tx.class.deleteMany({
    where: { id: { in: classIds } },
  });
  // ClassAttendance records will be cascade deleted automatically
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
        effectiveTo: null,
      },
    },
    include: {
      schedule: true,
    },
  });
}

// Create new RecurringClass functions
export async function createRecurringClass(
  tx: Prisma.TransactionClient,
  params: CreateRegularClassParams,
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

  // Check for conflicting regular classes
  const hasConflict = await conflictingRegularClassExists(
    tx,
    instructorId,
    weekday,
    startTime,
    startDateObj,
  );

  if (hasConflict) {
    throw new Error("Regular class already exists at this time slot");
  }

  // Calculate first occurrence for startAt
  const firstOccurrence = getNextWeekdayOccurrence(
    startDateObj,
    weekday,
    startTime,
  );

  const recurringClass = await tx.recurringClass.create({
    data: {
      instructorId,
      subscriptionId,
      startAt: firstOccurrence,
      endAt: null,
    },
  });

  await createRecurringClassAttendance(tx, recurringClass.id, childrenIds);

  // Generate dates for 3 months and create classes
  const endDate = new Date(firstOccurrence);
  endDate.setMonth(endDate.getMonth() + 3);

  const createdClasses = await createClassesUntil(tx, recurringClass, endDate, {
    customerId,
    childrenIds,
  });

  return { recurringClass, createdClasses };
}

async function createRecurringClassAttendance(
  tx: Prisma.TransactionClient,
  recurringClassId: number,
  childrenIds: number[],
): Promise<void> {
  await tx.recurringClassAttendance.createMany({
    data: childrenIds.map((childId) => ({
      recurringClassId,
      childrenId: childId,
    })),
  });
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
  const dates = createWeeklyDates(recurringClass.startAt, endDate);

  // Create all classes initially with "booked" status
  if (!recurringClass.instructorId) {
    throw new Error("RecurringClass instructorId cannot be null");
  }
  const createdClasses = await tx.class.createManyAndReturn({
    data: dates.map((dateTime, index) => ({
      instructorId: recurringClass.instructorId!,
      customerId: classParams.customerId,
      recurringClassId: recurringClass.id,
      subscriptionId: recurringClass.subscriptionId,
      dateTime,
      status: "booked" as const,
      rebookableUntil: nHoursLater(180 * 24, dateTime), // 180 days
      updatedAt: new Date(),
      classCode: `${recurringClass.id}-${index}`,
    })),
  });

  // Create ClassAttendance for all created classes
  await tx.classAttendance.createMany({
    data: createdClasses
      .map((createdClass: Class) => {
        return classParams.childrenIds.map((childrenId) => ({
          classId: createdClass.id,
          childrenId,
        }));
      })
      .flat(),
  });

  await cancelConflictingClasses(
    tx,
    recurringClass.instructorId!,
    createdClasses,
  );

  return createdClasses;
}

// Cancel conflicting classes functions
async function cancelConflictingClasses(
  tx: Prisma.TransactionClient,
  instructorId: number,
  createdClasses: Class[],
): Promise<void> {
  // Filter out classes with null dateTime and map to non-null dates
  const validClasses = createdClasses.filter((c) => c.dateTime !== null);
  const classDates = validClasses.map((c) => c.dateTime!);

  if (classDates.length === 0) {
    return; // No valid classes to process
  }

  // Find conflicting classes (existing classes at same times)
  const conflictingClassIds = await findConflictingClasses(
    tx,
    instructorId,
    classDates,
  );

  // Find instructor absences
  const absenceClassIds = await findClassesDuringAbsences(
    tx,
    instructorId,
    classDates,
    validClasses,
  );

  // Combine all classes to cancel
  const combinedIds = conflictingClassIds.concat(absenceClassIds);
  const classIdsToCancel = Array.from(new Set(combinedIds));

  if (classIdsToCancel.length > 0) {
    await cancelClasses(tx, classIdsToCancel);
  }
}

export async function findConflictingClasses(
  tx: Prisma.TransactionClient,
  instructorId: number,
  dates: Date[],
): Promise<number[]> {
  // Find existing classes that conflict with the new class times
  const existingClasses = await tx.class.findMany({
    where: {
      instructorId,
      dateTime: { in: dates },
      status: { not: "canceledByInstructor" }, // Don't count already canceled classes
    },
    select: { id: true, dateTime: true },
  });

  // Return the IDs from our new classes that conflict with existing ones
  return existingClasses.map((c: { id: number }) => c.id);
}

export async function findClassesDuringAbsences(
  tx: Prisma.TransactionClient,
  instructorId: number,
  dates: Date[],
  createdClasses: Class[],
): Promise<number[]> {
  // Find instructor absences that overlap with class dates
  const absences = await tx.instructorAbsence.findMany({
    where: {
      instructorId,
      absentAt: { in: dates },
    },
    select: { absentAt: true },
  });

  const absenceDates = absences.map((a: { absentAt: Date }) =>
    a.absentAt.getTime(),
  );

  // Find our created classes that fall on absence dates
  return createdClasses
    .filter((c) => c.dateTime && absenceDates.includes(c.dateTime.getTime()))
    .map((c) => c.id);
}

export async function cancelClasses(
  tx: Prisma.TransactionClient,
  classIds: number[],
): Promise<void> {
  await tx.class.updateMany({
    where: { id: { in: classIds } },
    data: { status: "canceledByInstructor" },
  });
}

export const getRegularClassesBySubscriptionId = async (
  subscriptionId: number,
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const recurringClasses = await prisma.recurringClass.findMany({
    where: {
      subscriptionId,
      OR: [{ endAt: { gte: today } }, { endAt: null }],
    },
    include: {
      instructor: true,
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

export const updateRegularClass = async (params: UpdateRegularClassParams) => {
  const {
    recurringClassId,
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

  return await prisma.$transaction(async (tx) => {
    // Check if the existing recurring class exists
    const existingRecurringClass = await tx.recurringClass.findFirst({
      where: { id: recurringClassId },
    });

    if (!existingRecurringClass) {
      throw new Error("Regular class not found");
    }

    const startDateObj = new Date(startDate);

    // Calculate the exact start time for the new recurring class
    const firstOccurrence = getNextWeekdayOccurrence(
      startDateObj,
      weekday,
      startTime,
    );

    // Step 1: Terminate the existing recurring class at the exact start time
    const terminatedRecurringClass = await terminateRecurringClass(
      tx,
      recurringClassId,
      firstOccurrence,
    );

    // Step 2: Create the new recurring class using the shared function
    const createParams = {
      instructorId,
      weekday,
      startTime,
      customerId,
      childrenIds,
      subscriptionId,
      startDate,
      timezone,
    };

    const { recurringClass: newRecurringClass, createdClasses } =
      await createRecurringClass(tx, createParams);

    return {
      oldRecurringClass: terminatedRecurringClass,
      newRecurringClass,
      createdClasses,
    };
  });
};
