import { z } from "zod";

export const ClassChangeActor = z.object({
  id: z.string(),
  userType: z.enum(["customer", "admin"]),
});
export type ClassChangeActor = z.infer<typeof ClassChangeActor>;
const child = z.object({ id: z.number(), name: z.string() });
const slot = z.object({
  dateTime: z.string().nullable(),
  instructor: z.string(),
  instructorId: z.number().nullable(),
  classId: z.number().optional(),
  recurringClassId: z.number().optional(),
  endAt: z.string().nullable().optional(),
  children: z.array(child).optional(),
});
export const ClassChangeDetails = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("REGULAR_CLASS_CHANGED"),
    before: slot,
    after: slot,
    effectiveAt: z.string(),
  }),
  z.object({ type: z.literal("CLASS_CANCELED"), target: slot }),
  z.object({ type: z.literal("CLASS_REBOOKED"), target: slot }),
]);
export type ClassChangeDetails = z.infer<typeof ClassChangeDetails>;
export const ClassChangeHistoryResponse = z.array(
  z.object({
    id: z.number(),
    occurredAt: z.string(),
    type: z.enum(["REGULAR_CLASS_CHANGED", "CLASS_CANCELED", "CLASS_REBOOKED"]),
    actorRole: z.enum(["CUSTOMER", "ADMIN"]),
    customerName: z.string(),
    children: z.array(z.object({ id: z.number(), name: z.string() })),
    details: ClassChangeDetails,
  }),
);
export type ClassChangeHistoryResponse = z.infer<
  typeof ClassChangeHistoryResponse
>;

export function formatHistoryDate(
  value: string | null,
  regular = false,
): string {
  if (!value) return "未設定";
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? "";
  const time = `${part("hour")}:${part("minute")}`;
  if (regular) return `${part("weekday")}曜日 ${time}`;
  return `${part("year")}-${part("month")}-${part("day")} ${time}（${part("weekday")}）`;
}
export function formatHistoryDetails(details: ClassChangeDetails): string {
  const describe = (value: z.infer<typeof slot>, regular = false) =>
    `${formatHistoryDate(value.dateTime, regular)} ${value.instructor}`;
  if (details.type === "REGULAR_CLASS_CHANGED")
    return `変更前: ${describe(details.before, true)}\n変更後: ${describe(details.after, true)}\n適用日: ${formatHistoryDate(details.effectiveAt).split(" ")[0]}`;
  return describe(details.target);
}
