import {
  CONFIRMATION_EMAIL_RESEND_FAILURE,
  EMAIL_NOT_REGISTERED_MESSAGE,
  EMAIL_VERIFICATION_RESENT_NOTICE,
  GENERAL_ERROR_MESSAGE,
  GENERAL_ERROR_MESSAGE_JA,
  LOGIN_FAILED_MESSAGE,
  PASSWORD_RESET_EMAIL_SEND_FAILURE,
  PASSWORD_RESET_EMAIL_SENT_MESSAGE,
  PASSWORD_RESET_EXPIRED_AND_RESENT,
  PASSWORD_RESET_FAILED_MESSAGE,
  PASSWORD_RESET_RESEND_FAILURE,
  PASSWORD_RESET_SUCCESS_MESSAGE,
  TOKEN_OR_USER_NOT_FOUND_ERROR,
} from "../messages/formValidation";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

export const authenticateUser = async (
  email: string,
  password: string,
  userType: UserType,
  language: LanguageType,
): Promise<{ userId: number } | { errorMessage: string }> => {
  const apiUrl = `${BACKEND_ORIGIN}/users/authenticate`;
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({ email, password, userType });

  const statusErrorMessages: Record<number, string> = {
    401: LOGIN_FAILED_MESSAGE[language],
    503: CONFIRMATION_EMAIL_RESEND_FAILURE[language],
    403: EMAIL_VERIFICATION_RESENT_NOTICE[language],
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
    return {
      errorMessage:
        language === "ja" ? GENERAL_ERROR_MESSAGE_JA : GENERAL_ERROR_MESSAGE,
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
    const statusErrorMessages: Record<number, string> = {
      404: EMAIL_NOT_REGISTERED_MESSAGE,
      503: PASSWORD_RESET_EMAIL_SEND_FAILURE,
    };

    const errorMessage = statusErrorMessages[response.status];
    if (errorMessage) {
      return { errorMessage };
    }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return {
      successMessage: PASSWORD_RESET_EMAIL_SENT_MESSAGE,
    };
  } catch (error) {
    console.error("API error while sending password reset email:", error);
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

    if (response.status === 410) {
      return { errorMessage: PASSWORD_RESET_EXPIRED_AND_RESENT };
    }

    if (response.status === 503) {
      return { unexpectedErrorMessage: PASSWORD_RESET_RESEND_FAILURE };
    }

    if (response.status === 404) {
      return { errorMessage: TOKEN_OR_USER_NOT_FOUND_ERROR };
    }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return {
      successMessage: PASSWORD_RESET_SUCCESS_MESSAGE,
    };
  } catch (error) {
    console.error("API error while updating password:", error);
    return {
      unexpectedErrorMessage: PASSWORD_RESET_FAILED_MESSAGE,
    };
  }
};
