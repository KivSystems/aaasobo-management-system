import { describe, it, expect } from "vitest";
import request from "supertest";
import { server } from "../../server";
import {
  createAdmin,
  createEvent,
  createSchedule,
  generateAuthCookie,
} from "../testUtils";
import { prisma } from "../setup";

describe("GET /admins/business-schedule", () => {
  it("succeed with multiple schedules", async () => {
    const event1 = await createEvent();
    const event2 = await createEvent();
    const date1 = new Date("2025-01-15");
    const date2 = new Date("2025-01-20");
    const schedule1 = await createSchedule(event1.id, date1);
    const schedule2 = await createSchedule(event2.id, date2);

    const response = await request(server)
      .get("/admins/business-schedule")
      .expect(200);

    expect(response.body.organizedData).toEqual([
      {
        id: schedule1.id,
        date: "2025-01-15",
        event: event1.name,
        color: event1.color,
      },
      {
        id: schedule2.id,
        date: "2025-01-20",
        event: event2.name,
        color: event2.color,
      },
    ]);
  });
});

describe("POST /admins/business-schedule/update", () => {
  it("succeed with single date", async () => {
    const admin = await createAdmin();
    const event = await createEvent();
    const authCookie = await generateAuthCookie(admin.id, "admin");
    const targetDate = "2025-02-15";

    await request(server)
      .post("/admins/business-schedule/update")
      .set("Cookie", authCookie)
      .send({
        eventId: event.id,
        startDate: targetDate,
      })
      .expect(200);

    const createdSchedule = await prisma.schedule.findFirst({
      where: {
        date: new Date(targetDate),
        eventId: event.id,
      },
    });
    expect(createdSchedule).toBeTruthy();
  });

  it("succeed with date range", async () => {
    const admin = await createAdmin();
    const event = await createEvent();
    const authCookie = await generateAuthCookie(admin.id, "admin");
    const startDate = "2025-03-01";
    const endDate = "2025-03-05";

    await request(server)
      .post("/admins/business-schedule/update")
      .set("Cookie", authCookie)
      .send({
        eventId: event.id,
        startDate,
        endDate,
      })
      .expect(200);

    const createdSchedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        eventId: event.id,
      },
    });
    expect(createdSchedules.length).toBe(5);
  });

  it("fail for unauthenticated request", async () => {
    const event = await createEvent();

    await request(server)
      .post("/admins/business-schedule/update")
      .send({
        eventId: event.id,
        startDate: "2025-04-01",
      })
      .expect(401);
  });
});
