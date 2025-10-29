import { FAILED_TO_FETCH_INSTRUCTOR_PROFILES } from "../messages/customerDashboard";
import {
  INSTRUCTOR_REGISTRATION_SUCCESS_MESSAGE,
  GENERAL_ERROR_MESSAGE,
  SINGLE_ITEM_ALREADY_REGISTERED_ERROR,
  MULTIPLE_ITEMS_ALREADY_REGISTERED_ERROR,
} from "../messages/formValidation";
import { ERROR_PAGE_MESSAGE_EN } from "../messages/generalMessages";
import {
  FAILED_TO_FETCH_INSTRUCTOR_AVAILABILITIES,
  FAILED_TO_FETCH_INSTRUCTOR_CLASSES,
  FAILED_TO_FETCH_INSTRUCTOR_PROFILE,
} from "../messages/instructorDashboard";

import type {
  InstructorProfile,
  CompleteInstructor,
  DetailedInstructorProfile,
  InstructorSchedule,
  AvailableSlot,
  SimpleInstructorProfile,
  CreateScheduleRequest,
  ActiveInstructorSchedule,
  AvailableSlotsQuery,
  AvailableSlotsResponse,
  InstructorAbsence,
  InstructorAbsencesResponse,
  CreateAbsenceResponse,
  DeleteAbsenceResponse,
} from "@shared/schemas/instructors";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";
const BASE_URL = `${BACKEND_ORIGIN}/instructors`;

type Response<T> = T | { message: string };

export type InstructorSlot = {
  scheduleId: number;
  weekday: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "HH:MM" format
};

export type InstructorScheduleWithSlots = InstructorSchedule & {
  slots: InstructorSlot[];
};

// GET instructors data
export const getInstructors = async (cookie?: string) => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/admins/instructor-list`;
    const method = "GET";
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data.map(
      (instructor: { ID: number; Instructor: string }) => ({
        id: instructor.ID,
        name: instructor.Instructor,
      }),
    );
  } catch (error) {
    console.error("Failed to fetch instructors:", error);
    throw error;
  }
};

export const getInstructor = async (id: number, cookie?: string) => {
  try {
    const apiURL = `${BASE_URL}/${id}`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        cache: "no-store",
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
        cache: "no-store",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Response<{ instructor: CompleteInstructor }> =
      await response.json();

    return data;
  } catch (error) {
    console.error("Failed to fetch instructor:", error);
    throw error;
  }
};

// GET instructor id by class id
export const getInstructorIdByClassId = async (
  classId: number,
  cookie?: string,
) => {
  const apiURL = `${BASE_URL}/class/${classId}`;
  const method = "GET";
  let headers;
  let response;

  if (cookie) {
    headers = { "Content-Type": "application/json", Cookie: cookie };
    response = await fetch(apiURL, {
      method,
      headers,
      cache: "no-store",
    });
  } else {
    headers = { "Content-Type": "application/json" };
    response = await fetch(apiURL, {
      method,
      headers,
      credentials: "include",
    });
  }

  const data: Response<{ instructorId: number }> = await response.json();

  return data;
};

// Register instructor data
export const registerInstructor = async (
  userData: FormData,
  cookie: string,
): Promise<RegisterFormState> => {
  try {
    // Handle api based on whether an icon is included
    let apiURL = `${BACKEND_ORIGIN}/admins/instructor-list/register`;
    if (userData.has("icon")) {
      apiURL = `${BACKEND_ORIGIN}/admins/instructor-list/register/withIcon`;
    }
    const method = "POST";
    const headers = {
      Cookie: cookie,
    };
    const body = userData;
    const response = await fetch(apiURL, {
      method,
      headers,
      body,
    });

    if (response.status === 409) {
      const data = await response.json();
      const { items } = data;
      // Check the number of commas in the error message
      const commaCount = (items.match(/,/g) || []).length;
      if (commaCount === 0) {
        return { errorMessage: SINGLE_ITEM_ALREADY_REGISTERED_ERROR(items) };
      } else if (commaCount > 0) {
        return { errorMessage: MULTIPLE_ITEMS_ALREADY_REGISTERED_ERROR(items) };
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return {
      successMessage: INSTRUCTOR_REGISTRATION_SUCCESS_MESSAGE,
    };
  } catch (error) {
    console.error("API error while registering instructor:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};

// Update instructor data
export const updateInstructor = async (
  id: number,
  userData: FormData,
  cookie: string,
) => {
  // Handle api based on whether an icon is included
  let apiURL = `${BACKEND_ORIGIN}/admins/instructor-list/update/${id}`;
  if (userData.has("icon")) {
    apiURL = `${BACKEND_ORIGIN}/admins/instructor-list/update/${id}/withIcon`;
  }
  const method = "PATCH";
  const headers = {
    Cookie: cookie,
  };
  const body = userData;

  // Define the data to be sent to the server side.
  const response = await fetch(apiURL, {
    method,
    headers,
    body,
  });

  const data = await response.json();

  if (response.status === 500) {
    return { errorMessage: data.message || ERROR_PAGE_MESSAGE_EN };
  }

  return data;
};

// Mask instructor information (Cron Job use only)
export const maskInstructors = async (authorization: string): Promise<void> => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/jobs/mask/instructors`;
    const method = "PATCH";
    const headers = {
      "Content-Type": "application/json",
      Authorization: authorization,
    };
    await fetch(apiURL, {
      method,
      headers,
    });
  } catch (error) {
    console.error("Failed to mask instructor information:", error);
    throw error;
  }
};

export const getInstructorProfile = async (
  instructorId: number,
  cookie?: string,
) => {
  try {
    const apiURL = "/api/instructorsApi";
    const method = "GET";
    const backendEndpoint = `/instructors/${instructorId}/profile`;
    const headers = {
      "Content-Type": "application/json",
      "backend-endpoint": backendEndpoint,
      "no-cache": "no-cache",
    };
    const response = await fetch(apiURL, {
      method,
      headers,
    });

    // const apiURL = `${BASE_URL}/${instructorId}/profile`;
    // const method = "GET";
    // let headers;
    // let response;

    // if (cookie) {
    //   headers = { "Content-Type": "application/json", Cookie: cookie };
    //   response = await fetch(apiURL, {
    //     method,
    //     headers,
    //     cache: "no-store",
    //   });
    // } else {
    //   headers = { "Content-Type": "application/json" };
    //   response = await fetch(apiURL, {
    //     method,
    //     headers,
    //     credentials: "include",
    //     cache: "no-store",
    //   });
    // }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const instructorProfile: SimpleInstructorProfile = await response.json();
    return instructorProfile;
  } catch (error) {
    console.error("API error while fetching instructor profile:", error);
    throw new Error(FAILED_TO_FETCH_INSTRUCTOR_PROFILE);
  }
};

export const getInstructorProfiles = async (cookie?: string) => {
  try {
    const apiURL = `${BASE_URL}/profiles`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        cache: "no-store",
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
        cache: "no-store",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const instructorProfiles: InstructorProfile[] = await response.json();
    return instructorProfiles;
  } catch (error) {
    console.error(
      "API error while fetching instructor profiles for rebooking page:",
      error,
    );
    throw new Error(FAILED_TO_FETCH_INSTRUCTOR_PROFILES);
  }
};

// GET all instructors profiles for customer dashboard
export const getAllInstructorProfiles = async (cookie?: string) => {
  try {
    const apiURL = `${BASE_URL}/all-profiles`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        next: { tags: ["instructor-list"] },
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: { instructorProfiles: DetailedInstructorProfile[] } =
      await response.json();
    return data.instructorProfiles;
  } catch (error) {
    console.error("Failed to fetch all instructor profiles:", error);
    throw error;
  }
};

export const getCalendarClasses = async (
  instructorId: number,
  cookie?: string,
): Promise<EventType[] | []> => {
  try {
    const apiURL = "/api/instructorsApi";
    const method = "GET";
    const backendEndpoint = `/instructors/${instructorId}/calendar-classes`;
    const headers = {
      "Content-Type": "application/json",
      "backend-endpoint": backendEndpoint,
      "no-cache": "no-cache",
    };
    const response = await fetch(apiURL, {
      method,
      headers,
    });

    // const apiURL = `${BACKEND_ORIGIN}/instructors/${instructorId}/calendar-classes`;
    // const apiURL = `/api/instructors/${instructorId}/calendar-classes`;
    // const method = "GET";
    // let headers;
    // let response;

    // if (cookie) {
    //   headers = { "Content-Type": "application/json", Cookie: cookie };
    //   response = await fetch(apiURL, {
    //     method,
    //     headers,
    //     cache: "no-store",
    //   });
    // } else {
    //   headers = { "Content-Type": "application/json" };
    //   response = await fetch(apiURL, {
    //     method,
    //     headers,
    //     credentials: "include",
    //     cache: "no-store",
    //   });
    // }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      "API error while fetching instructor calendar classes:",
      error,
    );
    throw new Error(FAILED_TO_FETCH_INSTRUCTOR_CLASSES);
  }
};

export const getSameDateClasses = async (
  instructorId: number,
  classId: number,
  cookie?: string,
): Promise<{
  selectedClassDetails: InstructorClassDetail;
  sameDateClasses: InstructorClassDetail[] | [];
}> => {
  try {
    const apiURL = `${BASE_URL}/${instructorId}/classes/${classId}/same-date`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        cache: "no-store",
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
        cache: "no-store",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      "API error while fetching same-date classes for instructor:",
      error,
    );
    throw new Error(FAILED_TO_FETCH_INSTRUCTOR_CLASSES);
  }
};

// Versioned Schedule System APIs
export const getInstructorSchedules = async (
  instructorId: number,
  cookie?: string,
) => {
  try {
    const apiURL = `${BASE_URL}/${instructorId}/schedules`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        cache: "no-store",
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
        cache: "no-store",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = (await response.json()) as { data: InstructorSchedule[] };

    return { schedules: result.data };
  } catch (error) {
    console.error("Failed to fetch instructor schedules:", error);
    throw error;
  }
};

export const getInstructorScheduleById = async (
  instructorId: number,
  scheduleId: number,
  cookie?: string,
) => {
  try {
    const apiURL = `${BASE_URL}/${instructorId}/schedules/${scheduleId}`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        cache: "no-store",
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
        cache: "no-store",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = (await response.json()) as {
      data: InstructorScheduleWithSlots;
    };

    return { schedule: result.data };
  } catch (error) {
    console.error("Failed to fetch instructor schedule details:", error);
    throw error;
  }
};

export const createInstructorSchedule = async (
  instructorId: number,
  effectiveFrom: string,
  slots: Omit<InstructorSlot, "scheduleId">[],
  cookie: string,
) => {
  try {
    const apiURL = `${BASE_URL}/${instructorId}/schedules`;
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      Cookie: cookie,
    };
    const body = JSON.stringify({
      effectiveFrom,
      slots,
      timezone: "Asia/Tokyo",
    } as CreateScheduleRequest);
    const response = await fetch(apiURL, {
      method,
      headers,
      credentials: "include",
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = (await response.json()) as {
      data: ActiveInstructorSchedule;
    };

    return { schedule: result.data };
  } catch (error) {
    console.error("Failed to create instructor schedule:", error);
    throw error;
  }
};

// Create instructors post termination Schedule (Cron Job use only)
export const createInstructorPostTerminationSchedule = async (
  authorization: string,
) => {
  try {
    const apiURL = `${BASE_URL}/schedules/post-termination`;
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      Authorization: authorization,
    };
    const response = await fetch(apiURL, {
      method,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = (await response.json()) as {
      data: InstructorScheduleWithSlots;
    };

    return { schedule: result.data };
  } catch (error) {
    console.error(
      "Failed to create instructor post termination schedule:",
      error,
    );
    throw error;
  }
};

export const getInstructorAvailableSlots = async (
  instructorId: number,
  startDate: string,
  endDate: string,
  excludeBookedSlots: boolean,
  cookie?: string,
) => {
  try {
    const params = new URLSearchParams({
      start: startDate,
      end: endDate,
      timezone: "Asia/Tokyo",
      excludeBookedSlots: excludeBookedSlots.toString(),
    } as AvailableSlotsQuery & { excludeBookedSlots: string });

    const apiURL = `${BASE_URL}/${instructorId}/available-slots?${params}`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        cache: "no-store",
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
        cache: "no-store",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = (await response.json()) as { data: AvailableSlot[] };

    return { data: result.data };
  } catch (error) {
    console.error("Failed to fetch instructor available slots:", error);
    throw error;
  }
};

export const getAllInstructorAvailableSlots = async (
  startDate: string,
  endDate: string,
  cookie?: string,
) => {
  try {
    const params = new URLSearchParams({
      start: startDate,
      end: endDate,
      timezone: "Asia/Tokyo",
    });

    const apiURL = `${BASE_URL}/available-slots?${params}`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        cache: "no-store",
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
        cache: "no-store",
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const data = (await response.json()) as AvailableSlotsResponse;
    return data;
  } catch (error) {
    console.error("Failed to fetch all instructor available slots:", error);
    return { message: "Failed to fetch available slots" };
  }
};

// Instructor Absence APIs
export const getInstructorAbsences = async (
  instructorId: number,
  cookie?: string,
) => {
  try {
    const apiURL = `${BASE_URL}/${instructorId}/absences`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        cache: "no-store",
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
        cache: "no-store",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: InstructorAbsencesResponse = await response.json();

    return { absences: result.data };
  } catch (error) {
    console.error("Failed to fetch instructor absences:", error);
    throw error;
  }
};

export const addInstructorAbsence = async (
  instructorId: number,
  absentAt: string,
  cookie: string,
) => {
  try {
    const apiURL = `${BASE_URL}/${instructorId}/absences`;
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      Cookie: cookie,
    };
    const body = JSON.stringify({ absentAt });
    const response = await fetch(apiURL, {
      method,
      headers,
      body,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: CreateAbsenceResponse = await response.json();

    return { absence: result.data };
  } catch (error) {
    console.error("Failed to add instructor absence:", error);
    throw error;
  }
};

export const deleteInstructorAbsence = async (
  instructorId: number,
  absentAt: string,
  cookie: string,
) => {
  try {
    const encodedAbsentAt = encodeURIComponent(absentAt);
    const apiURL = `${BASE_URL}/${instructorId}/absences/${encodedAbsentAt}`;
    const method = "DELETE";
    const headers = {
      "Content-Type": "application/json",
      Cookie: cookie,
    };

    const response = await fetch(apiURL, {
      method,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: DeleteAbsenceResponse = await response.json();

    return { absence: result.data };
  } catch (error) {
    console.error("Failed to delete instructor absence:", error);
    throw error;
  }
};

// Get active schedule for an instructor
export const getActiveInstructorSchedule = async (
  instructorId: number,
  effectiveDate: string,
  cookie?: string,
) => {
  try {
    const apiURL = new URL(`${BASE_URL}/${instructorId}/schedules/active`);
    apiURL.searchParams.append("effectiveDate", effectiveDate);
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        cache: "no-store",
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
        cache: "no-store",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = (await response.json()) as {
      data: InstructorScheduleWithSlots;
    };

    return { schedule: result.data };
  } catch (error) {
    console.error("Failed to fetch active instructor schedule:", error);
    throw error;
  }
};
