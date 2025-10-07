import { describe, it, expect } from "vitest";
import request from "supertest";
import { server } from "../../server";
import {
  createAdmin,
  createEvent,
  generateTestEvent,
  generateAuthCookie,
} from "../testUtils";
import { prisma } from "../setup";

describe("GET /admins/event-list", () => {
  it("succeed with multiple events", async () => {
    const event1 = await createEvent();
    const event2 = await createEvent();

    const response = await request(server)
      .get("/admins/event-list")
      .expect(200);

    expect(response.body.data).toEqual([
      { No: 1, ID: event1.id, Event: event1.name, "Color Code": event1.color },
      { No: 2, ID: event2.id, Event: event2.name, "Color Code": event2.color },
    ]);
  });
});

describe("POST /admins/event-list/register", () => {
  it("succeed with authenticated admin", async () => {
    const admin = await createAdmin();
    const eventData = generateTestEvent();
    const authCookie = await generateAuthCookie(admin.id, "admin");

    await request(server)
      .post("/admins/event-list/register")
      .set("Cookie", authCookie)
      .send(eventData)
      .expect(201);

    const createdEvent = await prisma.event.findFirst({
      where: { name: eventData.name },
    });
    expect(createdEvent).toBeTruthy();
  });

  it("fail for unauthenticated request", async () => {
    const eventData = generateTestEvent();

    await request(server)
      .post("/admins/event-list/register")
      .send(eventData)
      .expect(401);
  });
});

describe("PATCH /admins/event-list/update/:id", () => {
  it("succeed with authenticated admin", async () => {
    const admin = await createAdmin();
    const event = await createEvent();
    const authCookie = await generateAuthCookie(admin.id, "admin");
    const updatedName = `更新イベント / Updated Event`;

    await request(server)
      .patch(`/admins/event-list/update/${event.id}`)
      .set("Cookie", authCookie)
      .send({ name: updatedName, color: event.color })
      .expect(200);

    const updatedEvent = await prisma.event.findUnique({
      where: { id: event.id },
    });
    expect(updatedEvent?.name).toBe(updatedName);
  });

  it("fail for unauthenticated request", async () => {
    const event = await createEvent();

    await request(server)
      .patch(`/admins/event-list/update/${event.id}`)
      .send({ name: "Invalid Name", color: event.color })
      .expect(401);
  });
});

describe("DELETE /admins/event-list/:id", () => {
  it("succeed with authenticated admin", async () => {
    const admin = await createAdmin();
    const event = await createEvent();
    const authCookie = await generateAuthCookie(admin.id, "admin");

    await request(server)
      .delete(`/admins/event-list/${event.id}`)
      .set("Cookie", authCookie)
      .expect(200);

    const deletedEvent = await prisma.event.findUnique({
      where: { id: event.id },
    });
    expect(deletedEvent).toBeNull();
  });

  it("fail for unauthenticated request", async () => {
    const event = await createEvent();

    await request(server).delete(`/admins/event-list/${event.id}`).expect(401);
  });
});
