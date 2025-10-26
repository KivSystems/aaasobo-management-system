import {
  ITEM_REQUIRED_ERROR,
  GENERAL_ERROR_MESSAGE,
  CONTENT_REGISTRATION_SUCCESS_MESSAGE,
} from "../messages/formValidation";
import type { PlanResponse, PlansListResponse } from "@shared/schemas/plans";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

const BASE_URL = `${BACKEND_ORIGIN}/plans`;

type Response<T> = T | { message: string };

// GET all plans data
export const getAllPlans = async (
  cookie?: string,
): Promise<PlansListResponse["data"]> => {
  try {
    const apiURL = `${BASE_URL}`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        cache: "no-store",
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
        cache: "no-store",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data }: PlansListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    throw error;
  }
};

// Get plan by ID
export const getPlanById = async (
  id: number,
  cookie?: string,
): Promise<Response<PlanResponse>> => {
  const apiURL = `${BASE_URL}/${id}`;
  const method = "GET";
  let headers;
  let response;

  if (cookie) {
    headers = { "Content-Type": "application/json", Cookie: cookie };
    response = await fetch(apiURL, {
      method,
      headers,
      cache: "no-store",
    });
  } else {
    headers = { "Content-Type": "application/json" };
    response = await fetch(apiURL, {
      method,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  }

  const data: Response<PlanResponse> = await response.json();

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
    const apiURL = `${BACKEND_ORIGIN}/admins/plan-list/register`;
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      Cookie: userData.cookie,
    };
    const body = JSON.stringify(userData);
    const response = await fetch(apiURL, {
      method,
      headers,
      body,
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
    const method = "PATCH";
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const body = JSON.stringify(
      isDelete
        ? { isDelete: true }
        : {
            isDelete: false,
            name: planName,
            description: planDescription,
          },
    );

    const response = await fetch(apiURL, {
      method,
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
