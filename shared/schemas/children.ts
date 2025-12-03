import { z } from "zod";

export const ChildIdParams = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Child ID must be a valid number")
    .transform((val) => parseInt(val, 10)),
});

export const GetChildrenQuery = z.object({
  customerId: z.string().regex(/^\d+$/, "Customer ID must be a valid number"),
});

export const RegisterChildRequest = z.object({
  name: z.string().min(1, "Name is required"),
  birthdate: z.string().min(1, "Birthdate is required"),
  personalInfo: z.string().min(1, "Personal info is required"),
  customerId: z
    .number()
    .int()
    .positive("Customer ID must be a positive integer"),
});

export const UpdateChildRequest = z.object({
  name: z.string().min(1, "Name is required"),
  birthdate: z.string().min(1, "Birthdate is required"),
  personalInfo: z.string().min(1, "Personal info is required"),
  customerId: z
    .number()
    .int()
    .positive("Customer ID must be a positive integer"),
});

// Response schemas - matches frontend Child type
export const ChildProfile = z
  .object({
    id: z.number(),
    name: z.string(),
    birthdate: z.string(),
    // birthdate: z.string().nullish(), // Handle both null and undefined
    personalInfo: z.string().nullish(),
    customerId: z.number().optional(),
  })
  .passthrough(); // Allow additional properties from database

export const ChildrenResponse = z.object({
  children: z.array(ChildProfile),
});

export const UpdateChildResponse = z.object({
  message: z.union([z.literal("updated"), z.literal("no_change")]),
});

export const DeleteChildResponse = z.object({
  message: z.literal("deleted"),
});

// Error responses for business logic
export const DeleteChildConflictResponse = z.object({
  message: z.union([
    z.literal("has_completed_class"),
    z.literal("has_booked_class"),
  ]),
});

// Export inferred types
export type ChildIdParams = z.infer<typeof ChildIdParams>;
export type GetChildrenQuery = z.infer<typeof GetChildrenQuery>;
export type RegisterChildRequest = z.infer<typeof RegisterChildRequest>;
export type UpdateChildRequest = z.infer<typeof UpdateChildRequest>;

export type ChildProfile = z.infer<typeof ChildProfile>;
export type ChildrenResponse = z.infer<typeof ChildrenResponse>;
export type UpdateChildResponse = z.infer<typeof UpdateChildResponse>;
export type DeleteChildResponse = z.infer<typeof DeleteChildResponse>;
export type DeleteChildConflictResponse = z.infer<
  typeof DeleteChildConflictResponse
>;
