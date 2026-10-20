import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/prismaClient";
import {
  ClassChangeActor,
  ClassChangeDetails,
  formatHistoryDate,
  formatHistoryDetails,
} from "../../../shared/schemas/classChangeHistory";
import { sendEmail } from "../lib/email/delivery";

export function historyCutoff(now = new Date()) {
  return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
}
export async function recordClassChange(
  tx: Prisma.TransactionClient,
  actor: ClassChangeActor | undefined,
  customerId: number,
  children: { id: number; name: string }[],
  details: ClassChangeDetails,
) {
  if (!actor) return;
  const validatedActor = ClassChangeActor.parse(actor);
  const validatedDetails = ClassChangeDetails.parse(details);
  const customer = await tx.customer.findUniqueOrThrow({
    where: { id: customerId },
    select: { name: true },
  });
  await tx.classChangeHistory.create({
    data: {
      type: validatedDetails.type,
      actorRole: validatedActor.userType === "admin" ? "ADMIN" : "CUSTOMER",
      actorId: Number(validatedActor.id),
      customerId,
      customerName: customer.name,
      children,
      details: validatedDetails,
      outbox: { create: {} },
    },
  });
}
export async function recordClassSnapshot(
  tx: Prisma.TransactionClient,
  classId: number,
  actor: ClassChangeActor | undefined,
  type: "CLASS_CANCELED" | "CLASS_REBOOKED",
) {
  if (!actor) return;
  const target = await tx.class.findUniqueOrThrow({
    where: { id: classId },
    include: {
      instructor: true,
      classAttendance: { include: { children: true } },
    },
  });
  await recordClassChange(
    tx,
    actor,
    target.customerId,
    target.classAttendance.map(({ children }) => ({
      id: children.id,
      name: children.name,
    })),
    {
      type,
      target: {
        classId: target.id,
        instructorId: target.instructorId,
        dateTime: target.dateTime?.toISOString() ?? null,
        instructor: target.instructor?.name ?? "未設定",
      },
    },
  );
}
export async function listClassChangeHistory() {
  return prisma.classChangeHistory.findMany({
    where: { occurredAt: { gte: historyCutoff() } },
    orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      occurredAt: true,
      type: true,
      actorRole: true,
      customerName: true,
      children: true,
      details: true,
    },
  });
}
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
export async function sendClassChangeDigest() {
  let deliveryError: unknown;
  try {
    const pending = await prisma.classChangeOutbox.findMany({
      orderBy: { id: "asc" },
      include: { history: true },
    });
    if (!pending.length) {
      console.info("Class change digest: no pending entries");
      return;
    }
    const rows = pending.map(({ history }) => {
      const children = history.children as { name: string }[];
      return [
        formatHistoryDate(history.occurredAt.toISOString()),
        history.customerName,
        children.map((child) => child.name).join("、"),
        history.type === "REGULAR_CLASS_CHANGED"
          ? "レギュラークラス変更"
          : history.type === "CLASS_CANCELED"
            ? "キャンセル"
            : "振替予約",
        formatHistoryDetails(ClassChangeDetails.parse(history.details)),
        history.actorRole === "CUSTOMER" ? "お客様" : "管理者",
      ]
        .map(escapeHtml)
        .join(" | ");
    });
    const origin = process.env.FRONTEND_ORIGIN;
    if (!origin)
      throw new Error("FRONTEND_ORIGIN is required for class change digest");
    const response = await sendEmail({
      to: "kidsinternationalvillage@gmail.com",
      subject: `クラス変更履歴 (${pending.length}件)`,
      html: `<p>日時はすべて日本時間</p><pre>${rows.join("\n\n")}</pre><p><a href="${escapeHtml(new URL("/admins/class-change-history", origin).href)}">クラス変更履歴を確認</a></p>`,
    });
    if (response.error || !response.data?.id)
      throw new Error(
        `Class change digest rejected: ${response.error?.message ?? "no email ID"}`,
      );
    await prisma.classChangeOutbox.deleteMany({
      where: { id: { in: pending.map((entry) => entry.id) } },
    });
    console.info("Class change digest accepted", {
      count: pending.length,
      emailId: response.data.id,
    });
  } catch (error) {
    deliveryError = error;
    console.error(
      "Class change digest failed; pending entries retained",
      error,
    );
    throw error;
  } finally {
    try {
      const result = await prisma.classChangeHistory.deleteMany({
        where: { occurredAt: { lt: historyCutoff() }, outbox: { is: null } },
      });
      console.info("Class change history cleanup", { count: result.count });
    } catch (error) {
      console.error("Class change history cleanup failed", error);
      if (!deliveryError) throw error;
    }
  }
}

export function classChangeActorFromUser(
  user: { id: string; userType: string } | undefined,
): ClassChangeActor | undefined {
  if (user?.userType === "instructor") return undefined;
  return ClassChangeActor.parse(user);
}
