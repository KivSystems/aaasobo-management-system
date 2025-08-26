import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma, createTestInstructor, loginAsAdmin } from "./helper";

vi.mock("../../prisma/prismaClient", () => ({
  prisma: createMockPrisma(),
}));

import { prisma } from "../../prisma/prismaClient";
import request from "supertest";
import { server } from "../server";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

let mockTxUpdate: any;

const mockScheduleTransaction = (
  existingSchedule: any,
  createdSchedule: any,
  returnedSchedule: any,
) => {
  mockPrisma.$transaction.mockImplementation(async (callback) => {
    mockTxUpdate = vi.fn().mockResolvedValue(
      existingSchedule
        ? {
            ...existingSchedule,
            effectiveTo: createdSchedule.effectiveFrom,
          }
        : undefined,
    );

    const mockTx = {
      instructorSchedule: {
        findFirst: vi.fn().mockResolvedValue(existingSchedule),
        findUnique: vi.fn().mockResolvedValue(returnedSchedule),
        update: mockTxUpdate,
        create: vi.fn().mockResolvedValue(createdSchedule),
      },
      instructorSlot: {
        createMany: vi
          .fn()
          .mockResolvedValue({ count: returnedSchedule.slots.length }),
      },
    };

    return await callback(mockTx);
  });
};

/**
 * Creates a time-only ISO string
 * @returns Time-only ISO string (e.g., "1970-01-01T10:00:00.000Z")
 */
function time(strings: TemplateStringsArray, ...values: any[]): string {
  const input = strings[0] + (values[0] || "");
  const timeMatch = input.match(/^(\d{1,2}):(\d{2})$/);

  if (timeMatch) {
    const [, hours, minutes] = timeMatch;
    return `1970-01-01T${hours.padStart(2, "0")}:${minutes}:00.000Z`;
  }

  throw new Error(`Invalid time format: "${input}". Use "HH:MM" format.`);
}

/**
 * Convert JST datetime to UTC
 * @returns UTC ISO string
 */
function jst(strings: TemplateStringsArray, ...values: any[]): string {
  const input = strings[0] + (values[0] || "");

  // Match date only: YYYY-MM-DD
  const dateOnlyMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    // Create JST date at 00:00 and convert to UTC
    const jstDate = new Date(`${year}-${month}-${day}T00:00:00+09:00`);
    return jstDate.toISOString();
  }

  // Match datetime: YYYY-MM-DD HH:MM
  const dateTimeMatch = input.match(
    /^(\d{4})-(\d{2})-(\d{2})[ ](\d{1,2}):(\d{2})$/,
  );
  if (dateTimeMatch) {
    const [, year, month, day, hours, minutes] = dateTimeMatch;
    // Create a Date object in JST and convert to UTC
    const jstDate = new Date(
      `${year}-${month}-${day}T${hours.padStart(2, "0")}:${minutes}:00+09:00`,
    );
    return jstDate.toISOString();
  }

  throw new Error(
    `Invalid JST format: "${input}". Use "YYYY-MM-DD" or "YYYY-MM-DD HH:MM" format.`,
  );
}

describe("Instructor Schedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new schedule for instructor with no existing schedules", async () => {
    // Mock instructor without schedule
    const sessionCookie = await loginAsAdmin(server, mockPrisma);
    const instructor = createTestInstructor();
    mockPrisma.instructor.findUnique.mockResolvedValue(instructor);
    mockPrisma.instructorSchedule.findUnique.mockResolvedValue(null);

    const existingSchedule = null;
    const createdSchedule = {
      id: 1,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-02-01"),
      effectiveTo: null,
      timezone: "Asia/Tokyo",
      slots: [
        {
          id: 1,
          scheduleId: 1,
          weekday: 1,
          startTime: new Date(time`09:00`),
        },
        {
          id: 2,
          scheduleId: 1,
          weekday: 3,
          startTime: new Date(time`14:00`),
        },
      ],
    };
    const returnedSchedule = {
      ...createdSchedule,
      effectiveFrom: createdSchedule.effectiveFrom.toISOString(),
      slots: createdSchedule.slots.map((slot) => ({
        ...slot,
        startTime: slot.startTime,
      })),
    };

    mockScheduleTransaction(
      existingSchedule,
      createdSchedule,
      returnedSchedule,
    );

    const requestBody = {
      effectiveFrom: new Date("2025-02-01"),
      timezone: "Asia/Tokyo",
      slots: [
        {
          weekday: 1,
          startTime: "09:00",
        },
        {
          weekday: 3,
          startTime: "14:00",
        },
      ],
    };

    const response = await request(server)
      .post(`/instructors/${instructor.id}/schedules`)
      .set("Cookie", sessionCookie)
      .send(requestBody)
      .expect(201);

    expect(response.body.message).toBe("Schedule version created successfully");
    expect(response.body.data).toMatchObject({
      id: 1,
      instructorId: instructor.id,
      effectiveFrom: "2025-02-01T00:00:00.000Z",
      effectiveTo: null,
      timezone: "Asia/Tokyo",
      slots: [
        {
          id: 1,
          scheduleId: 1,
          weekday: 1,
          startTime: "09:00",
        },
        {
          id: 2,
          scheduleId: 1,
          weekday: 3,
          startTime: "14:00",
        },
      ],
    });
  });

  it("should add a new schedule to instructor with existing schedules", async () => {
    // Mock instructor with an existing active schedule
    const sessionCookie = await loginAsAdmin(server, mockPrisma);
    const instructor = createTestInstructor();
    mockPrisma.instructor.findUnique.mockResolvedValue(instructor);

    const existingSchedule = {
      id: 1,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: null,
      timezone: "Asia/Tokyo",
    };
    const createdSchedule = {
      id: 2,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-03-01"),
      effectiveTo: null,
      timezone: "Asia/Tokyo",
      slots: [
        {
          id: 3,
          scheduleId: 2,
          weekday: 2,
          startTime: new Date(time`10:00`),
        },
        {
          id: 4,
          scheduleId: 2,
          weekday: 4,
          startTime: new Date(time`15:00`),
        },
      ],
    };
    const returnedSchedule = {
      ...createdSchedule,
      effectiveFrom: createdSchedule.effectiveFrom.toISOString(),
      slots: createdSchedule.slots.map((slot) => ({
        ...slot,
        startTime: slot.startTime,
      })),
    };
    mockScheduleTransaction(
      existingSchedule,
      createdSchedule,
      returnedSchedule,
    );

    const requestBody = {
      effectiveFrom: new Date("2025-03-01"),
      timezone: "Asia/Tokyo",
      slots: [
        {
          weekday: 2,
          startTime: "10:00",
        },
        {
          weekday: 4,
          startTime: "15:00",
        },
      ],
    };

    const response = await request(server)
      .post(`/instructors/${instructor.id}/schedules`)
      .set("Cookie", sessionCookie)
      .send(requestBody)
      .expect(201);

    expect(response.body.message).toBe("Schedule version created successfully");
    expect(response.body.data).toMatchObject({
      id: 2,
      instructorId: instructor.id,
      effectiveFrom: "2025-03-01T00:00:00.000Z",
      effectiveTo: null,
      timezone: "Asia/Tokyo",
      slots: [
        {
          id: 3,
          scheduleId: 2,
          weekday: 2,
          startTime: "10:00",
        },
        {
          id: 4,
          scheduleId: 2,
          weekday: 4,
          startTime: "15:00",
        },
      ],
    });

    // Ensure the existing schedule has been ended
    expect(mockTxUpdate).toHaveBeenCalledWith({
      where: { id: existingSchedule.id },
      data: { effectiveTo: createdSchedule.effectiveFrom },
    });
  });
});

describe("Available Slots API - Active Schedule", () => {
  /*
   * Interval Overlap Patterns
   *
   * Pattern A: No Overlap    - Query period ends before or at schedule start
   *            endDate <= effectiveFrom
   *
   * Pattern B: Partial Overlap - Query period starts before schedule, ends after schedule starts
   *            startDate < effectiveFrom < endDate
   *
   * Pattern C: Full Overlap  - Query period starts at or after schedule start
   *            effectiveFrom <= startDate < endDate
   *
   * Note: All boundary cases (=) are handled within these 3 main patterns
   */

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.instructorSchedule.findMany.mockResolvedValue([mockSchedule]);
    mockPrisma.instructorAbsence.findMany.mockResolvedValue([]);
  });

  const instructor = createTestInstructor();

  const mockSchedule = {
    id: 1,
    instructorId: instructor.id,
    effectiveFrom: new Date("2025-07-01"), // Tuesday
    effectiveTo: null,
    timezone: "Asia/Tokyo",
    slots: [
      { id: 1, scheduleId: 1, weekday: 0, startTime: new Date(time`09:00`) }, // Sunday
      { id: 2, scheduleId: 1, weekday: 1, startTime: new Date(time`10:00`) },
      { id: 3, scheduleId: 1, weekday: 2, startTime: new Date(time`11:00`) },
      { id: 4, scheduleId: 1, weekday: 2, startTime: new Date(time`12:00`) }, // Tuesday has two slots.
      { id: 5, scheduleId: 1, weekday: 3, startTime: new Date(time`13:00`) },
      { id: 6, scheduleId: 1, weekday: 4, startTime: new Date(time`14:00`) },
      { id: 7, scheduleId: 1, weekday: 5, startTime: new Date(time`15:00`) },
      { id: 8, scheduleId: 1, weekday: 6, startTime: new Date(time`16:00`) },
    ],
  };

  // Pattern A: No Overlap - endDate < effectiveFrom
  it("startDate < endDate < effectiveFrom (no overlap)", async () => {
    await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-06-01", end: "2025-06-30" })
      .expect(200)
      .expect((res) => expect(res.body.data).toEqual([]));
  });

  // Pattern A: No Overlap - endDate = effectiveFrom (boundary)
  it("startDate < endDate = effectiveFrom (boundary, no overlap)", async () => {
    await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-06-01", end: "2025-07-01" })
      .expect(200)
      .expect((res) => expect(res.body.data).toEqual([]));
  });

  // Pattern B: Partial Overlap - startDate < effectiveFrom < endDate
  it("startDate < effectiveFrom < endDate (partial overlap from effectiveFrom)", async () => {
    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-06-01", end: "2025-07-02" })
      .expect(200);

    expect(response.body.data).toEqual([
      { dateTime: jst`2025-07-01 11:00` },
      { dateTime: jst`2025-07-01 12:00` },
    ]);
  });

  // Pattern C: Full Overlap - effectiveFrom = startDate (boundary)
  it("effectiveFrom = startDate < endDate (boundary, full overlap from startDate)", async () => {
    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-07-01", end: "2025-07-08" })
      .expect(200);

    expect(response.body.message).toBe(
      "Available slots retrieved successfully",
    );
    // All weekdays covered from startDate onwards in JST
    expect(response.body.data).toEqual([
      { dateTime: jst`2025-07-01 11:00` },
      { dateTime: jst`2025-07-01 12:00` },
      { dateTime: jst`2025-07-02 13:00` },
      { dateTime: jst`2025-07-03 14:00` },
      { dateTime: jst`2025-07-04 15:00` },
      { dateTime: jst`2025-07-05 16:00` },
      { dateTime: jst`2025-07-06 09:00` },
      { dateTime: jst`2025-07-07 10:00` },
    ]);
  });

  // Pattern C: Full Overlap - effectiveFrom < startDate
  it("effectiveFrom < startDate < endDate (full overlap from startDate)", async () => {
    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-07-10", end: "2025-07-15" })
      .expect(200);

    expect(response.body.message).toBe(
      "Available slots retrieved successfully",
    );
    // Slots from startDate onwards (schedule has been running)
    expect(response.body.data).toEqual([
      { dateTime: jst`2025-07-10 14:00` },
      { dateTime: jst`2025-07-11 15:00` },
      { dateTime: jst`2025-07-12 16:00` },
      { dateTime: jst`2025-07-13 09:00` },
      { dateTime: jst`2025-07-14 10:00` },
    ]);
  });

  it("should return 400 error when startDate is missing", async () => {
    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ end: "2025-07-14" })
      .expect(400);

    expect(response.body.message).toBe(
      "start and end query parameters are required (YYYY-MM-DD format)",
    );
  });
});

describe("Available Slots API - Schedule End Date", () => {
  /*
   * Interval Overlap Patterns with effectiveTo (finite schedule)
   *
   * Pattern A: No Overlap    - Query period ends before or at schedule start
   *            endDate <= effectiveFrom
   *
   * Pattern B: Partial Overlap (Start) - Query starts before schedule, ends within schedule
   *            startDate < effectiveFrom < endDate <= effectiveTo
   *
   * Pattern C: Full Overlap  - Query period completely within schedule period
   *            effectiveFrom <= startDate < endDate <= effectiveTo
   *
   * Pattern D: Query Encompasses Schedule - Query period completely contains schedule period
   *            startDate < effectiveFrom < effectiveTo < endDate
   *
   * Pattern E: Partial Overlap (End) - Query starts within schedule, ends after schedule
   *            effectiveFrom <= startDate < effectiveTo < endDate
   *
   * Pattern F: No Overlap    - Query period starts at or after schedule end
   *            effectiveTo <= startDate < endDate
   */

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.instructorSchedule.findMany.mockResolvedValue([
      mockScheduleWithEndDate,
    ]);
    mockPrisma.instructorAbsence.findMany.mockResolvedValue([]);
  });

  const instructor = createTestInstructor();
  const mockScheduleWithEndDate = {
    id: 1,
    instructorId: instructor.id,
    effectiveFrom: new Date("2025-07-01"),
    effectiveTo: new Date("2025-07-15"),
    timezone: "Asia/Tokyo",
    slots: [
      { id: 1, scheduleId: 1, weekday: 0, startTime: new Date(time`00:00`) },
      { id: 2, scheduleId: 1, weekday: 1, startTime: new Date(time`03:30`) },
      { id: 3, scheduleId: 1, weekday: 1, startTime: new Date(time`06:30`) },
      { id: 4, scheduleId: 1, weekday: 2, startTime: new Date(time`09:30`) },
      { id: 5, scheduleId: 1, weekday: 3, startTime: new Date(time`13:00`) },
      { id: 6, scheduleId: 1, weekday: 4, startTime: new Date(time`16:30`) },
      { id: 7, scheduleId: 1, weekday: 5, startTime: new Date(time`20:00`) },
      { id: 8, scheduleId: 1, weekday: 6, startTime: new Date(time`23:30`) },
    ],
  };

  // Pattern A: No Overlap - endDate < effectiveFrom
  it("startDate < endDate < effectiveFrom (no overlap before schedule)", async () => {
    await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-06-01", end: "2025-06-30" })
      .expect(200)
      .expect((res) => expect(res.body.data).toEqual([]));
  });

  // Pattern A: No Overlap - endDate = effectiveFrom (boundary)
  it("startDate < endDate = effectiveFrom (boundary, no overlap)", async () => {
    await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-06-01", end: "2025-07-01" })
      .expect(200)
      .expect((res) => expect(res.body.data).toEqual([]));
  });

  // Pattern B: Partial Overlap (Start) - startDate < effectiveFrom < endDate <= effectiveTo
  it("startDate < effectiveFrom < endDate <= effectiveTo (partial overlap from schedule start)", async () => {
    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-06-25", end: "2025-07-10" })
      .expect(200);

    expect(response.body.data).toEqual([
      { dateTime: jst`2025-07-01 09:30` },
      { dateTime: jst`2025-07-02 13:00` },
      { dateTime: jst`2025-07-03 16:30` },
      { dateTime: jst`2025-07-04 20:00` },
      { dateTime: jst`2025-07-05 23:30` },
      { dateTime: jst`2025-07-06 00:00` },
      { dateTime: jst`2025-07-07 03:30` },
      { dateTime: jst`2025-07-07 06:30` },
      { dateTime: jst`2025-07-08 09:30` },
      { dateTime: jst`2025-07-09 13:00` },
    ]);
  });

  // Pattern C: Full Overlap Within Schedule - effectiveFrom <= startDate < endDate <= effectiveTo
  it("effectiveFrom <= startDate < endDate <= effectiveTo (full overlap within schedule)", async () => {
    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-07-05", end: "2025-07-12" })
      .expect(200);

    expect(response.body.data).toEqual([
      { dateTime: jst`2025-07-05 23:30` },
      { dateTime: jst`2025-07-06 00:00` },
      { dateTime: jst`2025-07-07 03:30` },
      { dateTime: jst`2025-07-07 06:30` },
      { dateTime: jst`2025-07-08 09:30` },
      { dateTime: jst`2025-07-09 13:00` },
      { dateTime: jst`2025-07-10 16:30` },
      { dateTime: jst`2025-07-11 20:00` },
    ]);
  });

  // Pattern D: Query Encompasses Entire Schedule - startDate < effectiveFrom < effectiveTo < endDate
  it("startDate < effectiveFrom < effectiveTo < endDate (query encompasses entire schedule)", async () => {
    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-06-15", end: "2025-07-30" })
      .expect(200);

    expect(response.body.data).toEqual([
      { dateTime: jst`2025-07-01 09:30` },
      { dateTime: jst`2025-07-02 13:00` },
      { dateTime: jst`2025-07-03 16:30` },
      { dateTime: jst`2025-07-04 20:00` },
      { dateTime: jst`2025-07-05 23:30` },
      { dateTime: jst`2025-07-06 00:00` },
      { dateTime: jst`2025-07-07 03:30` },
      { dateTime: jst`2025-07-07 06:30` },
      { dateTime: jst`2025-07-08 09:30` },
      { dateTime: jst`2025-07-09 13:00` },
      { dateTime: jst`2025-07-10 16:30` },
      { dateTime: jst`2025-07-11 20:00` },
      { dateTime: jst`2025-07-12 23:30` },
      { dateTime: jst`2025-07-13 00:00` },
      { dateTime: jst`2025-07-14 03:30` },
      { dateTime: jst`2025-07-14 06:30` },
    ]);
  });

  // Pattern E: Partial Overlap (End) - effectiveFrom <= startDate < effectiveTo < endDate
  it("effectiveFrom <= startDate < effectiveTo < endDate (partial overlap until schedule end)", async () => {
    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-07-10", end: "2025-07-20" })
      .expect(200);

    expect(response.body.data).toEqual([
      { dateTime: jst`2025-07-10 16:30` },
      { dateTime: jst`2025-07-11 20:00` },
      { dateTime: jst`2025-07-12 23:30` },
      { dateTime: jst`2025-07-13 00:00` },
      { dateTime: jst`2025-07-14 03:30` },
      { dateTime: jst`2025-07-14 06:30` },
    ]);
  });

  // Pattern F: No Overlap (After Schedule) - effectiveTo <= startDate
  it("effectiveTo <= startDate < endDate (no overlap after schedule end)", async () => {
    await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-07-15", end: "2025-07-25" })
      .expect(200)
      .expect((res) => expect(res.body.data).toEqual([]));
  });

  // Pattern G: No Overlap (Clear Gap After Schedule) - effectiveTo < startDate
  it("effectiveTo < startDate < endDate (no overlap, clear gap after schedule)", async () => {
    await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-07-20", end: "2025-07-30" })
      .expect(200)
      .expect((res) => expect(res.body.data).toEqual([]));
  });
});

describe("Available Slots API - Multiple Schedules Adjacent", () => {
  /*
   * Multi-Schedule Interaction Patterns (Adjacent Schedules)
   *
   * Setup: endedSchedule (June 1 - July 1, exclusive) + activeSchedule (July 1+, infinite)
   * Note: Schedules are typically adjacent with no gaps (endedSchedule.effectiveTo = activeSchedule.effectiveFrom)
   *
   * Pattern A: Query Spans Both Schedules - Query period overlaps both ended and active schedules
   *            startDate < endedSchedule.effectiveTo = activeSchedule.effectiveFrom < endDate
   *
   * Note: Single-schedule interactions are already tested in previous describe blocks
   */

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.instructorSchedule.findMany.mockResolvedValue([
      endedSchedule,
      activeSchedule,
    ]);
    mockPrisma.instructorAbsence.findMany.mockResolvedValue([]);
  });

  const instructor = createTestInstructor();

  const endedSchedule = {
    id: 1,
    instructorId: instructor.id,
    effectiveFrom: new Date("2025-06-01"),
    effectiveTo: new Date("2025-07-01"),
    timezone: "Asia/Tokyo",
    slots: [
      { id: 1, scheduleId: 1, weekday: 1, startTime: new Date(time`15:00`) },
      { id: 2, scheduleId: 1, weekday: 3, startTime: new Date(time`14:00`) },
    ],
  };

  const activeSchedule = {
    id: 2,
    instructorId: instructor.id,
    effectiveFrom: new Date("2025-07-01"),
    effectiveTo: null,
    timezone: "Asia/Tokyo",
    slots: [
      { id: 3, scheduleId: 2, weekday: 2, startTime: new Date(time`13:00`) },
      { id: 4, scheduleId: 2, weekday: 4, startTime: new Date(time`12:00`) },
    ],
  };

  // Pattern A: Query Spans Both Schedules
  it("startDate < endedSchedule.effectiveTo = activeSchedule.effectiveFrom < endDate (spans both schedules, no gap)", async () => {
    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-06-25", end: "2025-07-10" })
      .expect(200);

    expect(response.body.message).toBe(
      "Available slots retrieved successfully",
    );
    // Should return slots from both schedules
    // Note: July 1st is NOT included from ended schedule since effectiveTo is exclusive
    expect(response.body.data).toEqual([
      { dateTime: jst`2025-06-25 14:00` },
      { dateTime: jst`2025-06-30 15:00` },
      { dateTime: jst`2025-07-01 13:00` },
      { dateTime: jst`2025-07-03 12:00` },
      { dateTime: jst`2025-07-08 13:00` },
    ]);
  });

  // Pattern A: Query Spans Both Schedules (Extended)
  it("startDate < endedSchedule.effectiveFrom and activeSchedule.effectiveFrom < endDate (spans entire ended schedule plus active)", async () => {
    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-05-01", end: "2025-07-05" })
      .expect(200);

    expect(response.body.message).toBe(
      "Available slots retrieved successfully",
    );
    expect(response.body.data).toEqual([
      { dateTime: jst`2025-06-02 15:00` },
      { dateTime: jst`2025-06-04 14:00` },
      { dateTime: jst`2025-06-09 15:00` },
      { dateTime: jst`2025-06-11 14:00` },
      { dateTime: jst`2025-06-16 15:00` },
      { dateTime: jst`2025-06-18 14:00` },
      { dateTime: jst`2025-06-23 15:00` },
      { dateTime: jst`2025-06-25 14:00` },
      { dateTime: jst`2025-06-30 15:00` },
      { dateTime: jst`2025-07-01 13:00` },
      { dateTime: jst`2025-07-03 12:00` },
    ]);
  });
});

describe("Available Slots API - Multiple Schedules Gap", () => {
  /*
   * Multi-Schedule Interaction Patterns (Schedules with Gap)
   *
   * Setup: endedSchedule (June 1 - June 20, exclusive) + activeSchedule (July 10+, infinite)
   * Note: This tests the unusual scenario where there's a gap between schedule periods
   *
   * Pattern A: Query Spans Both Schedules with Gap - Query period overlaps both schedules and the gap
   *            startDate < endedSchedule.effectiveTo < activeSchedule.effectiveFrom < endDate
   *
   * Pattern B: Query Spans Only Gap - Query period falls entirely within the gap period
   *            endedSchedule.effectiveTo <= startDate < endDate <= activeSchedule.effectiveFrom
   */

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.instructorSchedule.findMany.mockResolvedValue([
      endedScheduleWithGap,
      activeScheduleWithGap,
    ]);
    mockPrisma.instructorAbsence.findMany.mockResolvedValue([]);
  });

  const instructor = createTestInstructor();
  const endedScheduleWithGap = {
    id: 1,
    instructorId: instructor.id,
    effectiveFrom: new Date("2025-06-01"),
    effectiveTo: new Date("2025-06-20"),
    timezone: "Asia/Tokyo",
    slots: [
      { id: 1, scheduleId: 1, weekday: 1, startTime: new Date(time`15:00`) },
      { id: 2, scheduleId: 1, weekday: 3, startTime: new Date(time`14:00`) },
    ],
  };

  const activeScheduleWithGap = {
    id: 2,
    instructorId: instructor.id,
    effectiveFrom: new Date("2025-07-10"),
    effectiveTo: null,
    timezone: "Asia/Tokyo",
    slots: [
      { id: 3, scheduleId: 2, weekday: 2, startTime: new Date(time`10:00`) },
      { id: 4, scheduleId: 2, weekday: 4, startTime: new Date(time`15:00`) },
    ],
  };

  // Pattern A: Query Spans Both Schedules with Gap
  it("endedSchedule.effectiveTo < activeSchedule.effectiveFrom with query spanning gap", async () => {
    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-06-15", end: "2025-07-15" }) // Within first schedule, Within second schedule, spans the gap
      .expect(200);

    expect(response.body.message).toBe(
      "Available slots retrieved successfully",
    );
    expect(response.body.data).toEqual([
      { dateTime: jst`2025-06-16 15:00` },
      { dateTime: jst`2025-06-18 14:00` },
      { dateTime: jst`2025-07-10 15:00` },
    ]);
  });

  // Pattern A: Query Spans Both Schedules with Gap (Extended)
  it("query spans entire ended schedule, gap, and part of active schedule", async () => {
    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-05-25", end: "2025-07-12" }) // Before ended schedule starts, Within active schedule
      .expect(200);

    expect(response.body.message).toBe(
      "Available slots retrieved successfully",
    );
    expect(response.body.data).toEqual([
      { dateTime: jst`2025-06-02 15:00` },
      { dateTime: jst`2025-06-04 14:00` },
      { dateTime: jst`2025-06-09 15:00` },
      { dateTime: jst`2025-06-11 14:00` },
      { dateTime: jst`2025-06-16 15:00` },
      { dateTime: jst`2025-06-18 14:00` },
      { dateTime: jst`2025-07-10 15:00` },
    ]);
  });

  // Pattern B: Query Spans Only Gap
  it("query period spans only the gap between schedules (no slots)", async () => {
    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-06-25", end: "2025-07-05" }) // After first schedule ends, Before second schedule starts
      .expect(200);

    expect(response.body.message).toBe(
      "Available slots retrieved successfully",
    );
    expect(response.body.data).toEqual([]); // No overlap with any schedule
  });

  // Pattern B: Query Spans Only Gap (Boundary)
  it("query period exactly matches the gap between schedules", async () => {
    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-06-20", end: "2025-07-10" }) // Exactly when first schedule ends, Exactly when second schedule starts
      .expect(200);

    expect(response.body.message).toBe(
      "Available slots retrieved successfully",
    );
    expect(response.body.data).toEqual([]); // No overlap with any schedule (both boundaries are exclusive)
  });
});

describe("Available Slots API - With Absences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should filter out absent slots and ignore absences outside query range", async () => {
    const instructor = createTestInstructor();

    const mockSchedule = {
      id: 1,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-07-07"), // Monday
      effectiveTo: null,
      timezone: "Asia/Tokyo",
      slots: [
        { id: 1, scheduleId: 1, weekday: 1, startTime: new Date(time`09:00`) },
        { id: 2, scheduleId: 1, weekday: 2, startTime: new Date(time`19:00`) },
        { id: 3, scheduleId: 1, weekday: 3, startTime: new Date(time`09:00`) },
      ],
    };

    // Create absences: one within query range, one outside
    const mockAbsences = [
      {
        instructorId: instructor.id,
        absentAt: new Date(jst`2025-07-07 09:00`),
      },
      {
        instructorId: instructor.id,
        absentAt: new Date(jst`2025-07-09 09:00`),
      },
    ];

    mockPrisma.instructorSchedule.findMany.mockResolvedValue([mockSchedule]);
    mockPrisma.instructorAbsence.findMany.mockResolvedValue([mockAbsences[0]]); // Only return absence within range

    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({ start: "2025-07-07", end: "2025-07-09" })
      .expect(200);

    expect(response.body.message).toBe(
      "Available slots retrieved successfully",
    );
    expect(response.body.data).toEqual([{ dateTime: jst`2025-07-08 19:00` }]);
  });
});

describe("All Available Slots API", () => {
  it("should return available slots grouped by time with instructor lists", async () => {
    // Create multiple test instructors
    const instructor1 = { ...createTestInstructor(), id: 1 };
    const instructor2 = { ...createTestInstructor(), id: 2 };
    const instructor3 = { ...createTestInstructor(), id: 3 };

    const schedule1 = {
      id: 1,
      instructorId: instructor1.id,
      effectiveFrom: new Date("2025-08-01"),
      effectiveTo: null,
      timezone: "Asia/Tokyo",
      slots: [
        { scheduleId: 1, weekday: 1, startTime: new Date(time`10:00`) },
        { scheduleId: 1, weekday: 1, startTime: new Date(time`11:00`) },
      ],
    };

    const schedule2 = {
      id: 2,
      instructorId: instructor2.id,
      effectiveFrom: new Date("2025-08-01"),
      effectiveTo: null,
      timezone: "Asia/Tokyo",
      slots: [
        { scheduleId: 2, weekday: 1, startTime: new Date(time`10:00`) },
        { scheduleId: 2, weekday: 1, startTime: new Date(time`14:00`) },
      ],
    };

    const schedule3 = {
      id: 3,
      instructorId: instructor3.id,
      effectiveFrom: new Date("2025-08-01"),
      effectiveTo: null,
      timezone: "Asia/Tokyo",
      slots: [{ scheduleId: 3, weekday: 1, startTime: new Date(time`11:00`) }],
    };

    const absences = [
      {
        instructorId: instructor2.id,
        absentAt: new Date(jst`2025-08-04 14:00`),
      },
    ];

    const bookings = [
      {
        instructorId: instructor3.id,
        dateTime: new Date(jst`2025-08-04 11:00`),
        status: "booked" as const,
      },
    ];

    const holidays: any[] = [];

    mockPrisma.instructorSchedule.findMany.mockResolvedValue([
      schedule1,
      schedule2,
      schedule3,
    ]);
    mockPrisma.instructorAbsence.findMany.mockResolvedValue(absences);
    mockPrisma.class.findMany.mockResolvedValue(bookings);
    mockPrisma.schedule.findMany.mockResolvedValue(holidays);

    const response = await request(server)
      .get("/instructors/available-slots")
      .query({
        start: "2025-08-04",
        end: "2025-08-05",
      })
      .expect(200);

    expect(response.body.message).toBe(
      "Available slots retrieved successfully",
    );
    expect(response.body.data).toEqual([
      {
        dateTime: jst`2025-08-04 10:00`,
        availableInstructors: [1, 2],
      },
      {
        dateTime: jst`2025-08-04 11:00`,
        availableInstructors: [1],
      },
    ]);
  });

  it("should handle empty results when no instructors are available", async () => {
    const instructor = createTestInstructor();

    mockPrisma.instructorSchedule.findMany.mockResolvedValue([]);
    mockPrisma.instructorAbsence.findMany.mockResolvedValue([]);
    mockPrisma.class.findMany.mockResolvedValue([]);
    mockPrisma.schedule.findMany.mockResolvedValue([]);

    const response = await request(server)
      .get("/instructors/available-slots")
      .query({
        start: "2025-08-04",
        end: "2025-08-05",
      })
      .expect(200);

    expect(response.body.message).toBe(
      "Available slots retrieved successfully",
    );
    expect(response.body.data).toEqual([]);
  });
});
