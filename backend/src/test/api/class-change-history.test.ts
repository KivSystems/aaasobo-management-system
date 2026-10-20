import { describe, expect, it, vi, beforeEach } from "vitest";
import request from "supertest";
import { prisma } from "../setup";
import { prisma as servicePrisma } from "../../../prisma/prismaClient";
import { server } from "../../server";
import {
  createAdmin,
  createCustomer,
  createInstructor,
  createClass,
  createChild,
  createClassAttendance,
  generateAuthCookie,
} from "../testUtils";
import {
  cancelClassById,
  cancelClasses,
  updateClass,
} from "../../services/classesService";
import {
  recordClassSnapshot,
  sendClassChangeDigest,
  historyCutoff,
} from "../../services/classChangeHistoryService";
import {
  formatHistoryDate,
  formatHistoryDetails,
} from "../../../../shared/schemas/classChangeHistory";
import { sendEmail } from "../../lib/email/delivery";
vi.mock("../../lib/email/delivery", () => ({ sendEmail: vi.fn() }));
const mockedSend = vi.mocked(sendEmail);
async function fixture() {
  const customer = await createCustomer();
  const instructor = await createInstructor();
  const target = await createClass(
    customer.id,
    instructor.id,
    new Date(Date.now() + 86400000),
  );
  const child = await createChild(customer.id);
  await createClassAttendance(target.id, child.id);
  return {
    customer,
    instructor,
    target,
    child,
    actor: { id: String(customer.id), userType: "customer" as const },
  };
}
beforeEach(() => {
  mockedSend.mockReset();
  process.env.FRONTEND_ORIGIN = "https://example.com";
  mockedSend.mockResolvedValue({ data: { id: "test-email" }, error: null });
});
describe("class change history", () => {
  it("formats dates across JST midnight using sortable padded dates", () => {
    expect(formatHistoryDate("2026-01-31T15:00:00Z")).toBe(
      "2026-02-01 00:00（日）",
    );
    expect(formatHistoryDate("2026-12-31T15:00:00Z")).toBe(
      "2027-01-01 00:00（金）",
    );
    expect(
      formatHistoryDetails({
        type: "REGULAR_CLASS_CHANGED",
        before: {
          instructorId: 1,
          instructor: "A",
          dateTime: "2026-01-31T15:00:00Z",
        },
        after: {
          instructorId: 2,
          instructor: "B",
          dateTime: "2026-02-01T01:00:00Z",
        },
        effectiveAt: "2026-02-01T01:00:00Z",
      }),
    ).toContain("適用日: 2026-02-01");
  });
  it("rejects cron when its secret is absent or empty", async () => {
    const original = process.env.CRON_SECRET;
    try {
      delete process.env.CRON_SECRET;
      await request(server)
        .post("/jobs/class-change-history")
        .set("Authorization", "Bearer undefined")
        .expect(401);
      process.env.CRON_SECRET = "";
      await request(server)
        .post("/jobs/class-change-history")
        .set("Authorization", "Bearer ")
        .expect(401);
    } finally {
      if (original === undefined) delete process.env.CRON_SECRET;
      else process.env.CRON_SECRET = original;
    }
  });
  it("keeps accepted outbox pending if acknowledgment fails", async () => {
    const { target, actor } = await fixture();
    await cancelClassById(target.id, actor);
    const delegate = servicePrisma.classChangeOutbox;
    const originalDelete = delegate.deleteMany;
    delegate.deleteMany = vi
      .fn()
      .mockRejectedValueOnce(new Error("ack failed"));
    try {
      await expect(sendClassChangeDigest()).rejects.toThrow("ack failed");
    } finally {
      delegate.deleteMany = originalDelete;
    }
    expect(await prisma.classChangeOutbox.count()).toBe(1);
    await sendClassChangeDigest();
    expect(await prisma.classChangeOutbox.count()).toBe(0);
  });
  it("snapshots cancellation before attendance removal and survives source deletion", async () => {
    const { customer, instructor, target, child, actor } = await fixture();
    await cancelClassById(target.id, actor);
    const entry = await prisma.classChangeHistory.findFirstOrThrow();
    expect(entry).toMatchObject({
      actorId: customer.id,
      actorRole: "CUSTOMER",
      customerName: customer.name,
      children: [{ id: child.id, name: child.name }],
      details: {
        type: "CLASS_CANCELED",
        target: {
          dateTime: target.dateTime!.toISOString(),
          instructor: instructor.name,
        },
      },
    });
    expect(await prisma.classChangeOutbox.count()).toBe(1);
    await prisma.class.delete({ where: { id: target.id } });
    await prisma.child.delete({ where: { id: child.id } });
    await prisma.customer.delete({ where: { id: customer.id } });
    await prisma.instructor.delete({ where: { id: instructor.id } });
    expect(
      await prisma.classChangeHistory.findUnique({ where: { id: entry.id } }),
    ).toEqual(entry);
  });
  it("rolls back snapshot, outbox and mutation on failed bulk cancellation", async () => {
    const { target, actor } = await fixture();
    await expect(cancelClasses([target.id, -1], actor)).rejects.toThrow();
    expect(await prisma.classChangeHistory.count()).toBe(0);
    expect(await prisma.classChangeOutbox.count()).toBe(0);
    expect(await prisma.classAttendance.count()).toBe(1);
    expect(
      (await prisma.class.findUniqueOrThrow({ where: { id: target.id } }))
        .status,
    ).toBe("booked");
  });
  it("records all bulk events and admin role", async () => {
    const { target, actor, customer, instructor } = await fixture();
    const second = await createClass(
      customer.id,
      instructor.id,
      new Date(Date.now() + 172800000),
    );
    await cancelClasses([target.id, second.id], actor);
    const third = await createClass(
      customer.id,
      instructor.id,
      new Date(Date.now() + 259200000),
    );
    await updateClass(third.id, "canceledByAdmin", third.dateTime!, {
      id: "123",
      userType: "admin",
    });
    expect(await prisma.classChangeHistory.count()).toBe(3);
    expect(
      await prisma.classChangeHistory.count({
        where: { actorRole: "ADMIN", actorId: 123 },
      }),
    ).toBe(1);
  });
  it("enforces admin read and cron permissions and ignores forbidden mutations", async () => {
    const { target, customer } = await fixture();
    const other = await createCustomer();
    const admin = await createAdmin();
    await request(server).get("/admins/class-change-history").expect(401);
    await request(server)
      .get("/admins/class-change-history")
      .set("Cookie", await generateAuthCookie(customer.id, "customer"))
      .expect(403);
    await request(server)
      .patch(`/classes/${target.id}/cancel`)
      .set("Cookie", await generateAuthCookie(other.id, "customer"))
      .expect(403);
    expect(await prisma.classChangeHistory.count()).toBe(0);
    await request(server)
      .patch(`/classes/${target.id}/cancel`)
      .set("Cookie", await generateAuthCookie(customer.id, "customer"))
      .expect(200);
    const response = await request(server)
      .get("/admins/class-change-history")
      .set("Cookie", await generateAuthCookie(admin.id, "admin"))
      .expect(200);
    expect(response.body).toHaveLength(1);
    await request(server).post("/jobs/class-change-history").expect(401);
    expect(mockedSend).not.toHaveBeenCalled();
  });
  it("sends nothing empty, retains expired pending on rejection and cleans after acceptance", async () => {
    await sendClassChangeDigest();
    expect(mockedSend).not.toHaveBeenCalled();
    const { target, actor } = await fixture();
    await cancelClassById(target.id, actor);
    await prisma.classChangeHistory.updateMany({
      data: { occurredAt: new Date(historyCutoff().getTime() - 1000) },
    });
    mockedSend.mockResolvedValueOnce({
      data: null,
      error: { name: "rate_limit_exceeded", message: "limit" },
    });
    await expect(sendClassChangeDigest()).rejects.toThrow("limit");
    expect(await prisma.classChangeHistory.count()).toBe(1);
    expect(await prisma.classChangeOutbox.count()).toBe(1);
    await sendClassChangeDigest();
    expect(await prisma.classChangeOutbox.count()).toBe(0);
    expect(await prisma.classChangeHistory.count()).toBe(0);
  });
  it("retains on network failure and removes only captured IDs when new events arrive during send", async () => {
    const { target, actor, customer, instructor } = await fixture();
    await cancelClassById(target.id, actor);
    mockedSend.mockRejectedValueOnce(new Error("network"));
    await expect(sendClassChangeDigest()).rejects.toThrow("network");
    expect(await prisma.classChangeOutbox.count()).toBe(1);
    mockedSend.mockImplementationOnce(async () => {
      const next = await createClass(
        customer.id,
        instructor.id,
        new Date(Date.now() + 172800000),
      );
      await cancelClassById(next.id, actor);
      return { data: { id: "accepted" }, error: null };
    });
    await sendClassChangeDigest();
    expect(await prisma.classChangeHistory.count()).toBe(2);
    expect(await prisma.classChangeOutbox.count()).toBe(1);
    expect(mockedSend.mock.calls[1][0].html).toContain(
      "/admins/class-change-history",
    );
    await sendClassChangeDigest();
    expect(await prisma.classChangeOutbox.count()).toBe(0);
  });
  it("cleans acknowledged expired histories even if delivery fails", async () => {
    const { target, actor } = await fixture();
    await cancelClassById(target.id, actor);
    await prisma.classChangeOutbox.deleteMany();
    await prisma.classChangeHistory.updateMany({
      data: { occurredAt: new Date(historyCutoff().getTime() - 1000) },
    });
    await prisma.$transaction((tx) =>
      recordClassSnapshot(tx, target.id, actor, "CLASS_REBOOKED"),
    );
    mockedSend.mockRejectedValueOnce(new Error("network"));
    await expect(sendClassChangeDigest()).rejects.toThrow();
    expect(await prisma.classChangeHistory.count()).toBe(1);
    expect(await prisma.classChangeOutbox.count()).toBe(1);
  });
});
