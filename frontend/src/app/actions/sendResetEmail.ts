"use server";

import { sendUserResetEmail } from "@/lib/api/usersApi";
import {
  GENERAL_ERROR_MESSAGE,
  UNEXPECTED_ERROR_MESSAGE,
} from "@/lib/messages/formValidation";
import { extractResetRequestValidationErrors } from "@/lib/utils/validationErrorUtils";
import {
  forgotPasswordFormSchema,
  forgotPasswordFormSchemaJa,
} from "@/schemas/authSchema";
export async function sendResetEmail(
  prevState: ForgotPasswordFormState | undefined,
  formData: FormData,
): Promise<ForgotPasswordFormState> {
  const email = formData.get("email");
  const userType = formData.get("userType");
  const language = formData.get("language") as LanguageType;

  try {
    const schema =
      language === "ja" ? forgotPasswordFormSchemaJa : forgotPasswordFormSchema;

    const parsedForm = schema.safeParse({
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
      language,
    );

    return response;
  } catch (error) {
    console.error("Unexpected error in sendResetEmail server action:", error);
    return {
      errorMessage: UNEXPECTED_ERROR_MESSAGE[language],
    };
  }
}
