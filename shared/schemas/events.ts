import { z } from "zod";

// Parameter schemas
export const EventIdParams = z.object({
  id: z.string().regex(/^\d+$/, "Must be a valid number").transform(Number),
});

// Request body schemas
export const CreateEventRequest = z.object({
  name: z.string().min(1).describe("Event name"),
  color: z.string().min(1).describe("Event color code"),
});

export const UpdateEventRequest = z.object({
  name: z.string().min(1).describe("Updated event name"),
  color: z.string().min(1).describe("Updated event color code"),
});

// Response schemas
export const EventResponse = z.object({
  event: z.object({
    id: z.number().describe("Event ID"),
    name: z.string().describe("Event name"),
    color: z.string().describe("Event color code"),
  }),
});

export const EventsListResponse = z.array(
  z.object({
    id: z.number().describe("Event ID"),
    name: z.string().describe("Event name"),
    color: z.string().describe("Event color code"),
  }),
);

// Inferred TypeScript types
export type EventIdParams = z.infer<typeof EventIdParams>;
export type CreateEventRequest = z.infer<typeof CreateEventRequest>;
export type UpdateEventRequest = z.infer<typeof UpdateEventRequest>;

// Response types
export type EventResponse = z.infer<typeof EventResponse>;
export type EventsListResponse = z.infer<typeof EventsListResponse>;
