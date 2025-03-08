import {
  GENERAL_ERROR_MESSAGE,
  PASSWORD_RESET_REQUEST_ERROR,
} from "../utils/messages";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

export const authenticateUser = async (
  email: string,
  password: string,
  userType: UserType,
) => {
  const apiUrl = `${BACKEND_ORIGIN}/users/authenticate`;
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({ email, password, userType });

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      try {
        const errorDetails = await response.json();
        console.error(
          `Authentication failed: ${response.status} - ${errorDetails.message}`,
        );
        return {
          success: false,
          message:
            errorDetails.message ||
            "Unable to sign in. Please check your details and try again.",
        };
      } catch {
        console.error("Error parsing error response from server.");
        return {
          success: false,
          message: "Something went wrong. Please try again later.",
        };
      }
    }

    const data: { id?: number } = await response.json();

    if (!data.id || typeof data.id !== "number") {
      console.error("Unexpected API response:", data);
      return {
        success: false,
        message:
          "We're experiencing some issues. Please try again in a moment.",
      };
    }

    return { success: true, userId: data.id };
  } catch (error) {
    console.error("Error during authentication:", error);
    return { success: false, message: "An unexpected error occurred." };
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

export const sendUserResetEmail = async (
  email: string,
  userType: UserType,
): Promise<ForgotPasswordFormState> => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/users/send-password-reset`;
    const response = await fetch(apiURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, userType }),
    });

    const data = await response.json();

    if (!response.ok) {
      return response.status === 404
        ? { errorMessage: data.message || "The email address does not exist." }
        : {
            errorMessage: data.message || GENERAL_ERROR_MESSAGE,
          };
    }

    return {
      successMessage: data.message || "Password reset email sent successfully.",
    };
  } catch (error) {
    console.error("Error in sendUserResetEmail API call:", error);

    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};

export const updateUserPassword = async (
  token: string,
  userType: UserType,
  password: string,
): Promise<ResetPasswordFormState> => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/users/update-password`;
    const response = await fetch(apiURL, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userType, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return response.status === 500
        ? { errorMessage: data.message || GENERAL_ERROR_MESSAGE }
        : {
            queryError:
              `${data.message} Please request the password reset email again using the link below.` ||
              PASSWORD_RESET_REQUEST_ERROR,
          };
    }

    return {
      successMessage: data.message || "Password was updated successfully.",
    };
  } catch (error) {
    console.error("Error in updateUserPassword API call:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};
