import "../mockEmail";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { server } from "../../server";
import { prisma } from "../setup";
import { createAdminAuthCookie, createInstructor } from "../testUtils";
import { createRebookingCustomer, requestRebooking } from "./rebooking";
import { getConcurrencyConfig } from "./config";

describe("concurrency: schedule update vs booking race", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const { repetitions } = getConcurrencyConfig();

  for (let repetition = 1; repetition <= repetitions; repetition += 1) {
    it(`keeps schedule and booking state consistent when slot is removed (run #${repetition})`, async () => {
      const adminAuthCookie = await createAdminAuthCookie();
      const instructor = await createInstructor();

      await request(server)
        .post(`/instructors/${instructor.id}/schedules`)
        .set("Cookie", adminAuthCookie)
        .send({
          effectiveFrom: "2025-01-01",
          timezone: "Asia/Tokyo",
          slots: [{ weekday: 3, startTime: "00:00" }],
        })
        .expect(201);

      const customer = await createRebookingCustomer();
      const targetDateTime = new Date("2025-01-15T00:00:00.000Z");

      const rebookRequest = requestRebooking(
        customer,
        adminAuthCookie,
        instructor.id,
        targetDateTime,
      );

      const scheduleUpdateRequest = request(server)
        .post(`/instructors/${instructor.id}/schedules`)
        .set("Cookie", adminAuthCookie)
        .send({
          effectiveFrom: "2025-01-15",
          timezone: "Asia/Tokyo",
          slots: [{ weekday: 4, startTime: "00:00" }],
        });

      const [rebookResponse, scheduleUpdateResponse] = await Promise.all([
        rebookRequest,
        scheduleUpdateRequest,
      ]);

      expect(scheduleUpdateResponse.status).toBe(201);
      expect([201, 400, 409, 500]).toContain(rebookResponse.status);

      const bookedOrRebookedCount = await prisma.class.count({
        where: {
          instructorId: instructor.id,
          dateTime: targetDateTime,
          status: {
            in: ["booked", "rebooked"],
          },
        },
      });

      const activeSchedule = await prisma.instructorSchedule.findFirst({
        where: {
          instructorId: instructor.id,
          effectiveFrom: { lte: targetDateTime },
          OR: [{ effectiveTo: null }, { effectiveTo: { gt: targetDateTime } }],
        },
        include: { slots: true },
      });

      const hasTargetSlot = !!activeSchedule?.slots.some(
        (slot) =>
          slot.weekday === 3 &&
          slot.startTime.toISOString().slice(11, 16) === "00:00",
      );

      expect(bookedOrRebookedCount).toBe(0);
      expect(hasTargetSlot).toBe(false);

      const canceledClass = await prisma.class.findFirst({
        where: {
          instructorId: instructor.id,
          customerId: customer.customerId,
          dateTime: targetDateTime,
          status: "canceledByInstructor",
        },
      });

      if (rebookResponse.status === 201) {
        expect(canceledClass).toBeTruthy();
        expect(canceledClass?.rebookableUntil).toBeTruthy();
      }
    }, 15000);
  }
});
