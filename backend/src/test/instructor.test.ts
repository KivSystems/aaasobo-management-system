import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockPrisma,
  createMockResend,
  createTestAdmin,
  createTestInstructor,
} from "./helper";
import { hashPasswordSync } from "../helper/commonUtils";

vi.mock("../../prisma/prismaClient", () => ({
  prisma: createMockPrisma(),
}));

vi.mock("../helper/resendClient", () => ({
  resend: createMockResend(),
}));

import { prisma } from "../../prisma/prismaClient";
import request from "supertest";
import { server } from "../server";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

const loginAsAdmin = async (admin = createTestAdmin()) => {
  mockPrisma.admins.findUnique.mockResolvedValue({
    id: admin.id,
    email: admin.email,
    password: hashPasswordSync(admin.password),
    name: admin.name,
  });

  await request(server)
    .post("/users/authenticate")
    .send({
      email: admin.email,
      password: admin.password,
      userType: "admin",
    })
    .expect(200);

  return `${process.env.AUTH_SALT}=mock-token`;
};

describe("Instructor Registration", () => {
  it("should complete the instructor registration flow", async () => {
    // Step 1: Admin creates instructor profile
    const newInstructor = createTestInstructor();

    mockPrisma.instructor.findUnique.mockResolvedValue(null);
    mockPrisma.instructor.create.mockResolvedValue(newInstructor);

    const sessionCookie = await loginAsAdmin();
    await request(server)
      .post("/admins/instructor-list/register")
      .set("Cookie", sessionCookie)
      .send(newInstructor)
      .expect(201);

    // Step 2: Admin creates instructor schedule
    const schedule = {
      slotsOfDays: {
        Mon: ["09:00", "10:00"],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: [],
      },
      startFrom: "2025-01-01",
    };

    // Mock for schedule creation
    mockPrisma.instructor.findUnique.mockResolvedValue({
      ...newInstructor,
      instructorRecurringAvailability: [],
    });
    mockPrisma.instructorRecurringAvailability.findMany.mockResolvedValue([]);
    mockPrisma.instructorUnavailability.findMany.mockResolvedValue([]);
    mockPrisma.$queryRaw.mockResolvedValue([]);

    // Mock multiple create calls.
    let mockCallCount = 0;
    const expectedSchedules = [
      { day: "Mon", time: "09:00", startAt: new Date("2025-01-06T00:00:00Z") }, // JST 09:00 = UTC 00:00 (Next Monday)
      { day: "Mon", time: "10:00", startAt: new Date("2025-01-06T01:00:00Z") },
    ];
    mockPrisma.instructorRecurringAvailability.create.mockImplementation(
      (data: any) => {
        const scheduleItem =
          expectedSchedules[mockCallCount] || expectedSchedules[0];
        mockCallCount++;
        return Promise.resolve({
          id: mockCallCount,
          instructorId: newInstructor.id,
          startAt: data.data?.startAt || scheduleItem.startAt,
          endAt: null,
        });
      },
    );

    await request(server)
      .put(`/instructors/${newInstructor.id}/recurringAvailability`)
      .set("Cookie", sessionCookie)
      .send(schedule)
      .expect(200);

    // Step 3: Instructor can login
    const hashedPassword = hashPasswordSync(newInstructor.password);
    mockPrisma.instructor.findUnique.mockResolvedValue({
      ...newInstructor,
      password: hashedPassword,
    });

    await request(server)
      .post("/users/authenticate")
      .send({
        email: newInstructor.email,
        password: newInstructor.password,
        userType: "instructor",
      })
      .expect(200);
  });
});

describe("Instructor Profile Update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle instructor profile update flow", async () => {
    // Step 1: Admin views instructor profile
    const sessionCookie = await loginAsAdmin();
    const instructor = createTestInstructor();
    mockPrisma.instructor.findUnique.mockResolvedValue(instructor);

    const profileResponse = await request(server)
      .get(`/instructors/${instructor.id}`)
      .send()
      .expect(200);
    expect(profileResponse.body.instructor).toHaveProperty(
      "name",
      instructor.name,
    );
    expect(profileResponse.body.instructor).toHaveProperty(
      "meetingId",
      instructor.meetingId,
    );

    // Step 2: Admin modifies instructor profile
    const updatedInstructor = {
      ...instructor,
      name: "Updated Instructor Name",
      meetingId: "987 654 3210",
    };

    mockPrisma.instructor.update.mockResolvedValue(updatedInstructor);

    await request(server)
      .patch(`/instructors/${instructor.id}`)
      .set("Cookie", sessionCookie)
      .send({
        name: updatedInstructor.name,
        meetingId: updatedInstructor.meetingId,
      })
      .expect(200);

    // Step 3: Admin views updated instructor profile
    mockPrisma.instructor.findUnique.mockResolvedValue(updatedInstructor);

    const updatedProfileResponse = await request(server)
      .get(`/instructors/${instructor.id}`)
      .send()
      .expect(200);
    expect(updatedProfileResponse.body.instructor).toHaveProperty(
      "name",
      updatedInstructor.name,
    );
    expect(updatedProfileResponse.body.instructor).toHaveProperty(
      "meetingId",
      updatedInstructor.meetingId,
    );
  });
});
