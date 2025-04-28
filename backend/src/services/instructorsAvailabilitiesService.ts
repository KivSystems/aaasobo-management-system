import { prisma } from "../../prisma/prismaClient";

export const fetchInstructorAvailabilitiesTodayAndAfter = async (
  instructorId: number,
  startDate: Date,
) => {
  try {
    // Get the dateTime to exclude from the `Class` table
    const excludedFromClasses = await prisma.class.findMany({
      where: {
        instructorId: instructorId,
        dateTime: {
          gte: startDate,
        },
        status: {
          in: ["booked", "canceledByInstructor"],
        },
      },
      select: {
        dateTime: true,
      },
    });

    // Get the dateTime to exclude from the `instructorUnavailability` table
    const excludedFromUnavailability =
      await prisma.instructorUnavailability.findMany({
        where: {
          instructorId: instructorId,
          dateTime: {
            gte: startDate,
          },
        },
        select: {
          dateTime: true,
        },
      });

    // Combine the excluded dateTime
    const excludedDateTimes = [
      ...excludedFromClasses.map((record) => record.dateTime),
      ...excludedFromUnavailability.map((record) => record.dateTime),
    ];

    // Get the availabilities from the `instructorAvailability` table
    const availabilities = await prisma.instructorAvailability.findMany({
      where: {
        instructorId: instructorId,
        dateTime: {
          gte: startDate,
          notIn: excludedDateTimes, // Exclude the dateTime from the list
        },
      },
      orderBy: {
        dateTime: "asc",
      },
    });

    // Convert to an array of dateTime only
    const dateTimes = availabilities.map(
      (availability) => availability.dateTime,
    );

    return dateTimes;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch instructor availabilities.");
  }
};

export const getCalendarAvailabilities = async (instructorId: number) => {
  const threeHoursLater = new Date(new Date().getTime() + 3 * 60 * 60 * 1000);

  // Get the instructor's unavailable dateTimes from Class table
  const bookedOrCanceledTimeSlots = await prisma.class.findMany({
    where: {
      instructorId: instructorId,
      dateTime: {
        gte: threeHoursLater,
      },
      status: {
        in: ["booked", "canceledByInstructor"],
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
        gte: threeHoursLater,
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
        gte: threeHoursLater,
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
