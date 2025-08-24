import { z } from "zod";

// Common user type enum used across multiple routers
export const UserType = z
  .enum(["admin", "customer", "instructor"])
  .describe("Type of user account");

// Standard error response used across all API endpoints
export const ErrorResponse = z.object({
  error: z.string().describe("Error message"),
});
