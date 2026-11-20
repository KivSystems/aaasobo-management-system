import "../mockEmail";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { server } from "../../server";
import { prisma } from "../setup";
import { createAdminAuthCookie, createInstructor } from "../testUtils";
import { createRebookingCustomer, requestRebooking } from "./rebooking";
import { getConcurrencyConfig } from "./config";

describe("concurrency: double booking race", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const { repetitions } = getConcurrencyConfig();

  for (let repetition = 1; repetition <= repetitions; repetition += 1) {
    it(`allows only one winner for same instructor+slot (run #${repetition})`, async () => {
      const adminAuthCookie = await createAdminAuthCookie();

      const instructor = await createInstructor();
      const targetDateTime = new Date("2025-01-15T00:00:00.000Z");

      await request(server)
        .post(`/instructors/${instructor.id}/schedules`)
        .set("Cookie", adminAuthCookie)
        .send({
          effectiveFrom: "2025-01-01",
          timezone: "Asia/Tokyo",
          slots: [{ weekday: 3, startTime: "09:00" }],
        })
        .expect(201);

      const customerA = await createRebookingCustomer();
      const customerB = await createRebookingCustomer();
      const responses = await Promise.all([
        requestRebooking(
          customerA,
          adminAuthCookie,
          instructor.id,
          targetDateTime,
        ),
        requestRebooking(
          customerB,
          adminAuthCookie,
          instructor.id,
          targetDateTime,
        ),
      ]);

      const statuses = responses.map((response) => response.status).sort();
      expect(statuses[0]).toBe(201);
      expect([400, 409, 500]).toContain(statuses[1]);

      const activeClasses = await prisma.class.findMany({
        where: {
          instructorId: instructor.id,
          dateTime: targetDateTime,
          status: {
            in: ["booked", "rebooked"],
          },
        },
        select: { status: true },
      });

      expect(activeClasses).toEqual([{ status: "rebooked" }]);
    }, 15000);
  }
});
