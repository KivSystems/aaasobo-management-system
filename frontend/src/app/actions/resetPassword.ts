"use server";

import { updateUserPassword } from "../helper/api/usersApi";
import { resetPasswordFormSchema } from "../schemas/authSchema";

export async function resetPassword(
  prevState: ResetPasswordFormState | undefined,
  formData: FormData,
): Promise<ResetPasswordFormState> {
  const PASSWORD_RESET_REQUEST_ERROR =
    "An error has occurred. Please request the password reset email again using the link below.";
  const GENERAL_ERROR_MESSAGE =
    "An error has occurred. Please try again later.";

  try {
    const token = formData.get("token");
    const userType = formData.get("userType");
    const password = formData.get("password");
    const passwordConfirmation = formData.get("passwordConfirmation");
    const passwordStrength = parseInt(
      formData.get("passwordStrength") as string,
      10,
    );

    const parsedForm = resetPasswordFormSchema.safeParse({
      token,
      userType,
      password,
      passwordConfirmation,
      passwordStrength,
    });

    if (!parsedForm.success) {
      const formattedErrors = parsedForm.error.format();
      console.error("Password reset validation failed:", formattedErrors);

      // TODO: Create extractPasswordResetValidationErrors function in ../helper/util/formValidationUtils.ts
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

    const response = await updateUserPassword(
      parsedForm.data.token,
      parsedForm.data.userType,
      parsedForm.data.password,
    );

    return response;
  } catch (error) {
    console.error("Unexpected error in updateUserPassword:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
}
