import { z } from "zod";

// Parameter schemas
export const EventIdParams = z.object({
  id: z.string().regex(/^\d+$/, "Must be a valid number").transform(Number),
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

// Response types
export type EventResponse = z.infer<typeof EventResponse>;
export type EventsListResponse = z.infer<typeof EventsListResponse>;
