import {
  EMAIL_ALREADY_REGISTERED_ERROR,
  GENERAL_ERROR_MESSAGE,
} from "../utils/messages";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

export const getCustomerById = async (
  customerId: number,
): Promise<Customer> => {
  try {
    const response = await fetch(
      `${BACKEND_ORIGIN}/customers/${customerId}/customer`,
      {
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: { customer: Customer } = await response.json();
    return data.customer;
  } catch (error) {
    console.error("Failed to fetch customer data:", error);
    throw error;
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

    const data = await response.json();

    if (!response.ok) {
      return response.status === 409
        ? { email: data.message || EMAIL_ALREADY_REGISTERED_ERROR }
        : { errorMessage: data.message || GENERAL_ERROR_MESSAGE };
    }

    return {
      successMessage: data.message || "Registration successful!",
    };
  } catch (error) {
    console.error("Error in registerCustomer API call:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};
