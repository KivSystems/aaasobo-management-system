import { ZodFormattedError } from "zod";
import { ZodIssue } from "zod";
import {
  GENERAL_ERROR_MESSAGE,
  LOGIN_FAILED_MESSAGE,
  PASSWORD_RESET_TOKEN_OR_USER_TYPE_ERROR,
  PASSWORD_SECURITY_CHECK_FAILED_MESSAGE,
  UNEXPECTED_ERROR_MESSAGE,
} from "../messages/formValidation";

export function extractRegisterValidationErrors(
  validationErrors: ZodIssue[],
  language?: LanguageType,
): RegisterFormState {
  const unexpectedError = validationErrors.some(
    (error) =>
      error.path[0] === "userType" || error.path[0] === "passwordStrength",
  );

  if (unexpectedError) {
    return {
      errorMessage: UNEXPECTED_ERROR_MESSAGE[language ?? "en"],
    };
  }

  const errors: Record<string, string> = {};
  validationErrors.forEach((err) => {
    if (err.path[0]) {
      errors[String(err.path[0])] = err.message;
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
      errors[String(err.path[0])] = err.message;
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
      errorMessage: UNEXPECTED_ERROR_MESSAGE[language],
    };
  }
  return { errorMessage: LOGIN_FAILED_MESSAGE[language] };
}

export function extractResetRequestValidationErrors(
  formattedErrors: ZodFormattedError<
    {
      email: string;
      userType: UserType;
    },
    string
  >,
): StringMessages {
  const errors: StringMessages = {};

  if (formattedErrors.email) {
    errors.errorMessage = formattedErrors.email._errors[0];
  }

  if (formattedErrors.userType) {
    errors.errorMessage = formattedErrors.userType._errors[0];
  }

  return errors;
}

export function extractPasswordResetValidationErrors(
  formattedErrors: ZodFormattedError<
    {
      token: string;
      userType: UserType;
      password: string;
      passConfirmation: string;
      passwordStrength: number;
    },
    string
  >,
  language: LanguageType,
): StringMessages {
  const errors: StringMessages = {};

  if (formattedErrors.token || formattedErrors.userType) {
    errors.errorMessage = PASSWORD_RESET_TOKEN_OR_USER_TYPE_ERROR[language];
  }

  if (formattedErrors.password) {
    errors.password = formattedErrors.password._errors[0];
  }

  if (formattedErrors.passConfirmation) {
    errors.passConfirmation = formattedErrors.passConfirmation._errors[0];
  }

  if (formattedErrors.passwordStrength) {
    errors.errorMessage = PASSWORD_SECURITY_CHECK_FAILED_MESSAGE[language];
  }

  return errors;
}

export function extractProfileUpdateErrors(
  validationErrors: ZodIssue[],
): LocalizedMessages {
  const errors: LocalizedMessages = {};
  validationErrors.forEach((err) => {
    if (err.path[0]) {
      const [messageJa, messageEn] = err.message.split(" / ");
      const errorMessage = { ja: messageJa, en: messageEn };
      errors[String(err.path[0])] = errorMessage;
    }
  });
  return errors;
}
