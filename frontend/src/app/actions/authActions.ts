"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "../../../auth.config";
import { userLoginSchema } from "../schemas/authSchema";
import { extractLoginValidationErrors } from "../helper/utils/validationErrorUtils";
import { authenticateUser } from "../helper/api/usersApi";
import { UNEXPECTED_ERROR_MESSAGE } from "../helper/messages/formValidation";

export async function authenticate(
  prevState: { errorMessage: string } | undefined,
  formData: FormData,
): Promise<{ errorMessage: string } | undefined> {
  const email = formData.get("email");
  const password = formData.get("password");
  const userType = formData.get("userType");
  const language = formData.get("language") as LanguageType;

  try {
    const parsedForm = userLoginSchema.safeParse({
      email,
      password,
      userType,
    });

    if (!parsedForm.success) {
      const validationErrors = parsedForm.error.issues;
      return extractLoginValidationErrors(validationErrors, language);
    }

    const response = await authenticateUser(
      parsedForm.data.email,
      parsedForm.data.password,
      parsedForm.data.userType,
      language,
    );

    if ("errorMessage" in response) {
      return response;
    }

    const userId = response.userId;

    let redirectUrl = "";
    switch (parsedForm.data.userType) {
      case "admin":
        redirectUrl = `/admins/${userId}/calendar`;
        break;
      case "customer":
        redirectUrl = `/customers/${userId}/classes`;
        break;
      case "instructor":
        redirectUrl = `/instructors/${userId}/class-schedule`;
        break;
    }

    await signIn("credentials", {
      userId,
      userType: parsedForm.data.userType,
      redirectTo: redirectUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("Error in authenticate server action:", error);
      return {
        errorMessage: UNEXPECTED_ERROR_MESSAGE[language],
      };
    }
    // Re-throw non-auth errors so that Next.js can handle redirects properly.
    throw error;
  }
}

export async function logout(userType: UserType) {
  await signOut({ redirectTo: `/${userType}s/login` });
}
