import { ZodFormattedError } from "zod";
import { ZodIssue } from "zod";
import {
  GENERAL_ERROR_MESSAGE,
  GENERAL_ERROR_MESSAGE_JA,
  LOGIN_FAILED_MESSAGE,
  PASSWORD_RESET_TOKEN_OR_USER_TYPE_ERROR,
} from "../messages/formValidation";

export function extractRegisterValidationErrors(
  validationErrors: ZodIssue[],
): RegisterFormState {
  const unexpectedError = validationErrors.some(
    (error) =>
      error.path[0] === "userType" || error.path[0] === "passwordStrength",
  );

  if (unexpectedError) {
    return { errorMessage: GENERAL_ERROR_MESSAGE };
  }

  const errors: Record<string, string> = {};
  validationErrors.forEach((err) => {
    if (err.path[0]) {
      errors[err.path[0]] = err.message;
    }
  });
  return errors;
}

export function extractUpdateValidationErrors(
  validationErrors: ZodIssue[],
): UpdateFormState {
  const unexpectedError = validationErrors.some(
    (error) => error.path[0] === "userType",
  );

  if (unexpectedError) {
    return { errorMessage: GENERAL_ERROR_MESSAGE };
  }

  const errors: Record<string, string> = {};
  validationErrors.forEach((err) => {
    if (err.path[0]) {
      errors[err.path[0]] = err.message;
    }
  });
  return errors;
}

export function extractLoginValidationErrors(
  validationErrors: ZodIssue[],
  language: LanguageType,
): {
  errorMessage: string;
} {
  const unexpectedError = validationErrors.some(
    (error) => error.path[0] === "userType",
  );

  if (unexpectedError) {
    return {
      errorMessage:
        language === "ja" ? GENERAL_ERROR_MESSAGE_JA : GENERAL_ERROR_MESSAGE,
    };
  }
  return { errorMessage: LOGIN_FAILED_MESSAGE[language] };
}

export function extractResetRequestValidationErrors(
  formattedErrors: ZodFormattedError<
    {
      email: string;
      userType: "admin" | "customer" | "instructor";
    },
    string
  >,
): ForgotPasswordFormState {
  const errors: ResetPasswordFormState = {};

  if (formattedErrors.email) {
    errors.errorMessage = formattedErrors.email._errors[0];
  }

  if (formattedErrors.userType) {
    errors.errorMessage = GENERAL_ERROR_MESSAGE;
  }

  return errors;
}

export function extractPasswordResetValidationErrors(
  formattedErrors: ZodFormattedError<
    {
      token: string;
      userType: "admin" | "customer" | "instructor";
      password: string;
      passwordConfirmation: string;
      passwordStrength: number;
    },
    string
  >,
): ResetPasswordFormState {
  const errors: ResetPasswordFormState = {};

  if (formattedErrors.token || formattedErrors.userType) {
    errors.errorMessage = PASSWORD_RESET_TOKEN_OR_USER_TYPE_ERROR;
  }

  if (formattedErrors.password) {
    errors.password = formattedErrors.password._errors[0];
  }

  if (formattedErrors.passwordConfirmation) {
    errors.passwordConfirmation =
      formattedErrors.passwordConfirmation._errors[0];
  }

  if (formattedErrors.passwordStrength) {
    errors.errorMessage = GENERAL_ERROR_MESSAGE;
  }

  return errors;
}
