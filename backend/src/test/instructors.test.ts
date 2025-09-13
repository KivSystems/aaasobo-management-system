import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { createMockPrisma, createTestInstructor } from "./helper";
import request from "supertest";
import { server } from "../server";

vi.mock("../../prisma/prismaClient", () => ({
  prisma: createMockPrisma(),
}));

vi.mock("../middlewares/auth.middleware", () => ({
  verifyAuthentication: (req: any, res: any, next: any) => {
    req.user = { id: "1", userType: "admin" };
    next();
  },
  verifyCronJobAuthorization: (req: any, res: any, next: any) => {
    next();
  },
}));

// Suppress console.error for cleaner test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

import { prisma } from "../../prisma/prismaClient";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe("GET /instructors/all-profiles", () => {
  it("should return detailed instructor profiles for authenticated users", async () => {
    const instructor1 = createTestInstructor();
    const instructor2 = createTestInstructor();

    const mockDetailedInstructors = [
      {
        id: instructor1.id,
        name: instructor1.name,
        nickname: instructor1.nickname,
        icon: instructor1.icon,
        birthdate: new Date("1990-01-01"),
        lifeHistory: "Test life history",
        favoriteFood: "Test food",
        hobby: "Test hobby",
        messageForChildren: "Test message",
        workingTime: "9AM-5PM",
        skill: "Test skill",
        createdAt: new Date(),
        terminationAt: null,
      },
      {
        id: instructor2.id,
        name: instructor2.name,
        nickname: instructor2.nickname,
        icon: instructor2.icon,
        birthdate: new Date("1992-01-01"),
        lifeHistory: "Test life history 2",
        favoriteFood: "Test food 2",
        hobby: "Test hobby 2",
        messageForChildren: "Test message 2",
        workingTime: "10AM-6PM",
        skill: "Test skill 2",
        createdAt: new Date(),
        terminationAt: null,
      },
    ];

    mockPrisma.instructor.findMany.mockResolvedValue(mockDetailedInstructors);

    const response = await request(server).get("/instructors/all-profiles");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.instructorProfiles)).toBe(true);
    expect(response.body.instructorProfiles).toHaveLength(2);

  });

  it("should handle server errors", async () => {
    mockPrisma.instructor.findMany.mockRejectedValue(
      new Error("Database error"),
    );

    const response = await request(server).get("/instructors/all-profiles");

    expect(response.status).toBe(500);
  });
});

describe("GET /instructors/:id", () => {
  it("should return detailed instructor information by ID", async () => {
    const instructor = createTestInstructor();

    const mockDetailedInstructor = {
      id: instructor.id,
      name: instructor.name,
      nickname: instructor.nickname,
      email: instructor.email,
      icon: instructor.icon,
      birthdate: new Date("1990-01-01"),
      lifeHistory: "Test life history",
      favoriteFood: "Test food",
      hobby: "Test hobby",
      messageForChildren: "Test message",
      workingTime: "9AM-5PM",
      skill: "Test skill",
      classURL: "https://example.com/class",
      meetingId: "123456789",
      passcode: "123456",
      introductionURL: "https://example.com/intro",
      createdAt: new Date(),
      terminationAt: null,
    };

    mockPrisma.instructor.findUnique.mockResolvedValue(mockDetailedInstructor);

    const response = await request(server).get(`/instructors/${instructor.id}`);

    expect(response.status).toBe(200);
    expect(response.body.instructor.id).toBe(instructor.id);
    expect(response.body.instructor.name).toBe(instructor.name);
    expect(response.body.instructor.nickname).toBe(instructor.nickname);
    expect(response.body.instructor.email).toBe(instructor.email);
  });
});

describe("GET /instructors/profiles", () => {
  it("should return public instructor profiles", async () => {
    const instructor1 = createTestInstructor();
    const instructor2 = createTestInstructor();

    const mockInstructorProfiles = [
      {
        id: instructor1.id,
        name: instructor1.name,
        nickname: instructor1.nickname,
        icon: instructor1.icon,
        introductionURL: instructor1.introductionURL,
        terminationAt: null,
      },
      {
        id: instructor2.id,
        name: instructor2.name,
        nickname: instructor2.nickname,
        icon: instructor2.icon,
        introductionURL: instructor2.introductionURL,
        terminationAt: null,
      },
    ];

    mockPrisma.instructor.findMany.mockResolvedValue(mockInstructorProfiles);

    const response = await request(server).get("/instructors/profiles");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);

    // Verify specific values
    if (response.body.length > 0) {
      expect(response.body[0].id).toBe(instructor1.id);
      expect(response.body[0].name).toBe(instructor1.name);
      expect(response.body[0].nickname).toBe(instructor1.nickname);
    }
  });
});

describe("GET /instructors/:id/profile", () => {
  it("should return simple instructor profile by ID", async () => {
    const instructor = createTestInstructor();

    const mockSimpleProfile = {
      id: instructor.id,
      name: instructor.name,
      nickname: instructor.nickname,
      createdAt: new Date(),
    };

    mockPrisma.instructor.findUnique.mockResolvedValue(mockSimpleProfile);

    const response = await request(server).get(
      `/instructors/${instructor.id}/profile`,
    );

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(instructor.id);
    expect(response.body.name).toBe(instructor.name);
    expect(response.body.nickname).toBe(instructor.nickname);

    // Verify it doesn't include detailed fields
    expect(response.body).not.toHaveProperty("email");
    expect(response.body).not.toHaveProperty("classURL");
    expect(response.body).not.toHaveProperty("birthdate");
  });
});

describe("GET /instructors/:id/schedules", () => {
  it("should return instructor schedules by ID", async () => {
    const instructorId = 1;

    const mockSchedules = [
      {
        id: 1,
        instructorId: instructorId,
        effectiveFrom: new Date("2024-01-01"),
        effectiveTo: new Date("2024-06-30"),
        timezone: "Asia/Tokyo",
      },
      {
        id: 2,
        instructorId: instructorId,
        effectiveFrom: new Date("2024-07-01"),
        effectiveTo: null,
        timezone: "Asia/Tokyo",
      },
    ];

    mockPrisma.instructorSchedule.findMany.mockResolvedValue(mockSchedules);

    const response = await request(server).get(
      `/instructors/${instructorId}/schedules`,
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Instructor schedule versions retrieved successfully");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(2);

    // Check first schedule
    if (response.body.data.length > 0) {
      const schedule = response.body.data[0];
      expect(schedule.instructorId).toBe(instructorId);
    }
  });
});

describe("GET /instructors/class/:id", () => {
  it("should return instructor ID for a valid class ID", async () => {
    const classId = 123;
    const instructorId = 456;

    const mockClass = {
      id: classId,
      instructorId: instructorId,
    };

    mockPrisma.class.findUnique.mockResolvedValue(mockClass);

    const response = await request(server).get(`/instructors/class/${classId}`);

    expect(response.status).toBe(200);
    expect(response.body.instructorId).toBe(instructorId);
  });
});

describe("GET /instructors/:id/calendar-classes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return calendar classes with valid instructor ID", async () => {
    // Simplify by mocking empty calendar classes
    mockPrisma.class.findMany.mockResolvedValue([]);

    const response = await request(server).get(
      "/instructors/1/calendar-classes",
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
  });
});
