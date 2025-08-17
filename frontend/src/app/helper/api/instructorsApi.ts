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

export type Day = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export type SlotsOfDays = {
  // time must be in 24 format: "HH:MM"
  [day in Day]: string[];
};

export type Response<T> = T | { message: string };

export type Availability = {
  dateTime: string;
};

export type RecurringInstructorAvailability = {
  rrule: string;
};

export type InstructorWithRecurringAvailability = {
  id: number;
  name: string;
  recurringAvailabilities: SlotsOfDays;
};

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
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    return data;
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

  if ("instructor" in data) {
    data.instructor.availabilities = data.instructor.availabilities.sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );
  }

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
): Promise<RegisterFormState> => {
  try {
    const registerURL = `${BACKEND_ORIGIN}/admins/instructor-list/register`;
    const response = await fetch(registerURL, {
      method: "POST",
      body: userData,
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

// PATCH instructor data
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

export const getInstructorRecurringAvailability = async (
  id: number,
  date: string,
): Promise<Response<InstructorWithRecurringAvailability>> => {
  const data: Response<InstructorWithRecurringAvailability> = await fetch(
    `${BASE_URL}/${id}/recurringAvailability?date=${date}`,
  ).then((res) => res.json());
  return data;
};

export const addAvailability = async (
  id: number,
  from: string,
  until: string,
): Promise<Response<{}>> => {
  return await fetch(`${BASE_URL}/${id}/availability`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, until }),
  }).then((res) => res.json());
};

export const addRecurringAvailability = async (
  id: number,
  day: number,
  time: string,
  startDate: string,
): Promise<
  Response<{ recurringInstructorAvailability: RecurringInstructorAvailability }>
> => {
  return await fetch(`${BASE_URL}/${id}/recurringAvailability`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ day, time, startDate }),
  }).then((res) => res.json());
};

export const deleteAvailability = async (
  id: number,
  dateTime: string,
): Promise<Response<{ availability: Availability }>> => {
  return await fetch(`${BASE_URL}/${id}/availability`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "slot", dateTime }),
  }).then((res) => res.json());
};

export const deleteRecurringAvailability = async (
  id: number,
  dateTime: string,
): Promise<
  Response<{ recurringAvailability: RecurringInstructorAvailability }>
> => {
  return await fetch(`${BASE_URL}/${id}/availability`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "recurring", dateTime }),
  }).then((res) => res.json());
};

export const extendRecurringAvailability = async (
  id: number,
  until: string,
): Promise<
  Response<{ recurringAvailabilities: RecurringInstructorAvailability[] }>
> => {
  return await fetch(`${BASE_URL}/${id}/availability/extend`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ until }),
  }).then((res) => res.json());
};

export const addRecurringAvailabilities = async (
  instructorId: number,
  slotsOfDays: SlotsOfDays,
  startDate: string,
) => {
  return await fetch(`${BASE_URL}/${instructorId}/recurringAvailability`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ slotsOfDays, startDate }),
  });
};

export const registerUnavailability = async (
  id: number,
  dateTime: string,
): Promise<Response<{ unavailability: Availability }>> => {
  return await fetch(`${BASE_URL}/${id}/unavailability`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dateTime }),
  }).then((res) => res.json());
};

export const getCalendarAvailabilities = async (
  instructorId: number,
): Promise<EventType[] | []> => {
  try {
    const calendarAvailabilitiesURL = `${BASE_URL}/${instructorId}/calendar-availabilities`;
    const response = await fetch(calendarAvailabilitiesURL, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const calendarAvailabilities = await response.json();
    return calendarAvailabilities;
  } catch (error) {
    console.error(
      "API error while fetching instructor calendar availabilities:",
      error,
    );
    throw new Error(FAILED_TO_FETCH_INSTRUCTOR_AVAILABILITIES);
  }
};

export const fetchInstructorRecurringAvailabilities = async (
  instructorId: number,
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/${instructorId}/recurringAvailabilityById`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.recurringAvailabilities;
  } catch (error) {
    console.error(
      "Failed to fetch instructor recurring availabilities.",
      error,
    );
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

export type AvailableSlot = {
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
export type InstructorAbsence = {
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
