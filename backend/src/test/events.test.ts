import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "./helper";
import request from "supertest";
import { server } from "../server";

vi.mock("../../prisma/prismaClient", () => ({
  prisma: createMockPrisma(),
}));

import { prisma } from "../../prisma/prismaClient";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe("Events Router - Validation Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /events/:id", () => {
    it("should return event for valid ID", async () => {
      const mockEvent = {
        id: 1,
        name: "Test Event",
        color: "#FF5733",
      };

      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

      const response = await request(server).get("/events/1");

      expect(response.status).toBe(200);
      expect(response.body.event).toEqual({
        id: 1,
        name: "Test Event",
        color: "#FF5733",
      });
    });

    it("should return 400 for invalid event ID", async () => {
      const response = await request(server).get("/events/invalid");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid parameters");
    });

    it("should return 400 for non-numeric event ID", async () => {
      const response = await request(server).get("/events/abc123");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid parameters");
    });

    it("should return 404 for non-existent event ID", async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      const response = await request(server).get("/events/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Event not found.");
    });

    it("should return 500 for database errors", async () => {
      mockPrisma.event.findUnique.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const response = await request(server).get("/events/1");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Database connection failed");
    });
  });
});
