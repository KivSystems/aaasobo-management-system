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
    isRebookable?: boolean;
    rebookableUntil?: string | null;
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

// Cancel a class: Change the state of the class from 'booked' to 'canceledByCustomer'
export const cancelClass = async (classId: number) => {
  const classURL = `${BACKEND_ORIGIN}/classes/${classId}/cancel`;

  try {
    const response = await fetch(classURL, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error ${response.status}: ${errorData.message}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Failed to cancel class:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
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
      const { error } = await response.json();

      throw new Error(`HTTP Status: ${response.status} ${error}`);
    }
  } catch (error) {
    console.error("Failed to cancel classes:", error);
    throw new Error("Failed to cancel classes.");
  }
};
