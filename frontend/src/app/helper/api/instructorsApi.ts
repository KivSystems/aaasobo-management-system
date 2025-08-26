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

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";
const BASE_URL = `${BACKEND_ORIGIN}/instructors`;

type Response<T> = T | { message: string };

export type InstructorSchedule = {
  id: number;
  instructorId: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InstructorSlot = {
  scheduleId: number;
  weekday: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "HH:MM" format
};

export type InstructorScheduleWithSlots = InstructorSchedule & {
  slots: InstructorSlot[];
};

// GET instructors data
export const getInstructors = async () => {
  try {
    // Use the admin endpoint that returns simple instructor list
    const response = await fetch(`${BACKEND_ORIGIN}/admins/instructor-list`);
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

export const getInstructor = async (
  id: number,
): Promise<Response<{ instructor: Instructor }>> => {
  const apiUrl = `${BASE_URL}/${id}`;
  const data: Response<{ instructor: Instructor }> = await fetch(apiUrl, {
    cache: "no-store",
  }).then((res) => res.json());

  return data;
};

// GET instructor id by class id
export const getInstructorIdByClassId = async (
  classId: number,
): Promise<Response<{ instructorId: number }>> => {
  const apiUrl = `${BASE_URL}/class/${classId}`;
  const data: Response<{ instructorId: number }> = await fetch(apiUrl, {
    cache: "no-store",
  }).then((res) => res.json());

  return data;
};

// Register instructor data
export const registerInstructor = async (
  userData: FormData,
  cookie: string,
): Promise<RegisterFormState> => {
  try {
    // Handle api based on whether an icon is included
    let apiUrl = `${BACKEND_ORIGIN}/admins/instructor-list/register`;
    if (userData.has("icon")) {
      apiUrl = `${BACKEND_ORIGIN}/admins/instructor-list/register/withIcon`;
    }
    const response = await fetch(apiUrl, {
      method: "POST",
      body: userData,
      headers: {
        Cookie: cookie,
      },
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
  let apiUrl = `${BACKEND_ORIGIN}/admins/instructor-list/update/${id}`;
  if (userData.has("icon")) {
    apiUrl = `${BACKEND_ORIGIN}/admins/instructor-list/update/${id}/withIcon`;
  }

  // Define the data to be sent to the server side.
  const response = await fetch(apiUrl, {
    method: "PATCH",
    body: userData,
    headers: {
      Cookie: cookie,
    },
  });

  const data = await response.json();

  if (response.status === 500) {
    return { errorMessage: data.message || ERROR_PAGE_MESSAGE_EN };
  }

  return data;
};

// Mask instructor information
export const maskInstructors = async (): Promise<void> => {
  try {
    const apiUrl = `${BACKEND_ORIGIN}/jobs/mask/instructors`;
    const headers = {
      "Content-Type": "application/json",
    };
    await fetch(apiUrl, {
      method: "PATCH",
      headers,
    });
  } catch (error) {
    console.error("Failed to mask instructor information:", error);
    throw error;
  }
};

export const getInstructorProfile = async (
  instructorId: number,
): Promise<InstructorProfile> => {
  try {
    const instructorProfileURL = `${BASE_URL}/${instructorId}/profile`;
    const response = await fetch(instructorProfileURL, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const instructorProfile = await response.json();
    return instructorProfile;
  } catch (error) {
    console.error("API error while fetching instructor profile:", error);
    throw new Error(FAILED_TO_FETCH_INSTRUCTOR_PROFILE);
  }
};

export const getInstructorProfiles = async (): Promise<
  InstructorRebookingProfile[]
> => {
  try {
    const apiUrl = `${BASE_URL}/profiles`;
    const response = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const instructorProfiles = await response.json();
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
export const getAllInstructorProfiles = async (cookie: string) => {
  try {
    const apiUrl = `${BASE_URL}/all-profiles`;
    const response = await fetch(apiUrl, {
      next: { tags: ["instructor-list"] },
      headers: {
        Cookie: cookie,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.instructorProfiles;
  } catch (error) {
    console.error("Failed to fetch all instructor profiles:", error);
    throw error;
  }
};

export const getCalendarClasses = async (
  instructorId: number,
): Promise<EventType[] | []> => {
  try {
    const calendarClassesURL = `${BACKEND_ORIGIN}/instructors/${instructorId}/calendar-classes`;
    const response = await fetch(calendarClassesURL, {
      cache: "no-store",
    });

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
): Promise<{
  selectedClassDetails: InstructorClassDetail;
  sameDateClasses: InstructorClassDetail[] | [];
}> => {
  try {
    const apiUrl = `${BASE_URL}/${instructorId}/classes/${classId}/same-date`;
    const response = await fetch(apiUrl, {
      cache: "no-store",
    });

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
): Promise<Response<{ schedules: InstructorSchedule[] }>> => {
  try {
    const response = await fetch(`${BASE_URL}/${instructorId}/schedules`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Handle the backend response format { message, data }
    if ("message" in result && !result.data) {
      return { message: result.message };
    }

    // Return in the expected format
    return { schedules: result.data };
  } catch (error) {
    console.error("Failed to fetch instructor schedules:", error);
    throw error;
  }
};

export const getInstructorScheduleById = async (
  instructorId: number,
  scheduleId: number,
): Promise<Response<{ schedule: InstructorScheduleWithSlots }>> => {
  try {
    const response = await fetch(
      `${BASE_URL}/${instructorId}/schedules/${scheduleId}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Handle the backend response format { message, data }
    if ("message" in result && !result.data) {
      return { message: result.message };
    }

    // Return in the expected format
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
): Promise<Response<{ schedule: InstructorScheduleWithSlots }>> => {
  try {
    const response = await fetch(`${BASE_URL}/${instructorId}/schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      credentials: "include",
      body: JSON.stringify({
        effectiveFrom,
        slots,
        timezone: "Asia/Tokyo",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Handle the backend response format { message, data }
    if ("message" in result && !result.data) {
      return { message: result.message };
    }

    // Return in the expected format
    return { schedule: result.data };
  } catch (error) {
    console.error("Failed to create instructor schedule:", error);
    throw error;
  }
};

// Create instructors post termination Schedule
export const createInstructorPostTerminationSchedule = async (): Promise<
  Response<{ schedule: InstructorScheduleWithSlots }>
> => {
  try {
    const response = await fetch(`${BASE_URL}/schedules/post-termination`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Handle the backend response format { message, data }
    if ("message" in result && !result.data) {
      return { message: result.message };
    }

    // Return in the expected format
    return { schedule: result.data };
  } catch (error) {
    console.error(
      "Failed to create instructor post termination schedule:",
      error,
    );
    throw error;
  }
};

type AvailableSlot = {
  dateTime: string;
  weekday: number;
  startTime: string;
};

export const getInstructorAvailableSlots = async (
  instructorId: number,
  startDate: string,
  endDate: string,
  excludeBookedSlots: boolean,
): Promise<Response<{ data: AvailableSlot[] }>> => {
  try {
    const params = new URLSearchParams({
      start: startDate,
      end: endDate,
      excludeBookedSlots: excludeBookedSlots.toString(),
    });

    const response = await fetch(
      `${BASE_URL}/${instructorId}/available-slots?${params}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Handle the backend response format { message, data }
    if ("message" in result && !result.data) {
      return { message: result.message };
    }

    // Return in the expected format
    return { data: result.data };
  } catch (error) {
    console.error("Failed to fetch instructor available slots:", error);
    throw error;
  }
};

export type AvailableSlotWithInstructors = {
  dateTime: string;
  availableInstructors: number[];
};

export const getAllInstructorAvailableSlots = async (
  startDate: string,
  endDate: string,
): Promise<Response<{ data: AvailableSlotWithInstructors[]; meta: any }>> => {
  try {
    const params = new URLSearchParams({
      start: startDate,
      end: endDate,
    });

    const response = await fetch(`${BASE_URL}/available-slots?${params}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch all instructor available slots:", error);
    return { message: "Failed to fetch available slots" };
  }
};

// Instructor Absence APIs
type InstructorAbsence = {
  instructorId: number;
  absentAt: string;
};

export const getInstructorAbsences = async (
  instructorId: number,
): Promise<Response<{ absences: InstructorAbsence[] }>> => {
  try {
    const response = await fetch(`${BASE_URL}/${instructorId}/absences`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Handle the backend response format { message, data }
    if ("message" in result && !result.data) {
      return { message: result.message };
    }

    // Return in the expected format
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
): Promise<Response<{ absence: InstructorAbsence }>> => {
  try {
    const response = await fetch(`${BASE_URL}/${instructorId}/absences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      credentials: "include",
      body: JSON.stringify({ absentAt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Handle the backend response format { message, data }
    if ("message" in result && !result.data) {
      return { message: result.message };
    }

    // Return in the expected format
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
): Promise<Response<{ absence: InstructorAbsence }>> => {
  try {
    const encodedAbsentAt = encodeURIComponent(absentAt);
    const response = await fetch(
      `${BASE_URL}/${instructorId}/absences/${encodedAbsentAt}`,
      {
        method: "DELETE",
        headers: {
          Cookie: cookie,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Handle the backend response format { message, data }
    if ("message" in result && !result.data) {
      return { message: result.message };
    }

    // Return in the expected format
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
): Promise<Response<InstructorScheduleWithSlots>> => {
  try {
    const url = new URL(`${BASE_URL}/${instructorId}/schedules/active`);
    url.searchParams.append("effectiveDate", effectiveDate);

    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Handle the backend response format { message, data }
    if ("message" in result && !result.data) {
      return { message: result.message };
    }

    // Return the schedule directly (not wrapped in additional object)
    return result.data;
  } catch (error) {
    console.error("Failed to fetch active instructor schedule:", error);
    throw error;
  }
};
