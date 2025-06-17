"use server";

import {
  checkChildConflicts,
  checkDoubleBooking,
  rebookClass,
} from "../helper/api/classesApi";

export const checkChildConflictsAction = async (
  dateTimeToRebook: string,
  selectedChildrenIds: number[],
) => {
  const conflictingChildren = await checkChildConflicts(
    dateTimeToRebook,
    selectedChildrenIds,
  );

  return conflictingChildren;
};

export const checkDoubleBookingAction = async (
  customerId: number,
  dateTimeToRebook: string,
) => {
  const doubleBookingResult = await checkDoubleBooking(
    customerId,
    dateTimeToRebook,
  );

  return doubleBookingResult;
};

export const rebookClassAction = async (
  classId: number,
  classData: {
    dateTime: string;
    instructorId: number;
    customerId: number;
    childrenIds: number[];
  },
) => {
  const rebookingResult = await rebookClass(classId, classData);

  return rebookingResult;
};
