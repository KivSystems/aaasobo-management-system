import {
  ITEM_ALREADY_REGISTERED_ERROR,
  GENERAL_ERROR_MESSAGE,
  CONTENT_REGISTRATION_SUCCESS_MESSAGE,
} from "../messages/formValidation";
import { EVENT_DELETE_CONSTRAINT_MESSAGE } from "../messages/formValidation";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

const BASE_URL = `${BACKEND_ORIGIN}/events`;

export type Response<T> = T | { message: string };

// Get event by ID
export const getEventById = async (
  id: number,
): Promise<Response<{ event: BusinessEventType }>> => {
  const apiUrl = `${BASE_URL}/${id}`;
  const data: Response<{ event: BusinessEventType }> = await fetch(apiUrl, {
    cache: "no-store",
  }).then((res) => res.json());

  return data;
};

// Register a new event
export const registerEvent = async (eventData: {
  name: string;
  color: string;
  cookie: string;
}): Promise<RegisterFormState> => {
  try {
    const registerURL = `${BACKEND_ORIGIN}/admins/event-list/register`;
    const response = await fetch(registerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: eventData.cookie },
      body: JSON.stringify(eventData),
    });

    // Handle the duplicated error if the response status is 409 or 422
    if (response.status === 409 || response.status === 422) {
      const { items } = await response.json();

      if (items.length === 2) {
        return {
          name: ITEM_ALREADY_REGISTERED_ERROR(items[0]),
          color: ITEM_ALREADY_REGISTERED_ERROR(items[1]),
        };
      }
      if (items.some((item: string) => item.includes("name"))) {
        return { name: ITEM_ALREADY_REGISTERED_ERROR(items) };
      } else if (items.some((item: string) => item.includes("color"))) {
        return { color: ITEM_ALREADY_REGISTERED_ERROR(items) };
      } else {
        return { name: items };
      }
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

// Update event item
export const updateEvent = async (
  eventId: number,
  eventName: string,
  eventColor: string,
  cookie: string,
): Promise<UpdateFormState> => {
  try {
    // Define the item to be sent to the server side.
    const apiURL = `${BACKEND_ORIGIN}/admins/event-list/update/${eventId}`;
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const body = JSON.stringify({
      name: eventName,
      color: eventColor,
    });

    const response = await fetch(apiURL, {
      method: "PATCH",
      headers,
      body,
    });

    const data = await response.json();

    // Handle the duplicated error if the response status is 409 or 422
    if (response.status === 409 || response.status === 422) {
      const items = data.items;
      if (items.length === 2) {
        return {
          name: ITEM_ALREADY_REGISTERED_ERROR(items[0]),
          color: ITEM_ALREADY_REGISTERED_ERROR(items[1]),
        };
      }
      if (items.some((item: string) => item.includes("name"))) {
        return { name: ITEM_ALREADY_REGISTERED_ERROR(items) };
      } else if (items.some((item: string) => item.includes("color"))) {
        return { color: ITEM_ALREADY_REGISTERED_ERROR(items) };
      } else {
        return { name: items };
      }
    }

    if (response.status !== 200) {
      return { errorMessage: data.message };
    }

    return data;
  } catch (error) {
    console.error("API error while updating event:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};

// DELETE event data
export const deleteEvent = async (eventId: number, cookie: string) => {
  try {
    // Define the data to be sent to the server side.
    const apiURL = `${BACKEND_ORIGIN}/admins/event-list/${eventId}`;
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const response = await fetch(apiURL, {
      method: "DELETE",
      headers,
    });

    if (response.status !== 200) {
      return { errorMessage: EVENT_DELETE_CONSTRAINT_MESSAGE };
    }
    const result = await response.json();

    return result;
  } catch (error) {
    console.error("Failed to delete the event:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};
