import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma, createTestInstructor, jst } from "./helper";
import { nDaysLater } from "../helper/dateUtils";
import request from "supertest";
import { server } from "../server";

vi.mock("../../prisma/prismaClient", () => ({
  prisma: createMockPrisma(),
}));

import { prisma } from "../../prisma/prismaClient";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe("Recurring Classes API - POST /recurring-classes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback) =>
      callback(mockPrisma),
    );
  });

  const validRequestData = {
    instructorId: 1,
    weekday: 1, // Monday
    startTime: "10:00",
    customerId: 1,
    childrenIds: [1, 2],
    subscriptionId: 1,
    startDate: "2025-01-15",
    timezone: "Asia/Tokyo",
  };

  it("should create a regular class successfully when instructor has the time slot", async () => {
    // Mock instructor slot with schedule
    mockPrisma.instructorSlot.findFirst.mockResolvedValue({
      scheduleId: 1,
      weekday: 1,
      startTime: new Date(jst`1970-01-01 10:00`),
      schedule: {
        id: 1,
        instructorId: 1,
        effectiveFrom: new Date(jst`2025-01-01`),
        effectiveTo: null,
        timezone: "Asia/Tokyo",
      },
    });

    // Mock no conflicting regular class
    mockPrisma.$queryRaw.mockResolvedValue([{ exists: false }]);

    // Mock successful creation
    mockPrisma.recurringClass.create.mockResolvedValue({
      id: 1,
      instructorId: 1,
      subscriptionId: 1,
      startAt: new Date(jst`2025-01-20 10:00`),
      endAt: null,
    });

    mockPrisma.recurringClassAttendance.createMany.mockResolvedValue({
      count: 2,
    });

    // Mock Class creation
    mockPrisma.class.createManyAndReturn.mockResolvedValue([
      {
        id: 1,
        instructorId: 1,
        customerId: 1,
        recurringClassId: 1,
        subscriptionId: 1,
        dateTime: new Date(jst`2025-01-20 10:00`),
        status: "booked",
        rebookableUntil: nDaysLater(180, new Date(jst`2025-01-20 10:00`)), // 180 days later
        classCode: "1-0",
      },
    ]);

    // Mock ClassAttendance creation
    mockPrisma.classAttendance.createMany.mockResolvedValue({
      count: 2,
    });

    // Mock conflict and absence checking (no conflicts/absences) - for the new refactored code
    mockPrisma.class.findMany.mockResolvedValueOnce([]); // No conflicts
    mockPrisma.instructorAbsence.findMany.mockResolvedValue([]); // No absences

    const response = await request(server)
      .post("/recurring-classes")
      .send(validRequestData)
      .expect(201);
  });

  it("should return 400 when instructor doesn't have the requested time slot", async () => {
    // Mock no instructor slot found
    mockPrisma.instructorSlot.findFirst.mockResolvedValue(null);

    const response = await request(server)
      .post("/recurring-classes")
      .send(validRequestData)
      .expect(400);
  });

  it("should return 400 when conflicting regular class exists", async () => {
    // Mock instructor slot available
    mockPrisma.instructorSlot.findFirst.mockResolvedValue({
      scheduleId: 1,
      weekday: 1,
      startTime: new Date(jst`1970-01-01 10:00`),
      schedule: {
        id: 1,
        instructorId: 1,
        effectiveFrom: new Date(jst`2025-01-01`),
        effectiveTo: null,
        timezone: "Asia/Tokyo",
      },
    });

    // Mock existing conflicting regular class
    mockPrisma.$queryRaw.mockResolvedValue([{ exists: true }]);

    const response = await request(server)
      .post("/recurring-classes")
      .send(validRequestData)
      .expect(400);

    // Should not proceed to create RecurringClass
    expect(mockPrisma.recurringClass.create).not.toHaveBeenCalled();
  });

  it("should return 400 for missing required fields", async () => {
    const response = await request(server)
      .post("/recurring-classes")
      .send({
        instructorId: 1,
        weekday: 1,
        // Missing other required fields
      })
      .expect(400);
  });

  it("should return 400 for invalid weekday", async () => {
    const response = await request(server)
      .post("/recurring-classes")
      .send({
        instructorId: 1,
        weekday: 7, // Invalid - must be 0-6
        startTime: "10:00",
        customerId: 1,
        childrenIds: [1],
        subscriptionId: 1,
        startDate: "2024-01-01",
      })
      .expect(400);
  });

  it("should return 400 for invalid startTime format", async () => {
    const response = await request(server)
      .post("/recurring-classes")
      .send({
        instructorId: 1,
        weekday: 1,
        startTime: "10:00:00", // Invalid format - should be HH:mm
        customerId: 1,
        childrenIds: [1],
        subscriptionId: 1,
        startDate: "2024-01-01",
      })
      .expect(400);
  });

  it("should return 400 for empty childrenIds array", async () => {
    const response = await request(server)
      .post("/recurring-classes")
      .send({
        instructorId: 1,
        weekday: 1,
        startTime: "10:00",
        customerId: 1,
        childrenIds: [], // Invalid - must have at least one
        subscriptionId: 1,
        startDate: "2024-01-01",
      })
      .expect(400);
  });

  it("should return 400 for invalid parameter types", async () => {
    const response = await request(server)
      .post("/recurring-classes")
      .send({
        instructorId: "invalid", // Should be number
        weekday: 1,
        startTime: "10:00",
        customerId: 1,
        childrenIds: [1],
        subscriptionId: 1,
        startDate: "2024-01-01",
      })
      .expect(400);
  });

  it("should successfully create regular class and cancel conflicting existing classes", async () => {
    // Mock instructor slot available
    mockPrisma.instructorSlot.findFirst.mockResolvedValue({
      scheduleId: 1,
      weekday: 1,
      startTime: new Date(jst`1970-01-01 10:00`),
      schedule: {
        id: 1,
        instructorId: 1,
        effectiveFrom: new Date(jst`2025-01-01`),
        effectiveTo: null,
        timezone: "Asia/Tokyo",
      },
    });

    // Mock no conflicting regular class
    mockPrisma.$queryRaw.mockResolvedValue([{ exists: false }]);

    // Mock RecurringClass creation
    mockPrisma.recurringClass.create.mockResolvedValue({
      id: 1,
      instructorId: 1,
      subscriptionId: 1,
      startAt: new Date(jst`2025-01-20 10:00`),
      endAt: null,
    });

    mockPrisma.recurringClassAttendance.createMany.mockResolvedValue({
      count: 2,
    });

    // Mock Class creation (3 months = ~12 classes)
    const mockClasses = Array.from({ length: 12 }, (_, index) => {
      const classDate = new Date(jst`2025-01-20 10:00`);
      classDate.setUTCDate(classDate.getUTCDate() + index * 7); // Weekly increment

      return {
        id: index + 1,
        instructorId: 1,
        customerId: 1,
        recurringClassId: 1,
        subscriptionId: 1,
        dateTime: classDate,
        status: "booked",
        rebookableUntil: nDaysLater(180, classDate),
        classCode: `1-${index}`,
      };
    });

    mockPrisma.class.createManyAndReturn.mockResolvedValue(mockClasses);

    mockPrisma.classAttendance.createMany.mockResolvedValue({
      count: 24, // 12 classes × 2 children
    });

    // Mock existing conflicting classes found (different recurring class)
    mockPrisma.class.findMany.mockResolvedValueOnce([
      { id: 50, dateTime: new Date(jst`2025-01-20 10:00`) }, // Conflict with first class
    ]);

    // Mock no instructor absences
    mockPrisma.instructorAbsence.findMany.mockResolvedValue([]);

    // Mock class cancellation
    mockPrisma.class.updateMany.mockResolvedValue({ count: 1 });

    const response = await request(server)
      .post("/recurring-classes")
      .send(validRequestData)
      .expect(201);

    // Verify the conflicting classes were canceled using executeRaw
    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
  });
});

describe("Recurring Classes API - GET /recurring-classes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return customer's regular classes for a subscription", async () => {
    const subscriptionId = 1;
    const testInstructor = createTestInstructor();

    // Mock recurring classes data
    mockPrisma.recurringClass.findMany.mockResolvedValue([
      {
        id: 1,
        instructorId: 1,
        subscriptionId: 1,
        startAt: new Date(jst`2025-01-10 10:00`),
        endAt: null,
        instructor: testInstructor,
        recurringClassAttendance: [
          { childrenId: 1, children: { id: 1, name: "Child 1" } },
          { childrenId: 2, children: { id: 2, name: "Child 2" } },
        ],
      },
    ]);

    const response = await request(server)
      .get("/recurring-classes")
      .query({ subscriptionId })
      .expect(200);

    expect(response.body.recurringClasses).toHaveLength(1);
    expect(response.body.recurringClasses[0].id).toBe(1);
  });

  it("should return 400 when subscriptionId is missing", async () => {
    const response = await request(server)
      .get("/recurring-classes")
      .expect(400);
  });

  it("should return 400 for invalid subscriptionId", async () => {
    const response = await request(server)
      .get("/recurring-classes?subscriptionId=invalid")
      .expect(400);
  });

  it("should accept valid status parameter", async () => {
    mockPrisma.recurringClass.findMany.mockResolvedValue([]);

    const response = await request(server)
      .get("/recurring-classes?subscriptionId=1&status=active")
      .expect(200);
  });

  it("should return 400 for invalid status parameter", async () => {
    const response = await request(server)
      .get("/recurring-classes?subscriptionId=1&status=invalid")
      .expect(400);
  });
});

describe("Recurring Classes API - GET /recurring-classes/:id", () => {
  it("should return recurring class for valid ID", async () => {
    const mockRecurringClass = {
      id: 1,
      subscriptionId: 1,
      instructorId: 1,
      customerId: 1,
      weekday: 1,
      startTime: new Date("1970-01-01T10:00:00.000Z"),
      startDate: new Date("2024-01-01T00:00:00.000Z"),
      endDate: null,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };

    mockPrisma.recurringClass.findUnique.mockResolvedValue(mockRecurringClass);

    const response = await request(server)
      .get("/recurring-classes/1")
      .expect(200);
  });

  it("should return 400 for invalid ID", async () => {
    const response = await request(server)
      .get("/recurring-classes/invalid")
      .expect(400);
  });
});

describe("Recurring Classes API - GET /recurring-classes/by-instructorId", () => {
  it("should return recurring classes for valid instructorId", async () => {
    const mockRecurringClasses = [
      {
        id: 1,
        subscriptionId: 1,
        instructorId: 1,
        customerId: 1,
        weekday: 1,
        startTime: new Date("1970-01-01T10:00:00.000Z"),
        startDate: new Date("2024-01-01T00:00:00.000Z"),
        endDate: null,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      },
    ];

    mockPrisma.recurringClass.findMany.mockResolvedValue(mockRecurringClasses);

    const response = await request(server)
      .get("/recurring-classes/by-instructorId?instructorId=1")
      .expect(200);
  });

  it("should return 400 for missing instructorId", async () => {
    const response = await request(server)
      .get("/recurring-classes/by-instructorId")
      .expect(400);
  });

  it("should return 400 for invalid instructorId", async () => {
    const response = await request(server)
      .get("/recurring-classes/by-instructorId?instructorId=invalid")
      .expect(400);
  });
});

describe("Recurring Classes API - PUT /recurring-classes/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback) =>
      callback(mockPrisma),
    );
  });

  const validUpdateData = {
    instructorId: 2,
    weekday: 3, // Wednesday
    startTime: "14:00",
    customerId: 1,
    childrenIds: [1],
    subscriptionId: 1,
    startDate: nDaysLater(8).toISOString().split("T")[0], // At least one week from today (8 days to be safe)
    timezone: "Asia/Tokyo",
  };

  it("should return 400 for invalid ID", async () => {
    const response = await request(server)
      .put("/recurring-classes/invalid")
      .send(validUpdateData)
      .expect(400);
  });

  it("should return 400 for missing required fields", async () => {
    const response = await request(server)
      .put("/recurring-classes/1")
      .send({
        instructorId: 1,
        weekday: 1,
        // Missing other required fields
      })
      .expect(400);
  });

  it("should return 400 for invalid weekday", async () => {
    const response = await request(server)
      .put("/recurring-classes/1")
      .send({
        instructorId: 1,
        weekday: -1, // Invalid - must be 0-6
        startTime: "10:00",
        customerId: 1,
        childrenIds: [1],
        startDate: "2024-01-01",
      })
      .expect(400);
  });

  it("should successfully edit a regular class", async () => {
    const recurringClassId = 1;

    // Mock existing recurring class
    mockPrisma.recurringClass.findFirst.mockResolvedValue({
      id: 1,
      instructorId: 1,
      subscriptionId: 1,
      startAt: new Date(jst`2025-01-15 10:00`),
      endAt: null,
    });

    // Mock instructor has new time slot available
    mockPrisma.instructorSlot.findFirst.mockResolvedValue({
      scheduleId: 2,
      weekday: 3,
      startTime: new Date(jst`1970-01-01 14:00`),
      schedule: {
        id: 2,
        instructorId: 2,
        effectiveFrom: new Date(jst`2025-01-01`),
        effectiveTo: null,
        timezone: "Asia/Tokyo",
      },
    });

    // Mock finding the existing recurring class (first call)
    mockPrisma.recurringClass.findFirst.mockResolvedValueOnce({
      id: 1,
      instructorId: 1,
      subscriptionId: 1,
      startAt: new Date(jst`2025-01-15 10:00`),
      endAt: null,
    });

    // Mock no conflicting regular class with new instructor
    mockPrisma.$queryRaw.mockResolvedValue([{ exists: false }]);

    // Calculate dynamic dates for mocking
    const mockEndAtDate = nDaysLater(8); // Same as validUpdateData.startDate
    const mockStartAt = new Date(jst`2025-01-15 10:00`); // Keep original start for old class

    // Mock successful termination and creation
    mockPrisma.recurringClass.update.mockResolvedValue({
      id: 1,
      instructorId: 1,
      subscriptionId: 1,
      startAt: mockStartAt,
      endAt: mockEndAtDate, // Same as new RecurringClass startAt (no gap)
    });

    mockPrisma.recurringClass.create.mockResolvedValue({
      id: 2,
      instructorId: 2,
      subscriptionId: 1,
      startAt: mockEndAtDate,
      endAt: null,
    });

    // Mock cleanup of existing Class records
    mockPrisma.class.findMany.mockResolvedValue([{ id: 10 }, { id: 11 }]);
    mockPrisma.classAttendance.deleteMany.mockResolvedValue({ count: 4 });
    mockPrisma.class.deleteMany.mockResolvedValue({ count: 2 });

    mockPrisma.recurringClassAttendance.createMany.mockResolvedValue({
      count: 1,
    });

    // Mock Class creation
    mockPrisma.class.createManyAndReturn.mockResolvedValue([
      {
        id: 3,
        instructorId: 2,
        customerId: 1,
        recurringClassId: 2,
        subscriptionId: 1,
        dateTime: mockEndAtDate,
        status: "booked",
        rebookableUntil: nDaysLater(180, mockEndAtDate),
        classCode: "2-0",
      },
    ]);

    // Mock ClassAttendance creation
    mockPrisma.classAttendance.createMany.mockResolvedValue({
      count: 1,
    });

    // Mock conflict and absence checking (no conflicts/absences)
    mockPrisma.class.findMany
      .mockResolvedValueOnce([{ id: 10 }, { id: 11 }]) // For terminateRecurringClass
      .mockResolvedValueOnce([]); // No conflicts for new classes
    mockPrisma.instructorAbsence.findMany.mockResolvedValue([]); // No absences

    const response = await request(server)
      .put(`/recurring-classes/${recurringClassId}`)
      .send(validUpdateData)
      .expect(200);

    expect(response.body.oldRecurringClass.id).toBe(1);
    expect(response.body.newRecurringClass.id).toBe(2);
  });
});
