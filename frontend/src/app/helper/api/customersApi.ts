import {
  FAILED_TO_FETCH_CUSTOMER_CLASSES,
  FAILED_TO_FETCH_CUSTOMER_PROFILE,
  FAILED_TO_FETCH_REBOOKABLE_CLASSES,
  FAILED_TO_FETCH_UPCOMING_CLASSES,
} from "../messages/customerDashboard";
import {
  CONFIRMATION_EMAIL_SEND_FAILURE,
  CONFIRMATION_EMAIL_SENT,
  EMAIL_ALREADY_REGISTERED_ERROR,
  GENERAL_ERROR_MESSAGE,
} from "../messages/formValidation";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

export const getCustomerById = async (
  customerId: number,
): Promise<CustomerProfile> => {
  try {
    const customerProfileURL = `${BACKEND_ORIGIN}/customers/${customerId}/customer`;
    const response = await fetch(customerProfileURL, {
      // TODO: Remove this line before production to use cached data
      cache: "no-store",
      next: { tags: ["customer-profile"] },
    });

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
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};

export const getRebookableClasses = async (
  customerId: number,
): Promise<RebookableClass[] | []> => {
  try {
    const rebookableClassesURL = `${BACKEND_ORIGIN}/customers/${customerId}/rebookable-classes`;
    const response = await fetch(rebookableClassesURL, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch rebookable classes:", error);
    throw new Error(FAILED_TO_FETCH_REBOOKABLE_CLASSES);
  }
};

export const getUpcomingClasses = async (customerId: number) => {
  try {
    const upcomingClassesURL = `${BACKEND_ORIGIN}/customers/${customerId}/upcoming-classes`;
    const response = await fetch(upcomingClassesURL, {
      // TODO: Remove this line once "/customers/[id]/classes" revalidation is ensured after every booking or cancellation
      cache: "no-store",
      next: { tags: ["upcoming-classes"] },
    });

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

export const getClasses = async (customerId: number) => {
  try {
    const customerClassesURL = `${BACKEND_ORIGIN}/customers/${customerId}/classes`;
    const response = await fetch(customerClassesURL, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch customer classes:", error);
    throw new Error(FAILED_TO_FETCH_CUSTOMER_CLASSES);
  }
};
