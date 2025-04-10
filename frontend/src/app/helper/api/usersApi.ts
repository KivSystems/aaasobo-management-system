import {
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

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      return response.status === 401
        ? { errorMessage: data.message || LOGIN_FAILED_MESSAGE }
        : { errorMessage: data.message || GENERAL_ERROR_MESSAGE };
    }

    return { userId: data.userId };
  } catch (error) {
    console.error("Error during authentication:", error);
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

  try {
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        `Failed to fetch user. Status: ${response.status}, Message: ${errorData.error}`,
      );
      return {
        error: errorData.error || "An error occurred.",
      };
    }

    const successData = await response.json();
    return { success: successData.success || "Success" };
  } catch (error) {
    console.error("Network or unexpected error:", error);
    return {
      error: "Network error occurred.",
    };
  }
};
