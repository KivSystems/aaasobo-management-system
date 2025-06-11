import {
  CLASS_CANCELLATION_SUCCESS,
  FAILED_TO_CANCEL_CLASS,
  FAILED_TO_CANCEL_CLASSES,
  FAILED_TO_CANCEL_INVALID_CLASS,
  FAILED_TO_CANCEL_INVALID_CLASSES,
  FAILED_TO_FETCH_REBOOKABLE_INSTRUCTORS,
  SELECTED_CLASSES_CANCELLATION_SUCCESS,
} from "../messages/customerDashboard";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

// GET classes by customer id
export const getClassesByCustomerId = async (customerId: number) => {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}/classes/${customerId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { classes } = await response.json();
    return classes;
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    throw error;
  }
};

// DELETE a class with class id
export const deleteClass = async (classId: number) => {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}/classes/${classId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to delete class:", error);
    throw error;
  }
};

// POST class
export const bookClass = async (classData: {
  classId: number;
  dateTime: string;
  instructorId: number;
  customerId: number;
  childrenIds: number[];
  status: string;
  recurringClassId: number;
  rebookableUntil: string;
  classCode: string;
}) => {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(classData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error. status ${response.status}`,
      );
    }

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to book class:", error.message);
      throw new Error(error.message);
    } else {
      console.error("An unexpected error occurred:", error);
      throw new Error("An unexpected error occurred.");
    }
  }
};

// GET a class by id
export const getClassById = async (classId: number) => {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}/classes/class/${classId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const classData = await response.json();
    return classData;
  } catch (error) {
    console.error("Failed to fetch a class:", error);
    throw error;
  }
};

// PATCH a class date
export const editClass = async (
  id: number,
  classData: {
    childrenIds?: number[];
    dateTime?: string;
    status?: ClassStatus;
    instructorId?: number;
    rebookableUntil?: string | null;
    updateAt: Date;
  },
) => {
  // Define the data to be sent to the server side.
  const classURL = `${BACKEND_ORIGIN}/classes/${id}`;
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify(classData);

  const response = await fetch(classURL, {
    method: "PATCH",
    headers,
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return data;
};

export const cancelClass = async (classId: number) => {
  const cancelClassUrl = `${BACKEND_ORIGIN}/classes/${classId}/cancel`;

  try {
    const response = await fetch(cancelClassUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      if (response.status === 400)
        return { success: false, message: FAILED_TO_CANCEL_INVALID_CLASS };
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return { success: true, message: CLASS_CANCELLATION_SUCCESS };
  } catch (error) {
    console.error("API error while canceling a class:", error);
    return { success: false, message: FAILED_TO_CANCEL_CLASS };
  }
};

// TODO: Delete this api call function after finishing refactoring the instructor class details page
export const getClassesByInstructorId = async (instructorId: number) => {
  try {
    const response = await fetch(
      `${BACKEND_ORIGIN}/instructors/${instructorId}/classes`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { classes } = await response.json();
    return classes;
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    throw error;
  }
};

// POST create monthly classes
export const createMonthlyClasses = async (data: {
  year: number;
  month: string;
}) => {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}/classes/create-classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error. status ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to create the monthly classes:", error);
    throw error;
  }
};

// Check if there is already a booked class for this customer at the same time
export const checkDoubleBooking = async (
  customerId: number,
  dateTime: string,
): Promise<{
  error?: string;
  message?: string;
}> => {
  try {
    const response = await fetch(
      `${BACKEND_ORIGIN}/classes/check-double-booking`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          dateTime,
        }),
      },
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(
        errorResponse.error || `HTTP error. status ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof Error) {
      return { error: error.message || "Failed to check double booking." };
    } else {
      return { error: "An unknown error occurred." };
    }
  }
};

// Check if the selected children have another class with another instructor
export const checkChildrenAvailability = async (
  dateTime: string,
  selectedChildrenIds: number[],
): Promise<{
  error?: string;
  message?: string;
}> => {
  try {
    const response = await fetch(
      `${BACKEND_ORIGIN}/classes/check-children-availability`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateTime,
          selectedChildrenIds,
        }),
      },
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(
        errorResponse.error || `HTTP error. status ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof Error) {
      return {
        error: error.message || "Failed to check children availability.",
      };
    } else {
      return { error: "An unknown error occurred." };
    }
  }
};

export const cancelClasses = async (classIds: number[]) => {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}/classes/cancel-classes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ classIds }),
    });

    if (!response.ok) {
      if (response.status === 400)
        return { success: false, message: FAILED_TO_CANCEL_INVALID_CLASSES };
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }
    return { success: true, message: SELECTED_CLASSES_CANCELLATION_SUCCESS };
  } catch (error) {
    console.error("API error while canceling classes:", error);
    return { success: false, message: FAILED_TO_CANCEL_CLASSES };
  }
};

export const getInstructorAvailabilities = async (
  classId: number,
  // TODO: update the type
): Promise<InstructorAvailability[] | []> => {
  try {
    const apiUrl = `${BACKEND_ORIGIN}/classes/${classId}/instructor-availabilities`;
    const response = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      "API error while fetching rebookable instructor availabilities:",
      error,
    );
    throw new Error(FAILED_TO_FETCH_REBOOKABLE_INSTRUCTORS);
  }
};
