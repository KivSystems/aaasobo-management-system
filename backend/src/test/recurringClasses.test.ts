import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "./helper";
import request from "supertest";
import { server } from "../server";

vi.mock("../../prisma/prismaClient", () => ({
  prisma: createMockPrisma(),
}));

import { prisma } from "../../prisma/prismaClient";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe("Recurring Classes Router - Validation Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /recurring-classes (by subscriptionId)", () => {
    it("should return recurring classes for valid subscriptionId", async () => {
      const mockRecurringClasses = [
        {
          id: 1,
          subscriptionId: 1,
          instructorId: 1,
          customerId: 1,
          weekday: 1,
          startAt: new Date("2024-01-01T10:00:00.000Z"),
          endAt: null,
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
          updatedAt: new Date("2024-01-01T00:00:00.000Z"),
          instructor: {
            id: 1,
            name: "Test Instructor",
            nickname: "TestInst",
          },
          recurringClassAttendance: [
            {
              childrenId: 1,
              children: { id: 1, name: "Test Child" },
            },
          ],
        },
      ];

      mockPrisma.recurringClass.findMany.mockResolvedValue(
        mockRecurringClasses as any,
      );

      const response = await request(server).get(
        "/recurring-classes?subscriptionId=1",
      );

      expect(response.status).toBe(200);
    });

    it("should return 400 for missing subscriptionId", async () => {
      const response = await request(server).get("/recurring-classes");

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid subscriptionId", async () => {
      const response = await request(server).get(
        "/recurring-classes?subscriptionId=invalid",
      );

      expect(response.status).toBe(400);
    });

    it("should accept valid status parameter", async () => {
      mockPrisma.recurringClass.findMany.mockResolvedValue([]);

      const response = await request(server).get(
        "/recurring-classes?subscriptionId=1&status=active",
      );

      expect(response.status).toBe(200);
    });

    it("should return 400 for invalid status parameter", async () => {
      const response = await request(server).get(
        "/recurring-classes?subscriptionId=1&status=invalid",
      );

      expect(response.status).toBe(400);
    });
  });

  describe("GET /recurring-classes/by-instructorId", () => {
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

      mockPrisma.recurringClass.findMany.mockResolvedValue(
        mockRecurringClasses,
      );

      const response = await request(server).get(
        "/recurring-classes/by-instructorId?instructorId=1",
      );

      expect(response.status).toBe(200);
    });

    it("should return 400 for missing instructorId", async () => {
      const response = await request(server).get(
        "/recurring-classes/by-instructorId",
      );

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid instructorId", async () => {
      const response = await request(server).get(
        "/recurring-classes/by-instructorId?instructorId=invalid",
      );

      expect(response.status).toBe(400);
    });
  });

  describe("GET /recurring-classes/:id", () => {
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

      mockPrisma.recurringClass.findUnique.mockResolvedValue(
        mockRecurringClass,
      );

      const response = await request(server).get("/recurring-classes/1");

      expect(response.status).toBe(200);
    });

    it("should return 400 for invalid ID", async () => {
      const response = await request(server).get("/recurring-classes/invalid");

      expect(response.status).toBe(400);
    });
  });

  describe("POST /recurring-classes", () => {
    it("should return 400 for missing required fields", async () => {
      const response = await request(server).post("/recurring-classes").send({
        instructorId: 1,
        weekday: 1,
        // Missing other required fields
      });

      expect(response.status).toBe(400);
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
        });

      expect(response.status).toBe(400);
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
        });

      expect(response.status).toBe(400);
    });

    it("should return 400 for empty childrenIds array", async () => {
      const response = await request(server).post("/recurring-classes").send({
        instructorId: 1,
        weekday: 1,
        startTime: "10:00",
        customerId: 1,
        childrenIds: [], // Invalid - must have at least one
        subscriptionId: 1,
        startDate: "2024-01-01",
      });

      expect(response.status).toBe(400);
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
        });

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /recurring-classes/:id", () => {
    it("should return 400 for invalid ID", async () => {
      const response = await request(server)
        .put("/recurring-classes/invalid")
        .send({
          instructorId: 1,
          weekday: 1,
          startTime: "10:00",
          customerId: 1,
          childrenIds: [1],
          startDate: "2024-01-01",
        });

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(server).put("/recurring-classes/1").send({
        instructorId: 1,
        weekday: 1,
        // Missing other required fields
      });

      expect(response.status).toBe(400);
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
        });

      expect(response.status).toBe(400);
    });
  });
});
