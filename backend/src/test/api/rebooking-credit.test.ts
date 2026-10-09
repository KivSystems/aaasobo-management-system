import { describe, expect, it } from "vitest";
import { prisma } from "../setup";
import { rebookClass } from "../../services/classesService";
import {
  createClass,
  createCustomer,
  createInstructor,
  createInstructorSchedule,
  createInstructorSlot,
} from "../testUtils";

async function fixture() {
  const customer = await createCustomer();
  const targetDate = new Date();
  targetDate.setUTCDate(targetDate.getUTCDate() + 7);
  targetDate.setUTCHours(12, 0, 0, 0);
  const expiry = new Date(targetDate.getTime() + 86400000);
  const instructors = await Promise.all([
    createInstructor(),
    createInstructor(),
  ]);
  for (const instructor of instructors) {
    const schedule = await createInstructorSchedule(instructor.id, {
      effectiveFrom: new Date(
        `${targetDate.toISOString().slice(0, 10)}T00:00:00.000Z`,
      ),
      effectiveTo: null,
      timezone: "Asia/Tokyo",
    });
    await createInstructorSlot(
      schedule.id,
      targetDate.getUTCDay(),
      new Date("1970-01-01T21:00:00.000Z"),
    );
  }
  const source = await createClass(customer.id, undefined, undefined, {
    status: "canceledByCustomer",
    rebookableUntil: expiry,
    isFreeTrial: true,
  });
  const body = {
    dateTime: targetDate,
    instructorId: instructors[0].id,
    customerId: customer.id,
    status: "rebooked" as const,
    rebookableUntil: expiry,
    classCode: source.classCode,
    updatedAt: new Date(),
    isFreeTrial: true,
  };
  return { source, body, instructors, targetDate };
}

describe("Rebooking credits", () => {
  it("rejects booked sources without creating an extra class", async () => {
    const { source, body } = await fixture();
    await prisma.class.update({
      where: { id: source.id },
      data: { status: "booked" },
    });
    await expect(rebookClass(source, body, [])).rejects.toThrow(
      "rebooking credit unavailable",
    );
    expect(await prisma.class.count()).toBe(1);
  });

  it("rejects expired credits and target dates beyond the credit expiry", async () => {
    const { source, body, targetDate } = await fixture();
    for (const expiry of [
      new Date(Date.now() - 1000),
      new Date(targetDate.getTime() - 1000),
    ]) {
      await prisma.class.update({
        where: { id: source.id },
        data: { rebookableUntil: expiry },
      });
      await expect(rebookClass(source, body, [])).rejects.toThrow(
        "rebooking credit unavailable",
      );
    }
    expect(await prisma.class.count()).toBe(1);
  });

  it("consumes a canceled credit once across concurrent different instructor slots", async () => {
    const { source, body, instructors } = await fixture();
    const results = await Promise.allSettled(
      instructors.map((instructor) =>
        rebookClass(source, { ...body, instructorId: instructor.id }, []),
      ),
    );
    expect(
      results.filter((result) => result.status === "fulfilled"),
      results
        .map((result) =>
          result.status === "rejected" ? String(result.reason) : "ok",
        )
        .join("\n"),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === "rejected"),
    ).toHaveLength(1);
    expect(await prisma.class.count({ where: { status: "rebooked" } })).toBe(1);
    expect(
      (await prisma.class.findUniqueOrThrow({ where: { id: source.id } }))
        .rebookableUntil,
    ).toBeNull();
  });

  it("consumes pending credits by deleting the source before creating its replacement", async () => {
    const { source, body } = await fixture();
    await prisma.class.update({
      where: { id: source.id },
      data: { status: "pending" },
    });
    const replacement = await rebookClass(source, body, []);
    expect(replacement.status).toBe("rebooked");
    expect(
      await prisma.class.findUnique({ where: { id: source.id } }),
    ).toBeNull();
    expect(await prisma.class.count()).toBe(1);
  });
});
