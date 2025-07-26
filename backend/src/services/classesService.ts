import { Prisma, Status } from "@prisma/client";
import { prisma } from "../../prisma/prismaClient";
import { getJstDayRange, nHoursLater } from "../helper/dateUtils";
import { NewClassToRebookType } from "../controllers/classesController";
import {
  FREE_TRIAL_BOOKING_HOURS,
  REGULAR_REBOOKING_HOURS,
} from "../helper/commonUtils";
import {
  CANCELED_CLASS_COLOR,
  COMPLETED_CLASS_COLOR,
  FREE_TRIAL_CLASS_COLOR,
  REBOOKED_CLASS_COLOR,
  REGULAR_CLASS_COLOR,
} from "../helper/colors";

// Fetch all the classes with related instructors and customers data
export const getAllClasses = async () => {
  try {
    const classes = await prisma.class.findMany({
      include: { instructor: true, customer: true },
      orderBy: { dateTime: "desc" },
    });

    return classes;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch classes.");
  }
};

// Fetch classes with designated dateTime range
export const getClassesWithinPeriod = async (
  startDate: Date,
  endDate: Date,
) => {
  try {
    const classes = await prisma.class.findMany({
      where: {
        dateTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { instructor: true, customer: true },
      orderBy: { dateTime: "asc" },
    });

    return classes;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch classes.");
  }
};

// Fetch classes by customer id along with related instructors and customers data
export const getClassesByCustomerId = async (customerId: number) => {
  try {
    const classes = await prisma.class.findMany({
      where: { customerId },
      include: {
        instructor: true,
        customer: true,
        classAttendance: { include: { children: true } },
      },
      orderBy: { dateTime: "asc" },
    });

    return classes;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch classes.");
  }
};

// Create a new class in the DB
export const createClass = async (
  classData: {
    dateTime: string;
    instructorId: number;
    customerId: number;
    status: Status;
    subscriptionId: number;
    recurringClassId: number;
    rebookableUntil: string | Date;
    updatedAt: Date;
    classCode: string;
  },
  childrenIds: number[],
) => {
  try {
    const CreatedClass = await prisma.class.create({
      data: classData,
    });
    const classAttendancePromises = childrenIds.map((childrenId) => {
      return prisma.classAttendance.create({
        data: {
          classId: CreatedClass.id,
          childrenId,
        },
      });
    });
    const classAttendance = await Promise.all(classAttendancePromises);

    return { CreatedClass, classAttendance };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to add class.");
  }
};

// Delete a class in the DB
export const deleteClass = async (classId: number) => {
  try {
    const [_, deletedClass] = await prisma.$transaction([
      prisma.classAttendance.deleteMany({
        where: { classId },
      }),
      prisma.class.delete({
        where: { id: classId },
      }),
    ]);

    return deletedClass;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to delete class.");
  }
};

// Update/Edit a class
export const updateClass = async (
  id: number,
  status: Status,
  classDateTime: Date | string,
) => {
  if (status === "canceledByInstructor") {
    await prisma.$transaction(async (tx) => {
      await tx.class.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date(),
          rebookableUntil: nHoursLater(
            180 * 24,
            new Date(classDateTime),
          ).toISOString(), // If the class is canceled by the instructor, set rebookableUntil to 180 days (* 24 * 60 minutes) after the class dateTime
        },
      });

      await tx.classAttendance.deleteMany({
        where: { classId: id },
      });
    });
  } else {
    await prisma.class.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
        ...(status === "completed" && { rebookableUntil: null }),
      },
    });
  }
};

export async function countClassesOfSubscription(
  subscriptionId: number,
  until: Date,
) {
  try {
    return await prisma.class.count({
      where: {
        subscriptionId,
        OR: [{ status: "booked" }, { status: "completed" }],
        dateTime: { lte: until },
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to count lessons.");
  }
}

// Cancel a class
export const cancelClassById = async (classId: number) => {
  await prisma.$transaction(async (tx) => {
    await tx.classAttendance.deleteMany({
      where: { classId },
    });

    await tx.class.update({
      where: { id: classId },
      data: { status: "canceledByCustomer", updatedAt: new Date() },
    });
  });
};

export const fetchInstructorClasses = async (instructorId: number) => {
  try {
    const classes = await prisma.class.findMany({
      where: { instructorId },
      include: {
        instructor: true,
        customer: {
          include: {
            children: true,
          },
        },
        classAttendance: { include: { children: true } },
      },
      orderBy: { dateTime: "asc" },
    });

    return classes;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch classes.");
  }
};

// Create classes based on the recurring class id
export const createClassesUsingRecurringClassId = async (
  tx: Prisma.TransactionClient,
  recurringClassId: number,
  instructorId: number,
  customerId: number,
  subscriptionId: number,
  childrenIds: number[],
  dateTimes: Date[],
) => {
  try {
    const createdClasses = await tx.class.createManyAndReturn({
      data: dateTimes.map((dateTime, index) => {
        return {
          recurringClassId,
          instructorId,
          customerId,
          subscriptionId,
          status: "booked",
          dateTime,
          updatedAt: new Date(),
          classCode: `${recurringClassId}-${index}`,
        };
      }),
    });

    await tx.classAttendance.createMany({
      data: createdClasses
        .map((createdClass) => {
          return childrenIds.map((childrenId) => ({
            classId: createdClass.id,
            childrenId,
          }));
        })
        .flat(),
    });

    return { createdClasses };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to add classes.");
  }
};

export const getExcludedClasses = async (
  tx: Prisma.TransactionClient,
  recurringClassIds: number[],
  date: Date,
) => {
  try {
    const excludedClassData = await tx.class.findMany({
      where: {
        recurringClassId: { in: recurringClassIds },
        dateTime: { gte: date },
      },
    });

    return excludedClassData;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch classes.");
  }
};

// Check if the instructor is already booked at the specified date and time
export const checkInstructorConflicts = async (
  instructorId: number,
  dateTime: string,
): Promise<boolean> => {
  const existingBooking = await prisma.class.findFirst({
    where: {
      instructorId,
      dateTime: new Date(dateTime),
      status: {
        in: ["booked", "rebooked"],
      },
    },
  });
  return existingBooking !== null;
};

// Check if the instructor is unavailable or not at the specified date and time
export const checkInstructorUnavailability = async (
  instructorId: number,
  dateTime: string,
): Promise<boolean> => {
  const existingUnavailability =
    await prisma.instructorUnavailability.findFirst({
      where: {
        instructorId,
        dateTime: new Date(dateTime),
      },
    });
  return existingUnavailability !== null;
};

// Check if the selected children have another class with another instructor at the same dateTime
// If there are conflicting classes, return the array of the children's names
export const checkChildConflicts = async (
  dateTime: string,
  childrenIds: number[],
) => {
  const conflictingClasses = await prisma.class.findMany({
    where: {
      dateTime,
      classAttendance: {
        some: {
          childrenId: {
            in: childrenIds,
          },
        },
      },
    },
    include: {
      classAttendance: {
        include: {
          children: true,
        },
      },
    },
  });

  // Filter out names of the selected children that have conflicts
  const conflictingChildren: string[] = [
    ...new Set(
      conflictingClasses.flatMap((eachClass) =>
        eachClass.classAttendance
          .filter((attendance) => childrenIds.includes(attendance.childrenId))
          .map((attendance) => attendance.children.name),
      ),
    ),
  ];

  return conflictingChildren;
};

// Check if there is a class that is already booked at the same dateTime as the newlly booked class
export const checkDoubleBooking = async (
  customerId: number,
  dateTime: Date,
): Promise<boolean> => {
  const alreadyBookedClass = await prisma.class.findFirst({
    where: {
      customerId,
      dateTime,
      status: {
        in: ["booked", "rebooked"],
      },
    },
  });

  // Return true if a booked class is found, otherwise false
  return alreadyBookedClass !== null;
};

export const getRebookableClasses = async (customerId: number) => {
  // Rebooking is allowed until 3 hours before rebookableUntil.
  // Free trial booking is allowed until 72 hours before rebookableUntil.

  const rebookableFrom = nHoursLater(REGULAR_REBOOKING_HOURS);
  const freeTrialBookableFrom = nHoursLater(FREE_TRIAL_BOOKING_HOURS);

  // Regular (non-free trial) classes
  const regularClasses = await prisma.class.findMany({
    where: {
      customerId,
      isFreeTrial: false,
      status: { in: ["canceledByCustomer", "canceledByInstructor", "pending"] },
      rebookableUntil: {
        gte: rebookableFrom,
      },
    },
  });

  // Free trial classes
  const freeTrialClasses = await prisma.class.findMany({
    where: {
      customerId,
      isFreeTrial: true,
      status: { in: ["canceledByCustomer", "canceledByInstructor", "pending"] },
      rebookableUntil: {
        gte: freeTrialBookableFrom,
      },
    },
  });

  const combinedClasses = [...regularClasses, ...freeTrialClasses].sort(
    (a, b) => a.rebookableUntil!.getTime() - b.rebookableUntil!.getTime(),
  );

  return combinedClasses.map((classItem) => ({
    id: classItem.id,
    rebookableUntil: classItem.rebookableUntil,
    classCode: classItem.classCode,
    isFreeTrial: classItem.isFreeTrial,
  }));
};

export const getUpcomingClasses = async (customerId: number) => {
  const nowUTC = new Date();

  const classes = await prisma.class.findMany({
    where: {
      customerId: customerId,
      status: {
        in: ["booked", "rebooked"],
      },
      dateTime: {
        gte: nowUTC,
      },
    },
    orderBy: {
      dateTime: "asc",
    },
    include: {
      instructor: {
        select: {
          nickname: true,
          icon: true,
        },
      },
      classAttendance: {
        include: {
          children: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  const upcomingClasses = classes.map((classItem) => {
    return {
      id: classItem.id,
      dateTime: classItem.dateTime,
      instructor: classItem.instructor,
      attendingChildren: classItem.classAttendance.map(
        (attendance) => attendance.children.name,
      ),
    };
  });
  return upcomingClasses;
};

export const cancelClasses = async (classIds: number[]) => {
  return prisma.$transaction(async (tx) => {
    await tx.classAttendance.deleteMany({
      where: { classId: { in: classIds } },
    });

    await tx.class.updateMany({
      where: { id: { in: classIds } },
      data: { status: "canceledByCustomer", updatedAt: new Date() },
    });

    return true;
  });
};

// Fetch valid classes by instructor id.
export const getValidClassesByInstructorId = async (
  tx: Prisma.TransactionClient,
  instructorId: number,
  date: Date,
) => {
  try {
    const classes = await tx.class.findMany({
      where: { instructorId, dateTime: { gte: date } },
    });

    return classes;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch classes.");
  }
};

// Create new canceled classes
export const createCanceledClasses = async ({
  tx,
  dateTimes,
  instructorId,
  customerId,
  subscriptionId,
  recurringClassId,
  childrenIds,
}: {
  tx: Prisma.TransactionClient;
  dateTimes: Date[];
  instructorId: number;
  customerId: number;
  subscriptionId: number;
  recurringClassId: number;
  childrenIds: number[];
}) => {
  try {
    const createdClasses = await tx.class.createManyAndReturn({
      data: dateTimes.map((dateTime, index) => ({
        instructorId,
        customerId,
        recurringClassId,
        subscriptionId,
        dateTime,
        status: "pending", // NOTE: the status has been changed from "canceledByInstructor" to "pending"
        rebookableUntil: nHoursLater(180 * 24, dateTime), // 180 days (* 24 hours) after the class dateTime
        updatedAt: new Date(),
        classCode: `${recurringClassId}-f-${index}`, // "f" = failed booking
      })),
    });
    // Add the Class Attendance to the ClassAttendance Table based on the Class ID.
    // NOTE(to Saeka): Do we need to create ClassAttendance records for classes that were unable to be booked as regular classes? I temporarily commented out the following logic. (Shingo)
    // await tx.classAttendance.createMany({
    //   data: createdClasses
    //     .map((createdClass) => {
    //       return childrenIds.map((childrenId) => ({
    //         classId: createdClass.id,
    //         childrenId,
    //       }));
    //     })
    //     .flat(),
    // });

    return createdClasses;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to add class.");
  }
};

export const getCustomerClasses = async (customerId: number) => {
  const classes = await prisma.class.findMany({
    where: {
      customerId: customerId,
      NOT: {
        status: { in: ["pending", "declined"] },
      },
    },
    orderBy: {
      dateTime: "desc",
    },
    include: {
      instructor: {
        select: {
          name: true,
          nickname: true,
          icon: true,
          classURL: true,
          meetingId: true,
          passcode: true,
        },
      },
      classAttendance: {
        include: {
          children: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  // All returned classes are non-pending, so both dateTime and instructor are guaranteed to exist
  const customerClasses = classes.map((classItem) => {
    const start = classItem.dateTime!;
    const end = new Date(new Date(start).getTime() + 25 * 60000).toISOString();

    const statusColorMap: Partial<Record<Status, string>> = {
      booked: REGULAR_CLASS_COLOR,
      rebooked: REBOOKED_CLASS_COLOR,
      canceledByCustomer: CANCELED_CLASS_COLOR,
      canceledByInstructor: CANCELED_CLASS_COLOR,
      completed: COMPLETED_CLASS_COLOR,
    };

    const isBookedOrRebooked =
      classItem.status === "booked" || classItem.status === "rebooked";

    const color =
      classItem.isFreeTrial && isBookedOrRebooked
        ? FREE_TRIAL_CLASS_COLOR
        : statusColorMap[classItem.status];

    const childrenNames = classItem.classAttendance
      .map((attendance) => attendance.children.name)
      .join(", ");

    return {
      classId: classItem.id,
      start,
      end,
      title: childrenNames,
      color,
      instructorIcon: classItem.instructor!.icon,
      instructorNickname: classItem.instructor!.nickname,
      instructorName: classItem.instructor!.name,
      instructorClassURL: classItem.instructor!.classURL,
      instructorMeetingId: classItem.instructor!.meetingId,
      instructorPasscode: classItem.instructor!.passcode,
      classStatus: classItem.status,
      rebookableUntil: classItem.rebookableUntil,
      classCode: classItem.classCode,
      updatedAt: classItem.updatedAt,
      isFreeTrial: classItem.isFreeTrial,
    };
  });
  return customerClasses;
};

export const getCalendarClasses = async (instructorId: number) => {
  const classes = await prisma.class.findMany({
    where: {
      instructorId: instructorId,
      status: {
        in: ["booked", "rebooked", "completed", "canceledByInstructor"],
      },
    },
    orderBy: {
      dateTime: "desc",
    },
    include: {
      classAttendance: {
        include: {
          children: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  const instructorCalendarClasses = classes.map((classItem) => {
    const start = classItem.dateTime!; // Guaranteed to exist for non-pending classes
    const end = new Date(new Date(start).getTime() + 25 * 60000).toISOString();

    const statusColorMap: Partial<Record<Status, string>> = {
      booked: REGULAR_CLASS_COLOR,
      rebooked: REBOOKED_CLASS_COLOR,
      canceledByInstructor: CANCELED_CLASS_COLOR,
      completed: COMPLETED_CLASS_COLOR,
    };

    const isBookedOrRebooked =
      classItem.status === "booked" || classItem.status === "rebooked";

    const color =
      classItem.isFreeTrial && isBookedOrRebooked
        ? FREE_TRIAL_CLASS_COLOR
        : statusColorMap[classItem.status];

    const childrenNames = classItem.classAttendance
      .map((attendance) => attendance.children.name)
      .join(", ");

    return {
      classId: classItem.id,
      start,
      end,
      title: childrenNames,
      color,
      classStatus: classItem.status,
    };
  });
  return instructorCalendarClasses;
};

export const getRebookableUntil = async (classId: number) => {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
  });

  return {
    rebookableUntil: classData?.rebookableUntil,
    isFreeTrial: classData?.isFreeTrial,
  };
};

export const getClassToRebook = async (classId: number) => {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
  });

  return {
    status: classData?.status,
    recurringClassId: classData?.recurringClassId,
    rebookableUntil: classData?.rebookableUntil,
    classCode: classData?.classCode,
    isFreeTrial: classData?.isFreeTrial,
    dateTime: classData?.dateTime,
  };
};

export const rebookClass = async (
  oldClass: { id: number; status: Status },
  newClass: NewClassToRebookType,
  childrenToAttend: number[],
) => {
  return await prisma.$transaction(async (tx) => {
    // Step 1: Update or delete the old class to be rebooked.
    // If the old class status is "canceled", update the rebookableUntil field to null to prevent further rebooking.
    if (
      oldClass.status === "canceledByCustomer" ||
      oldClass.status === "canceledByInstructor"
    ) {
      await tx.class.update({
        where: { id: oldClass.id },
        data: { rebookableUntil: null },
      });
      // If the old class status is "pending", the cancelation history is not necessary, so delete the class.
    } else if (oldClass.status === "pending") {
      await tx.class.delete({ where: { id: oldClass.id } });
    }

    // Step 2: Create a new "rebooked" class and classAttendance records.
    const newRebookedClass = await tx.class.create({
      data: newClass,
    });
    await tx.classAttendance.createMany({
      data: childrenToAttend.map((childrenId) => ({
        classId: newRebookedClass.id,
        childrenId,
      })),
    });

    return newRebookedClass;
  });
};

export const createFreeTrialClass = async ({
  tx,
  customerId,
}: {
  tx: Prisma.TransactionClient;
  customerId: number;
}) => {
  const createdClass = await tx.class.create({
    data: {
      customerId,
      status: "pending",
      rebookableUntil: nHoursLater(180 * 24, new Date()), // 180 days (* 24 hours) after now
      updatedAt: new Date(),
      classCode: `ft-${customerId}`, // "ft" = free trial
      isFreeTrial: true,
    },
  });

  return createdClass;
};

export const declineFreeTrialClass = async (
  customerId: number,
  classCode?: string,
) => {
  const baseConditions = {
    customerId,
    isFreeTrial: true,
    status: {
      in: [
        Status.pending,
        Status.canceledByCustomer,
        Status.canceledByInstructor,
      ],
    },
  };

  const whereClause = classCode
    ? { ...baseConditions, classCode }
    : baseConditions;

  const updatedClass = await prisma.class.updateMany({
    where: whereClause,
    data: {
      status: Status.declined,
      updatedAt: new Date(),
      rebookableUntil: null,
    },
  });

  return updatedClass;
};

export const getSameDateClasses = async (
  instructorId: number,
  classId: number,
) => {
  const targetClass = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      dateTime: true,
      status: true,
      isFreeTrial: true,
      classCode: true,
      updatedAt: true,
      instructor: {
        select: {
          classURL: true,
          meetingId: true,
          passcode: true,
        },
      },
      customer: {
        select: {
          name: true,
          children: {
            select: {
              id: true,
              name: true,
              birthdate: true,
              personalInfo: true,
              customerId: true,
            },
          },
        },
      },
      classAttendance: {
        select: {
          children: {
            select: {
              id: true,
              name: true,
              birthdate: true,
              personalInfo: true,
              customerId: true,
            },
          },
        },
      },
    },
  });

  if (!targetClass?.dateTime) return [];

  const { startOfDay, endOfDay } = getJstDayRange(targetClass.dateTime);

  const classes = await prisma.class.findMany({
    where: {
      instructorId,
      status: {
        in: ["booked", "rebooked", "canceledByInstructor", "completed"],
      },
      dateTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: {
      id: true,
      dateTime: true,
      status: true,
      isFreeTrial: true,
      customer: {
        select: {
          children: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      classAttendance: {
        select: {
          children: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { dateTime: "asc" },
  });

  const formattedTargetClass = {
    id: targetClass.id,
    dateTime: targetClass.dateTime!.toISOString(),
    customerName: targetClass.customer.name,
    classURL: targetClass.instructor?.classURL || "",
    meetingId: targetClass.instructor?.meetingId || "",
    passcode: targetClass.instructor?.passcode || "",
    attendingChildren: targetClass.classAttendance.map((ca) => ca.children),
    customerChildren: targetClass.customer.children,
    status: targetClass.status,
    isFreeTrial: targetClass.isFreeTrial,
    classCode: targetClass.classCode,
    updatedAt: targetClass.updatedAt,
  };

  const formattedSameDayClasses = classes.map((cls) => ({
    id: cls.id,
    dateTime: cls.dateTime!.toISOString(),
    attendingChildren: cls.classAttendance.map((ca) => ca.children),
    customerChildren: cls.customer.children,
    status: cls.status,
    isFreeTrial: cls.isFreeTrial,
  }));

  return {
    selectedClassDetails: formattedTargetClass,
    sameDateClasses: formattedSameDayClasses,
  };
};
