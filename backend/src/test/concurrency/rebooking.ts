import request from "supertest";
import { server } from "../../server";
import { createChild, createClass, createCustomer } from "../testUtils";

export async function createRebookingCustomer() {
  const customer = await createCustomer();
  const child = await createChild(customer.id);
  const oldClass = await createClass(customer.id, undefined, undefined, {
    isFreeTrial: true,
    rebookableUntil: new Date("2025-12-31T00:00:00.000Z"),
  });
  return { customerId: customer.id, childId: child.id, classId: oldClass.id };
}

export function requestRebooking(
  customer: Awaited<ReturnType<typeof createRebookingCustomer>>,
  authCookie: string,
  instructorId: number,
  dateTime: Date,
) {
  return request(server)
    .post(`/classes/${customer.classId}/rebook`)
    .set("Cookie", authCookie)
    .send({
      customerId: customer.customerId,
      childrenIds: [customer.childId],
      instructorId,
      dateTime: dateTime.toISOString(),
    });
}
