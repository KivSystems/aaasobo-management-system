"use server";

import { sendUserResetEmail } from "../helper/api/usersApi";
import { emailSchema, userTypeSchema } from "../schemas/authSchema";

export async function sendResetEmail(
  prevState: { success: boolean; message: string } | undefined,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    const email = formData.get("email");
    const userType = formData.get("userType");

    // Validate email using Zod
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      console.error("Email validation failed:", parsedEmail.error.format());
      return { success: false, message: parsedEmail.error.errors[0].message };
    }

    // Validate userType using Zod
    const parsedUserType = userTypeSchema.safeParse(userType);
    if (!parsedUserType.success) {
      console.error("User type validation failed:", parsedUserType.error);
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      };
    }

    const response = await sendUserResetEmail(
      parsedEmail.data,
      parsedUserType.data,
    );

    return response;
  } catch (error) {
    console.error("Unexpected error in sendResetEmail:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}
