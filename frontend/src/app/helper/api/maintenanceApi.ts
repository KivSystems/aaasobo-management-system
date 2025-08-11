import { GENERAL_ERROR_MESSAGE } from "../messages/formValidation";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

// Get system status
export const getSystemStatus = async (): Promise<string> => {
  try {
    // Define the item to be sent to the server side.
    const apiURL = `${BACKEND_ORIGIN}/jobs/get-system-status`;
    const response = await fetch(apiURL, {
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) {
      return data.error;
    }
    return data.status;
  } catch (error) {
    console.error("API error while getting system status:", error);
    return GENERAL_ERROR_MESSAGE;
  }
};

// Update system status
export const updateSystemStatus = async (): Promise<string> => {
  try {
    // Define the item to be sent to the server side.
    const apiURL = `${BACKEND_ORIGIN}/jobs/update-system-status`;
    const headers = { "Content-Type": "application/json" };
    const response = await fetch(apiURL, {
      method: "POST",
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return data.error;
    }

    const status = data.status;
    return status;
  } catch (error) {
    console.error("API error while updating system status:", error);
    return GENERAL_ERROR_MESSAGE;
  }
};
