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

export const rebookClass = async (
  classId: number,
  classData: {
    dateTime: string;
    instructorId: number;
    customerId: number;
    childrenIds: number[];
  },
  cookie?: string,
): Promise<
  { success: true } | { success: false; errorMessage: LocalizedMessage }
> => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/classes/${classId}/rebook`;
    const method = "POST";
    const body = JSON.stringify(classData);
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
        credentials: "include",
      });
    }

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

export const cancelClass = async (classId: number, cookie?: string) => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/classes/${classId}/cancel`;
    const method = "PATCH";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
      });
    }

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
export const generateClasses = async (
  year: string,
  month: string,
  cookie: string,
) => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/classes/create-classes`;
    const method = "POST";
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const body = JSON.stringify({ year, month });

    const response = await fetch(apiURL, {
      method,
      headers,
      body,
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
  cookie?: string,
): Promise<{ isDoubleBooked: boolean } | { message: LocalizedMessage }> => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/classes/check-double-booking`;
    const method = "POST";
    const body = JSON.stringify({
      customerId,
      dateTime,
    });
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
        credentials: "include",
      });
    }

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
  cookie?: string,
): Promise<ChildConflictResponse> => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/classes/check-child-conflicts`;
    const method = "POST";
    const body = JSON.stringify({ dateTime, selectedChildrenIds });
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
        credentials: "include",
      });
    }

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

export const cancelClasses = async (classIds: number[], cookie?: string) => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/classes/cancel-classes`;
    const method = "POST";
    const body = JSON.stringify({ classIds });
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
        credentials: "include",
      });
    }

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
  cookie?: string,
): Promise<{ success: boolean }> => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/classes/${classId}/attendance`;
    const method = "POST";
    const body = JSON.stringify({ childrenIds });
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
        credentials: "include",
      });
    }

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
  cookie?: string,
): Promise<{ success: boolean }> => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/classes/${classId}/status`;
    const method = "PATCH";
    const body = JSON.stringify({ status });
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
        credentials: "include",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("API error while updating class status:", error);
    return { success: false };
  }
};

// Delete classes older than 1 year (13 months) (Only for Vercel Cron Job)
export const deleteOldClasses = async (authorization: string) => {
  try {
    const apiUrl = `${BACKEND_ORIGIN}/jobs/delete/old-classes`;
    const method = "DELETE";
    const headers = {
      "Content-Type": "application/json",
      Authorization: authorization,
    };
    const response = await fetch(apiUrl, {
      method,
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
