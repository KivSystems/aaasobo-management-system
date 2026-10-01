import { Prisma } from "@prisma/client";
import type { SchedulePreviewEvent } from "../../../shared/schemas/schedulePreview";

export async function loadCalendarClasses(
  tx: Prisma.TransactionClient,
  customerId: number,
) {
  const rows = await tx.class.findMany({
    where: { customerId, dateTime: { not: null } },
    include: {
      instructor: true,
      recurringClass: true,
      classAttendance: {
        include: { children: true },
        orderBy: { childrenId: "asc" },
      },
    },
    orderBy: [{ dateTime: "asc" }, { id: "asc" }],
  });
  const events: SchedulePreviewEvent[] = rows.map((c) => ({
    id: String(c.id),
    dateTime: c.dateTime!.toISOString(),
    instructorId: c.instructorId,
    childrenIds: c.classAttendance.map((a) => a.childrenId),
    instructorName: c.instructor?.nickname ?? "未設定",
    instructorIcon: c.instructor?.icon ?? null,
    childrenNames: c.classAttendance.map((a) => a.children.name),
    status: c.status,
    regularStartAt: c.recurringClass?.startAt?.toISOString() ?? null,
  }));
  return { rows, events };
}
