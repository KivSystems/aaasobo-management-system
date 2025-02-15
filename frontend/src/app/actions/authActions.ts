"use server";

import { AuthError } from "next-auth";
import { signIn } from "../../../auth.config";
import { authenticateUser } from "../helper/api/usersApi";
import { userLoginSchema, userTypeSchema } from "../schemas/authSchema";

export async function authenticate(
  prevState: { message: string; timestamp: number } | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const userType = formData.get("userType") as UserType;

    // Validate email and password format
    const parsedCredentials = userLoginSchema.safeParse({ email, password });
    if (!parsedCredentials.success) {
      console.error("Invalid credentials received:");
      return { message: "Invalid email or password", timestamp: Date.now() };
    }

    // Validate userType format
    const parsedUserType = userTypeSchema.safeParse(userType);
    if (!parsedUserType.success) {
      console.error("Invalid userType received:", userType);
      return {
        message: "Something went wrong. Please try again later.",
        timestamp: Date.now(),
      };
    }

    // Authenticate the user with backend
    const result = await authenticateUser(email, password, userType);
    if (!result.success) {
      return { message: result.message, timestamp: Date.now() };
    }

    const userId = result.userId ? String(result.userId) : undefined;
    const redirectUrls: Record<string, string> = {
      customer: `/customers/${userId}/classes`,
      instructor: `/instructors/${userId}/class-schedule`,
    };
    const redirectUrl = redirectUrls[userType];
    if (!userId || !redirectUrl) {
      return {
        message: "Authentication failed. Please try again later.",
        timestamp: Date.now(),
      };
    }

    // Sign in with NextAuth
    await signIn("credentials", {
      userId,
      userType,
      redirectTo: redirectUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        message: "Something went wrong during login. Please try again later.",
        timestamp: Date.now(),
      };
    }
    if ((error as Error)?.message?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      message: "Something went wrong. Please try again later.",
      timestamp: Date.now(),
    };
  }
}
