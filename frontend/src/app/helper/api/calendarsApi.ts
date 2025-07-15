import { GENERAL_ERROR_MESSAGE } from "../messages/formValidation";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

// Update business calendar schedule
export const updateBusinessSchedule = async (
  eventId: number,
  startDate: string,
  endDate: string | undefined,
  cookie: string,
): Promise<UpdateFormState> => {
  try {
    // Define the item to be sent to the server side.
    const apiURL = `${BACKEND_ORIGIN}/admins/business-schedule/update`;
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const body = JSON.stringify({
      startDate,
      endDate,
      eventId,
    });

    const response = await fetch(apiURL, {
      method: "POST",
      headers,
      body,
    });

    const data = await response.json();

    if (response.status !== 200) {
      return { errorMessage: data.message };
    }

    return data;
  } catch (error) {
    console.error("API error while updating business schedule:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};
