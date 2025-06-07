import {
  FAILED_TO_FETCH_CUSTOMER_CLASSES,
  FAILED_TO_FETCH_CUSTOMER_PROFILE,
  FAILED_TO_FETCH_REBOOKABLE_CLASSES,
  FAILED_TO_FETCH_UPCOMING_CLASSES,
  PROFILE_UPDATE_EMAIL_VERIFICATION_FAILED_MESSAGE,
  PROFILE_UPDATE_FAILED_MESSAGE,
  PROFILE_UPDATE_SUCCESS_MESSAGE,
  PROFILE_UPDATED_VERIFICATION_EMAIL_SENT,
} from "../messages/customerDashboard";
import {
  CONFIRMATION_EMAIL_SEND_FAILURE,
  CONFIRMATION_EMAIL_SENT,
  EMAIL_ALREADY_REGISTERED_ERROR,
  EMAIL_VERIFICATION_FAILED_MESSAGE,
  EMAIL_VERIFICATION_SUCCESS_MESSAGE,
  EMAIL_VERIFICATION_TOKEN_EXPIRED,
  EMAIL_VERIFICATION_UNEXPECTED_ERROR,
  UNEXPECTED_ERROR_MESSAGE,
} from "../messages/formValidation";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

export const getCustomerById = async (
  customerId: number,
): Promise<CustomerProfile> => {
  try {
    const customerProfileURL = `${BACKEND_ORIGIN}/customers/${customerId}/customer`;
    const response = await fetch(customerProfileURL, {
      cache: "no-store",
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

export const updateCustomerProfile = async (
  id: number,
  name: string,
  email: string,
  prefecture: string,
  language: LanguageType,
): Promise<UpdateFormState> => {
  const customerURL = `${BACKEND_ORIGIN}/customers/${id}`;
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({
    name,
    email,
    prefecture,
  });

  try {
    const response = await fetch(customerURL, {
      method: "PATCH",
      headers,
      body,
    });

    if (response.status === 409) {
      return { email: EMAIL_ALREADY_REGISTERED_ERROR[language] };
    }

    if (response.status === 503) {
      return {
        errorMessage:
          PROFILE_UPDATE_EMAIL_VERIFICATION_FAILED_MESSAGE[language],
      };
    }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.isEmailUpdated) {
      return {
        successMessage: PROFILE_UPDATED_VERIFICATION_EMAIL_SENT[language],
      };
    }

    return {
      successMessage: PROFILE_UPDATE_SUCCESS_MESSAGE[language],
    };
  } catch (error) {
    console.error("API error while updating customer profile:", error);
    return {
      errorMessage: PROFILE_UPDATE_FAILED_MESSAGE[language],
    };
  }
};

type Response<E> =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: E;
    };

export const registerCustomer = async (
  userData: {
    name: string;
    email: string;
    password: string;
    prefecture: string;
  },
  language: LanguageType,
): Promise<RegisterFormState> => {
  try {
    const registerURL = `${BACKEND_ORIGIN}/customers/register`;
    const response = await fetch(registerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (response.status === 409) {
      return { email: EMAIL_ALREADY_REGISTERED_ERROR[language] };
    }

    if (response.status === 503) {
      return { errorMessage: CONFIRMATION_EMAIL_SEND_FAILURE[language] };
    }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return {
      successMessage: CONFIRMATION_EMAIL_SENT[language],
    };
  } catch (error) {
    console.error("API error while registering customer:", error);
    return {
      errorMessage: UNEXPECTED_ERROR_MESSAGE[language],
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

export const verifyCustomerEmail = async (
  token: string,
): Promise<{
  success?: { ja: string; en: string };
  error?: { ja: string; en: string };
}> => {
  const apiUrl = `${BACKEND_ORIGIN}/customers/verify-email`;
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({
    token,
  });

  const statusErrorMessages: Record<number, { ja: string; en: string }> = {
    400: EMAIL_VERIFICATION_FAILED_MESSAGE,
    404: EMAIL_VERIFICATION_FAILED_MESSAGE,
    410: EMAIL_VERIFICATION_TOKEN_EXPIRED,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers,
      body,
    });

    const errorMessage = statusErrorMessages[response.status];
    if (errorMessage) {
      return { error: errorMessage };
    }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return { success: EMAIL_VERIFICATION_SUCCESS_MESSAGE };
  } catch (error) {
    console.error("API error while verifying user email:", error);
    return {
      error: EMAIL_VERIFICATION_UNEXPECTED_ERROR,
    };
  }
};
