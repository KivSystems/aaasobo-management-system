"use server";

import { updateUserPassword } from "../helper/api/usersApi";
import { UNEXPECTED_ERROR_MESSAGE } from "../helper/messages/formValidation";
import { extractPasswordResetValidationErrors } from "../helper/utils/validationErrorUtils";
import {
  resetPasswordFormSchema,
  resetPasswordFormSchemaJa,
} from "../schemas/authSchema";

export async function resetPassword(
  prevState: StringMessages | undefined,
  formData: FormData,
): Promise<StringMessages> {
  const token = formData.get("token");
  const userType = formData.get("userType");
  const password = formData.get("password");
  const passConfirmation = formData.get("passConfirmation");
  const passwordStrength = parseInt(
    formData.get("passwordStrength") as string,
    10,
  );
  const language = formData.get("language") as LanguageType;

  try {
    const schema =
      language === "ja" ? resetPasswordFormSchemaJa : resetPasswordFormSchema;

    const parsedForm = schema.safeParse({
      token,
      userType,
      password,
      passConfirmation,
      passwordStrength,
    });

    if (!parsedForm.success) {
      const formattedErrors = parsedForm.error.format();
      return extractPasswordResetValidationErrors(formattedErrors, language);
    }

    const response = await updateUserPassword(
      parsedForm.data.token,
      parsedForm.data.userType,
      parsedForm.data.password,
      language,
    );

    return response;
  } catch (error) {
    console.error("Unexpected error in updateUserPassword action:", error);
    return {
      errorMessage: UNEXPECTED_ERROR_MESSAGE[language],
    };
  }
}
