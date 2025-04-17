import {
  FAILED_TO_FETCH_BOOKABLE_CLASSES,
  FAILED_TO_FETCH_CUSTOMER_PROFILE,
  FAILED_TO_FETCH_UPCOMING_CLASSES,
} from "../messages/customerDashboard";
import {
  ACCOUNT_REGISTRATION_FAILURE_MESSAGE,
  CONFIRMATION_EMAIL_SEND_FAILURE,
  CONFIRMATION_EMAIL_SENT,
  EMAIL_ALREADY_REGISTERED_ERROR,
} from "../messages/formValidation";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

export const getCustomerById = async (
  customerId: number,
): Promise<CustomerProfile> => {
  try {
    const response = await fetch(
      `${BACKEND_ORIGIN}/customers/${customerId}/customer`,
      {
        // TODO: Remove this line before production to use cached data
        cache: "no-store",
        next: { tags: ["customer-profile"] },
      },
    );

    if (!response.ok) {
      const { error } = await response.json();

      throw new Error(`HTTP Status: ${response.status} ${error}`);
    }

    const customerData = await response.json();
    return customerData;
  } catch (error) {
    console.error("Failed to fetch the customer profile:", error);
    throw new Error(FAILED_TO_FETCH_CUSTOMER_PROFILE);
  }
};

// PATCH customer data
export const editCustomer = async (
  customerId: number,
  customerName: string,
  customerEmail: string,
  customerPrefecture: string,
) => {
  // Define the data to be sent to the server side.
  const customerURL = `${BACKEND_ORIGIN}/customers/${customerId}`;
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({
    name: customerName,
    email: customerEmail,
    prefecture: customerPrefecture,
  });

  const response = await fetch(customerURL, {
    method: "PATCH",
    headers,
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return data;
};

type Response<E> =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: E;
    };

export const registerCustomer = async (userData: {
  name: string;
  email: string;
  password: string;
  prefecture: string;
}): Promise<RegisterFormState> => {
  try {
    const registerURL = `${BACKEND_ORIGIN}/customers/register`;

    const response = await fetch(registerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (response.status === 409) {
      return { email: EMAIL_ALREADY_REGISTERED_ERROR };
    }

    if (response.status === 503) {
      return { errorMessage: CONFIRMATION_EMAIL_SEND_FAILURE };
    }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return {
      successMessage: CONFIRMATION_EMAIL_SENT,
    };
  } catch (error) {
    console.error("API error while registering customer:", error);
    return {
      errorMessage: ACCOUNT_REGISTRATION_FAILURE_MESSAGE,
    };
  }
};

export const getBookableClasses = async (customerId: number) => {
  try {
    const response = await fetch(
      `${BACKEND_ORIGIN}/customers/${customerId}/bookable-classes`,
      {
        // TODO: Remove this line once "/customers/[id]/classes" revalidation is ensured after every booking or cancellation
        cache: "no-store",
      },
      // { next: { tags: ["bookable-classes"] } },
    );

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch bookable classes:", error);
    throw new Error(FAILED_TO_FETCH_BOOKABLE_CLASSES);
  }
};

export const getUpcomingClasses = async (customerId: number) => {
  try {
    const response = await fetch(
      `${BACKEND_ORIGIN}/customers/${customerId}/upcoming-classes`,
      {
        // TODO: Remove this line once "/customers/[id]/classes" revalidation is ensured after every booking or cancellation
        cache: "no-store",
        next: { tags: ["upcoming-classes"] },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch upcoming classes:", error);
    throw new Error(FAILED_TO_FETCH_UPCOMING_CLASSES);
  }
};
