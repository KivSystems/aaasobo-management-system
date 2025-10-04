import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "./helper";

vi.mock("../../prisma/prismaClient", () => ({
  prisma: createMockPrisma(),
}));

import { prisma } from "../../prisma/prismaClient";
import request from "supertest";
import { server } from "../server";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

// Mock the auth middleware to bypass authentication
vi.mock("../middlewares/auth.middleware", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../middlewares/auth.middleware")>();
  return {
    ...actual,
    verifyCronJobAuthorization: (req: any, res: any, next: any) => next(),
  };
});

// Mock the schedule service
vi.mock("../services/scheduleService", () => ({
  registerSchedules: vi.fn().mockResolvedValue(true),
  getAllSchedules: vi.fn(),
  updateSchedules: vi.fn(),
}));

describe("Jobs Router - Zod Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /jobs/get-system-status", () => {
    it("should return system status", async () => {
      mockPrisma.systemStatus.findUnique = vi.fn().mockResolvedValue({
        id: 1,
        status: "Running",
      });

      const response = await request(server).get("/jobs/get-system-status");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status");
      expect(["Running", "Stop"]).toContain(response.body.status);
    });

    it("should return 500 when system status not found", async () => {
      mockPrisma.systemStatus.findUnique = vi.fn().mockResolvedValue(null);

      const response = await request(server).get("/jobs/get-system-status");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /jobs/business-schedule/update-sunday-color", () => {
    it("should update Sunday colors with valid eventId", async () => {
      mockPrisma.businessSchedule.createMany = vi
        .fn()
        .mockResolvedValue({ count: 52 });

      const response = await request(server)
        .post("/jobs/business-schedule/update-sunday-color")
        .send({ eventId: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("result");
      expect(typeof response.body.result).toBe("boolean");
    });

    it("should return 400 for invalid eventId (string)", async () => {
      const response = await request(server)
        .post("/jobs/business-schedule/update-sunday-color")
        .send({ eventId: "invalid" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 for missing eventId", async () => {
      const response = await request(server)
        .post("/jobs/business-schedule/update-sunday-color")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 for negative eventId", async () => {
      const response = await request(server)
        .post("/jobs/business-schedule/update-sunday-color")
        .send({ eventId: -1 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("PATCH /jobs/update-system-status", () => {
    it("should toggle system status from Running to Stop", async () => {
      mockPrisma.systemStatus.findUnique = vi.fn().mockResolvedValue({
        id: 1,
        status: "Running",
      });
      mockPrisma.systemStatus.update = vi.fn().mockResolvedValue({
        id: 1,
        status: "Stop",
      });

      const response = await request(server).patch(
        "/jobs/update-system-status",
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("status");
      expect(["Running", "Stop"]).toContain(response.body.status);
    });

    it("should toggle system status from Stop to Running", async () => {
      mockPrisma.systemStatus.findUnique = vi.fn().mockResolvedValue({
        id: 1,
        status: "Stop",
      });
      mockPrisma.systemStatus.update = vi.fn().mockResolvedValue({
        id: 1,
        status: "Running",
      });

      const response = await request(server).patch(
        "/jobs/update-system-status",
      );

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("Running");
    });
  });

  describe("PATCH /jobs/mask/instructors", () => {
    it("should mask instructors successfully", async () => {
      const mockInstructors = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          password: "hashedPassword",
          birthdate: new Date("1990-01-01"),
          workingTime: "9-5",
          lifeHistory: "Some history",
          favoriteFood: "Pizza",
          hobby: "Reading",
          messageForChildren: "Hello kids",
          skill: "Teaching",
          classURL: "https://zoom.us/class1",
          meetingId: "123456",
          passcode: "pass123",
          introductionURL: "https://intro.com",
        },
      ];

      mockPrisma.instructor.findMany = vi
        .fn()
        .mockResolvedValue(mockInstructors);
      mockPrisma.$transaction = vi.fn().mockResolvedValue([
        {
          ...mockInstructors[0],
          name: "Masked_Old1",
          email: "Masked_Old1",
          password: "Masked_Old1",
          birthdate: "1900-01-01T00:00:00.000Z",
          workingTime: "Masked_Old1",
          lifeHistory: "Masked_Old1",
          favoriteFood: "Masked_Old1",
          hobby: "Masked_Old1",
          messageForChildren: "Masked_Old1",
          skill: "Masked_Old1",
          classURL: "Masked_Old1",
          meetingId: "Masked_Old1",
          passcode: "Masked_Old1",
          introductionURL: "Masked_Old1",
        },
      ]);

      const response = await request(server).patch("/jobs/mask/instructors");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should handle empty instructors list", async () => {
      mockPrisma.instructor.findMany = vi.fn().mockResolvedValue([]);
      mockPrisma.$transaction = vi.fn().mockResolvedValue([]);

      const response = await request(server).patch("/jobs/mask/instructors");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("DELETE /jobs/delete/old-classes", () => {
    it("should delete old classes successfully", async () => {
      mockPrisma.class.deleteMany = vi.fn().mockResolvedValue({ count: 25 });

      const response = await request(server).delete("/jobs/delete/old-classes");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("deletedClasses");
      expect(response.body.deletedClasses).toHaveProperty("count");
      expect(typeof response.body.deletedClasses.count).toBe("number");
    });

    it("should handle no classes to delete", async () => {
      mockPrisma.class.deleteMany = vi.fn().mockResolvedValue({ count: 0 });

      const response = await request(server).delete("/jobs/delete/old-classes");

      expect(response.status).toBe(200);
      expect(response.body.deletedClasses.count).toBe(0);
    });
  });
});
