import {
  ITEM_ALREADY_REGISTERED_ERROR,
  GENERAL_ERROR_MESSAGE,
  CONTENT_REGISTRATION_SUCCESS_MESSAGE,
} from "../messages/formValidation";
import { EVENT_DELETE_CONSTRAINT_MESSAGE } from "../messages/formValidation";
import { EVENT_CONFLICT_ITEMS } from "../../helper/data/data";
import type { EventResponse } from "@shared/schemas/events";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

const BASE_URL = `${BACKEND_ORIGIN}/events`;

type Response<T> = T | { message: string };

// Get event by ID
export const getEventById = async (
  id: number,
): Promise<Response<EventResponse>> => {
  const apiUrl = `${BASE_URL}/${id}`;
  const data: Response<EventResponse> = await fetch(apiUrl, {
    cache: "no-store",
  }).then((res) => res.json());

  return data;
};

// Register a new event
export const registerEvent = async (eventData: {
  eventNameJpn: string;
  eventNameEng: string;
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
      const data = await response.json();
      const items = data.items;
      let errorMessage = { eventNameJpn: "", eventNameEng: "", color: "" };
      items.includes(EVENT_CONFLICT_ITEMS[0])
        ? (errorMessage.eventNameJpn = ITEM_ALREADY_REGISTERED_ERROR(
            EVENT_CONFLICT_ITEMS[0],
          ))
        : null;
      items.includes(EVENT_CONFLICT_ITEMS[1])
        ? (errorMessage.eventNameEng = ITEM_ALREADY_REGISTERED_ERROR(
            EVENT_CONFLICT_ITEMS[1],
          ))
        : null;
      items.includes(EVENT_CONFLICT_ITEMS[2])
        ? (errorMessage.color = ITEM_ALREADY_REGISTERED_ERROR(
            EVENT_CONFLICT_ITEMS[2],
          ))
        : null;

      return errorMessage;
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
export const updateEvent = async (eventData: {
  eventId: number;
  eventNameJpn: string;
  eventNameEng: string;
  color: string;
  cookie: string;
}): Promise<UpdateFormState> => {
  const { eventId, eventNameJpn, eventNameEng, color, cookie } = eventData;
  try {
    // Define the item to be sent to the server side.
    const apiURL = `${BACKEND_ORIGIN}/admins/event-list/update/${eventId}`;
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const body = JSON.stringify({
      eventNameJpn,
      eventNameEng,
      color,
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
      let errorMessage = { eventNameJpn: "", eventNameEng: "", color: "" };
      items.includes("Japanese event name")
        ? (errorMessage.eventNameJpn = ITEM_ALREADY_REGISTERED_ERROR(
            "Japanese event name",
          ))
        : null;
      items.includes("English event name")
        ? (errorMessage.eventNameEng =
            ITEM_ALREADY_REGISTERED_ERROR("English event name"))
        : null;
      items.includes("color code")
        ? (errorMessage.color = ITEM_ALREADY_REGISTERED_ERROR("color code"))
        : null;

      return errorMessage;
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
