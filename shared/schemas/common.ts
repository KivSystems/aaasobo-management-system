import { z } from "zod";

// Common user type enum used across multiple routers
export const UserType = z
  .enum(["admin", "customer", "instructor"])
  .describe("Type of user account");

// TypeScript type inferred from the schema
export type UserType = z.infer<typeof UserType>;

// Standard error response used across all API endpoints
export const ErrorResponse = z.object({
  error: z.string().describe("Error message"),
});
