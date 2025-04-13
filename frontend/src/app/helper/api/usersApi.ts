import {
  CONFIRMATION_EMAIL_RESEND_FAILURE,
  EMAIL_VERIFICATION_FAILED_MESSAGE,
  EMAIL_VERIFICATION_RESENT_NOTICE,
  EMAIL_VERIFICATION_SUCCESS_MESSAGE,
  EMAIL_VERIFICATION_TOKEN_EXPIRED,
  EMAIL_VERIFICATION_UNEXPECTED_ERROR,
  GENERAL_ERROR_MESSAGE,
  LOGIN_FAILED_MESSAGE,
} from "../messages/formValidation";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

export const authenticateUser = async (
  email: string,
  password: string,
  userType: UserType,
): Promise<{ userId: number } | { errorMessage: string }> => {
  const apiUrl = `${BACKEND_ORIGIN}/users/authenticate`;
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({ email, password, userType });

  const statusErrorMessages: Record<number, string> = {
    401: LOGIN_FAILED_MESSAGE,
    503: CONFIRMATION_EMAIL_RESEND_FAILURE,
    403: EMAIL_VERIFICATION_RESENT_NOTICE,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body,
    });

    const errorMessage = statusErrorMessages[response.status];
    if (errorMessage) {
      return { errorMessage };
    }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { userId: data.id };
  } catch (error) {
    console.error("API error while authenticating[logging in] user:", error);
    return { errorMessage: GENERAL_ERROR_MESSAGE };
  }
};

export const verifyUserEmail = async (
  token: string,
  userType: UserType,
): Promise<{ success?: string; error?: string }> => {
  const apiUrl = `${BACKEND_ORIGIN}/users/verify-email`;
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({
    token,
    userType,
  });

  const statusErrorMessages: Record<number, string> = {
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
