import type {
  SubscriptionsResponse,
  RegisterSubscriptionRequest,
  NewSubscriptionResponse,
} from "@shared/schemas/customers";
import { ERROR_PAGE_MESSAGE_EN } from "../messages/generalMessages";
import {
  DeleteResponse,
  UpdateSubscriptionResponse,
  UpdateSubscriptionToAddClassRequest,
  UpdateSubscriptionToTerminateClassRequest,
} from "@shared/schemas/admins";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

// GET subscriptions by a customer id
export const getSubscriptionsByCustomerId = async (
  customerId: number,
): Promise<SubscriptionsResponse> => {
  try {
    const response = await fetch(
      `${BACKEND_ORIGIN}/customers/${customerId}/subscriptions`,
    );
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
): Promise<NewSubscriptionResponse> => {
  try {
    const response = await fetch(
      `${BACKEND_ORIGIN}/customers/${customerId}/subscription`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriptionData),
      },
    );
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
    const URL = `${BACKEND_ORIGIN}/subscriptions/${subscriptionId}`;
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const response = await fetch(URL, {
      method: "DELETE",
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

export const updateSubscriptionToAddClass = async (
  subscriptionId: number,
  updateSubscriptionData: UpdateSubscriptionToAddClassRequest,
): Promise<UpdateSubscriptionResponse | { errorMessage: string }> => {
  try {
    const URL = `${BACKEND_ORIGIN}/subscriptions/${subscriptionId}/increase-recurring-class`;
    const headers = { "Content-Type": "application/json" };
    const response = await fetch(URL, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updateSubscriptionData),
    });

    if (response.status !== 200) {
      return { errorMessage: ERROR_PAGE_MESSAGE_EN };
    }
    const result: UpdateSubscriptionResponse = await response.json();

    return result;
  } catch (error) {
    console.error("Failed to update subscription:", error);
    throw error;
  }
};

export const updateSubscriptionToTerminateClass = async (
  subscriptionId: number,
  updateSubscriptionData: UpdateSubscriptionToTerminateClassRequest,
): Promise<UpdateSubscriptionResponse | { errorMessage: string }> => {
  try {
    const URL = `${BACKEND_ORIGIN}/subscriptions/${subscriptionId}/decrease-recurring-class`;
    const headers = { "Content-Type": "application/json" };
    const response = await fetch(URL, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updateSubscriptionData),
    });

    if (response.status !== 200) {
      return { errorMessage: ERROR_PAGE_MESSAGE_EN };
    }
    const result: UpdateSubscriptionResponse = await response.json();

    return result;
  } catch (error) {
    console.error("Failed to update subscription:", error);
    throw error;
  }
};
