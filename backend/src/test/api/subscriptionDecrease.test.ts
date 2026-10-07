import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import type { Class } from "@prisma/client";
import { server } from "../../server";
import { prisma } from "../setup";
import {
  createAdmin,
  createCustomer,
  createPlan,
  createSubscription,
  createInstructor,
  createChild,
  createClass,
  generateAuthCookie,
} from "../testUtils";

afterEach(() => vi.useRealTimers());
async function fixture() {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-09-24T03:00:00Z"));
  const cookie = await generateAuthCookie((await createAdmin()).id, "admin");
  const customer = await createCustomer();
  const instructor = await createInstructor();
  const child = await createChild(customer.id, { name: "Test child" });
  const plan = await createPlan({
    name: "Twice weekly",
    weeklyClassTimes: 2,
    description: "",
    englishBackground: 0,
  });
  const smallerPlan = await createPlan({
    name: "Once weekly",
    weeklyClassTimes: 1,
    description: "",
    englishBackground: 0,
  });
  const subscription = await createSubscription(plan.id, customer.id, {
    endAt: null,
  });
  const a = await prisma.recurringClass.create({
    data: {
      subscriptionId: subscription.id,
      instructorId: instructor.id,
      startAt: new Date("2026-09-07T01:00:00Z"),
    },
  });
  const b = await prisma.recurringClass.create({
    data: {
      subscriptionId: subscription.id,
      instructorId: instructor.id,
      startAt: new Date("2026-09-08T01:00:00Z"),
    },
  });
  const aBookings: Class[] = [],
    bBookings: Class[] = [];
  for (let index = 0; index < 4; index++) {
    for (const [series, bookings] of [
      [a, aBookings],
      [b, bBookings],
    ] as const) {
      const c = await createClass(
        customer.id,
        instructor.id,
        new Date(
          `2026-10-${String(1 + index * 7).padStart(2, "0")}T${series.id === a.id ? "01" : "02"}:00:00Z`,
        ),
        {
          recurringClassId: series.id,
          subscriptionId: subscription.id,
          status: "rebooked",
        },
      );
      await prisma.classAttendance.create({
        data: { classId: c.id, childrenId: child.id },
      });
      bookings.push(c);
    }
  }
  const data = {
    planId: smallerPlan.id,
    recurringClassIds: [a.id],
    selectType: subscription.selectType,
  };
  const url = `/subscriptions/${subscription.id}/decrease-recurring-class`;
  const preview = () =>
    request(server)
      .post(`${url}/preview`)
      .set("Cookie", cookie)
      .send({ updateSubscriptionData: data });
  const apply = (previewToken: string) =>
    request(server)
      .patch(url)
      .set("Cookie", cookie)
      .send({ updateSubscriptionData: { ...data, previewToken } });
  return {
    cookie,
    customer,
    instructor,
    subscription,
    smallerPlan,
    a,
    b,
    aBookings,
    bBookings,
    data,
    url,
    preview,
    apply,
  };
}

describe("subscription decrease confirmation", () => {
  it("preserves today's completed and started classes and attendance while removing future bookings", async () => {
    const f = await fixture();
    const child = await createChild(f.customer.id);
    const preserved = [];
    for (const [dateTime, status] of [
      ["2026-09-24T01:00:00Z", "completed"],
      ["2026-09-24T02:50:00Z", "booked"],
    ] as const) {
      const booking = await createClass(
        f.customer.id,
        f.instructor.id,
        new Date(dateTime),
        {
          recurringClassId: f.a.id,
          subscriptionId: f.subscription.id,
          status,
        },
      );
      const attendance = await prisma.classAttendance.create({
        data: { classId: booking.id, childrenId: child.id },
      });
      preserved.push({ booking, attendance });
    }
    const siblingAttendance = await prisma.classAttendance.findMany({
      where: { classId: { in: f.bBookings.map((c) => c.id) } },
      orderBy: { classId: "asc" },
    });
    const preview = (await f.preview().expect(200)).body;
    for (const { booking } of preserved)
      expect(
        preview.calendar.after.some(
          (event: { id: string }) => event.id === String(booking.id),
        ),
      ).toBe(true);
    await f.apply(preview.previewToken).expect(200);
    for (const { booking, attendance } of preserved) {
      expect(
        await prisma.class.findUnique({ where: { id: booking.id } }),
      ).toEqual(booking);
      expect(
        await prisma.classAttendance.findUnique({
          where: {
            classId_childrenId: {
              classId: attendance.classId,
              childrenId: attendance.childrenId,
            },
          },
        }),
      ).toEqual(attendance);
    }
    expect(
      await prisma.class.count({
        where: { id: { in: f.aBookings.map((c) => c.id) } },
      }),
    ).toBe(0);
    expect(
      await prisma.class.findMany({
        where: { recurringClassId: f.b.id },
        orderBy: { id: "asc" },
      }),
    ).toEqual(f.bBookings);
    expect(
      await prisma.classAttendance.findMany({
        where: { classId: { in: f.bBookings.map((c) => c.id) } },
        orderBy: { classId: "asc" },
      }),
    ).toEqual(siblingAttendance);
  });

  it("accepts a preview after the clock advances without changing affected bookings", async () => {
    const f = await fixture();
    const preview = (await f.preview().expect(200)).body;
    vi.setSystemTime(new Date("2026-09-24T03:00:10Z"));
    expect((await f.preview().expect(200)).body.previewToken).toBe(
      preview.previewToken,
    );
    await f.apply(preview.previewToken).expect(200);
    expect(
      await prisma.class.count({ where: { recurringClassId: f.a.id } }),
    ).toBe(0);
  });

  it("rejects confirmation after a selected booking starts and accepts a refreshed preview", async () => {
    const f = await fixture();
    const starting = await createClass(
      f.customer.id,
      f.instructor.id,
      new Date("2026-09-24T03:00:05Z"),
      {
        recurringClassId: f.a.id,
        subscriptionId: f.subscription.id,
      },
    );
    const preview = (await f.preview().expect(200)).body;
    const before = await prisma.class.findMany({ orderBy: { id: "asc" } });
    vi.setSystemTime(new Date("2026-09-24T03:00:10Z"));
    await f.apply(preview.previewToken).expect(409);
    expect(await prisma.class.findMany({ orderBy: { id: "asc" } })).toEqual(
      before,
    );
    expect(
      (
        await prisma.subscription.findUniqueOrThrow({
          where: { id: f.subscription.id },
        })
      ).planId,
    ).toBe(f.subscription.planId);
    const refreshed = (await f.preview().expect(200)).body;
    expect(refreshed.previewToken).not.toBe(preview.previewToken);
    await f.apply(refreshed.previewToken).expect(200);
    expect(
      await prisma.class.findUnique({ where: { id: starting.id } }),
    ).toEqual(starting);
  });

  it("removes pending predecessor bookings for the selected slot without changing sibling bookings or history", async () => {
    const f = await fixture();
    const historicalEnd = new Date("2026-09-15T01:00:00Z");
    const historical = await prisma.recurringClass.create({
      data: {
        subscriptionId: f.subscription.id,
        instructorId: f.instructor.id,
        startAt: new Date("2026-09-01T01:00:00Z"),
        endAt: historicalEnd,
      },
    });
    const predecessor = await prisma.recurringClass.create({
      data: {
        subscriptionId: f.subscription.id,
        instructorId: f.instructor.id,
        startAt: historicalEnd,
        endAt: new Date("2026-10-15T01:00:00Z"),
        previousRecurringClassId: historical.id,
      },
    });
    await prisma.recurringClass.update({
      where: { id: f.a.id },
      data: {
        startAt: new Date("2026-10-15T01:00:00Z"),
        previousRecurringClassId: predecessor.id,
      },
    });
    await prisma.class.updateMany({
      where: { id: { in: f.aBookings.slice(0, 2).map((c) => c.id) } },
      data: { recurringClassId: predecessor.id },
    });
    const past = await createClass(
      f.customer.id,
      f.instructor.id,
      new Date("2026-09-10T01:00:00Z"),
      {
        subscriptionId: f.subscription.id,
        recurringClassId: historical.id,
        status: "completed",
      },
    );
    const preview = (await f.preview().expect(200)).body;
    for (const c of f.aBookings)
      expect(
        preview.calendar.after.some(
          (event: { id: string }) => event.id === String(c.id),
        ),
      ).toBe(false);
    await f.apply(preview.previewToken).expect(200);
    expect(
      await prisma.class.findMany({
        where: { id: { in: f.aBookings.map((c) => c.id) } },
      }),
    ).toHaveLength(0);
    expect(await prisma.class.findUnique({ where: { id: past.id } })).toEqual(
      past,
    );
    expect(
      await prisma.class.findMany({
        where: { recurringClassId: f.b.id },
        orderBy: { id: "asc" },
      }),
    ).toEqual(f.bBookings);
    expect(
      (
        await prisma.recurringClass.findUniqueOrThrow({
          where: { id: historical.id },
        })
      ).endAt,
    ).toEqual(historicalEnd);
    expect(
      (
        await prisma.recurringClass.findUniqueOrThrow({
          where: { id: predecessor.id },
        })
      ).endAt,
    ).toEqual(new Date());
    expect(
      (await prisma.recurringClass.findUniqueOrThrow({ where: { id: f.a.id } }))
        .endAt,
    ).toEqual(new Date());
  });

  it("rejects a decrease with unresolved legacy pending versions without changing bookings", async () => {
    const f = await fixture();
    const legacy = await prisma.recurringClass.create({
      data: {
        subscriptionId: f.subscription.id,
        instructorId: f.instructor.id,
        startAt: new Date("2026-09-01T01:00:00Z"),
        endAt: new Date("2026-10-15T01:00:00Z"),
      },
    });
    await createClass(
      f.customer.id,
      f.instructor.id,
      new Date("2026-10-01T03:00:00Z"),
      { subscriptionId: f.subscription.id, recurringClassId: legacy.id },
    );
    const before = await prisma.class.findMany({ orderBy: { id: "asc" } });
    const response = await f.preview().expect(409);
    expect(response.body.error).toContain("変更前のクラス");
    expect(await prisma.class.findMany({ orderBy: { id: "asc" } })).toEqual(
      before,
    );
    expect(
      (
        await prisma.subscription.findUniqueOrThrow({
          where: { id: f.subscription.id },
        })
      ).planId,
    ).toBe(f.subscription.planId);
  });

  it("rejects a stale preview when a predecessor booking changes", async () => {
    const f = await fixture();
    const predecessor = await prisma.recurringClass.create({
      data: {
        subscriptionId: f.subscription.id,
        instructorId: f.instructor.id,
        startAt: new Date("2026-09-01T01:00:00Z"),
        endAt: new Date("2026-10-15T01:00:00Z"),
      },
    });
    await prisma.recurringClass.update({
      where: { id: f.a.id },
      data: {
        startAt: predecessor.endAt,
        previousRecurringClassId: predecessor.id,
      },
    });
    await prisma.class.update({
      where: { id: f.aBookings[0].id },
      data: { recurringClassId: predecessor.id },
    });
    const preview = (await f.preview().expect(200)).body;
    await prisma.class.update({
      where: { id: f.aBookings[0].id },
      data: { status: "canceledByCustomer" },
    });
    const before = await prisma.class.findMany({ orderBy: { id: "asc" } });
    await f.apply(preview.previewToken).expect(409);
    expect(await prisma.class.findMany({ orderBy: { id: "asc" } })).toEqual(
      before,
    );
    expect(
      (
        await prisma.subscription.findUniqueOrThrow({
          where: { id: f.subscription.id },
        })
      ).planId,
    ).toBe(f.subscription.planId);
  });

  it.each([0, 1])(
    "reduces unused slots with %i assigned classes without deleting bookings",
    async (assignedCount) => {
      const f = await fixture();
      const removedIds = assignedCount === 0 ? [f.a.id, f.b.id] : [f.a.id];
      await prisma.class.deleteMany({
        where: { recurringClassId: { in: removedIds } },
      });
      await prisma.recurringClass.deleteMany({
        where: { id: { in: removedIds } },
      });
      await prisma.recurringClass.create({
        data: { subscriptionId: f.subscription.id },
      });
      const otherSubscription = await createSubscription(
        f.subscription.planId,
        f.customer.id,
        { endAt: null },
      );
      const otherSeries = await prisma.recurringClass.create({
        data: {
          subscriptionId: otherSubscription.id,
          instructorId: f.instructor.id,
        },
      });
      await createClass(
        f.customer.id,
        f.instructor.id,
        new Date("2026-10-09T03:00:00Z"),
        {
          subscriptionId: otherSubscription.id,
          recurringClassId: otherSeries.id,
        },
      );
      const before = await prisma.class.findMany({ orderBy: { id: "asc" } });
      const data = { ...f.data, recurringClassIds: [] };
      const preview = (
        await request(server)
          .post(`${f.url}/preview`)
          .set("Cookie", f.cookie)
          .send({ updateSubscriptionData: data })
          .expect(200)
      ).body;
      expect(preview.calendar.after).toEqual(preview.calendar.before);
      expect(
        (
          await prisma.subscription.findUniqueOrThrow({
            where: { id: f.subscription.id },
          })
        ).planId,
      ).toBe(f.subscription.planId);
      await request(server)
        .patch(f.url)
        .set("Cookie", f.cookie)
        .send({
          updateSubscriptionData: {
            ...data,
            previewToken: preview.previewToken,
          },
        })
        .expect(200);
      expect(
        (
          await prisma.subscription.findUniqueOrThrow({
            where: { id: f.subscription.id },
          })
        ).planId,
      ).toBe(f.smallerPlan.id);
      expect(await prisma.class.findMany({ orderBy: { id: "asc" } })).toEqual(
        before,
      );
      expect(
        await prisma.recurringClass.count({
          where: {
            subscriptionId: f.subscription.id,
            endAt: null,
            instructorId: { not: null },
            startAt: { not: null },
          },
        }),
      ).toBe(assignedCount);
      expect(
        (
          await prisma.recurringClass.findUniqueOrThrow({
            where: { id: otherSeries.id },
          })
        ).endAt,
      ).toBeNull();
      expect(preview.requiredTerminationCount).toBe(0);
    },
  );

  it("requires only assignments exceeding the smaller plan when unused slots exist", async () => {
    const f = await fixture();
    await prisma.plan.update({
      where: { id: f.subscription.planId },
      data: { weeklyClassTimes: 4 },
    });
    const retained = await prisma.recurringClass.create({
      data: {
        subscriptionId: f.subscription.id,
        instructorId: f.instructor.id,
        startAt: new Date("2026-09-09T03:00:00Z"),
      },
    });
    const retainedClass = await createClass(
      f.customer.id,
      f.instructor.id,
      new Date("2026-10-09T03:00:00Z"),
      { subscriptionId: f.subscription.id, recurringClassId: retained.id },
    );
    const data = { ...f.data, recurringClassIds: [f.a.id, f.b.id] };
    const preview = (
      await request(server)
        .post(`${f.url}/preview`)
        .set("Cookie", f.cookie)
        .send({ updateSubscriptionData: data })
        .expect(200)
    ).body;
    await request(server)
      .patch(f.url)
      .set("Cookie", f.cookie)
      .send({
        updateSubscriptionData: { ...data, previewToken: preview.previewToken },
      })
      .expect(200);
    expect(preview.requiredTerminationCount).toBe(2);
    expect(
      await prisma.class.findUnique({ where: { id: retainedClass.id } }),
    ).toEqual(retainedClass);
    expect(
      await prisma.recurringClass.count({
        where: { subscriptionId: f.subscription.id, endAt: null },
      }),
    ).toBe(1);
    expect(
      (
        await prisma.subscription.findUniqueOrThrow({
          where: { id: f.subscription.id },
        })
      ).planId,
    ).toBe(f.smallerPlan.id);
  });

  it("rejects historical schedule versions with a future end date as termination selections", async () => {
    const f = await fixture();
    const ending = await prisma.recurringClass.create({
      data: {
        subscriptionId: f.subscription.id,
        instructorId: f.instructor.id,
        startAt: new Date("2026-09-01"),
        endAt: new Date("2026-10-15"),
      },
    });
    const before = await prisma.class.findMany({ orderBy: { id: "asc" } });
    await request(server)
      .post(`${f.url}/preview`)
      .set("Cookie", f.cookie)
      .send({
        updateSubscriptionData: { ...f.data, recurringClassIds: [ending.id] },
      })
      .expect(400);
    expect(
      (
        await prisma.subscription.findUniqueOrThrow({
          where: { id: f.subscription.id },
        })
      ).planId,
    ).toBe(f.subscription.planId);
    expect(await prisma.class.findMany({ orderBy: { id: "asc" } })).toEqual(
      before,
    );
  });

  it("previews the current calendar with no selection without allowing an empty downgrade", async () => {
    const f = await fixture();
    const data = { ...f.data, recurringClassIds: [] };
    const response = await request(server)
      .post(`${f.url}/preview`)
      .set("Cookie", f.cookie)
      .send({ updateSubscriptionData: data })
      .expect(200);
    expect(response.body.calendar.before.length).toBeGreaterThan(0);
    expect(response.body.calendar.after).toEqual(response.body.calendar.before);
    expect(response.body.rebookedClasses).toEqual([]);
    await request(server)
      .patch(f.url)
      .set("Cookie", f.cookie)
      .send({
        updateSubscriptionData: {
          ...data,
          previewToken: response.body.previewToken,
        },
      })
      .expect(400);
  });

  it("previews selected future rebookings without mutation, removes A, and preserves B and past classes", async () => {
    const f = await fixture();
    const past = await createClass(
      f.customer.id,
      f.instructor.id,
      new Date("2026-09-23T01:00:00Z"),
      { recurringClassId: f.a.id, status: "rebooked" },
    );
    const normal = await createClass(
      f.customer.id,
      f.instructor.id,
      new Date("2026-10-26T01:00:00Z"),
      { recurringClassId: f.a.id },
    );
    const response = await f.preview().expect(200);
    expect(
      response.body.rebookedClasses.map((c: { id: number }) => c.id),
    ).toEqual(f.aBookings.map((c) => c.id));
    expect(response.body.rebookedClasses[0]).toMatchObject({
      instructorName: f.instructor.nickname,
      childrenNames: ["Test child"],
      recurringClassId: f.a.id,
    });
    expect(
      (
        await prisma.subscription.findUniqueOrThrow({
          where: { id: f.subscription.id },
        })
      ).planId,
    ).toBe(f.subscription.planId);
    expect(await prisma.class.count()).toBe(10);
    expect(response.body.calendar.before).toHaveLength(10);
    expect(
      response.body.calendar.after.map((c: { id: string }) => c.id).sort(),
    ).toEqual(
      [...f.bBookings.map((c) => String(c.id)), String(past.id)].sort(),
    );
    await f.apply(response.body.previewToken).expect(200);
    expect(
      await prisma.class.findMany({
        where: { id: { in: [...f.aBookings.map((c) => c.id), normal.id] } },
      }),
    ).toEqual([]);
    expect(
      await prisma.class.count({
        where: { id: { in: [...f.bBookings.map((c) => c.id), past.id] } },
      }),
    ).toBe(5);
    expect(
      (
        await prisma.subscription.findUniqueOrThrow({
          where: { id: f.subscription.id },
        })
      ).planId,
    ).toBe(f.smallerPlan.id);
  });

  it("previews selected classes before the full termination count is chosen", async () => {
    const f = await fixture();
    const threeClassPlan = await createPlan({
      name: "Three times weekly",
      weeklyClassTimes: 3,
      description: "",
      englishBackground: 0,
    });
    await prisma.subscription.update({
      where: { id: f.subscription.id },
      data: { planId: threeClassPlan.id },
    });

    const response = await request(server)
      .post(`${f.url}/preview`)
      .set("Cookie", f.cookie)
      .send({
        updateSubscriptionData: { ...f.data, recurringClassIds: [f.a.id] },
      })
      .expect(200);

    expect(
      response.body.regularClasses.map((item: { id: number }) => item.id),
    ).toEqual([f.a.id]);
    expect(response.body.rebookedClasses).toHaveLength(4);
    expect(
      (
        await prisma.subscription.findUniqueOrThrow({
          where: { id: f.subscription.id },
        })
      ).planId,
    ).toBe(threeClassPlan.id);
  });
  it("rejects stale confirmation without modifying the plan, then accepts a fresh preview", async () => {
    const f = await fixture();
    const original = await f.preview().expect(200);
    await prisma.class.update({
      where: { id: f.aBookings[0].id },
      data: { dateTime: new Date("2026-11-01T01:00:00Z") },
    });
    await f.apply(original.body.previewToken).expect(409);
    expect(
      (
        await prisma.subscription.findUniqueOrThrow({
          where: { id: f.subscription.id },
        })
      ).planId,
    ).toBe(f.subscription.planId);
    expect(await prisma.class.count()).toBe(8);
    await f
      .apply((await f.preview().expect(200)).body.previewToken)
      .expect(200);
  });
  it("requires confirmation even with zero rebookings", async () => {
    const f = await fixture();
    await prisma.class.deleteMany({ where: { recurringClassId: f.a.id } });
    await request(server)
      .patch(f.url)
      .set("Cookie", f.cookie)
      .send({ updateSubscriptionData: f.data })
      .expect(400);
    const response = await f.preview().expect(200);
    expect(response.body.rebookedClasses).toEqual([]);
    await f.apply(response.body.previewToken).expect(200);
  });
  it("rejects foreign and duplicate regular class IDs", async () => {
    const f = await fixture();
    const another = await createSubscription(
      f.subscription.planId,
      f.customer.id,
      { endAt: null },
    );
    const foreign = await prisma.recurringClass.create({
      data: { subscriptionId: another.id },
    });
    for (const recurringClassIds of [[foreign.id], [f.a.id, f.a.id]]) {
      await request(server)
        .post(`${f.url}/preview`)
        .set("Cookie", f.cookie)
        .send({ updateSubscriptionData: { ...f.data, recurringClassIds } })
        .expect(400);
    }
  });
  it("restricts preview and plan updates to admins", async () => {
    const f = await fixture();
    const customerCookie = await generateAuthCookie(f.customer.id, "customer");
    for (const [method, url] of [
      ["post", `${f.url}/preview`],
      ["patch", f.url],
      ["patch", `/subscriptions/${f.subscription.id}/increase-recurring-class`],
      ["patch", `/subscriptions/${f.subscription.id}/update-select-type`],
    ] as const) {
      await request(server)
        [method](url)
        .send({ updateSubscriptionData: f.data })
        .expect(401);
      await request(server)
        [method](url)
        .set("Cookie", customerCookie)
        .send({ updateSubscriptionData: f.data })
        .expect(403);
    }
  });
});
