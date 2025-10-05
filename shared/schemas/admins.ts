import { z } from "zod";

export const AdminIdParams = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Admin ID must be a valid number")
    .transform((val) => parseInt(val, 10)),
});

export const CustomerIdParams = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Customer ID must be a valid number")
    .transform((val) => parseInt(val, 10)),
});

export const InstructorIdParams = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Instructor ID must be a valid number")
    .transform((val) => parseInt(val, 10)),
});

export const PlanIdParams = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Plan ID must be a valid number")
    .transform((val) => parseInt(val, 10)),
});

export const EventIdParams = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Event ID must be a valid number")
    .transform((val) => parseInt(val, 10)),
});

// Admin registration and update schemas
export const RegisterAdminRequest = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const UpdateAdminRequest = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email format"),
});

// Instructor registration and update schemas
export const RegisterInstructorRequest = z.object({
  name: z.string().min(1, "Name is required"),
  nickname: z.string().min(1, "Nickname is required"),
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  birthdate: z.string().min(1, "Birthdate is required"),
  lifeHistory: z.string(),
  favoriteFood: z.string(),
  hobby: z.string(),
  messageForChildren: z.string(),
  workingTime: z.string(),
  skill: z.string(),
  classURL: z.string().min(1, "Class URL is required"),
  meetingId: z.string().min(1, "Meeting ID is required"),
  passcode: z.string().min(1, "Passcode is required"),
  introductionURL: z.string().min(1, "Introduction URL is required"),
});

export const UpdateInstructorRequest = z.object({
  name: z.string().min(1, "Name is required"),
  leavingDate: z.string().nullable().optional(),
  email: z.email("Invalid email format"),
  nickname: z.string().min(1, "Nickname is required"),
  birthdate: z.string().min(1, "Birthdate is required"),
  workingTime: z.string(),
  lifeHistory: z.string(),
  favoriteFood: z.string(),
  hobby: z.string(),
  messageForChildren: z.string(),
  skill: z.string(),
  classURL: z.string().min(1, "Class URL is required"),
  meetingId: z.string().min(1, "Meeting ID is required"),
  passcode: z.string().min(1, "Passcode is required"),
  introductionURL: z.string().min(1, "Introduction URL is required"),
});

// Plan schemas
export const RegisterPlanRequest = z.object({
  name: z.string().min(1, "Plan name is required"),
  weeklyClassTimes: z
    .number()
    .int()
    .positive("Weekly class times must be a positive integer"),
  description: z.string().min(1, "Description is required"),
});

export const UpdatePlanRequest = z.discriminatedUnion("isDelete", [
  // Deletion request
  z.object({
    isDelete: z.literal(true),
  }),
  // Update request: both fields required
  z.object({
    isDelete: z.literal(false),
    name: z.string().min(1, "Plan name is required"),
    description: z.string().min(1, "Description is required"),
  }),
]);

// Event schemas
export const RegisterEventRequest = z.object({
  name: z
    .string()
    .min(1, "Event name is required")
    .regex(
      /^([^\x00-\x7F]+) \/ ([a-zA-Z0-9 ]+)$/,
      "Event Name must be in the format: 日本語名 / English Name",
    ),
  color: z.string().min(1, "Color is required"),
});

export const UpdateEventRequest = z.object({
  name: z
    .string()
    .min(1, "Event name is required")
    .regex(
      /^([^\x00-\x7F]+) \/ ([a-zA-Z0-9 ]+)$/,
      "Event Name must be in the format: 日本語名 / English Name",
    ),
  color: z.string().min(1, "Color is required"),
});

// Business schedule update schema
export const UpdateBusinessScheduleRequest = z.object({
  eventId: z.number().int().positive("Event ID must be a positive integer"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

// Basic admin profile schema
export const AdminProfile = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
});

// Single admin response
export const AdminResponse = z.object({
  admin: AdminProfile,
});

// Admin list item for table display
export const AdminListItem = z.object({
  No: z.number(),
  ID: z.number(),
  Admin: z.string(),
  Email: z.string(),
});

export const AdminsListResponse = z.object({
  data: z.array(AdminListItem),
});

// Instructor list item for table display
export const InstructorListItem = z.object({
  No: z.number(),
  ID: z.number(),
  Instructor: z.string(),
  Nickname: z.string(),
  Email: z.string(),
});

export const InstructorsListResponse = z.object({
  data: z.array(InstructorListItem),
});

// Customer list item for table display
export const CustomerListItem = z.object({
  No: z.number(),
  ID: z.number(),
  Customer: z.string(),
  Email: z.string(),
  Prefecture: z.string(),
});

export const CustomersListResponse = z.object({
  data: z.array(CustomerListItem),
});

// Child list item for table display
export const ChildListItem = z.object({
  No: z.number(),
  ID: z.number(),
  Child: z.string(),
  "Customer ID": z.number(),
  Customer: z.string(),
  Birthdate: z.string().nullable(),
  "Personal Info": z.string().nullable(),
});

export const ChildrenListResponse = z.object({
  data: z.array(ChildListItem),
});

// Plan list item for table display
export const PlanListItem = z.object({
  No: z.number(),
  ID: z.number(),
  Plan: z.string(),
  "Weekly Class Times": z.number(),
  Description: z.string(),
});

export const PlansListResponse = z.object({
  data: z.array(PlanListItem),
});

// Subscription list item for table display
export const SubscriptionListItem = z.object({
  No: z.number(),
  ID: z.number(),
  Customer: z.string(),
  "Subscription Plan": z.string(),
  Note: z.string(),
});

export const SubscriptionsListResponse = z.object({
  data: z.array(SubscriptionListItem),
});

// Event list item for table display
export const EventListItem = z.object({
  No: z.number(),
  ID: z.number(),
  Event: z.string(),
  "Color Code": z.string(),
});

export const EventsListResponse = z.object({
  data: z.array(EventListItem),
});

// Class list item for table display
export const ClassListItem = z.object({
  No: z.number(),
  ID: z.number(),
  Instructor: z.string(),
  Customer: z.string(),
  Date: z.string(),
  "JP Time": z.string(),
  Status: z.string(),
  "Class Code": z.string(),
});

export const ClassesListResponse = z.object({
  data: z.array(ClassListItem),
});

// Schedule list item for table display
export const ScheduleListItem = z.object({
  id: z.number(),
  date: z.string(),
  event: z.string(),
  color: z.string(),
});

export const SchedulesListResponse = z.object({
  organizedData: z.array(ScheduleListItem),
});

// Update response schemas
export const UpdateAdminResponse = z.object({
  message: z.string(),
  admin: AdminProfile,
});

export const UpdateInstructorResponse = z.object({
  message: z.string(),
  instructor: z
    .object({
      id: z.number(),
      name: z.string(),
      nickname: z.string(),
      email: z.string(),
      terminationAt: z.iso.datetime().nullable(),
    })
    .passthrough(), // Allow additional properties
});

export const UpdatePlanResponse = z.object({
  message: z.string(),
  plan: z
    .object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
    })
    .passthrough(),
});

export const UpdateEventResponse = z.object({
  message: z.string(),
  event: z
    .object({
      id: z.number(),
      name: z.string(),
      color: z.string(),
    })
    .passthrough(),
});

export const DeleteResponse = z.object({
  message: z.string(),
  id: z.number(),
});

// Error response schemas
export const ValidationErrorResponse = z.object({
  items: z.array(z.string()),
});

export const ConflictErrorResponse = z.object({
  items: z.union([z.string(), z.array(z.string())]),
});

export const InstructorUpdateErrorResponse = z.record(z.string(), z.string());

export type AdminIdParams = z.infer<typeof AdminIdParams>;
export type CustomerIdParams = z.infer<typeof CustomerIdParams>;
export type InstructorIdParams = z.infer<typeof InstructorIdParams>;
export type PlanIdParams = z.infer<typeof PlanIdParams>;
export type EventIdParams = z.infer<typeof EventIdParams>;

export type RegisterAdminRequest = z.infer<typeof RegisterAdminRequest>;
export type UpdateAdminRequest = z.infer<typeof UpdateAdminRequest>;
export type RegisterInstructorRequest = z.infer<
  typeof RegisterInstructorRequest
>;
export type UpdateInstructorRequest = z.infer<typeof UpdateInstructorRequest>;
export type RegisterPlanRequest = z.infer<typeof RegisterPlanRequest>;
export type UpdatePlanRequest = z.infer<typeof UpdatePlanRequest>;
export type RegisterEventRequest = z.infer<typeof RegisterEventRequest>;
export type UpdateEventRequest = z.infer<typeof UpdateEventRequest>;
export type UpdateBusinessScheduleRequest = z.infer<
  typeof UpdateBusinessScheduleRequest
>;

export type AdminProfile = z.infer<typeof AdminProfile>;
export type AdminResponse = z.infer<typeof AdminResponse>;
export type AdminsListResponse = z.infer<typeof AdminsListResponse>;
export type InstructorsListResponse = z.infer<typeof InstructorsListResponse>;
export type CustomersListResponse = z.infer<typeof CustomersListResponse>;
export type ChildrenListResponse = z.infer<typeof ChildrenListResponse>;
export type PlansListResponse = z.infer<typeof PlansListResponse>;
export type SubscriptionsListResponse = z.infer<
  typeof SubscriptionsListResponse
>;
export type EventsListResponse = z.infer<typeof EventsListResponse>;
export type ClassesListResponse = z.infer<typeof ClassesListResponse>;
export type SchedulesListResponse = z.infer<typeof SchedulesListResponse>;

export type UpdateAdminResponse = z.infer<typeof UpdateAdminResponse>;
export type UpdateInstructorResponse = z.infer<typeof UpdateInstructorResponse>;
export type UpdatePlanResponse = z.infer<typeof UpdatePlanResponse>;
export type UpdateEventResponse = z.infer<typeof UpdateEventResponse>;
export type DeleteResponse = z.infer<typeof DeleteResponse>;
