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
    let apiURL;
    let headers;
    let response;
    const method = "POST";
    const body = JSON.stringify(classData);

    if (cookie) {
      // From server component
      apiURL = `${BACKEND_ORIGIN}/classes/${classId}/rebook`;
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    } else {
      // From client component (via proxy)
      apiURL = `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN}/api/proxy`;
      const backendEndpoint = `/classes/${classId}/rebook`;
      headers = {
        "Content-Type": "application/json",
        "backend-endpoint": backendEndpoint,
      };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
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
    let apiURL;
    let headers;
    let response;
    const method = "PATCH";

    if (cookie) {
      // From server component
      apiURL = `${BACKEND_ORIGIN}/classes/${classId}/cancel`;
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
      });
    } else {
      // From client component (via proxy)
      apiURL = `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN}/api/proxy`;
      const backendEndpoint = `/classes/${classId}/cancel`;
      headers = {
        "Content-Type": "application/json",
        "backend-endpoint": backendEndpoint,
      };
      response = await fetch(apiURL, {
        method,
        headers,
      });
    }

    if (response.status !== 200) {
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
  year: number,
  month: string,
  cookie: string,
) => {
  try {
    // From server component
    const apiURL = `${BACKEND_ORIGIN}/classes/create-classes`;
    const method = "POST";
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const body = JSON.stringify({ year, month });

    const response = await fetch(apiURL, {
      method,
      headers,
      body,
    });

    if (response.status !== 201) {
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
    let apiURL;
    let headers;
    let response;
    const method = "POST";
    const body = JSON.stringify({
      customerId,
      dateTime,
    });

    if (cookie) {
      // From server component
      apiURL = `${BACKEND_ORIGIN}/classes/check-double-booking`;
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    } else {
      // From client component (via proxy)
      apiURL = `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN}/api/proxy`;
      const backendEndpoint = `/classes/check-double-booking`;
      headers = {
        "Content-Type": "application/json",
        "backend-endpoint": backendEndpoint,
      };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    }

    if (response.status !== 200) {
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
    let apiURL;
    let headers;
    let response;
    const method = "POST";
    const body = JSON.stringify({ dateTime, selectedChildrenIds });

    if (cookie) {
      // From server component
      apiURL = `${BACKEND_ORIGIN}/classes/check-child-conflicts`;
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    } else {
      // From client component (via proxy)
      apiURL = `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN}/api/proxy`;
      const backendEndpoint = `/classes/check-child-conflicts`;
      headers = {
        "Content-Type": "application/json",
        "backend-endpoint": backendEndpoint,
      };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    }

    if (response.status !== 200) {
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
    let apiURL;
    let headers;
    let response;
    const method = "POST";
    const body = JSON.stringify({ classIds });

    if (cookie) {
      // From server component
      apiURL = `${BACKEND_ORIGIN}/classes/cancel-classes`;
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    } else {
      // From client component (via proxy)
      apiURL = `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN}/api/proxy`;
      const backendEndpoint = `/classes/cancel-classes`;
      headers = {
        "Content-Type": "application/json",
        "backend-endpoint": backendEndpoint,
      };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    }

    if (response.status !== 200) {
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
    let apiURL;
    let headers;
    let response;
    const method = "POST";
    const body = JSON.stringify({ childrenIds });

    if (cookie) {
      // From server component
      apiURL = `${BACKEND_ORIGIN}/classes/${classId}/attendance`;
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    } else {
      // From client component (via proxy)
      apiURL = `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN}/api/proxy`;
      const backendEndpoint = `/classes/${classId}/attendance`;
      headers = {
        "Content-Type": "application/json",
        "backend-endpoint": backendEndpoint,
      };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    }

    if (response.status !== 200) {
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
    let apiURL;
    let headers;
    let response;
    const method = "PATCH";
    const body = JSON.stringify({ status });

    if (cookie) {
      // From server component
      apiURL = `${BACKEND_ORIGIN}/classes/${classId}/status`;
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    } else {
      // From client component (via proxy)
      apiURL = `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN}/api/proxy`;
      const backendEndpoint = `/classes/${classId}/status`;
      headers = {
        "Content-Type": "application/json",
        "backend-endpoint": backendEndpoint,
      };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    }

    if (response.status !== 200) {
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
    // From server component
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

    if (response.status !== 200) {
      return data.error;
    }
  } catch (error) {
    console.error("API error while deleting old classes:", error);
    throw error;
  }
};
