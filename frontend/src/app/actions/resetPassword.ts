"use server";

import { updateUserPassword } from "../helper/api/usersApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/utils/messages";
import { extractPasswordResetValidationErrors } from "../helper/utils/validationErrorUtils";
import { resetPasswordFormSchema } from "../schemas/authSchema";

export async function resetPassword(
  prevState: ResetPasswordFormState | undefined,
  formData: FormData,
): Promise<ResetPasswordFormState> {
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

      return extractPasswordResetValidationErrors(formattedErrors);
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
