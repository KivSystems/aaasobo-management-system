"use server";

import { CredentialsSignin } from "next-auth";
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
    if (error instanceof CredentialsSignin) {
      // Remove unnecessary URL from the error message
      const cleanedMessage = error.message.split(". Read more at ")[0];
      return {
        message: cleanedMessage,
        timestamp: Date.now(),
      };
    }
    throw error;
  }
}
