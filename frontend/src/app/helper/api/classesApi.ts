import {
  CHILD_BOOKING_STATUS_ERROR_MESSAGE,
  CLASS_CANCELLATION_SUCCESS,
  DOUBLE_BOOKING_CHECK_FAILURE,
  FAILED_TO_CANCEL_CLASS,
  FAILED_TO_CANCEL_CLASSES,
  FAILED_TO_CANCEL_INVALID_CLASS,
  FAILED_TO_CANCEL_INVALID_CLASSES,
  FAILED_TO_FETCH_REBOOKABLE_INSTRUCTORS,
  REBOOK_CLASS_RESULT_MESSAGES,
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

export const rebookClass = async (
  classId: number,
  classData: {
    dateTime: string;
    instructorId: number;
    customerId: number;
    childrenIds: number[];
  },
): Promise<
  { success: true } | { success: false; errorMessage: LocalizedMessage }
> => {
  const apiUrl = `${BACKEND_ORIGIN}/classes/${classId}/rebook`;
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(classData),
    });

    if (response.ok) {
      return { success: true };
    }

    const data = await response.json().catch(() => null);
    const errorType = data?.errorType;

    const errorMessage = REBOOK_CLASS_RESULT_MESSAGES[errorType];

    if (!errorMessage)
      throw new Error(
        `Error Type: ${errorType}, HTTP Status: ${response.status} ${response.statusText}`,
      );

    return { success: false, errorMessage };
  } catch (error: unknown) {
    console.error("API error while rebooking a class:", error);
    return {
      success: false,
      errorMessage: REBOOK_CLASS_RESULT_MESSAGES.default,
    };
  }
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
): Promise<{ isDoubleBooked: boolean } | { message: LocalizedMessage }> => {
  const apiUrl = `${BACKEND_ORIGIN}/classes/check-double-booking`;
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        dateTime,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { isDoubleBooked: data };
  } catch (error) {
    console.error("API error while checking double booking:", error);
    return { message: DOUBLE_BOOKING_CHECK_FAILURE };
  }
};

// Check if any of the selected children already have a class booked with a different instructor at the same time
export const checkChildConflicts = async (
  dateTime: string,
  selectedChildrenIds: number[],
): Promise<ChildConflictResponse> => {
  const apiUrl = `${BACKEND_ORIGIN}/classes/check-child-conflicts`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dateTime,
        selectedChildrenIds,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { conflictingChildren: data };
  } catch (error) {
    console.error("API error while checking child conflicts:", error);
    return { message: CHILD_BOOKING_STATUS_ERROR_MESSAGE };
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

export const updateAttendance = async (
  classId: number,
  childrenIds: number[],
): Promise<{ success: boolean }> => {
  const apiUrl = `${BACKEND_ORIGIN}/classes/${classId}/attendance`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childrenIds,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("API error while updating class attendance:", error);
    return { success: false };
  }
};

export const updateClassStatus = async (
  classId: number,
  status: string,
): Promise<{ success: boolean }> => {
  const apiUrl = `${BACKEND_ORIGIN}/classes/${classId}/status`;

  try {
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("API error while updating class status:", error);
    return { success: false };
  }
};

// Delete classes older than 1 year (13 months)
export const deleteOldClasses = async (authorization: string) => {
  const apiUrl = `${BACKEND_ORIGIN}/jobs/delete/old-classes`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: authorization,
  };
  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return data.error;
    }
  } catch (error) {
    console.error("API error while deleting old classes:", error);
    throw error;
  }
};
