import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma, createTestChild } from "./helper";

vi.mock("../../prisma/prismaClient", () => ({
  prisma: createMockPrisma(),
}));

import { prisma } from "../../prisma/prismaClient";
import request from "supertest";
import { server } from "../server";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe("Children Router - Zod Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /children", () => {
    it("should return children list with valid customerId", async () => {
      const mockChildren = [
        {
          id: 1,
          name: "Child 1",
          birthdate: "2016-03-15",
          personalInfo: "Loves art",
          customerId: 1,
        },
        {
          id: 2,
          name: "Child 2",
          birthdate: "2017-05-20",
          personalInfo: "Enjoys music",
          customerId: 1,
        },
      ];

      mockPrisma.children.findMany.mockResolvedValue(mockChildren);

      const response = await request(server)
        .get("/children")
        .query({ customerId: "1" })
        .expect(200);

      expect(response.body).toEqual({
        children: [
          {
            id: 1,
            name: "Child 1",
            birthdate: "2016-03-15",
            personalInfo: "Loves art",
            customerId: 1,
          },
          {
            id: 2,
            name: "Child 2",
            birthdate: "2017-05-20",
            personalInfo: "Enjoys music",
            customerId: 1,
          },
        ],
      });
    });

    it("should return 400 for invalid customerId", async () => {
      const response = await request(server)
        .get("/children")
        .query({ customerId: "invalid" })
        .expect(400);

      expect(response.body.message).toBe("Invalid query parameters");
    });

    it("should return 400 for missing customerId", async () => {
      const response = await request(server).get("/children").expect(400);

      expect(response.body.message).toBe("Invalid query parameters");
    });
  });

  describe("GET /children/:id", () => {
    it("should return child details with valid ID", async () => {
      const mockChild = createTestChild();
      mockPrisma.children.findUnique.mockResolvedValue(mockChild);

      const response = await request(server).get("/children/1").expect(200);

      expect(response.body).toEqual({
        id: 1,
        name: "Test Child",
        birthdate: "2016-03-15",
        personalInfo: "Loves art",
        customerId: 1,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should return 400 for invalid child ID", async () => {
      const response = await request(server)
        .get("/children/invalid")
        .expect(400);

      expect(response.body.message).toBe("Invalid parameters");
    });
  });

  describe("POST /children", () => {
    it("should register child successfully with valid data", async () => {
      const newChild = {
        name: "New Child",
        birthdate: "2018-01-10",
        personalInfo: "Enjoys reading",
        customerId: 1,
      };

      const createdChild = { id: 3, ...newChild };
      mockPrisma.children.create.mockResolvedValue(createdChild);

      const response = await request(server)
        .post("/children")
        .send(newChild)
        .expect(200);

      expect(response.body).toEqual({});
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(server)
        .post("/children")
        .send({
          name: "Jane Doe",
          // missing required fields
        })
        .expect(400);

      expect(response.body.message).toBe("Validation failed");
    });

    it("should return 400 for invalid customerId type", async () => {
      const response = await request(server)
        .post("/children")
        .send({
          name: "Jane Doe",
          birthdate: "2016-03-15",
          personalInfo: "Loves art",
          customerId: "invalid", // should be number
        })
        .expect(400);

      expect(response.body.message).toBe("Validation failed");
    });
  });

  describe("PATCH /children/:id", () => {
    it("should update child successfully with valid data", async () => {
      const updateData = {
        name: "Updated Child",
        birthdate: "2016-06-20",
        personalInfo: "Updated interests",
        customerId: 1,
      };

      const existingChild = createTestChild();
      const updatedChild = { id: 1, ...updateData };
      mockPrisma.children.findUnique.mockResolvedValue(existingChild);
      mockPrisma.children.update.mockResolvedValue(updatedChild);

      const response = await request(server)
        .patch("/children/1")
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "updated",
      });
    });

    it("should return 400 for invalid child ID", async () => {
      const response = await request(server)
        .patch("/children/invalid")
        .send({
          name: "John Updated",
          birthdate: "2015-01-01",
          personalInfo: "Updated info",
          customerId: 1,
        })
        .expect(400);

      expect(response.body.message).toBe("Invalid parameters");
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(server)
        .patch("/children/1")
        .send({
          name: "John Updated",
          // missing required fields
        })
        .expect(400);

      expect(response.body.message).toBe("Validation failed");
    });
  });

  describe("DELETE /children/:id", () => {
    it("should delete child successfully with valid ID", async () => {
      // Mock the class attendance checks to return no conflicts
      mockPrisma.classAttendance.findFirst
        .mockResolvedValueOnce(null) // no completed classes
        .mockResolvedValueOnce(null); // no booked classes

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrisma);
      });

      const response = await request(server).delete("/children/1").expect(200);

      expect(response.body).toEqual({
        message: "deleted",
      });
    });

    it("should return 400 for invalid child ID", async () => {
      const response = await request(server)
        .delete("/children/invalid")
        .expect(400);

      expect(response.body.message).toBe("Invalid parameters");
    });
  });
});
