import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma, createTestInstructor, loginAsAdmin } from "./helper";

vi.mock("../../prisma/prismaClient", () => ({
  prisma: createMockPrisma(),
}));

import { prisma } from "../../prisma/prismaClient";
import request from "supertest";
import { server } from "../server";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe("Instructor Absence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get instructor absences", async () => {
    const instructor = createTestInstructor();
    const absences = [
      {
        instructorId: instructor.id,
        absentAt: new Date("2025-01-15T10:00:00Z"),
      },
      {
        instructorId: instructor.id,
        absentAt: new Date("2025-01-20T14:00:00Z"),
      },
    ];

    mockPrisma.instructorAbsence.findMany.mockResolvedValue(absences);

    const response = await request(server)
      .get(`/instructors/${instructor.id}/absences`)
      .expect(200);

    expect(response.body.message).toBe(
      "Instructor absences retrieved successfully",
    );
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data).toMatchObject([
      {
        instructorId: instructor.id,
        absentAt: "2025-01-15T10:00:00.000Z",
      },
      {
        instructorId: instructor.id,
        absentAt: "2025-01-20T14:00:00.000Z",
      },
    ]);
  });

  it("should add instructor absence", async () => {
    const sessionCookie = await loginAsAdmin(server, mockPrisma);
    const instructor = createTestInstructor();
    const absenceData = {
      absentAt: "2025-01-15T10:00:00Z",
    };

    const createdAbsence = {
      instructorId: instructor.id,
      absentAt: new Date("2025-01-15T10:00:00Z"),
    };

    mockPrisma.instructorAbsence.create.mockResolvedValue(createdAbsence);

    const response = await request(server)
      .post(`/instructors/${instructor.id}/absences`)
      .set("Cookie", sessionCookie)
      .send(absenceData)
      .expect(201);

    expect(response.body.message).toBe("Instructor absence added successfully");
    expect(response.body.data).toMatchObject({
      instructorId: instructor.id,
      absentAt: "2025-01-15T10:00:00.000Z",
    });
  });

  it("should remove instructor absence", async () => {
    const sessionCookie = await loginAsAdmin(server, mockPrisma);
    const instructor = createTestInstructor();
    const absentAt = "2025-01-15T10:00:00.000Z";

    mockPrisma.instructorAbsence.delete.mockResolvedValue({
      instructorId: instructor.id,
      absentAt: new Date(absentAt),
    });

    const response = await request(server)
      .delete(`/instructors/${instructor.id}/absences/${absentAt}`)
      .set("Cookie", sessionCookie)
      .expect(200);

    expect(response.body.message).toBe(
      "Instructor absence removed successfully",
    );
    expect(mockPrisma.instructorAbsence.delete).toHaveBeenCalledWith({
      where: {
        instructorId_absentAt: {
          instructorId: instructor.id,
          absentAt: new Date(absentAt),
        },
      },
    });
  });

  it("should return 400 for invalid absentAt format", async () => {
    const sessionCookie = await loginAsAdmin(server, mockPrisma);
    const instructor = createTestInstructor();

    await request(server)
      .post(`/instructors/${instructor.id}/absences`)
      .set("Cookie", sessionCookie)
      .send({ absentAt: "invalid-date" })
      .expect(400);

    await request(server)
      .delete(`/instructors/${instructor.id}/absences/invalid-date`)
      .set("Cookie", sessionCookie)
      .expect(400);
  });

  it("should return 400 for missing absentAt", async () => {
    const sessionCookie = await loginAsAdmin(server, mockPrisma);
    const instructor = createTestInstructor();

    await request(server)
      .post(`/instructors/${instructor.id}/absences`)
      .set("Cookie", sessionCookie)
      .send({})
      .expect(400);
  });
});
