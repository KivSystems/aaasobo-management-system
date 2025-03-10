"use server";

import { AuthError } from "next-auth";
import { signIn } from "../../../auth.config";
import { userLoginSchema } from "../schemas/authSchema";
import { extractLoginValidationErrors } from "../helper/utils/validationErrorUtils";
import { authenticateUser } from "../helper/api/usersApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/utils/messages";

export async function authenticate(
  prevState: { errorMessage: string } | undefined,
  formData: FormData,
): Promise<{ errorMessage: string } | undefined> {
  try {
    const email = formData.get("email");
    const password = formData.get("password");
    const userType = formData.get("userType");

    const parsedForm = userLoginSchema.safeParse({
      email,
      password,
      userType,
    });

    if (!parsedForm.success) {
      const validationErrors = parsedForm.error.errors;
      console.error("User login validation failed:", validationErrors);
      return extractLoginValidationErrors(validationErrors);
    }

    const response = await authenticateUser(
      parsedForm.data.email,
      parsedForm.data.password,
      parsedForm.data.userType,
    );

    if ("errorMessage" in response) {
      return response;
    }

    const userId = response.userId;

    const redirectUrl =
      parsedForm.data.userType === "customer"
        ? `/customers/${userId}/classes`
        : `/instructors/${userId}/class-schedule`;

    await signIn("credentials", {
      userId,
      userType: parsedForm.data.userType,
      redirectTo: redirectUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("Error in authenticate server action:", error);
      return {
        errorMessage: GENERAL_ERROR_MESSAGE,
      };
    }
    // Re-throw non-auth errors so that Next.js can handle redirects properly.
    throw error;
  }
}
