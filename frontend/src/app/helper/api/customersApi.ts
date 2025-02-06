const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

export const getCustomerById = async (customerId: number) => {
  try {
    const response = await fetch(
      `${BACKEND_ORIGIN}/customers/${customerId}/customer`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
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

export const logoutCustomer = async (): Promise<Response<string>> => {
  const response = await fetch(`${BACKEND_ORIGIN}/customers/logout`, {
    method: "POST",
    credentials: "include",
  });
  return response.ok
    ? { ok: true }
    : { ok: false, error: (await response.json()).message };
};

export const registerCustomer = async (userData: {
  name: string;
  email: string;
  password: string;
  prefecture: string;
}) => {
  try {
    const registerURL = `${BACKEND_ORIGIN}/customers/register`;

    const response = await fetch(registerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        status: response.status,
        message: data.message || "Something went wrong",
      };
    }

    return { status: response.status, ...data };
  } catch (error) {
    return { status: 500, message: "An unexpected error occurred." };
  }
};
