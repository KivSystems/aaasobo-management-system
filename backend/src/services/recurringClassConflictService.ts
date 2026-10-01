import type { Prisma } from "@prisma/client";

export async function loadRecurringClassConflictChecker(
  tx: Prisma.TransactionClient,
  instructorId: number,
) {
  const classes = await tx.recurringClass.findMany({
    where: { instructorId, startAt: { not: null } },
    select: { id: true, startAt: true, endAt: true },
  });
  const slots = classes.map((regular) => {
    const jst = new Date(regular.startAt!.getTime() + 9 * 60 * 60 * 1000);
    return {
      ...regular,
      weekday: jst.getUTCDay(),
      time: jst.toISOString().slice(11, 16),
    };
  });
  return (
    weekday: number,
    startTime: string,
    firstOccurrence: Date,
    excludeId = -1,
  ) =>
    slots.some(
      (slot) =>
        slot.id !== excludeId &&
        (!slot.endAt || slot.endAt > firstOccurrence) &&
        slot.weekday === weekday &&
        slot.time === startTime.padStart(5, "0"),
    );
}
