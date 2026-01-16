import { GENERAL_ERROR_MESSAGE } from "../messages/formValidation";
import { revalidateSystemStatus } from "@/app/actions/revalidate";
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://localhost:4000";

// Get system status (Only for Vercel cron job)
export const getSystemStatus = async (): Promise<string> => {
  try {
    // From server component
    // Define the item to be sent to the server side.
    const apiURL = `${BACKEND_ORIGIN}/jobs/get-system-status`;
    const response = await fetch(apiURL, { next: { tags: ["system-status"] } });
    const data = await response.json();
    if (response.status !== 200) {
      return data.error;
    }
    return data.status;
  } catch (error) {
    console.error("API error while getting system status:", error);
    return GENERAL_ERROR_MESSAGE;
  }
};

// Update system status (Only for Vercel cron job)
export const updateSystemStatus = async (
  authorization: string,
): Promise<string> => {
  try {
    // From server component
    // Define the item to be sent to the server side.
    const apiURL = `${BACKEND_ORIGIN}/jobs/update-system-status`;
    const method = "PATCH";
    const headers = {
      "Content-Type": "application/json",
      Authorization: authorization,
    };
    const response = await fetch(apiURL, {
      method,
      headers,
    });

    const data = await response.json();

    if (response.status !== 200) {
      return data.error;
    }

    // Revalidate the system status
    revalidateSystemStatus();

    const status = data.status;

    return status;
  } catch (error) {
    console.error("API error while updating system status:", error);
    return GENERAL_ERROR_MESSAGE;
  }
};
