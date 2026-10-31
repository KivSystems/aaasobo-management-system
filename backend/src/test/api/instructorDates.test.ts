import { describe, expect, it } from "vitest";
import request from "supertest";
import { server } from "../../server";
import { prisma } from "../../../prisma/prismaClient";
import {
  createAdmin,
  createInstructor,
  generateAuthCookie,
} from "../testUtils";

const profile = {
  name: "Date validation teacher",
  nickname: "DateTeacher",
  email: "date-validation@example.com",
  birthdate: "01-01",
  workingTime: "",
  lifeHistory: "",
  favoriteFood: "",
  hobby: "",
  messageForChildren: "",
  skill: "",
  classURL: "https://example.com/date-validation",
  meetingId: "date-validation-meeting",
  passcode: "date-validation-passcode",
  englishBackground: "0",
};

async function adminCookie() {
  const admin = await createAdmin();
  return generateAuthCookie(admin.id, "admin");
}

const invalidDates = [
  "",
  "0000-02-29",
  "0099-01-01",
  "1990-01-01T00:00:00.000Z",
  "631152000000",
  "not-a-date",
  "2026-02-29",
  "02/30/2026",
  "2026-13-01",
  "2026-00-10",
];

const invalidBirthdays = [
  ...invalidDates,
  "1990-01-01",
  "02/29/2000",
  "02-30",
  "04-31",
  "2-29",
  "02-29\n",
];

describe("instructor profile date validation", () => {
  it("rejects a multipart ISO timestamp without changing the instructor", async () => {
    const instructor = await createInstructor();
    const cookie = await adminCookie();
    const before = await prisma.instructor.findUniqueOrThrow({
      where: { id: instructor.id },
    });
    let pending = request(server)
      .patch(`/admins/instructor-list/update/${instructor.id}`)
      .set("Cookie", cookie);
    for (const [key, value] of Object.entries({
      ...profile,
      birthdate: "1990-01-01T00:00:00.000Z",
    })) {
      pending = pending.field(key, value);
    }
    await pending.expect(400);
    expect(
      await prisma.instructor.findUniqueOrThrow({
        where: { id: instructor.id },
      }),
    ).toEqual(before);
  });

  it.each(invalidBirthdays)(
    "rejects invalid birthdate %s before updating",
    async (birthdate) => {
      const instructor = await createInstructor();
      const before = await prisma.instructor.findUniqueOrThrow({
        where: { id: instructor.id },
      });
      const response = await request(server)
        .patch(`/admins/instructor-list/update/${instructor.id}`)
        .set("Cookie", await adminCookie())
        .send({ ...profile, birthdate })
        .expect(400);
      expect(response.body.message).toBe("Validation failed");
      expect(
        await prisma.instructor.findUniqueOrThrow({
          where: { id: instructor.id },
        }),
      ).toEqual(before);
    },
  );

  it.each(invalidDates.filter((date) => date !== ""))(
    "rejects invalid leaving date %s before updating",
    async (leavingDate) => {
      const instructor = await createInstructor();
      const response = await request(server)
        .patch(`/admins/instructor-list/update/${instructor.id}`)
        .set("Cookie", await adminCookie())
        .send({ ...profile, leavingDate })
        .expect(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ["leavingDate"] }),
        ]),
      );
    },
  );

  it.each([
    { birthdate: "02-29", leavingDate: undefined },
    { birthdate: "02-29", leavingDate: null },
    { birthdate: "01-01", leavingDate: "" },
    { birthdate: "01-01", leavingDate: "null" },
    { birthdate: "01-01", leavingDate: "2030-02-28" },
    { birthdate: "01-01", leavingDate: "02/28/2030" },
  ])(
    "accepts supported dates and leaving sentinel $leavingDate",
    async ({ birthdate, leavingDate }) => {
      const instructor = await createInstructor();
      await request(server)
        .patch(`/admins/instructor-list/update/${instructor.id}`)
        .set("Cookie", await adminCookie())
        .send({ ...profile, birthdate, leavingDate })
        .expect(200);
      const saved = await prisma.instructor.findUniqueOrThrow({
        where: { id: instructor.id },
      });
      expect(saved.birthdate).toBe(birthdate);
      expect(saved.terminationAt?.toISOString() ?? null).toBe(
        leavingDate && leavingDate !== "null"
          ? "2030-02-27T15:00:00.000Z"
          : null,
      );
      expect(saved.icon).toBe(instructor.icon);
    },
  );

  it.each(invalidBirthdays)(
    "rejects invalid registration birthdate %s before creating",
    async (birthdate) => {
      const before = await prisma.instructor.count();
      await request(server)
        .post("/admins/instructor-list/register")
        .set("Cookie", await adminCookie())
        .send({ ...profile, password: "test-password", birthdate })
        .expect(400);
      expect(await prisma.instructor.count()).toBe(before);
    },
  );
});
