"use server";

import { registerCustomer } from "../helper/api/customersApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/utils/messages";
import { extractRegisterValidationErrors } from "../helper/utils/validationErrorUtils";
import { customerRegisterSchema } from "../schemas/authSchema";

export async function registerUser(
  prevState: RegisterFormState | undefined,
  formData: FormData,
): Promise<RegisterFormState> {
  try {
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const passConfirmation = formData.get("passConfirmation");
    const prefecture = formData.get("prefecture");
    const isAgreed = formData.get("isAgreed") === "on";
    const passwordStrength = parseInt(
      formData.get("passwordStrength") as string,
      10,
    );
    const userType = formData.get("userType");

    // TODO: If this component is used for different user types, the appropriate schema must be used for each based on the userType.
    const parsedForm = customerRegisterSchema.safeParse({
      name,
      email,
      password,
      passConfirmation,
      passwordStrength,
      prefecture,
      isAgreed,
      userType,
    });

    if (!parsedForm.success) {
      const validationErrors = parsedForm.error.errors;
      return extractRegisterValidationErrors(validationErrors);
    }

    // TODO: If this component handles different user types, the appropriate API function must be called for each based on the userType.
    const response = await registerCustomer({
      name: parsedForm.data.name,
      email: parsedForm.data.email,
      password: parsedForm.data.password,
      prefecture: parsedForm.data.prefecture,
    });

    return response;
  } catch (error) {
    console.error("Unexpected error in registerCustomer server action:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
}
