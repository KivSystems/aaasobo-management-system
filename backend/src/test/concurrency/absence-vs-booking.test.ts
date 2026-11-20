import "../mockEmail";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { server } from "../../server";
import { prisma } from "../setup";
import { createAdminAuthCookie, createInstructor } from "../testUtils";
import { createRebookingCustomer, requestRebooking } from "./rebooking";
import { getConcurrencyConfig } from "./config";

describe("concurrency: absence creation vs booking race", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const { repetitions } = getConcurrencyConfig();

  for (let repetition = 1; repetition <= repetitions; repetition += 1) {
    it(`absence operation always wins and booking does not remain confirmed (run #${repetition})`, async () => {
      const adminAuthCookie = await createAdminAuthCookie();
      const instructor = await createInstructor();

      const customer = await createRebookingCustomer();
      const targetDateTime = new Date("2025-01-15T00:00:00.000Z");

      const rebookRequest = requestRebooking(
        customer,
        adminAuthCookie,
        instructor.id,
        targetDateTime,
      );

      const absenceRequest = request(server)
        .post(`/instructors/${instructor.id}/absences`)
        .set("Cookie", adminAuthCookie)
        .send({ absentAt: targetDateTime.toISOString() });

      const [rebookResponse, absenceResponse] = await Promise.all([
        rebookRequest,
        absenceRequest,
      ]);
      expect(absenceResponse.status).toBe(201);
      expect([201, 400, 409]).toContain(rebookResponse.status);

      const bookedOrRebookedCount = await prisma.class.count({
        where: {
          instructorId: instructor.id,
          dateTime: targetDateTime,
          status: {
            in: ["booked", "rebooked"],
          },
        },
      });

      const absenceCount = await prisma.instructorAbsence.count({
        where: {
          instructorId: instructor.id,
          absentAt: targetDateTime,
        },
      });

      expect(absenceCount).toBe(1);
      expect(bookedOrRebookedCount).toBe(0);

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
    });
  }
});
