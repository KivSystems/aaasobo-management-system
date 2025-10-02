import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "./helper";

vi.mock("../../prisma/prismaClient", () => ({
  prisma: createMockPrisma(),
}));

import { prisma } from "../../prisma/prismaClient";
import request from "supertest";
import { server } from "../server";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe("Subscriptions Router - Zod Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /subscriptions/:id", () => {
    it("should return subscription with valid ID", async () => {
      const mockSubscription = {
        id: 1,
        planId: 1,
        customerId: 1,
        startAt: new Date("2024-01-01T00:00:00.000Z"),
        endAt: null,
        plan: {
          id: 1,
          name: "Basic Plan",
          weeklyClassTimes: 2,
          description: "Basic English conversation plan",
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
          updatedAt: new Date("2024-01-01T00:00:00.000Z"),
          terminationAt: null,
        },
        customer: {
          id: 1,
          name: "Test Customer",
          email: "customer@example.com",
          prefecture: "Tokyo",
          emailVerified: new Date("2024-01-01T00:00:00.000Z"),
          hasSeenWelcome: true,
        },
      };

      mockPrisma.subscription.findUnique = vi
        .fn()
        .mockResolvedValue(mockSubscription);

      const response = await request(server)
        .get("/subscriptions/1")
        .expect(200);

      expect(response.body).toEqual({
        id: 1,
        planId: 1,
        customerId: 1,
        startAt: "2024-01-01T00:00:00.000Z",
        endAt: null,
        plan: {
          id: 1,
          name: "Basic Plan",
          weeklyClassTimes: 2,
          description: "Basic English conversation plan",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          terminationAt: null,
        },
        customer: {
          id: 1,
          name: "Test Customer",
          email: "customer@example.com",
          prefecture: "Tokyo",
          emailVerified: "2024-01-01T00:00:00.000Z",
          hasSeenWelcome: true,
        },
      });
    });

    it("should return 400 for invalid subscription ID", async () => {
      const response = await request(server)
        .get("/subscriptions/invalid")
        .expect(400);

      expect(response.body.message).toBe("Invalid parameters");
    });

    it("should return 404 for non-existent subscription", async () => {
      mockPrisma.subscription.findUnique = vi.fn().mockResolvedValue(null);

      const response = await request(server)
        .get("/subscriptions/999")
        .expect(404);

      expect(response.body.error).toBe("Subscription not found.");
    });
  });
});
