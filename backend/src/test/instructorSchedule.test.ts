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
        findUnique: vi.fn(),
        update: mockTxUpdate,
        create: vi.fn().mockResolvedValue(createdSchedule),
      },
      instructorSlot: {
        createMany: vi
          .fn()
          .mockResolvedValue({ count: returnedSchedule.slots.length }),
      },
    };

    mockTx.instructorSchedule.findUnique = vi
      .fn()
      .mockResolvedValueOnce(existingSchedule)
      .mockResolvedValueOnce(returnedSchedule);

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
      effectiveFrom: new Date("2025-02-01"),
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
        effectiveFrom: new Date("2025-02-01"),
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
      effectiveFrom: "2025-02-01T00:00:00.000Z",
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
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: null,
    };

    // Mock new schedule
    const newSchedule = {
      id: 2,
      instructorId: instructor.id,
      effectiveFrom: new Date("2025-03-01"),
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
        effectiveFrom: new Date("2025-03-01"),
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
      effectiveFrom: "2025-03-01T00:00:00.000Z",
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
      data: { effectiveTo: new Date("2025-03-01") },
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
        effectiveFrom: new Date("2025-01-01"),
        effectiveTo: new Date("2025-03-01"),
      },
      {
        id: 2,
        instructorId: instructor.id,
        effectiveFrom: new Date("2025-03-01"),
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
      effectiveFrom: "2025-01-01T00:00:00.000Z",
      effectiveTo: "2025-03-01T00:00:00.000Z",
    });

    // Step 2: Select a schedule version from the list
    const selectedScheduleId = 2;
    const slots = [
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
    ];

    mockPrisma.instructorSlot.findMany.mockResolvedValue(slots);

    const scheduleDetailResponse = await request(server)
      .get(`/instructors/${instructor.id}/schedules/${selectedScheduleId}`)
      .expect(200);

    expect(scheduleDetailResponse.body.message).toBe(
      "Schedule slots retrieved successfully",
    );
    expect(scheduleDetailResponse.body.data).toHaveLength(3);
    expect(scheduleDetailResponse.body.data).toMatchObject([
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
    ]);
  });
});
