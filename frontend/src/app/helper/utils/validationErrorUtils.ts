import { ZodFormattedError } from "zod";
import { PASSWORD_RESET_REQUEST_ERROR } from "./messages";
import { ZodIssue } from "zod";
import {
  GENERAL_ERROR_MESSAGE,
  LOGIN_FAILED_MESSAGE,
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

export function extractLoginValidationErrors(validationErrors: ZodIssue[]): {
  errorMessage: string;
} {
  const unexpectedError = validationErrors.some(
    (error) => error.path[0] === "userType",
  );

  if (unexpectedError) {
    return { errorMessage: GENERAL_ERROR_MESSAGE };
  }
  return { errorMessage: LOGIN_FAILED_MESSAGE };
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
    errors.queryError = PASSWORD_RESET_REQUEST_ERROR;
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
