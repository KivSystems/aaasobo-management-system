import type {
  SubscriptionsResponse,
  RegisterSubscriptionRequest,
  NewSubscriptionResponse,
} from "@shared/schemas/customers";
import { ERROR_PAGE_MESSAGE_EN } from "../messages/generalMessages";
import { DeleteResponse } from "@shared/schemas/admins";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

// GET subscriptions by a customer id
export const getSubscriptionsByCustomerId = async (
  customerId: number,
  cookie?: string,
): Promise<SubscriptionsResponse> => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/customers/${customerId}/subscriptions`;
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
    const subscriptions = await response.json();

    return subscriptions;
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    throw error;
  }
};

// Register a subscription
export const registerSubscription = async (
  customerId: number,
  subscriptionData: RegisterSubscriptionRequest,
  cookie?: string,
): Promise<NewSubscriptionResponse> => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/customers/${customerId}/subscription`;
    const method = "POST";
    const body = JSON.stringify(subscriptionData);
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to register a subscription:", error);
    throw error;
  }
};

// Delete a subscription
export const deleteSubscription = async (
  subscriptionId: number,
  cookie: string,
): Promise<DeleteResponse | { errorMessage: string }> => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/subscriptions/${subscriptionId}`;
    const method = "DELETE";
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const response = await fetch(apiURL, {
      method,
      headers,
    });

    if (response.status !== 200) {
      return { errorMessage: ERROR_PAGE_MESSAGE_EN };
    }
    const result: DeleteResponse = await response.json();

    return result;
  } catch (error) {
    console.error("Failed to delete the subscription:", error);
    throw error;
  }
};
