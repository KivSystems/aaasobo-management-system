import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "./helper";
import request from "supertest";
import { server } from "../server";

vi.mock("../../prisma/prismaClient", () => ({
  prisma: createMockPrisma(),
}));

import { prisma } from "../../prisma/prismaClient";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe("Plans Router - Validation Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /plans", () => {
    it("should return list of all active plans", async () => {
      const mockPlans = [
        {
          id: 1,
          name: "Basic Plan",
          weeklyClassTimes: 2,
          description: "A basic plan with 2 weekly classes",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          terminationAt: null,
        },
        {
          id: 2,
          name: "Premium Plan",
          weeklyClassTimes: 4,
          description: "A premium plan with 4 weekly classes",
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
          terminationAt: null,
        },
      ];

      mockPrisma.plan.findMany.mockResolvedValue(mockPlans);

      const response = await request(server).get("/plans");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].id).toBe(1);
      expect(response.body.data[0].name).toBe("Basic Plan");
      expect(response.body.data[0].weeklyClassTimes).toBe(2);
    });

    it("should return empty array when no plans exist", async () => {
      mockPrisma.plan.findMany.mockResolvedValue([]);

      const response = await request(server).get("/plans");

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it("should return 500 for database errors", async () => {
      mockPrisma.plan.findMany.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const response = await request(server).get("/plans");

      expect(response.status).toBe(500);
    });
  });

  describe("GET /plans/:id", () => {
    it("should return plan for valid ID", async () => {
      const mockPlan = {
        id: 1,
        name: "Basic Plan",
        weeklyClassTimes: 2,
        description: "A basic plan with 2 weekly classes",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        terminationAt: null,
      };

      mockPrisma.plan.findUnique.mockResolvedValue(mockPlan);

      const response = await request(server).get("/plans/1");

      expect(response.status).toBe(200);
      expect(response.body.plan).toEqual({
        id: 1,
        name: "Basic Plan",
        weeklyClassTimes: 2,
        description: "A basic plan with 2 weekly classes",
      });
    });

    it("should return 400 for invalid plan ID", async () => {
      const response = await request(server).get("/plans/invalid");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid parameters");
    });

    it("should return 400 for non-numeric plan ID", async () => {
      const response = await request(server).get("/plans/abc123");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid parameters");
    });

    it("should return 404 for non-existent plan ID", async () => {
      mockPrisma.plan.findUnique.mockResolvedValue(null);

      const response = await request(server).get("/plans/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Plan not found.");
    });

    it("should return 500 for database errors", async () => {
      mockPrisma.plan.findUnique.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const response = await request(server).get("/plans/1");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Database connection failed");
    });
  });
});
