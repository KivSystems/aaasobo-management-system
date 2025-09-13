import { z } from "zod";
import { UserType } from "./common";

export const authenticateSchema = z.object({
  email: z.email(),
  password: z.string().min(1).describe("User's password"),
  userType: UserType,
});

export const sendPasswordResetSchema = z.object({
  email: z.email(),
  userType: UserType,
});

export const verifyResetTokenSchema = z.object({
  token: z.string().min(1).describe("Password reset token"),
  userType: UserType,
});

export const updatePasswordSchema = z.object({
  token: z.string().min(1).describe("Password reset token"),
  userType: UserType,
  password: z.string().min(1).describe("New password"),
});

// Response schemas
export const authenticateResponse = z.object({
  id: z.number().describe("User ID"),
});

// Request types
export type AuthenticateRequest = z.infer<typeof authenticateSchema>;
export type SendPasswordResetRequest = z.infer<typeof sendPasswordResetSchema>;
export type VerifyResetTokenRequest = z.infer<typeof verifyResetTokenSchema>;
export type UpdatePasswordRequest = z.infer<typeof updatePasswordSchema>;

// Response types
export type AuthenticateResponse = z.infer<typeof authenticateResponse>;
