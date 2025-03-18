import { ZodIssue } from "zod";
import { GENERAL_ERROR_MESSAGE } from "../messages/formValidation";

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
