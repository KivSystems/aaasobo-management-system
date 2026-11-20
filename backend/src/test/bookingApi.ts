import request from "supertest";
const { faker } = require("@faker-js/faker");
import { server } from "../server";

export async function registerSubscription(
  authCookie: string,
  customerId: number,
  planId: number,
  subscriptionStartAtIso: string,
) {
  const response = await request(server)
    .post(`/customers/${customerId}/subscription`)
    .set("Cookie", authCookie)
    .send({
      planId,
      startAt: subscriptionStartAtIso,
      selectType: `https://example.com/subscriptions/${faker.string.uuid()}`,
    })
    .expect(200);

  const subscriptionId = response.body.newSubscription?.id;
  if (typeof subscriptionId !== "number") {
    throw new Error("Subscription creation did not return an ID");
  }
  return subscriptionId;
}

export async function createRecurringClass(args: {
  authCookie: string;
  instructorId: number;
  customerId: number;
  childrenIds: number[];
  subscriptionId: number;
  startDate: string;
  timezone: string;
  slot: { weekday: number; startTime: string };
}) {
  await request(server)
    .post("/recurring-classes")
    .set("Cookie", args.authCookie)
    .send({
      instructorId: args.instructorId,
      weekday: args.slot.weekday,
      startTime: args.slot.startTime,
      customerId: args.customerId,
      childrenIds: args.childrenIds,
      subscriptionId: args.subscriptionId,
      startDate: args.startDate,
      timezone: args.timezone,
    })
    .expect(201);
}
