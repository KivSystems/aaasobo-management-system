"use server";

import { sendUserResetEmail } from "../helper/api/usersApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/messages/formValidation";
import { extractResetRequestValidationErrors } from "../helper/utils/validationErrorUtils";
import { forgotPasswordFormSchema } from "../schemas/authSchema";

export async function sendResetEmail(
  prevState: ForgotPasswordFormState | undefined,
  formData: FormData,
): Promise<ForgotPasswordFormState> {
  try {
    const email = formData.get("email");
    const userType = formData.get("userType");

    const parsedForm = forgotPasswordFormSchema.safeParse({
      email,
      userType,
    });

    if (!parsedForm.success) {
      const formattedErrors = parsedForm.error.format();
      return extractResetRequestValidationErrors(formattedErrors);
    }

    const response = await sendUserResetEmail(
      parsedForm.data.email,
      parsedForm.data.userType,
    );

    return response;
  } catch (error) {
    console.error("Unexpected error in sendResetEmail server action:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
}
