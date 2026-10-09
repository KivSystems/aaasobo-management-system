import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { server } from "../../server";
import { prisma } from "../setup";
import {
  createAdmin,
  createCustomer,
  createInstructor,
  createClass,
  createChild,
  createClassAttendance,
  createPlan,
  createSubscription,
  generateAuthCookie,
} from "../testUtils";

async function fixture() {
  const owner = await createCustomer();
  const other = await createCustomer();
  const instructor = await createInstructor();
  const unrelatedInstructor = await createInstructor();
  const target = await createClass(
    owner.id,
    instructor.id,
    new Date(Date.now() + 86400000),
  );
  const own = await createClass(
    other.id,
    unrelatedInstructor.id,
    new Date(Date.now() + 172800000),
  );
  const child = await createChild(owner.id);
  await createClassAttendance(target.id, child.id);
  return { owner, other, instructor, unrelatedInstructor, target, own, child };
}

describe("Class authorization", () => {
  it("scopes summaries and rejects another customer's class and meeting reads", async () => {
    const { owner, other, target, own } = await fixture();
    const cookie = await generateAuthCookie(other.id, "customer");
    const response = await request(server)
      .get("/classes")
      .set("Cookie", cookie)
      .expect(200);
    expect(
      response.body.classes.map((item: { id: number }) => item.id),
    ).toEqual([own.id]);
    await request(server)
      .get(`/classes/${owner.id}`)
      .set("Cookie", cookie)
      .expect(403);
    expect(
      response.body.classes.some(
        (item: { id: number }) => item.id === target.id,
      ),
    ).toBe(false);
  });

  it("rejects cross-customer mutations and leaves mixed batch cancellation unchanged", async () => {
    const { other, target, own, child, instructor } = await fixture();
    const cookie = await generateAuthCookie(other.id, "customer");
    await request(server)
      .delete(`/classes/${target.id}`)
      .set("Cookie", cookie)
      .expect(403);
    await request(server)
      .patch(`/classes/${target.id}/cancel`)
      .set("Cookie", cookie)
      .expect(403);
    await request(server)
      .patch(`/classes/${target.id}/status`)
      .set("Cookie", cookie)
      .send({ status: "completed" })
      .expect(403);
    await request(server)
      .post(`/classes/${target.id}/rebook`)
      .set("Cookie", cookie)
      .send({
        customerId: other.id,
        instructorId: instructor.id,
        dateTime: new Date(Date.now() + 86400000).toISOString(),
        childrenIds: [child.id],
      })
      .expect(403);
    await request(server)
      .post("/classes/cancel-classes")
      .set("Cookie", cookie)
      .send({ classIds: [own.id, target.id] })
      .expect(403);
    expect(
      (await prisma.class.findUniqueOrThrow({ where: { id: target.id } }))
        .status,
    ).toBe("booked");
    expect(
      (await prisma.class.findUniqueOrThrow({ where: { id: own.id } })).status,
    ).toBe("booked");
    expect(
      await prisma.classAttendance.count({ where: { classId: target.id } }),
    ).toBe(1);
  });

  it("allows assigned instructor attendance while rejecting unrelated instructor and foreign children", async () => {
    const { other, instructor, unrelatedInstructor, target, child } =
      await fixture();
    await request(server)
      .post(`/classes/${target.id}/attendance`)
      .set(
        "Cookie",
        await generateAuthCookie(unrelatedInstructor.id, "instructor"),
      )
      .send({ childrenIds: [] })
      .expect(403);
    const foreignChild = await createChild(other.id);
    const cookie = await generateAuthCookie(instructor.id, "instructor");
    await request(server)
      .post(`/classes/${target.id}/attendance`)
      .set("Cookie", cookie)
      .send({ childrenIds: [foreignChild.id] })
      .expect(403);
    await request(server)
      .post(`/classes/${target.id}/attendance`)
      .set("Cookie", cookie)
      .send({ childrenIds: [child.id] })
      .expect(200);
    await request(server)
      .patch(`/classes/${target.id}/status`)
      .set(
        "Cookie",
        await generateAuthCookie(unrelatedInstructor.id, "instructor"),
      )
      .send({ status: "completed" })
      .expect(403);
  });

  it("rejects changing the rebook customer or attaching foreign children before mutating", async () => {
    const { owner, other, instructor, target, child } = await fixture();
    const cookie = await generateAuthCookie(owner.id, "customer");
    const body = {
      customerId: other.id,
      instructorId: instructor.id,
      dateTime: new Date(Date.now() + 86400000).toISOString(),
      childrenIds: [child.id],
    };
    await request(server)
      .post(`/classes/${target.id}/rebook`)
      .set("Cookie", cookie)
      .send(body)
      .expect(403);
    const foreignChild = await createChild(other.id);
    await request(server)
      .post(`/classes/${target.id}/rebook`)
      .set("Cookie", cookie)
      .send({ ...body, customerId: owner.id, childrenIds: [foreignChild.id] })
      .expect(403);
  });
});

describe("Recurring class authorization", () => {
  it("requires authentication, enforces ownership, and omits instructor password hashes", async () => {
    const owner = await createCustomer();
    const other = await createCustomer();
    const instructor = await createInstructor();
    const admin = await createAdmin();
    const plan = await createPlan();
    const subscription = await createSubscription(plan.id, owner.id);
    const recurring = await prisma.recurringClass.create({
      data: {
        subscriptionId: subscription.id,
        instructorId: instructor.id,
        startAt: new Date(),
      },
    });
    await request(server).get(`/recurring-classes/${recurring.id}`).expect(401);
    await request(server)
      .get(`/recurring-classes/by-instructorId?instructorId=${instructor.id}`)
      .expect(401);
    const cookie = await generateAuthCookie(other.id, "customer");
    await request(server)
      .get(`/recurring-classes/${recurring.id}`)
      .set("Cookie", cookie)
      .expect(403);
    await request(server)
      .get(`/recurring-classes?subscriptionId=${subscription.id}`)
      .set("Cookie", cookie)
      .expect(403);
    await request(server)
      .get(`/recurring-classes/history-count?subscriptionId=${subscription.id}`)
      .set("Cookie", cookie)
      .expect(403);
    const response = await request(server)
      .get(`/recurring-classes/${recurring.id}`)
      .set("Cookie", await generateAuthCookie(owner.id, "customer"))
      .expect(200);
    expect(response.body.instructor).not.toHaveProperty("password");
    await request(server)
      .get(`/recurring-classes/${recurring.id}`)
      .set("Cookie", await generateAuthCookie(admin.id, "admin"))
      .expect(200);
  });
});

describe("Class state permissions", () => {
  it("rejects single and mixed bulk cancellation on the class day in JST", async () => {
    const { owner, instructor, target } = await fixture();
    const cookie = await generateAuthCookie(owner.id, "customer");
    const realNow = new Date();
    const jstDate = new Date(realNow.getTime() + 9 * 3600000)
      .toISOString()
      .slice(0, 10);
    const sameDayClass = await createClass(
      owner.id,
      instructor.id,
      new Date(`${jstDate}T23:00:00+09:00`),
    );
    const child = await createChild(owner.id);
    await createClassAttendance(sameDayClass.id, child.id);

    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(`${jstDate}T00:00:00+09:00`));
    try {
      await request(server)
        .patch(`/classes/${sameDayClass.id}/cancel`)
        .set("Cookie", cookie)
        .expect(409);
      await request(server)
        .post("/classes/cancel-classes")
        .set("Cookie", cookie)
        .send({ classIds: [target.id, sameDayClass.id] })
        .expect(409);
      const unchanged = await prisma.class.findMany({
        where: { id: { in: [target.id, sameDayClass.id] } },
      });
      expect(unchanged.every((item) => item.status === "booked")).toBe(true);
      expect(
        await prisma.classAttendance.count({
          where: { classId: sameDayClass.id },
        }),
      ).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });
  it("denies customer administrative states/deletion and preserves historical classes", async () => {
    const { owner, target } = await fixture();
    const cookie = await generateAuthCookie(owner.id, "customer");
    await request(server)
      .delete(`/classes/${target.id}`)
      .set("Cookie", cookie)
      .expect(403);
    for (const status of [
      "completed",
      "canceledByInstructor",
      "canceledByAdmin",
    ]) {
      await request(server)
        .patch(`/classes/${target.id}/status`)
        .set("Cookie", cookie)
        .send({ status })
        .expect(403);
    }
    const historical = await createClass(
      owner.id,
      target.instructorId!,
      new Date(Date.now() - 86400000),
    );
    await prisma.class.update({
      where: { id: historical.id },
      data: { status: "completed" },
    });
    await request(server)
      .patch(`/classes/${historical.id}/cancel`)
      .set("Cookie", cookie)
      .expect(409);
    await request(server)
      .post("/classes/cancel-classes")
      .set("Cookie", cookie)
      .send({ classIds: [target.id, historical.id] })
      .expect(409);
    expect(
      (await prisma.class.findUniqueOrThrow({ where: { id: historical.id } }))
        .status,
    ).toBe("completed");
    expect(
      (await prisma.class.findUniqueOrThrow({ where: { id: target.id } }))
        .status,
    ).toBe("booked");
    await request(server)
      .patch(`/classes/${target.id}/cancel`)
      .set("Cookie", cookie)
      .expect(200);
  });
  it("allows assigned instructors only to complete ended booked classes", async () => {
    const { instructor, target } = await fixture();
    const cookie = await generateAuthCookie(instructor.id, "instructor");
    await request(server)
      .patch(`/classes/${target.id}/status`)
      .set("Cookie", cookie)
      .send({ status: "canceledByAdmin" })
      .expect(403);
    await request(server)
      .patch(`/classes/${target.id}/status`)
      .set("Cookie", cookie)
      .send({ status: "completed" })
      .expect(409);
    await prisma.class.update({
      where: { id: target.id },
      data: { dateTime: new Date(Date.now() - 3600000) },
    });
    await request(server)
      .patch(`/classes/${target.id}/status`)
      .set("Cookie", cookie)
      .send({ status: "completed" })
      .expect(200);
  });
});
