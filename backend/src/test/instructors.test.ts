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
