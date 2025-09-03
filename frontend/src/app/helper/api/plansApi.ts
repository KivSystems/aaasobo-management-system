import {
  ITEM_REQUIRED_ERROR,
  ITEM_ALREADY_REGISTERED_ERROR,
  GENERAL_ERROR_MESSAGE,
  CONTENT_REGISTRATION_SUCCESS_MESSAGE,
} from "../messages/formValidation";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

const BASE_URL = `${BACKEND_ORIGIN}/plans`;

export type Response<T> = T | { message: string };

// GET all plans data
export const getAllPlans = async () => {
  try {
    const response = await fetch(`${BASE_URL}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    throw error;
  }
};

// Get plan by ID
export const getPlanById = async (
  id: number,
): Promise<Response<{ plan: Plan }>> => {
  const apiUrl = `${BASE_URL}/${id}`;
  const data: Response<{ plan: Plan }> = await fetch(apiUrl, {
    cache: "no-store",
  }).then((res) => res.json());

  return data;
};

// Register a new plan
export const registerPlan = async (userData: {
  name: string;
  weeklyClassTimes: number;
  description: string;
  cookie: string;
}): Promise<RegisterFormState> => {
  try {
    const registerURL = `${BACKEND_ORIGIN}/admins/plan-list/register`;
    const response = await fetch(registerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userData.cookie },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return {
      successMessage: CONTENT_REGISTRATION_SUCCESS_MESSAGE("plan"),
    };
  } catch (error) {
    console.error("API error while registering plan:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};

// Update plan information
export const updatePlan = async (
  planId: number,
  planName: string | null,
  planDescription: string | null,
  isDelete: boolean,
  cookie: string,
): Promise<UpdateFormState> => {
  try {
    // Define the item to be sent to the server side.
    const apiURL = `${BACKEND_ORIGIN}/admins/plan-list/update/${planId}`;
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const body = JSON.stringify({
      name: planName,
      description: planDescription,
      isDelete,
    });

    const response = await fetch(apiURL, {
      method: "PATCH",
      headers,
      body,
    });

    const data = await response.json();

    // Display the required error if the response status is 400
    if (response.status === 400) {
      return { name: ITEM_REQUIRED_ERROR("plan name") };
    }

    if (response.status !== 200) {
      return { errorMessage: data.message };
    }

    return data;
  } catch (error) {
    console.error("API error while updating plan:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};
