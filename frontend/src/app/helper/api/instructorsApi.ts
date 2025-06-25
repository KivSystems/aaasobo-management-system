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
  instructorId: number,
  instructorName: string,
  instructorEmail: string,
  instructorClassURL: string,
  instructorIcon: string,
  instructorNickname: string,
  instructorMeetingId: string,
  instructorPasscode: string,
  instructorIntroductionURL: string,
) => {
  // Define the data to be sent to the server side.
  const instructorURL = `${BACKEND_ORIGIN}/instructors/${instructorId}`;
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({
    name: instructorName,
    email: instructorEmail,
    classURL: instructorClassURL,
    icon: instructorIcon,
    nickname: instructorNickname,
    meetingId: instructorMeetingId,
    passcode: instructorPasscode,
    introductionURL: instructorIntroductionURL,
  });

  const response = await fetch(instructorURL, {
    method: "PATCH",
    headers,
    body,
  });

  const data = await response.json();

  if (response.status !== 200) {
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

export const fetchInstructorAvailabilitiesForTomorrowAndAfter = async (
  instructorId: number,
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/${instructorId}/availabilities/after-tomorrow`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const instructorAvailabilities = await response.json();
    return instructorAvailabilities.data;
  } catch (error) {
    console.error(
      "Failed to fetch instructor availability date and times:",
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
