import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma, createTestAdmin } from "./helper";

vi.mock("../../prisma/prismaClient", () => ({
  prisma: createMockPrisma(),
}));

import { prisma } from "../../prisma/prismaClient";
import request from "supertest";
import { server } from "../server";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe("Admins Router - Zod Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /admins/admin-list", () => {
    it("should return list of admins with correct schema", async () => {
      const mockAdmins = [
        { id: 1, name: "Admin 1", email: "admin1@test.com" },
        { id: 2, name: "Admin 2", email: "admin2@test.com" },
      ];

      mockPrisma.admins.findMany.mockResolvedValue(mockAdmins);

      const response = await request(server)
        .get("/admins/admin-list")
        .expect(200);

      expect(response.body).toEqual({
        data: [
          { No: 1, ID: 1, Admin: "Admin 1", Email: "admin1@test.com" },
          { No: 2, ID: 2, Admin: "Admin 2", Email: "admin2@test.com" },
        ],
      });
    });
  });

  describe("GET /admins/admin-list/:id", () => {
    it("should return admin details with valid ID", async () => {
      const mockAdmin = { id: 1, name: "Test Admin", email: "test@admin.com" };
      mockPrisma.admins.findUnique.mockResolvedValue(mockAdmin);

      const response = await request(server)
        .get("/admins/admin-list/1")
        .expect(200);

      expect(response.body).toEqual({
        admin: {
          id: 1,
          name: "Test Admin",
          email: "test@admin.com",
        },
      });
    });

    it("should return 400 for invalid ID parameter", async () => {
      const response = await request(server)
        .get("/admins/admin-list/invalid")
        .expect(400);

      expect(response.body).toHaveProperty("message", "Invalid parameters");
      expect(response.body).toHaveProperty("details");
    });

    it("should return 404 for non-existent admin", async () => {
      mockPrisma.admins.findUnique.mockResolvedValue(null);

      const response = await request(server)
        .get("/admins/admin-list/999")
        .expect(404);

      expect(response.body).toHaveProperty("message", "Admin not found.");
    });
  });

  describe("GET /admins/instructor-list", () => {
    it("should return list of instructors with correct schema", async () => {
      const mockInstructors = [
        {
          id: 1,
          name: "Instructor 1",
          nickname: "Nick1",
          email: "inst1@test.com",
        },
        {
          id: 2,
          name: "Instructor 2",
          nickname: "Nick2",
          email: "inst2@test.com",
        },
      ];

      mockPrisma.instructor.findMany.mockResolvedValue(mockInstructors);

      const response = await request(server)
        .get("/admins/instructor-list")
        .expect(200);

      expect(response.body).toEqual({
        data: [
          {
            No: 1,
            ID: 1,
            Instructor: "Instructor 1",
            Nickname: "Nick1",
            Email: "inst1@test.com",
          },
          {
            No: 2,
            ID: 2,
            Instructor: "Instructor 2",
            Nickname: "Nick2",
            Email: "inst2@test.com",
          },
        ],
      });
    });
  });

  describe("POST /admins/admin-list/register", () => {
    it("should return 401 for unauthenticated request", async () => {
      const response = await request(server)
        .post("/admins/admin-list/register")
        .send({
          name: "Test Admin",
          email: "test@admin.com",
          password: "password123",
        })
        .expect(401);
    });
  });

  describe("GET /admins/plan-list", () => {
    it("should return list of plans with correct schema", async () => {
      const mockPlans = [
        {
          id: 1,
          name: "Basic Plan",
          weeklyClassTimes: 1,
          description: "Basic plan description",
        },
        {
          id: 2,
          name: "Premium Plan",
          weeklyClassTimes: 3,
          description: "Premium plan description",
        },
      ];

      mockPrisma.plan.findMany.mockResolvedValue(mockPlans);

      const response = await request(server)
        .get("/admins/plan-list")
        .expect(200);

      expect(response.body).toEqual({
        data: [
          {
            No: 1,
            ID: 1,
            Plan: "Basic Plan",
            "Weekly Class Times": 1,
            Description: "Basic plan description",
          },
          {
            No: 2,
            ID: 2,
            Plan: "Premium Plan",
            "Weekly Class Times": 3,
            Description: "Premium plan description",
          },
        ],
      });
    });
  });
});
