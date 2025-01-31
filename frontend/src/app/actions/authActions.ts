"use server";

import { AuthError } from "next-auth";
import { signIn } from "../../../auth.config";
import { z } from "zod";
import { authenticateUser } from "../helper/api/usersApi";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const userType = formData.get("userType") as UserType;

    // TODO: Uncomment the following password validation after revising the user registration code.
    // Validate the types of credentials (email and password)
    // const credentialsSchema = z.object({
    //   email: z.string().email(),
    //   password: z
    //     .string()
    //     .min(8, "Password must be at least 8 characters")
    //     .max(12, "Password must be at most 12 characters")
    //     .regex(/[a-z]/, "Password must include a lowercase letter")
    //     .regex(/[A-Z]/, "Password must include an uppercase letter")
    //     .regex(/\d/, "Password must include a number")
    //     .regex(
    //       /[!@#$%^&*]/,
    //       "Password must include a special character (!@#$%^&*)",
    //     ),
    // });

    // const parsedCredentials = credentialsSchema.safeParse({ email, password });

    // if (!parsedCredentials.success) {
    //   console.error(
    //     "Invalid credentials received:",
    //     parsedCredentials.error.format(),
    //   );
    //   return "Invalid email or password";
    // }

    // Validate the type of userType
    const userTypeSchema = z.enum(["admin", "customer", "instructor"]);
    const parsedUserType = userTypeSchema.safeParse(userType);

    if (!parsedUserType.success) {
      console.error("Invalid userType received:", userType);
      return "Something went wrong. Please try again later.";
    }

    // Authenticate the user with backend
    const result = await authenticateUser(email, password, userType);
    if (!result.success) {
      return result.message;
    }

    const userId = result.userId ? String(result.userId) : undefined;
    const redirectUrls: Record<string, string> = {
      customer: `/customers/${userId}/classes`,
      instructor: `/instructors/${userId}/class-schedule`,
    };

    const redirectUrl = redirectUrls[userType];
    if (!userId || !redirectUrl) {
      return "Authentication failed. Please try again later.";
    }

    // Sign in with NextAuth
    await signIn("credentials", {
      userId,
      userType,
      redirectTo: redirectUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Something went wrong during login. Please try again later.";
    }
    if ((error as Error)?.message?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return "Something went wrong. Please try again later.";
  }
}
