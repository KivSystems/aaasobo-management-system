import { z } from "zod";
import { SchedulePreview } from "./schedulePreview";

export const SelectTypeUrl = z
  .string()
  .trim()
  .url("Enter a valid HTTP or HTTPS URL")
  .refine(
    (value) => /^https?:\/\//i.test(value),
    "Enter a valid HTTP or HTTPS URL",
  );

// Parameter schemas
export const SubscriptionIdParams = z.object({
  id: z.string().regex(/^\d+$/, "Must be a valid number").transform(Number),
});

// Response schemas
export const SubscriptionResponse = z.object({
  id: z.number().describe("Subscription ID"),
  planId: z.number().describe("Plan ID"),
  customerId: z.number().describe("Customer ID"),
  startAt: z.iso.datetime().describe("Subscription start date"),
  endAt: z.iso.datetime().nullable().describe("Subscription end date"),
  plan: z
    .object({
      id: z.number().describe("Plan ID"),
      name: z.string().describe("Plan name"),
      weeklyClassTimes: z.number().describe("Weekly class times"),
      description: z.string().describe("Plan description"),
      createdAt: z.iso.datetime().describe("Plan creation date"),
      updatedAt: z.iso.datetime().describe("Plan last update date"),
      terminationAt: z.iso
        .datetime()
        .nullable()
        .describe("Plan termination date"),
      englishBackground: z.number().describe("English background requirement"),
    })
    .describe("Associated plan details"),
  customer: z
    .object({
      id: z.number().describe("Customer ID"),
      name: z.string().describe("Customer name"),
      email: z.email().describe("Customer email"),
      prefecture: z.string().describe("Customer prefecture"),
      emailVerified: z.iso
        .datetime()
        .nullable()
        .describe("Email verification date"),
      hasSeenWelcome: z
        .boolean()
        .describe("Whether customer has seen welcome message"),
    })
    .describe("Associated customer details"),
});

// Delete response schemas
export const DeleteSubscriptionResponse = z.object({
  message: z.string(),
  id: z.number(),
});

export const CancelSubscriptionBody = z.object({
  cancellationDate: z.string(),
});

// Update response schemas
export const UpdateSubscriptionResponse = z.object({
  message: z.string(),
  id: z.number(),
});

// Inferred TypeScript types
export type SubscriptionIdParams = z.infer<typeof SubscriptionIdParams>;
export type SubscriptionResponse = z.infer<typeof SubscriptionResponse>;
export type DeleteSubscriptionResponse = z.infer<
  typeof DeleteSubscriptionResponse
>;
export type CancelSubscriptionBody = z.infer<typeof CancelSubscriptionBody>;
export type UpdateSubscriptionResponse = z.infer<
  typeof UpdateSubscriptionResponse
>;

export const SubscriptionDecreaseData = z.object({
  planId: z.number().int().positive(),
  recurringClassIds: z
    .array(z.number().int().positive())
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Recurring class IDs must be unique",
    ),
  selectType: SelectTypeUrl,
});

export const SubscriptionDecreasePreviewRequest = SubscriptionDecreaseData;
export const SubscriptionDecreasePreviewBody = z.object({
  updateSubscriptionData: SubscriptionDecreasePreviewRequest,
});
export const SubscriptionDecreaseBody = z.object({
  updateSubscriptionData: SubscriptionDecreaseData.extend({
    previewToken: z.string().regex(/^[a-f0-9]{64}$/),
  }),
});
export const SubscriptionDecreasePreview = z.object({
  requiredTerminationCount: z.number().int().nonnegative(),
  previewToken: z.string(),
  calendar: SchedulePreview,
  planName: z.string(),
  regularClasses: z.array(
    z.object({
      id: z.number(),
      startAt: z.iso.datetime().nullable(),
      instructorName: z.string(),
    }),
  ),
  rebookedClasses: z.array(
    z.object({
      id: z.number(),
      recurringClassId: z.number(),
      dateTime: z.iso.datetime(),
      instructorName: z.string(),
      childrenNames: z.array(z.string()),
      classCode: z.string(),
    }),
  ),
});
export type SubscriptionDecreaseData = z.infer<typeof SubscriptionDecreaseData>;
export type SubscriptionDecreasePreviewRequest = z.infer<
  typeof SubscriptionDecreasePreviewRequest
>;
export type SubscriptionDecreasePreviewBody = z.infer<
  typeof SubscriptionDecreasePreviewBody
>;
export type SubscriptionDecreaseBody = z.infer<typeof SubscriptionDecreaseBody>;
export type SubscriptionDecreasePreview = z.infer<
  typeof SubscriptionDecreasePreview
>;
