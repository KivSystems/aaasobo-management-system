import { Request, Response } from "express";
import {
  cancelClassById,
  cancelClasses,
  checkDoubleBooking,
  checkChildConflicts,
  createClassesUsingRecurringClassId,
  deleteClass,
  deleteOldClasses,
  getAllClasses,
  getClassesByCustomerId,
  getClassToRebook,
  getExcludedClasses,
  checkInstructorConflicts,
  rebookClass,
  updateClass,
} from "../services/classesService";
import { isInstructorAbsent } from "../services/instructorAbsenceService";
import { RequestWithId } from "../middlewares/parseId.middleware";
import { prisma } from "../../prisma/prismaClient";
import {
  getValidRecurringClasses,
  getSubscriptionByRecurringClassId,
} from "../services/recurringClassesService";
import {
  calculateFirstDate,
  createDatesBetween,
  days,
  formatYearDateTime,
  getFirstDateInMonths,
  getMonthNumber,
  isSameLocalDate,
  nHoursBefore,
} from "../helper/dateUtils";
import { getInstructorContactById } from "../services/instructorsService";
import { getCustomerContactById } from "../services/customersService";
import { getChildrenNamesByIds } from "../services/childrenService";
import {
  sendAdminSameDayRebookEmail,
  sendInstructorSameDayRebookEmail,
} from "../helper/mail";
import {
  FREE_TRIAL_BOOKING_HOURS,
  REGULAR_REBOOKING_HOURS,
} from "../helper/commonUtils";
import {
  createAttendances,
  deleteAttendancesByClassId,
} from "../services/classAttendancesService";

// GET all classes along with related instructors and customers data
export const getAllClassesController = async (_: Request, res: Response) => {
  try {
    const classes = await getAllClasses();

    const classesData = classes.map((eachClass) => {
      const { id, dateTime, customer, instructor, status, recurringClassId } =
        eachClass;

      return {
        id,
        dateTime,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
        },
        // "Pending" or "declined" free trial classes don't have an instructor, so use fallback values when instructor is missing
        instructor: {
          id: instructor?.id,
          name: instructor?.name,
        },
        status,
        recurringClassId,
      };
    });

    res.json({ classes: classesData });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: "Failed to fetch classes." });
  }
};

// GET classes by customer id along with related instructors and customers data
export const getClassesByCustomerIdController = async (
  req: Request,
  res: Response,
) => {
  const id = Number(req.params.id);

  try {
    const classes = await getClassesByCustomerId(id);

    const classesData = classes.map((eachClass) => {
      const {
        id,
        dateTime,
        customer,
        instructor,
        status,
        classAttendance,
        recurringClassId,
        rebookableUntil,
        updatedAt,
        classCode,
      } = eachClass;

      return {
        id,
        dateTime,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
        },
        // "Pending" or "declined" free trial classes don't have an instructor, so use fallback values when instructor is missing
        instructor: {
          id: instructor?.id,
          name: instructor?.name,
          icon: instructor?.icon,
          classURL: instructor?.classURL,
          nickname: instructor?.nickname,
          meetingId: instructor?.meetingId,
          passcode: instructor?.passcode,
        },
        classAttendance: {
          children: classAttendance.map((classAttendance) => ({
            id: classAttendance.children.id,
            name: classAttendance.children.name,
          })),
        },
        status,
        recurringClassId,
        rebookableUntil,
        updatedAt,
        classCode,
      };
    });

    res.json({ classes: classesData });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: "Failed to fetch classes." });
  }
};

export type NewClassToRebookType = {
  dateTime: string | Date;
  instructorId: number;
  customerId: number;
  status: "rebooked";
  rebookableUntil: string | Date;
  classCode: string;
  updatedAt: Date;
  isFreeTrial: boolean;
  subscriptionId?: number;
  recurringClassId?: number;
};

export const rebookClassController = async (
  req: RequestWithId,
  res: Response,
) => {
  const classId = req.id;

  const { dateTime, instructorId, customerId, childrenIds } = req.body;

  if (!dateTime || !instructorId || !customerId || !childrenIds) {
    return res.status(400).json({
      errorType: "missing parameters",
    });
  }

  try {
    const classToRebook = await getClassToRebook(classId);
    const {
      status,
      recurringClassId,
      rebookableUntil,
      classCode,
      isFreeTrial,
    } = classToRebook;

    if (!status || !rebookableUntil || !classCode) {
      return res.status(400).json({
        errorType: "invalid class data",
      });
    }

    // Rebooking deadline: 72 hours before the class starts for free trial classes, and 3 hours before the class starts for regular classes
    const rebookingDeadline = isFreeTrial
      ? nHoursBefore(FREE_TRIAL_BOOKING_HOURS, new Date(dateTime))
      : nHoursBefore(REGULAR_REBOOKING_HOURS, new Date(dateTime));
    const isPastRebookingDeadline = new Date() > rebookingDeadline;

    if (isPastRebookingDeadline) {
      return res.status(403).json({
        errorType: "past rebooking deadline",
      });
    }

    // For non-freeTrial classes, check subscription validity
    let subscription;
    if (!isFreeTrial) {
      if (!recurringClassId) {
        return res.status(400).json({
          errorType: "invalid class data",
        });
      }

      // Check if subscription exists and whether it's ended
      subscription = await getSubscriptionByRecurringClassId(recurringClassId);

      if (!subscription) {
        return res.status(404).json({
          errorType: "no subscription",
        });
      }

      const hasEnded = subscription.endAt
        ? new Date(subscription.endAt) < new Date()
        : false;

      if (hasEnded) {
        return res.status(400).json({
          errorType: "outdated subscription",
        });
      }
    }

    // Check if the selected instructor is already booked at the selected date and time
    const isInstructorBooked: boolean = await checkInstructorConflicts(
      instructorId,
      dateTime,
    );
    if (isInstructorBooked) {
      return res.status(400).json({
        errorType: "instructor conflict",
      });
    }

    // Check if the selected instructor is unavailable at the selected date and time
    const isInstructorUnavailable: boolean = await isInstructorAbsent(
      instructorId,
      dateTime,
    );
    if (isInstructorUnavailable) {
      return res.status(400).json({
        errorType: "instructor unavailable",
      });
    }

    const newClassToRebook: NewClassToRebookType = {
      dateTime,
      instructorId,
      customerId,
      status: "rebooked",
      rebookableUntil,
      classCode,
      updatedAt: new Date(),
      isFreeTrial: !!isFreeTrial,
    };

    if (!isFreeTrial) {
      newClassToRebook.subscriptionId = subscription!.id;
      newClassToRebook.recurringClassId = recurringClassId!;
    }

    const newClass = await rebookClass(
      { id: classId, status },
      newClassToRebook,
      childrenIds,
    );

    // Check if the rebooked date is today; if so, send notification emails to the admin and instructor
    const isSameDay = isSameLocalDate(dateTime, "Asia/Tokyo");

    if (isSameDay) {
      try {
        const instructor = await getInstructorContactById(
          newClass.instructorId!, // Guaranteed to exist for a newly created rebooked class
        );
        const customer = await getCustomerContactById(newClass.customerId);
        const children = await getChildrenNamesByIds(childrenIds);

        if (!instructor || !customer || !children) {
          console.error(
            "Missing required data for sending same-day rebooking emails",
            {
              instructor,
              customer,
              children,
              classId,
            },
          );
          return;
        }

        await sendAdminSameDayRebookEmail({
          classCode: newClass.classCode,
          dateTime: formatYearDateTime(newClass.dateTime!), // Guaranteed to exist for a newly created rebooked class
          instructorName: instructor.name,
          instructorEmail: instructor.email,
          customerName: customer.name,
          customerEmail: customer.email,
          children,
        });

        await sendInstructorSameDayRebookEmail({
          classCode: newClass.classCode,
          dateTime: formatYearDateTime(newClass.dateTime!, "en-US"), // Guaranteed to exist for a newly created rebooked class
          instructorName: instructor.name,
          instructorEmail: instructor.email,
          children,
        });
      } catch (emailError) {
        console.error("Failed to send same-day rebooking notification email", {
          emailError,
          context: {
            emailError,
            classId,
            classDate: dateTime,
            instructorId,
            time: new Date().toISOString(),
          },
        });
      }
    }

    res.sendStatus(201);
  } catch (error) {
    console.error("Error rebooking a class", {
      error,
      context: {
        customerId,
        classId,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

function getEndOfThisMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(-1);
  d.setUTCHours(23, 59, 59);
  return d;
}

// DELETE a class
export const deleteClassController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const classId = parseInt(id, 10);

  try {
    if (isNaN(classId)) {
      return res.status(400).json({ error: "Invalid class ID." });
    }

    const deletedClass = await deleteClass(classId);

    return res.status(200).json(deletedClass);
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      error: "Failed to delete class. Please try again later.",
    });
  }
};

// Cancel a class
export const cancelClassController = async (req: Request, res: Response) => {
  const classId = parseInt(req.params.id);

  if (!classId || isNaN(classId)) res.sendStatus(400);

  try {
    await cancelClassById(classId);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error canceling a class", {
      error,
      context: {
        classId,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

export const createClassesForMonthController = async (
  req: Request,
  res: Response,
) => {
  const { year, month } = req.body;
  if (!year || !month) {
    return res.status(400).json({ error: "Invalid year or month." });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // First date of a giving month.
      const monthNum = getMonthNumber(month);
      if (monthNum === -1) throw new Error("Invalid month");
      const firstDateOfMonth = new Date(Date.UTC(year, monthNum, 1));

      // Get valid recurring classes.
      const recurringClasses = await getValidRecurringClasses(
        tx,
        firstDateOfMonth,
      );

      // Get excluded classes.
      const recurringClassIds = recurringClasses.map(
        (recurringClass) => recurringClass.id,
      );
      const excludedClasses = await getExcludedClasses(
        tx,
        recurringClassIds,
        firstDateOfMonth,
      );

      // TODO: Get the instructors' unavailability and exclude it.
      // TODO: Get the holiday and exclude it.

      // Define until when schedule should be created.
      const until = getFirstDateInMonths(firstDateOfMonth, 1);
      until.setUTCDate(until.getUTCDate() - 1);

      // Repeat the number of recurring classes.
      await Promise.all(
        recurringClasses.map(async (recurringClass) => {
          const {
            id,
            instructorId,
            startAt,
            endAt,
            subscriptionId,
            subscription,
            recurringClassAttendance,
          } = recurringClass;

          // If the applicable property is null, skip it.
          if (
            instructorId === null ||
            startAt === null ||
            subscriptionId == null ||
            subscription === null
          ) {
            return;
          }

          // If startAt is earlier than firstDateOfMonth, skip it.
          if (startAt && firstDateOfMonth < new Date(startAt)) {
            return;
          }

          // Extract time from startAt
          const hours = startAt.getHours().toString().padStart(2, "0");
          const minutes = startAt.getMinutes().toString().padStart(2, "0");
          const time = `${hours}:${minutes}`;

          // Get the first date of the class of the month
          const firstDate = calculateFirstDate(
            firstDateOfMonth,
            days[startAt.getDay()],
            time,
          );

          // Create the range of dates.
          const dateTimes = createDatesBetween(
            firstDate,
            endAt && endAt < until ? endAt : until,
          );

          // if you find the same dateTime and instructor id as in the excludedClass, skip it.
          const isExistingClass = excludedClasses.some((excludedClass) => {
            const excludedClassDateTimesStr = new Date(
              excludedClass.dateTime!, // All "excludedClasses" are selected by dateTime, so dateTime is guaranteed to exist.
            ).toISOString();
            const dateTimesStr = dateTimes.map((date) =>
              new Date(date).toISOString(),
            );
            return (
              dateTimesStr.includes(excludedClassDateTimesStr) &&
              excludedClass.instructorId === instructorId
            );
          });
          if (isExistingClass) {
            return;
          }

          const childrenIds = recurringClassAttendance.map(
            (attendee) => attendee.childrenId,
          );

          // Create the classes and its attendance based on the recurring id.
          await createClassesUsingRecurringClassId(
            tx,
            id,
            instructorId,
            subscription.customerId,
            subscriptionId,
            childrenIds,
            dateTimes,
          );
        }),
      );

      return recurringClasses;
    });

    res.status(201).json({ result });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: "Failed to add class." });
  }
};

// Check if there is a class that is already booked at the same dateTime as the newly booked class
export const checkDoubleBookingController = async (
  req: Request,
  res: Response,
) => {
  const { customerId, dateTime } = req.body;

  if (!customerId || !dateTime) {
    return res.sendStatus(400);
  }

  try {
    const isDoubleBooked = await checkDoubleBooking(customerId, dateTime);

    res.status(200).json(isDoubleBooked);
  } catch (error) {
    console.error("Error checking double booking", {
      error,
      context: {
        customerId,
        dateTime,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

export const checkChildConflictsController = async (
  req: Request,
  res: Response,
) => {
  const { dateTime, selectedChildrenIds } = req.body;

  if (!dateTime || !selectedChildrenIds) {
    return res.sendStatus(400);
  }

  try {
    const conflictingChildren = await checkChildConflicts(
      dateTime,
      selectedChildrenIds,
    );

    res.status(200).json(conflictingChildren);
  } catch (error) {
    console.error("Error checking children conflicts", {
      error,
      context: {
        childrenIds: selectedChildrenIds,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

export const cancelClassesController = async (req: Request, res: Response) => {
  const { classIds } = req.body;

  if (!Array.isArray(classIds) || classIds.length === 0) {
    return res.sendStatus(400);
  }

  try {
    await cancelClasses(classIds);

    res.sendStatus(200);
  } catch (error) {
    console.error("Error canceling classes", {
      error,
      context: {
        classIds,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

export const updateAttendanceController = async (
  req: RequestWithId,
  res: Response,
) => {
  const classId = req.id;
  const { childrenIds }: { childrenIds: number[] } = req.body;

  if (!Array.isArray(childrenIds)) {
    return res.sendStatus(400);
  }

  try {
    if (childrenIds.length === 0) {
      await deleteAttendancesByClassId(classId);
    } else {
      await prisma.$transaction(async (tx) => {
        await deleteAttendancesByClassId(classId, tx);
        await createAttendances(classId, childrenIds, tx);
      });
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Error updating class attendance", {
      error,
      context: {
        classId,
        childrenIds,
        time: new Date().toISOString(),
      },
    });
    return res.sendStatus(500);
  }
};

export const updateClassStatusController = async (
  req: RequestWithId,
  res: Response,
) => {
  const classId = req.id;
  const { status } = req.body;

  if (!status) {
    return res.sendStatus(400);
  }

  try {
    const classToUpdate = await getClassToRebook(classId);
    const classDateTime = classToUpdate.dateTime;

    if (!classToUpdate || !classDateTime) {
      return res.sendStatus(404);
    }

    await updateClass(classId, status, classDateTime);

    return res.sendStatus(200);
  } catch (error) {
    console.error("Error updating class status", {
      error,
      context: {
        classId,
        time: new Date().toISOString(),
      },
    });
    return res.sendStatus(500);
  }
};

// Delete classes older than 1 year (13 months)
export const deleteOldClassesController = async (_: Request, res: Response) => {
  try {
    const deletedClasses = await deleteOldClasses();
    res.status(200).json({ deletedClasses });
  } catch (error) {
    console.error("Error deleting old classes", {
      error,
      context: {
        time: new Date().toISOString(),
      },
    });
  }
};
