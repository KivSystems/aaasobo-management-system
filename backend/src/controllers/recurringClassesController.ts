import { Request, Response } from "express";
import {
  addRecurringClass,
  deleteRecurringClass,
  getRecurringClassByRecurringClassId,
  getRecurringClassesBySubscriptionId,
  getValidRecurringClasses,
  getValidRecurringClassesByInstructorId,
  terminateRecurringClass,
} from "../services/recurringClassesService";
import { RequestWithId } from "../middlewares/parseId.middleware";
import {
  getFirstDateInMonths,
  createDatesBetween,
  calculateFirstDate,
  formatTime,
  getDayNumber,
  convertDayTimeToUTC,
} from "../helper/dateUtils";
import { prisma } from "../../prisma/prismaClient";
import { getValidInstructorUnavailabilities } from "../services/instructorsUnavailabilitiesService";
import {
  createCanceledClasses,
  getValidClassesByInstructorId,
} from "../services/classesService";

// POST a recurring class
export const addRecurringClassController = async (
  req: Request,
  res: Response,
) => {
  const {
    instructorId,
    customerId,
    childrenIds,
    subscriptionId,
    startAt,
    endAt,
  } = req.body;
  if (
    !instructorId ||
    !customerId ||
    !childrenIds ||
    !subscriptionId ||
    !startAt ||
    !endAt
  ) {
    return res.status(400).json({ message: "Values are not found" });
  }

  // TODO: Implement when you add a new recurring class

  try {
    // const recurringClass = await addRecurringClass(
    //   instructorId,
    //   customerId,
    //   childrenIds,
    //   subscriptionId,
    //   startAt,
    //   dateTime,
    // );

    res.status(200).json({
      message: "Recurring class is created successfully",
      // recurringClass,
    });
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};

// GET recurring classes by subscription id.
export const getRecurringClassesBySubscriptionIdController = async (
  req: Request,
  res: Response,
) => {
  const subscriptionId = parseInt(req.query.subscriptionId as string);
  if (isNaN(subscriptionId)) {
    res.status(400).json({ error: "Invalid subscription ID" });
    return;
  }

  try {
    // Get the local date and the begging of its time.
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const today = date.toISOString().split("T")[0];

    const data = await getRecurringClassesBySubscriptionId(
      subscriptionId,
      new Date(today + "T00:00:00Z"),
    );

    const recurringClasses = data.map((recurringClass) => {
      const {
        id,
        startAt,
        instructorId,
        instructor,
        recurringClassAttendance,
        endAt,
      } = recurringClass;

      const childrenIds = recurringClassAttendance.map(
        (children) => children.childrenId,
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

    res.json({ recurringClasses });
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};

// Update recurring classes
export const updateRecurringClassesController = async (
  req: RequestWithId,
  res: Response,
) => {
  const {
    subscriptionId,
    day,
    time,
    instructorId,
    customerId,
    childrenIds,
    classStartDate,
  } = req.body;
  if (
    !subscriptionId ||
    !day ||
    !time ||
    !instructorId ||
    !customerId ||
    !childrenIds ||
    !classStartDate
  ) {
    return res.status(400).json({ message: "Invalid parameters provided." });
  }

  // Convert the local class start date to UTC time.
  const localClassStartDateTime = classStartDate + "T00:00:00"; // In the new Date object, the time will change based on the local date.
  const utcClassStartDate =
    new Date(localClassStartDateTime).toISOString().split("T")[0] +
    "T00:00:00.000Z"; // In the new Date object, the time will remain unchanged at 00:00.
  const utcToday = new Date();

  // Compare the classStart date and today's date in UTC time.
  // If classStartDate is equal to or shorter than today, it shouldn't be executed.
  if (new Date(localClassStartDateTime) <= new Date(utcToday)) {
    return res.status(400).json({ message: "Invalid Start From Date" });
  }

  try {
    const updatedRecurringClasses = await prisma.$transaction(async (tx) => {
      // Convert the local day and time from the request body to UTC time.
      const { utcDay, utcTime } = convertDayTimeToUTC(day, time);

      console.log(getDayNumber(utcDay));

      // If a recurring class is already taken, it shouldn't be updated.
      const allValidRecurringClasses = await getValidRecurringClasses(
        tx,
        utcToday,
      );
      allValidRecurringClasses.find((recurringClass) => {
        const recurringClassDay = recurringClass.startAt?.getDay();
        const recurringClassTime = formatTime(recurringClass.startAt as Date);
        if (
          recurringClass.instructorId === instructorId &&
          recurringClassDay === getDayNumber(utcDay) &&
          recurringClassTime === utcTime
        ) {
          throw new Error("Recurring class is already taken");
        }
      });

      // GET the current recurring class by recurring class id
      const recurringClass = await getRecurringClassByRecurringClassId(
        tx,
        req.id,
      );
      if (!recurringClass) {
        throw new Error("Recurring class not found");
      }
      const { endAt, startAt } = recurringClass;

      const firstClassDate = calculateFirstDate(
        new Date(utcClassStartDate),
        utcDay,
        utcTime,
      );

      let dateTimes: Date[] = [];
      const newStartAt = calculateFirstDate(
        new Date(utcClassStartDate),
        utcDay,
        utcTime,
      );
      let newEndAt: Date | null = null;

      // Configure conditions for updating recurring classes.
      // [Condition1]
      // EndAt is not null and classStartDate is the same or later than endAt.
      // -> Classes shouldn't be created.
      // [Condition2]
      // EndAt is not null and classStartDate is earlier than endAt.
      // -> All upcoming classes are deleted and recreated new recurring ones until EndAt.
      // [Condition3]
      // EndAt is null
      // -> All upcoming classes are deleted and recreated new recurring ones until the end of the next two months.

      const condition1 =
        endAt !== null && new Date(endAt) <= new Date(utcClassStartDate);
      const condition2 =
        endAt !== null && new Date(utcClassStartDate) < new Date(endAt);
      const condition3 = endAt === null;

      // Condition1
      if (condition1) {
        throw new Error("Regular class cannot be edited");
      }

      // Terminate the current recurring class.
      await terminateRecurringClass(tx, req.id, new Date(utcClassStartDate));

      // Delete unnecessary future recurring class.
      if (
        startAt === null ||
        (startAt !== null && new Date(utcClassStartDate) < new Date(startAt))
      ) {
        await deleteRecurringClass(tx, req.id);
      }

      // Condition2
      if (condition2) {
        // Store the endAt to newEndAt
        newEndAt = endAt;

        // Generate recurring dates until EndAt.
        const until = endAt;
        dateTimes = createDatesBetween(firstClassDate, until);
      }

      // Condition3
      if (condition3) {
        // Generate recurring dates until the end of the next two months.
        const until = getFirstDateInMonths(firstClassDate, 3);
        console.log(until);
        dateTimes = createDatesBetween(firstClassDate, until);
        console.log(dateTimes);
      }

      // Exclude instructor unavailability from the dateTimes.
      const instructorUnavailabilities =
        await getValidInstructorUnavailabilities(tx, instructorId, utcToday);
      const instructorUnavailableDates = dateTimes.filter((dateTime) =>
        instructorUnavailabilities.some(
          (unavailability) =>
            unavailability.dateTime.getTime() === dateTime.getTime(),
        ),
      );
      dateTimes = dateTimes.filter(
        (dateTime) => !instructorUnavailableDates.includes(dateTime),
      );

      // Exclude duplicated classes.
      const classes = await getValidClassesByInstructorId(
        tx,
        instructorId,
        utcToday,
      );
      const duplicatedClassesDates = dateTimes.filter((dateTimes) =>
        classes.some(
          (Class) => Class.dateTime.getTime() === dateTimes.getTime(),
        ),
      );
      dateTimes = dateTimes.filter(
        (dateTime) => !duplicatedClassesDates.includes(dateTime),
      );

      const unbookableDateTimes: Date[] = [
        ...instructorUnavailableDates,
        ...duplicatedClassesDates,
      ];

      console.log(dateTimes);
      console.log(unbookableDateTimes);

      // Add a new recurring class
      const updatedRecurringClass = await addRecurringClass(
        tx,
        instructorId,
        customerId,
        childrenIds,
        subscriptionId,
        newStartAt,
        dateTimes,
        newEndAt ?? null,
      );

      // Create the classes as canceled by instructor.
      const canceledClasses = await createCanceledClasses({
        tx,
        dateTimes: unbookableDateTimes,
        instructorId,
        customerId,
        subscriptionId,
        recurringClassId: updatedRecurringClass.id,
        childrenIds,
      });

      return { updatedRecurringClass, canceledClasses };
    });

    const messages = ["Regular Class is updated successfully"];

    // Check if there are any unbookable classes
    if (updatedRecurringClasses.canceledClasses.length > 0) {
      messages.push(
        "There are classes that cannot be booked. Please book alternative classes instead.",
      );
    }

    res.status(200).json({
      messages,
      updatedRecurringClasses,
    });
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};

// GET recurring classes by instructor id.
export const getRecurringClassesByInstructorIdController = async (
  req: Request,
  res: Response,
) => {
  const instructorId = parseInt(req.query.instructorId as string);
  if (isNaN(instructorId)) {
    res.status(400).json({ error: "Invalid instructor ID" });
    return;
  }

  try {
    // Get the today's UTC date at 00:00.
    const utcToday = new Date().toISOString().split("T")[0] + "T00:00:00.000Z";

    const recurringClasses = await getValidRecurringClassesByInstructorId(
      instructorId,
      new Date(utcToday),
    );

    res.json({ recurringClasses });
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};
