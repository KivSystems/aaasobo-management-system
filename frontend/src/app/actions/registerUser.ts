"use server";

import { registerCustomer } from "../helper/api/customersApi";
import { customerRegisterSchema } from "../schemas/authSchema";

export async function registerUser(
  prevState: Record<string, string> | undefined,
  formData: FormData,
): Promise<Record<string, string>> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passConfirmation = formData.get("passConfirmation") as string;
  const prefecture = formData.get("prefecture") as string;
  const isAgreed = formData.get("isAgreed") === "on";
  const passwordStrength = parseInt(
    formData.get("passwordStrength") as string,
    10,
  );

  // Validate form using Zod
  // TODO: If this component is used for different user types, the appropriate schema must be used for each based the userType prop.
  const validationResult = customerRegisterSchema.safeParse({
    name,
    email,
    password,
    passConfirmation,
    prefecture,
    isAgreed,
  });

  if (!validationResult.success) {
    const validationErrors: Record<string, string> = {};
    validationResult.error.errors.forEach((err) => {
      if (err.path[0]) {
        validationErrors[err.path[0]] = err.message;
      }
    });
    return validationErrors;
  }

  // Check if the submitted password is strong enough
  if (passwordStrength < 3) {
    return {
      password:
        "Your password is too weak. Try using a longer passphrase or a password manager.",
    };
  }

  try {
    // TODO: If this component handles different user types, the appropriate API function must be called for each based the userType prop.
    const response = await registerCustomer({
      name,
      email,
      password,
      prefecture,
    });

    if (response.status === 409) {
      return {
        email: response.message,
      };
    }

    const successMessage = response.message || "Registration successful!";
    return {
      success: successMessage,
    };
  } catch (error) {
    return {
      unexpectedError:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    };
  }
}
