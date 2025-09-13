import { z } from "zod";

// Parameter schemas
export const InstructorIdParams = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a valid number").transform(Number),
});

export const ClassIdParams = z.object({
  id: z.string().regex(/^\d+$/, "Class ID must be a valid number").transform(Number),
});

// Instructor profile schema for public profiles endpoint
export const InstructorProfile = z.object({
  id: z.number().int().positive().describe("Instructor ID"),
  name: z.string().min(1).describe("Instructor full name"),
  nickname: z.string().min(1).describe("Instructor nickname"),
  icon: z.string().describe("Instructor profile icon URL from database"),
  introductionURL: z.string().describe("Instructor introduction video URL"),
});

export const InstructorProfilesResponse = z
  .array(InstructorProfile)
  .describe("Array of instructor profiles");

// Detailed instructor profile schema for admin/authenticated users
export const DetailedInstructorProfile = z.object({
  id: z.number().int().positive().describe("Instructor ID"),
  name: z.string().min(1).describe("Instructor full name"),
  nickname: z.string().min(1).describe("Instructor nickname"),
  icon: z.object({
    url: z.string().describe("Validated instructor icon URL")
  }).describe("Instructor profile icon object"),
  birthdate: z.string().datetime().nullable().describe("Instructor birthdate"),
  lifeHistory: z.string().nullable().describe("Instructor life history"),
  favoriteFood: z.string().nullable().describe("Instructor favorite food"),
  hobby: z.string().nullable().describe("Instructor hobby"),
  messageForChildren: z.string().nullable().describe("Message for children"),
  workingTime: z.string().nullable().describe("Working time information"),
  skill: z.string().nullable().describe("Instructor skills"),
  createdAt: z.string().datetime().describe("Created timestamp"),
  terminationAt: z.string().datetime().nullable().describe("Termination timestamp (ISO string)"),
});

export const AllInstructorProfilesResponse = z.object({
  instructorProfiles: z.array(DetailedInstructorProfile),
}).describe("Detailed instructor profiles for authenticated users");

// Complete instructor schema for individual instructor endpoint
export const CompleteInstructor = z.object({
  id: z.number().int().positive().describe("Instructor ID"),
  name: z.string().min(1).describe("Instructor full name"),
  nickname: z.string().min(1).describe("Instructor nickname"),
  email: z.string().email().describe("Instructor email address"),
  icon: z.object({
    url: z.string().describe("Validated instructor icon URL")
  }).describe("Instructor profile icon object"),
  birthdate: z.string().datetime().nullable().describe("Instructor birthdate"),
  lifeHistory: z.string().nullable().describe("Instructor life history"),
  favoriteFood: z.string().nullable().describe("Instructor favorite food"),
  hobby: z.string().nullable().describe("Instructor hobby"),
  messageForChildren: z.string().nullable().describe("Message for children"),
  workingTime: z.string().nullable().describe("Working time information"),
  skill: z.string().nullable().describe("Instructor skills"),
  classURL: z.string().nullable().describe("Class meeting URL"),
  meetingId: z.string().nullable().describe("Meeting ID"),
  passcode: z.string().nullable().describe("Meeting passcode"),
  introductionURL: z.string().nullable().describe("Introduction video URL"),
  terminationAt: z.string().nullable().describe("Termination timestamp (JST)"),
});

export const InstructorResponse = z.object({
  instructor: CompleteInstructor,
}).describe("Individual instructor details");

// Simple instructor profile schema for /:id/profile endpoint
export const SimpleInstructorProfile = z.object({
  id: z.number().int().positive().describe("Instructor ID"),
  name: z.string().min(1).describe("Instructor full name"),
  nickname: z.string().min(1).describe("Instructor nickname"),
  createdAt: z.string().datetime().describe("Created timestamp"),
}).describe("Simple instructor profile information");

// Instructor schedule schema
export const InstructorSchedule = z.object({
  id: z.number().int().positive().describe("Schedule ID"),
  instructorId: z.number().int().positive().describe("Instructor ID"),
  effectiveFrom: z.string().datetime().describe("Effective from date"),
  effectiveTo: z.string().datetime().nullable().describe("Effective to date"),
  timezone: z.string().describe("Timezone"),
}).describe("Instructor schedule information");

export const InstructorSchedulesResponse = z.object({
  message: z.string().describe("Success message"),
  data: z.array(InstructorSchedule).describe("Array of instructor schedules"),
}).describe("Instructor schedules response");

// Class to instructor mapping response
export const ClassInstructorResponse = z.object({
  instructorId: z.number().int().positive().describe("Instructor ID for the class"),
}).describe("Class to instructor mapping");

// Available slots schemas
export const AvailableSlotsQuery = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format").describe("Start date for slot search"),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format").describe("End date for slot search"),
  timezone: z.literal("Asia/Tokyo").describe("Timezone (currently only Asia/Tokyo is supported)"),
}).refine(
  (data) => new Date(data.start) < new Date(data.end),
  "Start date must be before end date"
);

export const AvailableSlot = z.object({
  dateTime: z.string().datetime().describe("ISO datetime string for the available slot"),
  availableInstructors: z.array(z.number().int().positive()).describe("Array of instructor IDs available for this slot"),
});

export const AvailableSlotsResponse = z.object({
  message: z.string().describe("Success message"),
  data: z.array(AvailableSlot).describe("Array of available time slots with instructor availability"),
});

// Dual parameter schemas for complex routes
export const InstructorClassParams = z.object({
  id: z.string().regex(/^\d+$/, "Instructor ID must be a valid number").transform(Number),
  classId: z.string().regex(/^\d+$/, "Class ID must be a valid number").transform(Number),
});

// Type exports
export type InstructorIdParams = z.infer<typeof InstructorIdParams>;
export type ClassIdParams = z.infer<typeof ClassIdParams>;
export type InstructorProfile = z.infer<typeof InstructorProfile>;
export type InstructorProfilesResponse = z.infer<typeof InstructorProfilesResponse>;
export type DetailedInstructorProfile = z.infer<typeof DetailedInstructorProfile>;
export type AllInstructorProfilesResponse = z.infer<typeof AllInstructorProfilesResponse>;
export type CompleteInstructor = z.infer<typeof CompleteInstructor>;
export type InstructorResponse = z.infer<typeof InstructorResponse>;
export type SimpleInstructorProfile = z.infer<typeof SimpleInstructorProfile>;
export type InstructorSchedule = z.infer<typeof InstructorSchedule>;
export type InstructorSchedulesResponse = z.infer<typeof InstructorSchedulesResponse>;
export type ClassInstructorResponse = z.infer<typeof ClassInstructorResponse>;
export type AvailableSlotsQuery = z.infer<typeof AvailableSlotsQuery>;
export type AvailableSlot = z.infer<typeof AvailableSlot>;
export type AvailableSlotsResponse = z.infer<typeof AvailableSlotsResponse>;
export type InstructorClassParams = z.infer<typeof InstructorClassParams>;
