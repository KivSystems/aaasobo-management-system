import { ZodFormattedError } from "zod";
import {
  GENERAL_ERROR_MESSAGE,
  PASSWORD_RESET_REQUEST_ERROR,
} from "./messages";

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
