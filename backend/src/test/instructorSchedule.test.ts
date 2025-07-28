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

describe("Instructor Schedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new schedule for instructor with no existing schedules", async () => {
    const sessionCookie = await loginAsAdmin(server, mockPrisma);
    const instructor = createTestInstructor();

    // Mock instructor without schedule
    mockPrisma.instructor.findUnique.mockResolvedValue(instructor);
    mockPrisma.instructorSchedule.findUnique.mockResolvedValue(null);

    // Mock schedule creation
    const newSchedule = {
      id: 1,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-02-01T09:00:00.000Z"), // JST midnight
      effectiveTo: null,
      slots: [
        {
          id: 1,
          scheduleId: 1,
          weekday: 1, // Monday
          startTime: new Date("1970-01-01T09:00:00Z"),
        },
        {
          id: 2,
          scheduleId: 1,
          weekday: 3, // Wednesday
          startTime: new Date("1970-01-01T14:00:00Z"),
        },
      ],
    };

    mockScheduleTransaction(
      null, // No existing schedule
      {
        id: 1,
        instructorId: instructor.id,
        effectiveFrom: new Date("2025-02-01T09:00:00.000Z"), // JST midnight
        effectiveTo: null,
      },
      newSchedule,
    );

    const scheduleData = {
      effectiveFrom: "2025-02-01",
      slots: [
        {
          weekday: 1,
          startTime: "1970-01-01T09:00:00Z",
        },
        {
          weekday: 3,
          startTime: "1970-01-01T14:00:00Z",
        },
      ],
    };

    const response = await request(server)
      .post(`/instructors/${instructor.id}/schedules`)
      .set("Cookie", sessionCookie)
      .send(scheduleData)
      .expect(201);

    expect(response.body.message).toBe("Schedule version created successfully");
    expect(response.body.data).toMatchObject({
      id: 1,
      instructorId: instructor.id,
      effectiveFrom: "2025-02-01T09:00:00.000Z",
      effectiveTo: null,
      slots: [
        {
          id: 1,
          scheduleId: 1,
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          id: 2,
          scheduleId: 1,
          weekday: 3,
          startTime: "1970-01-01T14:00:00.000Z",
        },
      ],
    });
  });

  it("should add a new schedule to instructor with existing schedules", async () => {
    const sessionCookie = await loginAsAdmin(server, mockPrisma);
    const instructor = createTestInstructor();

    // Mock instructor with existing active schedule
    mockPrisma.instructor.findUnique.mockResolvedValue(instructor);

    const existingSchedule = {
      id: 1,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-01-01T09:00:00.000Z"), // JST midnight
      effectiveTo: null,
    };

    // Mock new schedule
    const newSchedule = {
      id: 2,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-03-01T09:00:00.000Z"), // JST midnight
      effectiveTo: null,
      slots: [
        {
          id: 3,
          scheduleId: 2,
          weekday: 2, // Tuesday
          startTime: new Date("1970-01-01T10:00:00Z"),
        },
        {
          id: 4,
          scheduleId: 2,
          weekday: 4, // Thursday
          startTime: new Date("1970-01-01T15:00:00Z"),
        },
      ],
    };

    mockScheduleTransaction(
      existingSchedule,
      {
        id: 2,
        instructorId: instructor.id,
        effectiveFrom: new Date("2025-03-01T09:00:00.000Z"), // JST midnight
        effectiveTo: null,
      },
      newSchedule,
    );

    const scheduleData = {
      effectiveFrom: "2025-03-01",
      slots: [
        {
          weekday: 2,
          startTime: "1970-01-01T10:00:00Z",
        },
        {
          weekday: 4,
          startTime: "1970-01-01T15:00:00Z",
        },
      ],
    };

    const response = await request(server)
      .post(`/instructors/${instructor.id}/schedules`)
      .set("Cookie", sessionCookie)
      .send(scheduleData)
      .expect(201);

    expect(response.body.message).toBe("Schedule version created successfully");
    expect(response.body.data).toMatchObject({
      id: 2,
      instructorId: instructor.id,
      effectiveFrom: "2025-03-01T09:00:00.000Z",
      effectiveTo: null,
      slots: [
        {
          id: 3,
          scheduleId: 2,
          weekday: 2,
          startTime: "1970-01-01T10:00:00.000Z",
        },
        {
          id: 4,
          scheduleId: 2,
          weekday: 4,
          startTime: "1970-01-01T15:00:00.000Z",
        },
      ],
    });

    // Ensure the existing schedule has been ended
    expect(mockTxUpdate).toHaveBeenCalledWith({
      where: { id: existingSchedule.id },
      data: { effectiveTo: new Date("2025-03-01T09:00:00.000Z") },
    });
  });

  it("should return 400 for invalid request data", async () => {
    const sessionCookie = await loginAsAdmin(server, mockPrisma);
    const instructor = createTestInstructor();

    const testInvalidScheduleData = async (
      sessionCookie: string,
      instructor: any,
      data: any,
    ) => {
      return request(server)
        .post(`/instructors/${instructor.id}/schedules`)
        .set("Cookie", sessionCookie)
        .send(data)
        .expect(400);
    };

    const validSlot = { weekday: 1, startTime: "1970-01-01T09:00:00Z" };

    // Test missing effectiveFrom
    await testInvalidScheduleData(sessionCookie, instructor, {
      slots: [validSlot],
    });

    // Test missing slots
    await testInvalidScheduleData(sessionCookie, instructor, {
      effectiveFrom: "2025-02-01",
    });

    // Test invalid weekday
    await testInvalidScheduleData(sessionCookie, instructor, {
      effectiveFrom: "2025-02-01",
      slots: [{ weekday: 8, startTime: "1970-01-01T09:00:00Z" }],
    });

    // Test invalid date format
    await testInvalidScheduleData(sessionCookie, instructor, {
      effectiveFrom: "invalid-date",
      slots: [validSlot],
    });
  });

  it("should support list and detail workflow", async () => {
    const instructor = createTestInstructor();

    // Step 1: Get all schedule versions
    const scheduleVersions = [
      {
        id: 1,
        instructorId: instructor.id,
        effectiveFrom: new Date("2025-01-01T09:00:00.000Z"), // JST midnight
        effectiveTo: new Date("2025-03-01T09:00:00.000Z"), // JST midnight
      },
      {
        id: 2,
        instructorId: instructor.id,
        effectiveFrom: new Date("2025-03-01T09:00:00.000Z"), // JST midnight
        effectiveTo: null, // Current active schedule
      },
    ];

    mockPrisma.instructorSchedule.findMany.mockResolvedValue(scheduleVersions);

    const versionsResponse = await request(server)
      .get(`/instructors/${instructor.id}/schedules`)
      .expect(200);

    expect(versionsResponse.body.message).toBe(
      "Instructor schedule versions retrieved successfully",
    );
    expect(versionsResponse.body.data).toHaveLength(2);
    expect(versionsResponse.body.data[0]).toMatchObject({
      id: 1,
      instructorId: instructor.id,
      effectiveFrom: "2025-01-01T09:00:00.000Z",
      effectiveTo: "2025-03-01T09:00:00.000Z",
    });

    // Step 2: Select a schedule version from the list
    const selectedScheduleId = 2;
    const scheduleWithSlots = {
      id: 2,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-03-01T09:00:00.000Z"), // JST midnight
      effectiveTo: null,
      slots: [
        {
          scheduleId: 2,
          weekday: 1, // Monday
          startTime: new Date("1970-01-01T09:00:00Z"),
        },
        {
          scheduleId: 2,
          weekday: 1, // Monday
          startTime: new Date("1970-01-01T14:00:00Z"),
        },
        {
          scheduleId: 2,
          weekday: 3, // Wednesday
          startTime: new Date("1970-01-01T10:00:00Z"),
        },
      ],
    };

    mockPrisma.instructorSchedule.findUnique.mockResolvedValue(
      scheduleWithSlots,
    );

    const scheduleDetailResponse = await request(server)
      .get(`/instructors/${instructor.id}/schedules/${selectedScheduleId}`)
      .expect(200);

    expect(scheduleDetailResponse.body.message).toBe(
      "Schedule retrieved successfully",
    );
    expect(scheduleDetailResponse.body.data).toMatchObject({
      id: 2,
      instructorId: instructor.id,
      effectiveFrom: "2025-03-01T09:00:00.000Z",
      effectiveTo: null,
      slots: [
        {
          scheduleId: 2,
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          scheduleId: 2,
          weekday: 1,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          scheduleId: 2,
          weekday: 3,
          startTime: "1970-01-01T10:00:00.000Z",
        },
      ],
    });
  });

  describe("Available Slots API", () => {
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

    const instructor = createTestInstructor();

    const mockSchedule = {
      id: 1,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-07-01T09:00:00.000Z"), // JST midnight
      effectiveTo: null,
      slots: [
        {
          id: 1,
          scheduleId: 1,
          weekday: 0, // Sunday
          startTime: new Date("1970-01-01T16:00:00.000Z"),
        },
        {
          id: 2,
          scheduleId: 1,
          weekday: 1, // Monday
          startTime: new Date("1970-01-01T00:00:00.000Z"), // Edge case: 00:00 UTC (09:00 JST)
        },
        {
          id: 3,
          scheduleId: 1,
          weekday: 1, // Monday
          startTime: new Date("1970-01-01T13:00:00.000Z"),
        },
        {
          id: 4,
          scheduleId: 1,
          weekday: 2, // Tuesday
          startTime: new Date("1970-01-01T10:00:00.000Z"),
        },
        {
          id: 5,
          scheduleId: 1,
          weekday: 3, // Wednesday
          startTime: new Date("1970-01-01T11:00:00.000Z"),
        },
        {
          id: 6,
          scheduleId: 1,
          weekday: 4, // Thursday
          startTime: new Date("1970-01-01T14:00:00.000Z"),
        },
        {
          id: 7,
          scheduleId: 1,
          weekday: 5, // Friday
          startTime: new Date("1970-01-01T15:00:00.000Z"),
        },
        {
          id: 8,
          scheduleId: 1,
          weekday: 6, // Saturday
          startTime: new Date("1970-01-01T12:00:00.000Z"),
        },
      ],
    };

    beforeEach(() => {
      vi.clearAllMocks();
      mockPrisma.instructorSchedule.findMany.mockResolvedValue([mockSchedule]);
    });

    // Pattern A: No Overlap - endDate < effectiveFrom
    it("startDate < endDate < effectiveFrom (no overlap)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-06-01", // startDate
          endDate: "2025-06-30", // endDate < effectiveFrom (July 1st)
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );
      expect(response.body.data).toEqual([]); // No overlap
    });

    // Pattern A: No Overlap - endDate = effectiveFrom (boundary)
    it("startDate < endDate = effectiveFrom (boundary, no overlap)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-06-01", // startDate
          endDate: "2025-07-01", // endDate = effectiveFrom (July 1st)
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );
      expect(response.body.data).toEqual([]); // No overlap (endDate is exclusive)
    });

    // Pattern B: Partial Overlap - startDate < effectiveFrom < endDate
    it("startDate < effectiveFrom < endDate (partial overlap from effectiveFrom)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-06-01", // startDate
          endDate: "2025-07-06", // endDate > effectiveFrom, covers July 1-5
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );

      // Slots start from effectiveFrom (July 1st) onwards
      expect(response.body.data).toEqual([
        {
          dateTime: "2025-07-01T10:00:00.000Z", // July 1st (Tuesday)
          weekday: 2,
          startTime: "1970-01-01T10:00:00.000Z",
        },
        {
          dateTime: "2025-07-02T11:00:00.000Z", // July 2nd (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T11:00:00.000Z",
        },
        {
          dateTime: "2025-07-03T14:00:00.000Z", // July 3rd (Thursday)
          weekday: 4,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-07-04T15:00:00.000Z", // July 4th (Friday)
          weekday: 5,
          startTime: "1970-01-01T15:00:00.000Z",
        },
        {
          dateTime: "2025-07-05T12:00:00.000Z", // July 5th (Saturday)
          weekday: 6,
          startTime: "1970-01-01T12:00:00.000Z",
        },
      ]);
    });

    // Pattern C: Full Overlap - effectiveFrom = startDate (boundary)
    it("effectiveFrom = startDate < endDate (boundary, full overlap from startDate)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-07-01", // startDate = effectiveFrom (July 1st)
          endDate: "2025-07-08", // endDate > startDate, one week
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );

      // All weekdays covered from startDate onwards
      expect(response.body.data).toEqual([
        {
          dateTime: "2025-07-01T10:00:00.000Z", // July 1st (Tuesday)
          weekday: 2,
          startTime: "1970-01-01T10:00:00.000Z",
        },
        {
          dateTime: "2025-07-02T11:00:00.000Z", // July 2nd (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T11:00:00.000Z",
        },
        {
          dateTime: "2025-07-03T14:00:00.000Z", // July 3rd (Thursday)
          weekday: 4,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-07-04T15:00:00.000Z", // July 4th (Friday)
          weekday: 5,
          startTime: "1970-01-01T15:00:00.000Z",
        },
        {
          dateTime: "2025-07-05T12:00:00.000Z", // July 5th (Saturday)
          weekday: 6,
          startTime: "1970-01-01T12:00:00.000Z",
        },
        {
          dateTime: "2025-07-06T16:00:00.000Z", // July 6th (Sunday)
          weekday: 0,
          startTime: "1970-01-01T16:00:00.000Z",
        },
        {
          dateTime: "2025-07-07T00:00:00.000Z", // July 7th (Monday) - first slot (00:00 UTC = 09:00 JST)
          weekday: 1,
          startTime: "1970-01-01T00:00:00.000Z",
        },
        {
          dateTime: "2025-07-07T13:00:00.000Z", // July 7th (Monday) - second slot
          weekday: 1,
          startTime: "1970-01-01T13:00:00.000Z",
        },
      ]);
    });

    // Pattern C: Full Overlap - effectiveFrom < startDate
    it("effectiveFrom < startDate < endDate (full overlap from startDate)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-07-10", // startDate > effectiveFrom (July 1st)
          endDate: "2025-07-15", // endDate > startDate, 5 days
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );

      // Slots from startDate onwards (schedule has been running)
      expect(response.body.data).toEqual([
        {
          dateTime: "2025-07-10T14:00:00.000Z", // July 10th (Thursday)
          weekday: 4,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-07-11T15:00:00.000Z", // July 11th (Friday)
          weekday: 5,
          startTime: "1970-01-01T15:00:00.000Z",
        },
        {
          dateTime: "2025-07-12T12:00:00.000Z", // July 12th (Saturday)
          weekday: 6,
          startTime: "1970-01-01T12:00:00.000Z",
        },
        {
          dateTime: "2025-07-13T16:00:00.000Z", // July 13th (Sunday)
          weekday: 0,
          startTime: "1970-01-01T16:00:00.000Z",
        },
        {
          dateTime: "2025-07-14T00:00:00.000Z", // July 14th (Monday) - first slot (00:00 UTC = 09:00 JST)
          weekday: 1,
          startTime: "1970-01-01T00:00:00.000Z",
        },
        {
          dateTime: "2025-07-14T13:00:00.000Z", // July 14th (Monday) - second slot
          weekday: 1,
          startTime: "1970-01-01T13:00:00.000Z",
        },
      ]);
    });

    it("should return 400 error when startDate is missing", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          endDate: "2025-07-14",
        })
        .expect(400);

      expect(response.body.message).toBe(
        "startDate and endDate query parameters are required",
      );
    });
  });

  describe("Available Slots API with Schedule End Date", () => {
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

    const instructor = createTestInstructor();

    const mockScheduleWithEndDate = {
      id: 1,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-07-01T09:00:00.000Z"), // JST midnight
      effectiveTo: new Date("2025-07-15T09:00:00.000Z"), // JST midnight - Schedule ends July 15th
      slots: [
        {
          id: 1,
          scheduleId: 1,
          weekday: 0, // Sunday
          startTime: new Date("1970-01-01T16:00:00.000Z"),
        },
        {
          id: 2,
          scheduleId: 1,
          weekday: 1, // Monday
          startTime: new Date("1970-01-01T09:00:00.000Z"),
        },
        {
          id: 3,
          scheduleId: 1,
          weekday: 1, // Monday
          startTime: new Date("1970-01-01T13:00:00.000Z"),
        },
        {
          id: 4,
          scheduleId: 1,
          weekday: 2, // Tuesday
          startTime: new Date("1970-01-01T10:00:00.000Z"),
        },
        {
          id: 5,
          scheduleId: 1,
          weekday: 3, // Wednesday
          startTime: new Date("1970-01-01T11:00:00.000Z"),
        },
        {
          id: 6,
          scheduleId: 1,
          weekday: 4, // Thursday
          startTime: new Date("1970-01-01T14:00:00.000Z"),
        },
        {
          id: 7,
          scheduleId: 1,
          weekday: 5, // Friday
          startTime: new Date("1970-01-01T15:00:00.000Z"),
        },
        {
          id: 8,
          scheduleId: 1,
          weekday: 6, // Saturday
          startTime: new Date("1970-01-01T12:00:00.000Z"),
        },
      ],
    };

    beforeEach(() => {
      vi.clearAllMocks();
      mockPrisma.instructorSchedule.findMany.mockResolvedValue([
        mockScheduleWithEndDate,
      ]);
    });

    // Pattern A: No Overlap - endDate < effectiveFrom
    it("startDate < endDate < effectiveFrom (no overlap before schedule)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-06-01", // startDate
          endDate: "2025-06-30", // endDate < effectiveFrom (July 1st)
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );
      expect(response.body.data).toEqual([]); // No overlap
    });

    // Pattern A: No Overlap - endDate = effectiveFrom (boundary)
    it("startDate < endDate = effectiveFrom (boundary, no overlap)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-06-01", // startDate
          endDate: "2025-07-01", // endDate = effectiveFrom (July 1st)
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );
      expect(response.body.data).toEqual([]); // No overlap (endDate is exclusive)
    });

    // Pattern B: Partial Overlap (Start) - startDate < effectiveFrom < endDate <= effectiveTo
    it("startDate < effectiveFrom < endDate <= effectiveTo (partial overlap from schedule start)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-06-25", // startDate < effectiveFrom
          endDate: "2025-07-10", // effectiveFrom < endDate <= effectiveTo
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );

      // Slots from effectiveFrom (July 1st) to endDate (July 10th exclusive)
      expect(response.body.data).toEqual([
        {
          dateTime: "2025-07-01T10:00:00.000Z", // July 1st (Tuesday)
          weekday: 2,
          startTime: "1970-01-01T10:00:00.000Z",
        },
        {
          dateTime: "2025-07-02T11:00:00.000Z", // July 2nd (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T11:00:00.000Z",
        },
        {
          dateTime: "2025-07-03T14:00:00.000Z", // July 3rd (Thursday)
          weekday: 4,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-07-04T15:00:00.000Z", // July 4th (Friday)
          weekday: 5,
          startTime: "1970-01-01T15:00:00.000Z",
        },
        {
          dateTime: "2025-07-05T12:00:00.000Z", // July 5th (Saturday)
          weekday: 6,
          startTime: "1970-01-01T12:00:00.000Z",
        },
        {
          dateTime: "2025-07-06T16:00:00.000Z", // July 6th (Sunday)
          weekday: 0,
          startTime: "1970-01-01T16:00:00.000Z",
        },
        {
          dateTime: "2025-07-07T09:00:00.000Z", // July 7th (Monday) - first slot
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-07-07T13:00:00.000Z", // July 7th (Monday) - second slot
          weekday: 1,
          startTime: "1970-01-01T13:00:00.000Z",
        },
        {
          dateTime: "2025-07-08T10:00:00.000Z", // July 8th (Tuesday)
          weekday: 2,
          startTime: "1970-01-01T10:00:00.000Z",
        },
        {
          dateTime: "2025-07-09T11:00:00.000Z", // July 9th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T11:00:00.000Z",
        },
      ]);
    });

    // Pattern C: Full Overlap - effectiveFrom <= startDate < endDate <= effectiveTo
    it("effectiveFrom <= startDate < endDate <= effectiveTo (full overlap within schedule)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-07-05", // effectiveFrom <= startDate
          endDate: "2025-07-12", // endDate <= effectiveTo
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );

      // Slots from startDate to endDate (both within schedule period)
      expect(response.body.data).toEqual([
        {
          dateTime: "2025-07-05T12:00:00.000Z", // July 5th (Saturday)
          weekday: 6,
          startTime: "1970-01-01T12:00:00.000Z",
        },
        {
          dateTime: "2025-07-06T16:00:00.000Z", // July 6th (Sunday)
          weekday: 0,
          startTime: "1970-01-01T16:00:00.000Z",
        },
        {
          dateTime: "2025-07-07T09:00:00.000Z", // July 7th (Monday) - first slot
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-07-07T13:00:00.000Z", // July 7th (Monday) - second slot
          weekday: 1,
          startTime: "1970-01-01T13:00:00.000Z",
        },
        {
          dateTime: "2025-07-08T10:00:00.000Z", // July 8th (Tuesday)
          weekday: 2,
          startTime: "1970-01-01T10:00:00.000Z",
        },
        {
          dateTime: "2025-07-09T11:00:00.000Z", // July 9th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T11:00:00.000Z",
        },
        {
          dateTime: "2025-07-10T14:00:00.000Z", // July 10th (Thursday)
          weekday: 4,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-07-11T15:00:00.000Z", // July 11th (Friday)
          weekday: 5,
          startTime: "1970-01-01T15:00:00.000Z",
        },
      ]);
    });

    // Pattern D: Query Encompasses Schedule - startDate < effectiveFrom < effectiveTo < endDate
    it("startDate < effectiveFrom < effectiveTo < endDate (query encompasses entire schedule)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-06-15", // startDate < effectiveFrom (July 1st)
          endDate: "2025-07-30", // effectiveTo (July 15th) < endDate
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );

      // Should return all slots from the entire schedule period (July 1-14)
      expect(response.body.data).toEqual([
        {
          dateTime: "2025-07-01T10:00:00.000Z", // July 1st (Tuesday)
          weekday: 2,
          startTime: "1970-01-01T10:00:00.000Z",
        },
        {
          dateTime: "2025-07-02T11:00:00.000Z", // July 2nd (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T11:00:00.000Z",
        },
        {
          dateTime: "2025-07-03T14:00:00.000Z", // July 3rd (Thursday)
          weekday: 4,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-07-04T15:00:00.000Z", // July 4th (Friday)
          weekday: 5,
          startTime: "1970-01-01T15:00:00.000Z",
        },
        {
          dateTime: "2025-07-05T12:00:00.000Z", // July 5th (Saturday)
          weekday: 6,
          startTime: "1970-01-01T12:00:00.000Z",
        },
        {
          dateTime: "2025-07-06T16:00:00.000Z", // July 6th (Sunday)
          weekday: 0,
          startTime: "1970-01-01T16:00:00.000Z",
        },
        {
          dateTime: "2025-07-07T09:00:00.000Z", // July 7th (Monday) - first slot
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-07-07T13:00:00.000Z", // July 7th (Monday) - second slot
          weekday: 1,
          startTime: "1970-01-01T13:00:00.000Z",
        },
        {
          dateTime: "2025-07-08T10:00:00.000Z", // July 8th (Tuesday)
          weekday: 2,
          startTime: "1970-01-01T10:00:00.000Z",
        },
        {
          dateTime: "2025-07-09T11:00:00.000Z", // July 9th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T11:00:00.000Z",
        },
        {
          dateTime: "2025-07-10T14:00:00.000Z", // July 10th (Thursday)
          weekday: 4,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-07-11T15:00:00.000Z", // July 11th (Friday)
          weekday: 5,
          startTime: "1970-01-01T15:00:00.000Z",
        },
        {
          dateTime: "2025-07-12T12:00:00.000Z", // July 12th (Saturday)
          weekday: 6,
          startTime: "1970-01-01T12:00:00.000Z",
        },
        {
          dateTime: "2025-07-13T16:00:00.000Z", // July 13th (Sunday)
          weekday: 0,
          startTime: "1970-01-01T16:00:00.000Z",
        },
        {
          dateTime: "2025-07-14T09:00:00.000Z", // July 14th (Monday) - first slot
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-07-14T13:00:00.000Z", // July 14th (Monday) - second slot
          weekday: 1,
          startTime: "1970-01-01T13:00:00.000Z",
        },
        // No slots on or after July 15th (effectiveTo is exclusive)
      ]);
    });

    // Pattern E: Partial Overlap (End) - effectiveFrom <= startDate < effectiveTo < endDate
    it("effectiveFrom <= startDate < effectiveTo < endDate (partial overlap until schedule end)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-07-10", // effectiveFrom <= startDate
          endDate: "2025-07-20", // effectiveTo < endDate (goes beyond schedule end)
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );

      // Slots from startDate until effectiveTo (July 15th exclusive)
      expect(response.body.data).toEqual([
        {
          dateTime: "2025-07-10T14:00:00.000Z", // July 10th (Thursday)
          weekday: 4,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-07-11T15:00:00.000Z", // July 11th (Friday)
          weekday: 5,
          startTime: "1970-01-01T15:00:00.000Z",
        },
        {
          dateTime: "2025-07-12T12:00:00.000Z", // July 12th (Saturday)
          weekday: 6,
          startTime: "1970-01-01T12:00:00.000Z",
        },
        {
          dateTime: "2025-07-13T16:00:00.000Z", // July 13th (Sunday)
          weekday: 0,
          startTime: "1970-01-01T16:00:00.000Z",
        },
        {
          dateTime: "2025-07-14T09:00:00.000Z", // July 14th (Monday) - first slot
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-07-14T13:00:00.000Z", // July 14th (Monday) - second slot
          weekday: 1,
          startTime: "1970-01-01T13:00:00.000Z",
        },
        // No slots on or after July 15th (effectiveTo is exclusive)
      ]);
    });

    // Pattern F: No Overlap - effectiveTo <= startDate < endDate
    it("effectiveTo <= startDate < endDate (no overlap after schedule end)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-07-15", // startDate >= effectiveTo
          endDate: "2025-07-25", // endDate after schedule end
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );
      expect(response.body.data).toEqual([]); // No overlap (schedule ended before query period)
    });

    // Pattern F: No Overlap - effectiveTo < startDate (clear gap)
    it("effectiveTo < startDate < endDate (no overlap, clear gap after schedule)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-07-20", // startDate > effectiveTo
          endDate: "2025-07-30", // endDate after schedule end
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );
      expect(response.body.data).toEqual([]); // No overlap
    });
  });

  describe("Available Slots API with Multiple Schedules (Adjacent)", () => {
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

    const instructor = createTestInstructor();

    const endedSchedule = {
      id: 1,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-06-01T09:00:00.000Z"), // JST midnight
      effectiveTo: new Date("2025-07-01T09:00:00.000Z"), // JST midnight - Ended July 1st (exclusive) - adjacent to active schedule
      slots: [
        {
          id: 1,
          scheduleId: 1,
          weekday: 1, // Monday
          startTime: new Date("1970-01-01T09:00:00.000Z"),
        },
        {
          id: 2,
          scheduleId: 1,
          weekday: 3, // Wednesday
          startTime: new Date("1970-01-01T14:00:00.000Z"),
        },
      ],
    };

    const activeSchedule = {
      id: 2,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-07-01T09:00:00.000Z"), // JST midnight
      effectiveTo: null, // Active schedule
      slots: [
        {
          id: 3,
          scheduleId: 2,
          weekday: 2, // Tuesday
          startTime: new Date("1970-01-01T10:00:00.000Z"),
        },
        {
          id: 4,
          scheduleId: 2,
          weekday: 4, // Thursday
          startTime: new Date("1970-01-01T15:00:00.000Z"),
        },
      ],
    };

    beforeEach(() => {
      vi.clearAllMocks();
      mockPrisma.instructorSchedule.findMany.mockResolvedValue([
        endedSchedule,
        activeSchedule,
      ]);
    });

    // Pattern A: Query Spans Both Schedules (Adjacent) - No Gap
    it("startDate < endedSchedule.effectiveTo = activeSchedule.effectiveFrom < endDate (spans both schedules, no gap)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-06-25", // Within ended schedule
          endDate: "2025-07-10", // Within active schedule
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );

      // Should return slots from both schedules
      // Note: July 1st is NOT included from ended schedule since effectiveTo is exclusive
      expect(response.body.data).toEqual([
        // From ended schedule (June 25-30, July 1st excluded by effectiveTo)
        {
          dateTime: "2025-06-25T14:00:00.000Z", // June 25th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-06-30T09:00:00.000Z", // June 30th (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        // From active schedule (July 1-9)
        {
          dateTime: "2025-07-01T10:00:00.000Z", // July 1st (Tuesday)
          weekday: 2,
          startTime: "1970-01-01T10:00:00.000Z",
        },
        {
          dateTime: "2025-07-03T15:00:00.000Z", // July 3rd (Thursday)
          weekday: 4,
          startTime: "1970-01-01T15:00:00.000Z",
        },
        {
          dateTime: "2025-07-08T10:00:00.000Z", // July 8th (Tuesday)
          weekday: 2,
          startTime: "1970-01-01T10:00:00.000Z",
        },
      ]);
    });

    // Pattern A: Query Spans Both Schedules (Extended)
    it("startDate < endedSchedule.effectiveFrom and activeSchedule.effectiveFrom < endDate (spans entire ended schedule plus active)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-05-01", // Before ended schedule starts
          endDate: "2025-07-05", // Within active schedule
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );

      // Should return slots from both schedules
      // Note: July 1st is NOT included from ended schedule since effectiveTo is exclusive
      expect(response.body.data).toEqual([
        // From ended schedule (June 1-30, July 1st excluded by effectiveTo)
        {
          dateTime: "2025-06-02T09:00:00.000Z", // June 2nd (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-06-04T14:00:00.000Z", // June 4th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-06-09T09:00:00.000Z", // June 9th (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-06-11T14:00:00.000Z", // June 11th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-06-16T09:00:00.000Z", // June 16th (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-06-18T14:00:00.000Z", // June 18th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-06-23T09:00:00.000Z", // June 23rd (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-06-25T14:00:00.000Z", // June 25th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-06-30T09:00:00.000Z", // June 30th (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        // July 1st is NOT included from ended schedule because effectiveTo is exclusive
        // From active schedule (July 1-5)
        {
          dateTime: "2025-07-01T10:00:00.000Z", // July 1st (Tuesday)
          weekday: 2,
          startTime: "1970-01-01T10:00:00.000Z",
        },
        {
          dateTime: "2025-07-03T15:00:00.000Z", // July 3rd (Thursday)
          weekday: 4,
          startTime: "1970-01-01T15:00:00.000Z",
        },
      ]);
    });

    // Pattern A: Query Spans Both Schedules (Extended)
    it("startDate < endedSchedule.effectiveFrom and activeSchedule.effectiveFrom < endDate (spans entire ended schedule plus active)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-05-01", // Before ended schedule starts
          endDate: "2025-07-05", // Within active schedule
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );

      // Should return slots from both schedules
      // Note: July 1st is NOT included from ended schedule since effectiveTo is exclusive
      expect(response.body.data).toEqual([
        // From ended schedule (June 1-30, July 1st excluded by effectiveTo)
        {
          dateTime: "2025-06-02T09:00:00.000Z", // June 2nd (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-06-04T14:00:00.000Z", // June 4th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-06-09T09:00:00.000Z", // June 9th (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-06-11T14:00:00.000Z", // June 11th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-06-16T09:00:00.000Z", // June 16th (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-06-18T14:00:00.000Z", // June 18th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-06-23T09:00:00.000Z", // June 23rd (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-06-25T14:00:00.000Z", // June 25th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-06-30T09:00:00.000Z", // June 30th (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        // July 1st is NOT included from ended schedule because effectiveTo is exclusive
        // From active schedule (July 1-5)
        {
          dateTime: "2025-07-01T10:00:00.000Z", // July 1st (Tuesday)
          weekday: 2,
          startTime: "1970-01-01T10:00:00.000Z",
        },
        {
          dateTime: "2025-07-03T15:00:00.000Z", // July 3rd (Thursday)
          weekday: 4,
          startTime: "1970-01-01T15:00:00.000Z",
        },
      ]);
    });
  });

  describe("Available Slots API with Multiple Schedules (Gap)", () => {
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

    const instructor = createTestInstructor();

    const endedScheduleWithGap = {
      id: 1,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-06-01T09:00:00.000Z"), // JST midnight
      effectiveTo: new Date("2025-06-20T09:00:00.000Z"), // JST midnight - Ends June 20th (exclusive)
      slots: [
        {
          id: 1,
          scheduleId: 1,
          weekday: 1, // Monday
          startTime: new Date("1970-01-01T09:00:00.000Z"),
        },
        {
          id: 2,
          scheduleId: 1,
          weekday: 3, // Wednesday
          startTime: new Date("1970-01-01T14:00:00.000Z"),
        },
      ],
    };

    const activeScheduleWithGap = {
      id: 2,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-07-10T09:00:00.000Z"), // JST midnight - Starts July 10th (gap from June 20 - July 10)
      effectiveTo: null, // Active schedule
      slots: [
        {
          id: 3,
          scheduleId: 2,
          weekday: 2, // Tuesday
          startTime: new Date("1970-01-01T10:00:00.000Z"),
        },
        {
          id: 4,
          scheduleId: 2,
          weekday: 4, // Thursday
          startTime: new Date("1970-01-01T15:00:00.000Z"),
        },
      ],
    };

    beforeEach(() => {
      vi.clearAllMocks();
      mockPrisma.instructorSchedule.findMany.mockResolvedValue([
        endedScheduleWithGap,
        activeScheduleWithGap,
      ]);
    });

    // Pattern A: Query Spans Both Schedules with Gap
    it("endedSchedule.effectiveTo < activeSchedule.effectiveFrom with query spanning gap", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-06-15", // Within first schedule
          endDate: "2025-07-15", // Within second schedule, spans the gap
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );

      // Should return slots from both schedules, but none from the gap period
      expect(response.body.data).toEqual([
        // From ended schedule (June 15-19, ends June 20th exclusive)
        {
          dateTime: "2025-06-16T09:00:00.000Z", // June 16th (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-06-18T14:00:00.000Z", // June 18th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        // Gap period (June 20 - July 9): No slots
        // From active schedule (July 10-14)
        {
          dateTime: "2025-07-10T15:00:00.000Z", // July 10th (Thursday)
          weekday: 4,
          startTime: "1970-01-01T15:00:00.000Z",
        },
      ]);
    });

    // Pattern A: Query Spans Both Schedules with Gap (Extended)
    it("query spans entire ended schedule, gap, and part of active schedule", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-05-25", // Before ended schedule starts
          endDate: "2025-07-12", // Within active schedule
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );

      // Should return slots from both schedules, but none from the gap period
      expect(response.body.data).toEqual([
        // From ended schedule (June 1-19, ends June 20th exclusive)
        {
          dateTime: "2025-06-02T09:00:00.000Z", // June 2nd (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-06-04T14:00:00.000Z", // June 4th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-06-09T09:00:00.000Z", // June 9th (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-06-11T14:00:00.000Z", // June 11th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        {
          dateTime: "2025-06-16T09:00:00.000Z", // June 16th (Monday)
          weekday: 1,
          startTime: "1970-01-01T09:00:00.000Z",
        },
        {
          dateTime: "2025-06-18T14:00:00.000Z", // June 18th (Wednesday)
          weekday: 3,
          startTime: "1970-01-01T14:00:00.000Z",
        },
        // Gap period (June 20 - July 9): No slots
        // From active schedule (July 10-11)
        {
          dateTime: "2025-07-10T15:00:00.000Z", // July 10th (Thursday)
          weekday: 4,
          startTime: "1970-01-01T15:00:00.000Z",
        },
      ]);
    });

    // Pattern B: Query Spans Only Gap
    it("query period spans only the gap between schedules (no slots)", async () => {
      const response = await request(server)
        .get(`/instructors/${instructor.id}/available-slots`)
        .query({
          startDate: "2025-06-25", // After first schedule ends
          endDate: "2025-07-05", // Before second schedule starts
        })
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
        .query({
          startDate: "2025-06-20", // Exactly when first schedule ends
          endDate: "2025-07-10", // Exactly when second schedule starts
        })
        .expect(200);

      expect(response.body.message).toBe(
        "Available slots retrieved successfully",
      );
      expect(response.body.data).toEqual([]); // No overlap with any schedule (both boundaries are exclusive)
    });
  });
});
