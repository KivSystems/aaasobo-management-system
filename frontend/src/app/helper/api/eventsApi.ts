import {
  ITEM_ALREADY_REGISTERED_ERROR,
  GENERAL_ERROR_MESSAGE,
  CONTENT_REGISTRATION_SUCCESS_MESSAGE,
} from "../messages/formValidation";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

const BASE_URL = `${BACKEND_ORIGIN}/events`;

export type Response<T> = T | { message: string };

// Get event by ID
export const getEventById = async (
  id: number,
): Promise<Response<{ event: EventType }>> => {
  const apiUrl = `${BASE_URL}/${id}`;
  const data: Response<{ event: EventType }> = await fetch(apiUrl, {
    cache: "no-store",
  }).then((res) => res.json());

  return data;
};

// Register a new event
export const registerEvent = async (userData: {
  name: string;
  weeklyClassTimes: number;
  description: string;
  cookie: string;
}): Promise<RegisterFormState> => {
  try {
    const registerURL = `${BACKEND_ORIGIN}/admins/event-list/register`;
    const response = await fetch(registerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userData.cookie },
      body: JSON.stringify(userData),
    });

    if (response.status === 409) {
      return { name: ITEM_ALREADY_REGISTERED_ERROR("Event Name") };
    }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return {
      successMessage: CONTENT_REGISTRATION_SUCCESS_MESSAGE("event"),
    };
  } catch (error) {
    console.error("API error while registering event:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};
