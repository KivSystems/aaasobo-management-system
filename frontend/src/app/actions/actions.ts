"use server";

import { registerCustomer } from "../helper/api/customersApi";
import { customerRegisterSchema } from "../schemas/customerRegisterSchema";

export async function customerRegisterHandler(
  prevState: any,
  formData: FormData,
) {
  const name = (formData.get("name") as string) || "";
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";
  const passConfirmation = (formData.get("passConfirmation") as string) || "";
  const prefecture = (formData.get("prefecture") as string) || "";
  const isAgreed = formData.get("isAgreed") === "true";

  // Validate input using Zod
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

    return { validationErrors };
  }

  try {
    const response = await registerCustomer({
      name,
      email,
      password,
      prefecture,
    });

    if (response.status === 409) {
      return { emailConflict: response.message };
    }

    return {
      redirectUrl: "/customers/login",
      successMessage: response.message || "Registration successful!",
    };
  } catch (error) {
    return { error: "An unexpected error occurred. Please try again later." };
  }
}
