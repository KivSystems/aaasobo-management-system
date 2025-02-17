"use server";

import { AuthError } from "next-auth";
import { signIn } from "../../../auth.config";

export async function authenticate(
  prevState: { message: string; timestamp: number } | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const userType = formData.get("userType") as string;

    await signIn("credentials", {
      email,
      password,
      userType,
      redirectTo: "/redirect",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        message: error.message.startsWith("Unexpected")
          ? "Something went wrong. Please try again later."
          : "Invalid email or password.",
        timestamp: Date.now(),
      };
    }
    throw error;
  }
}
