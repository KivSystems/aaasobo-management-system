import "dotenv/config";
import { prisma } from "../../prisma/prismaClient";
import { executeNormalizedImportFiles } from "../services/adminImport/execute";
import {
  cancelClassById,
  rebookClass,
  updateClass,
} from "../services/classesService";
import { classChangeActorFromUser } from "../services/classChangeHistoryService";
import { getInstructorAvailableSlots } from "../services/instructorScheduleService";
import {
  previewRegularClassChange,
  updateRegularClass,
} from "../services/recurringClassesService";
import { generateNormalizedImportFixture } from "./generateNormalizedImportFixture";
import {
  assertLocalPreviewEnvironment,
  parsePreviewOptions,
  PREVIEW_OPERATIONS,
  selectChangedCustomers,
  shiftDate,
} from "./previewFixtureOptions";

type Options = ReturnType<typeof parsePreviewOptions>;

async function applyCustomerChanges(
  email: string,
  ordinal: number,
  adminId: number,
  options: Options,
) {
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { email },
    include: { children: { orderBy: { id: "asc" } } },
  });
  const childrenIds = customer.children.map((child) => child.id);
  const customerActor = classChangeActorFromUser({
    id: String(customer.id),
    userType: "customer",
  });
  const adminActor = classChangeActorFromUser({
    id: String(adminId),
    userType: "admin",
  });
  const actors = [customerActor, adminActor];
  const sources = await prisma.class.findMany({
    where: {
      customerId: customer.id,
      status: "booked",
      dateTime: {
        gte: new Date(`${shiftDate(options.baseDate, 1)}T00:00:00+09:00`),
        lt: new Date(`${shiftDate(options.baseDate, 14)}T00:00:00+09:00`),
      },
    },
    orderBy: [{ dateTime: "asc" }, { id: "asc" }],
    take: 2,
  });
  if (sources.length !== 2)
    throw new Error(`${email}: two future booked classes are required`);
  // Resolve both original bookings before either regular series is versioned.
  for (let index = 0; index < sources.length; index += 1) {
    const source = sources[index];
    if (!source.instructorId || !source.dateTime || !source.rebookableUntil)
      throw new Error(`${email}: incomplete source class`);
    const slots = await getInstructorAvailableSlots(
      source.instructorId,
      shiftDate(options.baseDate, 1),
      shiftDate(options.baseDate, 14),
      "Asia/Tokyo",
      true,
    );
    const customerBookings = await prisma.class.findMany({
      where: {
        customerId: customer.id,
        status: { in: ["booked", "rebooked"] },
        dateTime: { not: null },
      },
      select: { dateTime: true },
    });
    const excludedTimes = new Set([
      ...sources.map((original) => original.dateTime!.toISOString()),
      ...customerBookings.map((booking) => booking.dateTime!.toISOString()),
    ]);
    const candidate = slots
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
      .find(
        (slot) =>
          !excludedTimes.has(slot.dateTime) &&
          new Date(slot.dateTime) <= source.rebookableUntil!,
      );
    if (!candidate) throw new Error(`${email}: no free replacement class slot`);
    if (index === 0) await cancelClassById(source.id, actors[index]);
    else
      await updateClass(
        source.id,
        "canceledByAdmin",
        source.dateTime,
        actors[index],
      );
    await rebookClass(
      {
        id: source.id,
        status: index === 0 ? "canceledByCustomer" : "canceledByAdmin",
      },
      {
        customerId: customer.id,
        instructorId: source.instructorId,
        dateTime: candidate.dateTime,
        status: "rebooked",
        rebookableUntil: source.rebookableUntil,
        classCode: source.classCode,
        isFreeTrial: source.isFreeTrial,
        updatedAt: new Date(),
        ...(source.subscriptionId
          ? { subscriptionId: source.subscriptionId }
          : {}),
        ...(source.recurringClassId
          ? { recurringClassId: source.recurringClassId }
          : {}),
      },
      childrenIds,
      actors[index],
    );
  }
  let recurring = await prisma.recurringClass.findFirstOrThrow({
    where: { subscription: { customerId: customer.id }, endAt: null },
    orderBy: { id: "asc" },
  });
  if (!recurring.instructorId)
    throw new Error(`${email}: missing regular instructor`);
  const instructorId = recurring.instructorId;
  const originalJst = new Date(recurring.startAt!.getTime() + 9 * 3_600_000);
  const originalSlot = `${originalJst.getUTCDay()}:${originalJst.toISOString().slice(11, 16)}`;
  let currentSlot = originalSlot;
  let previousEffectiveDate: string | undefined;
  // Prefer a third slot, allowing a return to the original only when capacity requires it.
  for (let index = 0; index < actors.length; index += 1) {
    const nominalStart = shiftDate(options.baseDate, 28 + index * 14);
    const afterPrevious = previousEffectiveDate
      ? shiftDate(previousEffectiveDate, 8)
      : nominalStart;
    const startDate =
      afterPrevious > nominalStart ? afterPrevious : nominalStart;
    const horizonEnd = shiftDate(options.to, 1);
    const searchEnd =
      shiftDate(startDate, 14) < horizonEnd
        ? shiftDate(startDate, 14)
        : horizonEnd;
    const slots = await getInstructorAvailableSlots(
      instructorId,
      startDate,
      searchEnd,
      "Asia/Tokyo",
      true,
      true,
    );
    const slotKey = (dateTime: string) => {
      const date = new Date(new Date(dateTime).getTime() + 9 * 3_600_000);
      return `${date.getUTCDay()}:${date.toISOString().slice(11, 16)}`;
    };
    const available = slots
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
      .filter((slot) => slotKey(slot.dateTime) !== currentSlot);
    const candidate =
      available.find((slot) => slotKey(slot.dateTime) !== originalSlot) ??
      available[0];
    if (!candidate) throw new Error(`${email}: no free regular class slot`);
    const jst = new Date(
      new Date(candidate.dateTime).getTime() + 9 * 3_600_000,
    );
    currentSlot = slotKey(candidate.dateTime);
    previousEffectiveDate = jst.toISOString().slice(0, 10);
    const params = {
      customerId: customer.id,
      recurringClassId: recurring.id,
      instructorId,
      childrenIds,
      weekday: jst.getUTCDay(),
      startTime: jst.toISOString().slice(11, 16),
      startDate: previousEffectiveDate,
      timezone: "Asia/Tokyo",
    };
    const preview = await previewRegularClassChange(params);
    const changed = await updateRegularClass(
      { ...params, previewToken: preview.previewToken },
      actors[index],
    );
    recurring = changed.newRecurringClass;
  }
  const histories = await prisma.classChangeHistory.findMany({
    where: { customerId: customer.id },
    orderBy: { id: "asc" },
  });
  const expected = [
    "CUSTOMER:CLASS_CANCELED",
    "CUSTOMER:CLASS_REBOOKED",
    "ADMIN:CLASS_CANCELED",
    "ADMIN:CLASS_REBOOKED",
    "CUSTOMER:REGULAR_CLASS_CHANGED",
    "ADMIN:REGULAR_CLASS_CHANGED",
  ];
  if (
    histories.length !== expected.length ||
    histories.some(
      (row, index) => `${row.actorRole}:${row.type}` !== expected[index],
    )
  )
    throw new Error(
      `${email}: expected exactly six ordered history operations`,
    );
  await prisma.$transaction(
    histories.map((row, index) =>
      prisma.classChangeHistory.update({
        where: { id: row.id },
        data: {
          occurredAt: new Date(
            options.changesStart.getTime() +
              (((ordinal - 1) / 2) * PREVIEW_OPERATIONS.length + index) *
                options.changesIntervalMinutes *
                60_000,
          ),
        },
      }),
    ),
  );
  // Only this runner's service-generated outbox entries are suppressed.
  await prisma.classChangeOutbox.deleteMany({
    where: { historyId: { in: histories.map((row) => row.id) } },
  });
  console.log(
    `Customer ${ordinal}: ${customer.name} (${email}): ${PREVIEW_OPERATIONS.join(" -> ")}`,
  );
  return {
    ordinal,
    email,
    name: customer.name,
    operations: [...PREVIEW_OPERATIONS],
    historyIds: histories.map((row) => row.id),
  };
}

export async function seedPreview(options: Options) {
  assertLocalPreviewEnvironment(process.env);
  const generated = await generateNormalizedImportFixture(options);
  const selected = selectChangedCustomers(
    generated.rows["customers.csv"],
    options.changes,
  );
  const admin = await prisma.admin.findFirst({ orderBy: { id: "asc" } });
  if (!admin)
    throw new Error(
      "Bootstrap an admin with npm run db:bootstrap before seed:preview (nothing imported)",
    );
  console.log(
    `Resetting local preview data: ${options.from} through ${options.to}; ${selected.length} six-operation sets`,
  );
  await executeNormalizedImportFiles(generated.files);
  const changedCustomers = [];
  for (const [index, customer] of selected.entries())
    changedCustomers.push(
      await applyCustomerChanges(
        customer.email,
        index * 2 + 1,
        admin.id,
        options,
      ),
    );
  const selectedEmails = new Set(selected.map((customer) => customer.email));
  const untouchedCustomers = generated.rows["customers.csv"]
    .filter((customer) => !selectedEmails.has(customer.email))
    .map((customer) => customer.email);
  const untouchedIds = await prisma.customer.findMany({
    where: { email: { in: untouchedCustomers } },
    select: { id: true },
  });
  if (
    await prisma.classChangeHistory.count({
      where: {
        customerId: { in: untouchedIds.map((customer) => customer.id) },
      },
    })
  )
    throw new Error("Unexpected history for untouched preview customers");
  const summary = {
    customerCount: generated.rows["customers.csv"].length,
    changedCustomers,
    untouchedCustomers,
    historyCount: changedCustomers.length * 6,
  };
  console.log(
    `Preview ready: ${summary.customerCount} customers; ${summary.historyCount} history rows; ${untouchedCustomers.length} unchanged customers`,
  );
  return summary;
}

if (require.main === module) {
  (async () => {
    try {
      await seedPreview(parsePreviewOptions(process.argv.slice(2)));
    } finally {
      await prisma.$disconnect();
    }
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
