import { z } from "zod";

export const SchedulePreviewEvent = z.object({
  id: z.string(),
  dateTime: z.iso.datetime(),
  instructorId: z.number().int().nullable(),
  childrenIds: z.array(z.number().int()),
  instructorName: z.string(),
  instructorIcon: z.string().nullable(),
  childrenNames: z.array(z.string()),
  status: z.string(),
  regularStartAt: z.iso.datetime().nullable(),
});
export const SchedulePreview = z.object({
  before: z.array(SchedulePreviewEvent),
  after: z.array(SchedulePreviewEvent),
});
export type SchedulePreviewEvent = z.infer<typeof SchedulePreviewEvent>;
export type SchedulePreview = z.infer<typeof SchedulePreview>;
