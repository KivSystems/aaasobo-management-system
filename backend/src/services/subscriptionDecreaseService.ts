import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/prismaClient";
import type {
  SubscriptionDecreaseData,
  SubscriptionDecreasePreview,
} from "../../../shared/schemas/subscriptions";
import {
  getRecurringClassTerminationCutoff,
  terminateRecurringClass,
} from "./recurringClassesService";

import { loadCalendarClasses } from "./schedulePreviewService";

export class SubscriptionDecreaseError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function buildPreview(
  tx: Prisma.TransactionClient,
  id: number,
  data: SubscriptionDecreaseData,
  now: Date,
  allowPartialSelection = false,
): Promise<SubscriptionDecreasePreview> {
  const subscription = await tx.subscription.findUnique({
    where: { id },
    include: { plan: true },
  });
  if (!subscription)
    throw new SubscriptionDecreaseError(404, "Subscription not found.");
  if (subscription.endAt)
    throw new SubscriptionDecreaseError(
      400,
      "終了済みのプランは変更できません。",
    );
  const plan = await tx.plan.findUnique({ where: { id: data.planId } });
  if (!plan) throw new SubscriptionDecreaseError(404, "Plan not found.");
  if (
    plan.englishBackground !== subscription.plan.englishBackground ||
    plan.terminationAt ||
    subscription.plan.weeklyClassTimes <= plan.weeklyClassTimes ||
    (allowPartialSelection
      ? subscription.plan.weeklyClassTimes - plan.weeklyClassTimes <
        data.recurringClassIds.length
      : subscription.plan.weeklyClassTimes - plan.weeklyClassTimes !==
        data.recurringClassIds.length)
  ) {
    throw new SubscriptionDecreaseError(
      400,
      "変更するプランと終了するクラスを確認してください。",
    );
  }
  const regularClasses = await tx.recurringClass.findMany({
    where: {
      id: { in: data.recurringClassIds },
      subscriptionId: id,
      OR: [{ endAt: null }, { endAt: { gt: now } }],
    },
    include: { instructor: true },
    orderBy: { id: "asc" },
  });
  if (regularClasses.length !== data.recurringClassIds.length)
    throw new SubscriptionDecreaseError(
      400,
      "このプランに属する有効なレギュラークラスを選択してください。",
    );
  const cutoff = getRecurringClassTerminationCutoff(now);
  const affectedClasses = await tx.class.findMany({
    where: {
      recurringClassId: { in: data.recurringClassIds },
      dateTime: { gte: cutoff },
    },
    include: {
      instructor: true,
      classAttendance: {
        include: { children: true },
        orderBy: { childrenId: "asc" },
      },
    },
    orderBy: [{ dateTime: "asc" }, { id: "asc" }],
  });
  const calendar = await loadCalendarClasses(tx, subscription.customerId);
  const removedIds = new Set(affectedClasses.map((c) => String(c.id)));
  const preview = {
    calendar: {
      before: calendar.events,
      after: calendar.events.filter((c) => !removedIds.has(c.id)),
    },
    planName: plan.name,
    regularClasses: regularClasses.map((c) => ({
      id: c.id,
      startAt: c.startAt?.toISOString() ?? null,
      instructorName: c.instructor?.nickname ?? "未設定",
    })),
    rebookedClasses: affectedClasses
      .filter((c) => c.status === "rebooked")
      .map((c) => ({
        id: c.id,
        recurringClassId: c.recurringClassId!,
        dateTime: c.dateTime!.toISOString(),
        instructorName: c.instructor?.nickname ?? "未設定",
        childrenNames: c.classAttendance.map((a) => a.children.name),
        classCode: c.classCode,
      })),
  };
  const previewToken = createHash("sha256")
    .update(
      JSON.stringify({
        id,
        oldPlanId: subscription.planId,
        data: {
          ...data,
          recurringClassIds: [...data.recurringClassIds].sort((a, b) => a - b),
        },
        cutoff,
        preview,
        regularClasses: regularClasses.map((c) => [c.id, c.endAt]),
        affectedClasses: affectedClasses.map((c) => [
          c.id,
          c.dateTime,
          c.status,
          c.updatedAt,
          c.rebookableUntil,
        ]),
      }),
    )
    .digest("hex");
  return { ...preview, previewToken };
}

export async function previewSubscriptionDecrease(
  id: number,
  data: SubscriptionDecreaseData,
) {
  return prisma.$transaction(
    (tx) => buildPreview(tx, id, data, new Date(), true),
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function applySubscriptionDecrease(
  id: number,
  data: SubscriptionDecreaseData,
  previewToken: string,
) {
  return prisma.$transaction(
    async (tx) => {
      const now = new Date();
      const preview = await buildPreview(tx, id, data, now);
      if (preview.previewToken !== previewToken)
        throw new SubscriptionDecreaseError(
          409,
          "予約内容が変更されています。戻ってキャンセル対象を再確認してください。",
        );
      await tx.subscription.update({
        where: { id },
        data: { planId: data.planId, selectType: data.selectType },
      });
      for (const recurringClassId of data.recurringClassIds)
        await terminateRecurringClass(tx, recurringClassId, now);
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
