import type { UpdateRecurringClassRequest } from "@shared/schemas/recurringClasses";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";
const BASE_URL = `${BACKEND_ORIGIN}/recurring-classes`;

// GET recurring classes by subscription id
export const getRecurringClassesBySubscriptionId = async (
  subscriptionId: number,
  status?: "active" | "history",
  cookie?: string,
): Promise<RecurringClasses> => {
  try {
    const params = new URLSearchParams({
      subscriptionId: subscriptionId.toString(),
    });
    if (status) {
      params.append("status", status);
    }

    const apiURL = `${BASE_URL}?${params.toString()}`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const recurringClasses = await response.json();
    return recurringClasses;
  } catch (error) {
    console.error("Failed to fetch recurring classes:", error);
    throw error;
  }
};

export const editRecurringClass = async (
  recurringClassId: number,
  recurringClassData: UpdateRecurringClassRequest,
  cookie?: string,
): Promise<{
  message: string;
  oldRecurringClass: RecurringClass;
  newRecurringClass: RecurringClass;
}> => {
  try {
    const apiURL = `${BASE_URL}/${recurringClassId}`;
    const method = "PUT";
    const body = JSON.stringify(recurringClassData);
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        body,
        credentials: "include",
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          errorData.error ||
          "Failed to edit recurring class",
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to edit recurring class:", error);
    throw error;
  }
};
