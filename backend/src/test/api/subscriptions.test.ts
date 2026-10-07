import { describe, it, expect } from "vitest";
import request from "supertest";
import { server } from "../../server";
import { prisma } from "../setup";
import {
  createAdmin,
  createCustomer,
  createPlan,
  createSubscription,
  generateAuthCookie,
  createInstructor,
  createClass,
} from "../testUtils";

describe("GET /subscriptions/:id", () => {
  it("succeed returning subscription by id (customer auth)", async () => {
    const customer = await createCustomer();
    const authCookie = await generateAuthCookie(customer.id, "customer");
    const plan = await createPlan();
    const subscription = await createSubscription(plan.id, customer.id, {
      startAt: new Date("2024-01-01T00:00:00.000Z"),
      endAt: null,
    });

    const response = await request(server)
      .get(`/subscriptions/${subscription.id}`)
      .set("Cookie", authCookie)
      .expect(200);

    expect(response.body).toMatchObject({
      id: subscription.id,
      planId: plan.id,
      customerId: customer.id,
      selectType: subscription.selectType,
      startAt: "2024-01-01T00:00:00.000Z",
      endAt: null,
      plan: {
        id: plan.id,
        weeklyClassTimes: plan.weeklyClassTimes,
      },
      customer: {
        id: customer.id,
        email: customer.email,
        hasSeenWelcome: customer.hasSeenWelcome,
      },
    });

    expect(response.body.plan.englishBackground).toBe(plan.englishBackground);
  });

  it("return 400 for invalid subscription id (with auth)", async () => {
    const customer = await createCustomer();
    const authCookie = await generateAuthCookie(customer.id, "customer");

    const response = await request(server)
      .get("/subscriptions/invalid")
      .set("Cookie", authCookie)
      .expect(400);

    expect(response.body.message).toBe("Invalid parameters");
  });

  it("return 404 for non-existent subscription", async () => {
    const customer = await createCustomer();
    const authCookie = await generateAuthCookie(customer.id, "customer");

    const response = await request(server)
      .get("/subscriptions/999999")
      .set("Cookie", authCookie)
      .expect(404);

    expect(response.body.error).toBe("Subscription not found.");
  });
});

describe("subscription URL validation", () => {
  it.each([
    "not a URL",
    "   ",
    "javascript:alert(1)",
    "ftp://example.com/subscription",
  ])(
    "rejects %j on every subscription write without changing data",
    async (selectType) => {
      const admin = await createAdmin();
      const authCookie = await generateAuthCookie(admin.id, "admin");
      const customer = await createCustomer();
      const plan = await createPlan({
        name: "QA twice weekly",
        weeklyClassTimes: 2,
        description: "QA",
        englishBackground: 0,
      });
      const subscription = await createSubscription(plan.id, customer.id);
      const originalCount = await prisma.subscription.count();
      const updateSubscriptionData = {
        selectType,
        planId: plan.id,
        times: 1,
        recurringClassIds: [],
      };

      for (const endpoint of [
        "update-select-type",
        "increase-recurring-class",
      ]) {
        const response = await request(server)
          .patch(`/subscriptions/${subscription.id}/${endpoint}`)
          .set("Cookie", authCookie)
          .send({ updateSubscriptionData })
          .expect(400);
        expect(response.body.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["updateSubscriptionData", "selectType"],
            }),
          ]),
        );
      }
      await request(server)
        .post(
          `/subscriptions/${subscription.id}/decrease-recurring-class/preview`,
        )
        .set("Cookie", authCookie)
        .send({ updateSubscriptionData })
        .expect(400);
      await request(server)
        .post(`/customers/${customer.id}/subscription`)
        .set("Cookie", authCookie)
        .send({ selectType, planId: plan.id, startAt: "2026-10-01" })
        .expect(400);

      expect(await prisma.subscription.count()).toBe(originalCount);
      const persisted = await prisma.subscription.findUniqueOrThrow({
        where: { id: subscription.id },
      });
      expect(persisted.selectType).toBe(subscription.selectType);
    },
  );

  it("saves a long HTTP(S) URL with surrounding whitespace trimmed", async () => {
    const admin = await createAdmin();
    const authCookie = await generateAuthCookie(admin.id, "admin");
    const customer = await createCustomer();
    const plan = await createPlan();
    const subscription = await createSubscription(plan.id, customer.id);
    const url =
      "https://dashboard.stripe.com/subscriptions/sub_1234567890abcdefghijklmnopqrstuvwxyz";

    await request(server)
      .patch(`/subscriptions/${subscription.id}/update-select-type`)
      .set("Cookie", authCookie)
      .send({ updateSubscriptionData: { selectType: `  ${url}  ` } })
      .expect(200);

    const persisted = await prisma.subscription.findUniqueOrThrow({
      where: { id: subscription.id },
    });
    expect(persisted.selectType).toBe(url);
  });
});

describe("subscription cancellation with class versions", () => {
  it("preserves historical end dates while canceling future bookings across versions", async () => {
    const cookie = await generateAuthCookie((await createAdmin()).id, "admin");
    const customer = await createCustomer();
    const instructor = await createInstructor();
    const subscription = await createSubscription(
      (await createPlan()).id,
      customer.id,
      { endAt: null },
    );
    const oldEnd = new Date("2026-09-15T01:00:00Z");
    const historical = await prisma.recurringClass.create({
      data: {
        subscriptionId: subscription.id,
        instructorId: instructor.id,
        startAt: new Date("2026-09-01T01:00:00Z"),
        endAt: oldEnd,
      },
    });
    const pending = await prisma.recurringClass.create({
      data: {
        subscriptionId: subscription.id,
        instructorId: instructor.id,
        startAt: oldEnd,
        endAt: new Date("2026-11-01T01:00:00Z"),
        previousRecurringClassId: historical.id,
      },
    });
    const latest = await prisma.recurringClass.create({
      data: {
        subscriptionId: subscription.id,
        instructorId: instructor.id,
        startAt: pending.endAt,
        previousRecurringClassId: pending.id,
      },
    });
    const past = await createClass(
      customer.id,
      instructor.id,
      new Date("2026-09-10T01:00:00Z"),
      {
        subscriptionId: subscription.id,
        recurringClassId: historical.id,
        status: "completed",
      },
    );
    for (const version of [pending, latest])
      await createClass(
        customer.id,
        instructor.id,
        new Date(
          version.id === pending.id
            ? "2026-10-31T01:00:00Z"
            : "2026-11-05T01:00:00Z",
        ),
        { subscriptionId: subscription.id, recurringClassId: version.id },
      );
    await request(server)
      .delete(`/subscriptions/${subscription.id}`)
      .set("Cookie", cookie)
      .send({ cancellationDate: "2026-10-30" })
      .expect(200);
    expect(await prisma.class.findMany()).toEqual([past]);
    expect(
      (
        await prisma.recurringClass.findUniqueOrThrow({
          where: { id: historical.id },
        })
      ).endAt,
    ).toEqual(oldEnd);
    for (const version of [pending, latest])
      expect(
        (
          await prisma.recurringClass.findUniqueOrThrow({
            where: { id: version.id },
          })
        ).endAt,
      ).toEqual(new Date("2026-10-30"));
  });
});
