import { describe, it, expect } from "vitest";
import request from "supertest";
const { faker } = require("@faker-js/faker");
import { server } from "../server";
import { prisma } from "./setup";
import {
  createInstructor,
  createAdmin,
  createCustomer,
  createClass,
  createInstructorSchedule,
  createInstructorSlot,
  createInstructorAbsence,
  generateAuthCookie,
  generateTestInstructor,
} from "./testUtils";

describe("GET /instructors/all-profiles", () => {
  it("succeed returning detailed instructor profiles", async () => {
    const admin = await createAdmin();
    const authCookie = await generateAuthCookie(admin.id, "admin");
    await createInstructor();
    await createInstructor();

    const response = await request(server)
      .get("/instructors/all-profiles")
      .set("Cookie", authCookie)
      .expect(200);

    expect(response.body.instructorProfiles).toHaveLength(2);
  });

  it("fail for unauthenticated request", async () => {
    await request(server).get("/instructors/all-profiles").expect(401);
  });
});

describe("GET /instructors/available-slots", () => {
  it("succeed returning available slots", async () => {
    const instructor = await createInstructor();
    const schedule = await createInstructorSchedule(instructor.id, {
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: new Date("2024-12-31"),
      timezone: "Asia/Tokyo",
    });
    await createInstructorSlot(
      schedule.id,
      1,
      new Date("1970-01-01T09:00:00Z"),
    );

    const response = await request(server)
      .get("/instructors/available-slots")
      .query({
        start: "2024-06-01",
        end: "2024-06-30",
        timezone: "Asia/Tokyo",
      })
      .expect(200);

    // Mondays in June 2024 within [2024-06-01, 2024-06-30) => 4 days (3, 10, 17, 24)
    expect(response.body.data.length).toBe(4);
  });
});

describe("GET /instructors/class/:id", () => {
  it("succeed returning instructor ID for valid class", async () => {
    const customer = await createCustomer();
    const instructor = await createInstructor();
    const classInstance = await createClass(
      customer.id,
      instructor.id,
      new Date(),
    );

    const response = await request(server)
      .get(`/instructors/class/${classInstance.id}`)
      .expect(200);

    expect(response.body.instructorId).toBe(instructor.id);
  });
});

describe("GET /instructors/profiles", () => {
  it("succeed returning public instructor profiles", async () => {
    await createInstructor();
    await createInstructor();

    const response = await request(server)
      .get("/instructors/profiles")
      .expect(200);

    expect(response.body).toHaveLength(2);
  });
});

describe("POST /instructors/schedules/post-termination", () => {
  it("succeed creating post-termination schedules", async () => {
    const futureDate = faker.date.future();
    const testData = generateTestInstructor();
    const instructor = await createInstructor({
      ...testData,
      birthdate: new Date(testData.birthdate),
      terminationAt: futureDate,
    });
    await createInstructorSchedule(instructor.id, {
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: null,
    });

    const response = await request(server)
      .post("/instructors/schedules/post-termination")
      .expect(201);

    expect(response.body.message).toContain("successfully");
  });
});

describe("GET /instructors/:id", () => {
  it("succeed with valid instructor ID", async () => {
    const instructor = await createInstructor();

    const response = await request(server)
      .get(`/instructors/${instructor.id}`)
      .expect(200);

    expect(response.body.instructor.id).toBe(instructor.id);
    expect(response.body.instructor.name).toBe(instructor.name);
    expect(response.body.instructor.email).toBe(instructor.email);
  });
});

describe("GET /instructors/:id/absences", () => {
  it("succeed returning instructor absences", async () => {
    const instructor = await createInstructor();
    const absenceDate = new Date("2024-06-15");
    await createInstructorAbsence(instructor.id, absenceDate);

    const response = await request(server)
      .get(`/instructors/${instructor.id}/absences`)
      .expect(200);

    expect(response.body.data).toHaveLength(1);
  });
});

describe("POST /instructors/:id/absences", () => {
  it("succeed adding instructor absence", async () => {
    const admin = await createAdmin();
    const authCookie = await generateAuthCookie(admin.id, "admin");
    const instructor = await createInstructor();
    const absenceDate = "2024-07-01T00:00:00.000Z";

    await request(server)
      .post(`/instructors/${instructor.id}/absences`)
      .set("Cookie", authCookie)
      .send({ absentAt: absenceDate })
      .expect(201);

    // Verify absence was created
    const absence = await prisma.instructorAbsence.findUnique({
      where: {
        instructorId_absentAt: {
          instructorId: instructor.id,
          absentAt: new Date(absenceDate),
        },
      },
    });
    expect(absence).toBeTruthy();
  });

  it("fail for unauthenticated request", async () => {
    const instructor = await createInstructor();

    await request(server)
      .post(`/instructors/${instructor.id}/absences`)
      .send({ absentAt: "2024-07-01T00:00:00.000Z" })
      .expect(401);
  });
});

describe("DELETE /instructors/:id/absences/:absentAt", () => {
  it("succeed removing instructor absence", async () => {
    const admin = await createAdmin();
    const authCookie = await generateAuthCookie(admin.id, "admin");
    const instructor = await createInstructor();
    const absenceDate = new Date("2024-07-01T00:00:00.000Z");
    await createInstructorAbsence(instructor.id, absenceDate);

    await request(server)
      .delete(`/instructors/${instructor.id}/absences/2024-07-01T00:00:00.000Z`)
      .set("Cookie", authCookie)
      .expect(200);

    // Verify absence was deleted
    const absence = await prisma.instructorAbsence.findUnique({
      where: {
        instructorId_absentAt: {
          instructorId: instructor.id,
          absentAt: absenceDate,
        },
      },
    });
    expect(absence).toBeNull();
  });

  it("fail for unauthenticated request", async () => {
    const instructor = await createInstructor();

    await request(server)
      .delete(`/instructors/${instructor.id}/absences/2024-07-01T00:00:00.000Z`)
      .expect(401);
  });
});

describe("GET /instructors/:id/available-slots", () => {
  it("succeed returning instructor available slots", async () => {
    const instructor = await createInstructor();
    const schedule = await createInstructorSchedule(instructor.id, {
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: new Date("2024-12-31"),
      timezone: "Asia/Tokyo",
    });
    await createInstructorSlot(
      schedule.id,
      1,
      new Date("1970-01-01T09:00:00Z"),
    );

    const response = await request(server)
      .get(`/instructors/${instructor.id}/available-slots`)
      .query({
        start: "2024-06-01",
        end: "2024-06-30",
        timezone: "Asia/Tokyo",
      })
      .expect(200);

    // Mondays in June 2024 within [2024-06-01, 2024-06-30) => 4
    expect(response.body.data.length).toBe(4);
  });
});

describe("GET /instructors/:id/calendar-classes", () => {
  it("succeed with valid instructor ID", async () => {
    const instructor = await createInstructor();

    const response = await request(server)
      .get(`/instructors/${instructor.id}/calendar-classes`)
      .expect(200);

    // Instructor has no classes, should return empty array
    expect(response.body).toEqual([]);
  });
});

describe("GET /instructors/:id/classes/:classId/same-date", () => {
  it("succeed returning same-date classes", async () => {
    const customer = await createCustomer();
    const instructor = await createInstructor();
    const dateTime = new Date("2024-06-15T10:00:00Z");
    const classInstance = await createClass(
      customer.id,
      instructor.id,
      dateTime,
    );

    const response = await request(server)
      .get(
        `/instructors/${instructor.id}/classes/${classInstance.id}/same-date`,
      )
      .expect(200);

    expect(response.body.selectedClassDetails.id).toBe(classInstance.id);
  });
});

describe("GET /instructors/:id/profile", () => {
  it("succeed with valid instructor ID", async () => {
    const instructor = await createInstructor();

    const response = await request(server)
      .get(`/instructors/${instructor.id}/profile`)
      .expect(200);

    expect(response.body.id).toBe(instructor.id);
    expect(response.body.name).toBe(instructor.name);
  });
});

describe("GET /instructors/:id/schedules", () => {
  it("succeed returning instructor schedules", async () => {
    const instructor = await createInstructor();
    await createInstructorSchedule(instructor.id, {
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: new Date("2024-06-30"),
    });
    await createInstructorSchedule(instructor.id, {
      effectiveFrom: new Date("2024-07-01"),
      effectiveTo: null,
    });

    const response = await request(server)
      .get(`/instructors/${instructor.id}/schedules`)
      .expect(200);

    expect(response.body.data).toHaveLength(2);
  });
});

describe("POST /instructors/:id/schedules", () => {
  describe("authenticated admin", () => {
    it("succeed creating instructor schedule", async () => {
      const admin = await createAdmin();
      const authCookie = await generateAuthCookie(admin.id, "admin");
      const instructor = await createInstructor();

      const scheduleData = {
        effectiveFrom: "2024-08-01",
        effectiveTo: "2024-12-31",
        timezone: "Asia/Tokyo",
        slots: [
          { weekday: 1, startTime: "09:00" },
          { weekday: 3, startTime: "14:00" },
        ],
      };

      const response = await request(server)
        .post(`/instructors/${instructor.id}/schedules`)
        .set("Cookie", authCookie)
        .send(scheduleData)
        .expect(201);

      // Verify schedule was created
      const schedules = await prisma.instructorSchedule.findMany({
        where: { instructorId: instructor.id },
        include: { slots: true },
      });
      expect(schedules).toHaveLength(1);
      expect(schedules[0].slots).toHaveLength(2);
    });
  });

  it("fail for unauthenticated request", async () => {
    const instructor = await createInstructor();

    await request(server)
      .post(`/instructors/${instructor.id}/schedules`)
      .send({
        effectiveFrom: "2024-08-01",
        timezone: "Asia/Tokyo",
        slots: [],
      })
      .expect(401);
  });
});

describe("GET /instructors/:id/schedules/active", () => {
  it("succeed with valid effective date", async () => {
    const instructor = await createInstructor();
    const schedule = await createInstructorSchedule(instructor.id, {
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: null,
    });
    await createInstructorSlot(
      schedule.id,
      1,
      new Date("1970-01-01T09:00:00Z"),
    );

    const response = await request(server)
      .get(`/instructors/${instructor.id}/schedules/active`)
      .query({ effectiveDate: "2024-06-15" })
      .expect(200);

    expect(response.body.data.id).toBe(schedule.id);
  });
});

describe("GET /instructors/:id/schedules/:scheduleId", () => {
  it("succeed with valid schedule ID", async () => {
    const instructor = await createInstructor();
    const schedule = await createInstructorSchedule(instructor.id);

    const response = await request(server)
      .get(`/instructors/${instructor.id}/schedules/${schedule.id}`)
      .expect(200);

    expect(response.body.data.id).toBe(schedule.id);
  });
});
