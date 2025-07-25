import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function insertInstructors() {
  await prisma.instructor.create({
    data: {
      // email: "helen@example.com",
      email: "kiv-developers@googlegroups.com",
      name: "Helene Gay Santos",
      nickname: "Helen",
      icon: "helen-1.jpg",
      classURL: "https://zoom.us/j/12345?pwd=ABCde",
      meetingId: "123 456 7890",
      passcode: "helen",
      password: "$2b$12$KIe8onrscIo38gG7qugTuOgx5CY7JQ6VkvFKh/skOwkw1tNWdpVlu", // AaasoBo!Helen
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=129259",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
  await prisma.instructor.create({
    data: {
      email: "elian@example.com",
      name: "Elian P.Quilisadio",
      nickname: "Elian",
      icon: "elian-1.jpg",
      classURL: "https://zoom.us/j/67890?pwd=FGHij",
      meetingId: "234 567 8901",
      passcode: "elian",
      password: "$2b$12$pNrLSRYlTIwTl//Tz3KMA.K2gdqRWA2/aikJ9ilr0ItQZWe1bJoay", // password: AaasoBo!Elian
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=127929",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
  await prisma.instructor.create({
    data: {
      email: "lori@example.com",
      name: "Lorraine Nuesca",
      nickname: "Lori",
      icon: "lori-1.jpg",
      classURL: "https://zoom.us/j/12345?pwd=lori",
      meetingId: "lori 123 456",
      passcode: "lori",
      password: "$2b$12$KIe8onrscIo38gG7qugTuOgx5CY7JQ6VkvFKh/skOwkw1tNWdpVlu", // AaasoBo!Helen
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=404241&w_flg=1",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
  await prisma.instructor.create({
    data: {
      email: "kaori@example.com",
      name: "Kaori Jean Garcia",
      nickname: "Kaori",
      icon: "kaori-1.jpg",
      classURL: "https://zoom.us/j/12345?pwd=kaori",
      meetingId: "kaori 123 456",
      passcode: "kaori",
      password: "$2b$12$KIe8onrscIo38gG7qugTuOgx5CY7JQ6VkvFKh/skOwkw1tNWdpVlu", // AaasoBo!Helen
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=399447&w_flg=1",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
  await prisma.instructor.create({
    data: {
      email: "winnie@example.com",
      name: "Winnelyn Balangbang",
      nickname: "Winnie",
      icon: "winnie-1.jpg",
      classURL: "https://zoom.us/j/12345?pwd=winnie",
      meetingId: "winnie 123 456",
      passcode: "winnie",
      password: "$2b$12$KIe8onrscIo38gG7qugTuOgx5CY7JQ6VkvFKh/skOwkw1tNWdpVlu", // AaasoBo!Helen
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=401099&w_flg=1",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
  await prisma.instructor.create({
    data: {
      email: "claude@example.com",
      name: "Claude Jean Hinampas",
      nickname: "Claude",
      icon: "claude-1.jpg",
      classURL: "https://zoom.us/j/12345?pwd=claude",
      meetingId: "claude 123 456",
      passcode: "claude",
      password: "$2b$12$KIe8onrscIo38gG7qugTuOgx5CY7JQ6VkvFKh/skOwkw1tNWdpVlu", // AaasoBo!Helen
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=326768&w_flg=1",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
  await prisma.instructor.create({
    data: {
      email: "jdy@example.com",
      name: "Jiesheru Dy Bandisa",
      nickname: "JDY",
      icon: "jdy-1.jpg",
      classURL: "https://zoom.us/j/12345?pwd=jdy",
      meetingId: "jdy 123 456",
      passcode: "jdy",
      password: "$2b$12$KIe8onrscIo38gG7qugTuOgx5CY7JQ6VkvFKh/skOwkw1tNWdpVlu", // AaasoBo!Helen
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=384411&w_flg=1",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
  await prisma.instructor.create({
    data: {
      email: "mae@example.com",
      name: "Mae Reantazo",
      nickname: "Mae",
      icon: "mae-1.jpg",
      classURL: "https://zoom.us/j/12345?pwd=mae",
      meetingId: "mae 123 456",
      passcode: "mae",
      password: "$2b$12$KIe8onrscIo38gG7qugTuOgx5CY7JQ6VkvFKh/skOwkw1tNWdpVlu", // AaasoBo!Helen
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=383552&w_flg=1",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
  await prisma.instructor.create({
    data: {
      email: "eiyd@example.com",
      name: "Eiyd",
      nickname: "Eiyd",
      icon: "eiyd-1.jpg",
      classURL: "https://zoom.us/j/12345?pwd=eiyd",
      meetingId: "eiyd 123 456",
      passcode: "eiyd",
      password: "$2b$12$KIe8onrscIo38gG7qugTuOgx5CY7JQ6VkvFKh/skOwkw1tNWdpVlu", // AaasoBo!Helen
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=383555&w_flg=1",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
  await prisma.instructor.create({
    data: {
      email: "kechia@example.com",
      name: "Kechia Oline Aquino",
      nickname: "Kechia",
      icon: "kechia-1.jpg",
      classURL: "https://zoom.us/j/12345?pwd=kechia",
      meetingId: "kechia 123 456",
      passcode: "kechia",
      password: "$2b$12$KIe8onrscIo38gG7qugTuOgx5CY7JQ6VkvFKh/skOwkw1tNWdpVlu", // AaasoBo!Helen
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=317400&w_flg=1",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
  await prisma.instructor.create({
    data: {
      email: "yasmin@example.com",
      name: "Yasmin Luda",
      nickname: "Yasmin",
      icon: "yasmin-1.jpg",
      classURL: "https://zoom.us/j/12345?pwd=yasmin",
      meetingId: "yasmin 123 456",
      passcode: "yasmin",
      password: "$2b$12$KIe8onrscIo38gG7qugTuOgx5CY7JQ6VkvFKh/skOwkw1tNWdpVlu", // AaasoBo!Helen
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=384405&w_flg=1",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
  await prisma.instructor.create({
    data: {
      email: "dani@example.com",
      name: "Dani",
      nickname: "Dani",
      icon: "dani-1.jpg",
      classURL: "https://zoom.us/j/12345?pwd=dani",
      meetingId: "dani 123 456",
      passcode: "dani",
      password: "$2b$12$KIe8onrscIo38gG7qugTuOgx5CY7JQ6VkvFKh/skOwkw1tNWdpVlu", // AaasoBo!Helen
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=372623&w_flg=1",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
  await prisma.instructor.create({
    data: {
      email: "angela@example.com",
      name: "Angela Siega",
      nickname: "Angela",
      icon: "angela-1.jpg",
      classURL: "https://zoom.us/j/12345?pwd=angela",
      meetingId: "angela 123 456",
      passcode: "angela",
      password: "$2b$12$KIe8onrscIo38gG7qugTuOgx5CY7JQ6VkvFKh/skOwkw1tNWdpVlu", // AaasoBo!Helen
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=359230&w_flg=1",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
  await prisma.instructor.create({
    data: {
      email: "ronilo@example.com",
      name: "Ronilo Salimbot",
      nickname: "Ronilo",
      icon: "ronilo-1.jpg",
      classURL: "https://zoom.us/j/12345?pwd=ronilo",
      meetingId: "ronilo 123 456",
      passcode: "ronilo",
      password: "$2b$12$KIe8onrscIo38gG7qugTuOgx5CY7JQ6VkvFKh/skOwkw1tNWdpVlu", // AaasoBo!Helen
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=359243&w_flg=1",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
  await prisma.instructor.create({
    data: {
      email: "sheryll@example.com",
      name: "Sheryll",
      nickname: "Sheryll",
      icon: "sheryll-1.jpg",
      classURL: "https://zoom.us/j/12345?pwd=sheryll",
      meetingId: "sheryll 123 456",
      passcode: "sheryll",
      password: "$2b$12$KIe8onrscIo38gG7qugTuOgx5CY7JQ6VkvFKh/skOwkw1tNWdpVlu", // AaasoBo!Helen
      introductionURL:
        "https://select-type.com/rsv/?id=9krPgyM7znE&c_id=350273&w_flg=1",
      createdAt: "2024-08-01T00:00:00.000Z",
    },
  });
}

async function insertInstructorAvailabilities() {
  const helen = await getInstructor("Helen");
  const elian = await getInstructor("Elian");
  await prisma.instructorRecurringAvailability.createMany({
    data: [
      { startAt: "2025-06-02T07:00:00Z", instructorId: helen.id }, // 16:00 in Japan
      { startAt: "2025-06-02T07:00:00Z", instructorId: elian.id }, // 16:00 in Japan
      { startAt: "2025-06-03T07:00:00Z", instructorId: helen.id },
      { startAt: "2025-06-04T07:00:00Z", instructorId: helen.id },
      { startAt: "2025-06-05T07:00:00Z", instructorId: helen.id },
      { startAt: "2025-06-06T07:00:00Z", instructorId: helen.id },
      { startAt: "2025-06-07T07:00:00Z", instructorId: helen.id },
      { startAt: "2025-06-08T07:00:00Z", instructorId: helen.id },

      // { startAt: "2025-02-03T07:00:00Z", instructorId: helen.id }, // 16:00 in Japan
      // { startAt: "2025-02-03T07:30:00Z", instructorId: helen.id }, // 16:30 in Japan
      // { startAt: "2025-02-03T08:00:00Z", instructorId: helen.id }, // 17:00 in Japan
      // { startAt: "2025-02-03T08:30:00Z", instructorId: helen.id }, // 17:30 in Japan
      // { startAt: "2025-02-03T09:00:00Z", instructorId: helen.id }, // 18:00 in Japan
      // { startAt: "2025-02-03T09:30:00Z", instructorId: helen.id }, // 18:30 in Japan
      // { startAt: "2025-02-03T10:00:00Z", instructorId: helen.id }, // 19:00 in Japan
      // { startAt: "2025-02-04T07:00:00Z", instructorId: helen.id }, // 16:00 in Japan
      // { startAt: "2025-02-04T07:30:00Z", instructorId: helen.id }, // 16:30 in Japan
      // { startAt: "2025-02-04T08:00:00Z", instructorId: helen.id }, // 17:00 in Japan
      // { startAt: "2025-02-04T08:30:00Z", instructorId: helen.id }, // 17:30 in Japan
      // { startAt: "2025-02-04T09:00:00Z", instructorId: helen.id }, // 18:00 in Japan
      // { startAt: "2025-02-04T09:30:00Z", instructorId: helen.id }, // 18:30 in Japan
      // { startAt: "2025-02-04T10:00:00Z", instructorId: helen.id }, // 19:00 in Japan
      // { startAt: "2025-02-05T07:00:00Z", instructorId: helen.id }, // 16:00 in Japan
      // { startAt: "2025-02-05T07:30:00Z", instructorId: helen.id }, // 16:30 in Japan
      // { startAt: "2025-02-05T08:30:00Z", instructorId: helen.id }, // 17:30 in Japan
      // { startAt: "2025-02-05T09:30:00Z", instructorId: helen.id }, // 18:30 in Japan
      // { startAt: "2025-02-05T10:00:00Z", instructorId: helen.id }, // 19:00 in Japan
      // { startAt: "2025-02-05T10:30:00Z", instructorId: helen.id }, // 19:30 in Japan
      // { startAt: "2025-02-05T11:00:00Z", instructorId: helen.id }, // 20:00 in Japan
      // { startAt: "2025-02-07T07:00:00Z", instructorId: helen.id }, // 16:00 in Japan
      // { startAt: "2025-02-07T07:30:00Z", instructorId: helen.id }, // 16:30 in Japan
      // { startAt: "2025-02-07T08:30:00Z", instructorId: helen.id }, // 17:30 in Japan
      // { startAt: "2025-02-07T09:30:00Z", instructorId: helen.id }, // 18:30 in Japan
      // { startAt: "2025-02-07T10:00:00Z", instructorId: helen.id }, // 19:00 in Japan
      // { startAt: "2025-02-07T10:30:00Z", instructorId: helen.id }, // 19:30 in Japan
      // { startAt: "2025-02-07T11:00:00Z", instructorId: helen.id }, // 20:00 in Japan
      // { startAt: "2025-02-03T07:00:00Z", instructorId: elian.id }, // 16:00 in Japan
      // { startAt: "2025-02-03T07:30:00Z", instructorId: elian.id }, // 16:30 in Japan
      // { startAt: "2025-02-03T08:00:00Z", instructorId: elian.id }, // 17:00 in Japan
      // { startAt: "2025-02-03T08:30:00Z", instructorId: elian.id }, // 17:30 in Japan
      // { startAt: "2025-02-03T09:00:00Z", instructorId: elian.id }, // 18:00 in Japan
      // { startAt: "2025-02-03T09:30:00Z", instructorId: elian.id }, // 18:30 in Japan
      // { startAt: "2025-02-03T10:00:00Z", instructorId: elian.id }, // 19:00 in Japan
      // { startAt: "2025-02-04T07:00:00Z", instructorId: elian.id }, // 16:00 in Japan
      // { startAt: "2025-02-04T07:30:00Z", instructorId: elian.id }, // 16:30 in Japan
      // { startAt: "2025-02-04T08:00:00Z", instructorId: elian.id }, // 17:00 in Japan
      // { startAt: "2025-02-04T08:30:00Z", instructorId: elian.id }, // 17:30 in Japan
      // { startAt: "2025-02-04T09:00:00Z", instructorId: elian.id }, // 18:00 in Japan
      // { startAt: "2025-02-04T09:30:00Z", instructorId: elian.id }, // 18:30 in Japan
      // { startAt: "2025-02-04T10:00:00Z", instructorId: elian.id }, // 19:00 in Japan
      // { startAt: "2025-02-05T07:00:00Z", instructorId: elian.id }, // 16:00 in Japan
      // { startAt: "2025-02-05T07:30:00Z", instructorId: elian.id }, // 16:30 in Japan
      // { startAt: "2025-02-05T08:30:00Z", instructorId: elian.id }, // 17:30 in Japan
      // { startAt: "2025-02-05T09:30:00Z", instructorId: elian.id }, // 18:30 in Japan
      // { startAt: "2025-02-05T10:00:00Z", instructorId: elian.id }, // 19:00 in Japan
      // { startAt: "2025-02-05T10:30:00Z", instructorId: elian.id }, // 19:30 in Japan
      // { startAt: "2025-02-05T11:00:00Z", instructorId: elian.id }, // 20:00 in Japan
      // { startAt: "2025-02-07T07:00:00Z", instructorId: elian.id }, // 16:00 in Japan
      // { startAt: "2025-02-07T07:30:00Z", instructorId: elian.id }, // 16:30 in Japan
      // { startAt: "2025-02-07T08:30:00Z", instructorId: elian.id }, // 17:30 in Japan
      // { startAt: "2025-02-07T09:30:00Z", instructorId: elian.id }, // 18:30 in Japan
      // { startAt: "2025-02-07T10:00:00Z", instructorId: elian.id }, // 19:00 in Japan
      // { startAt: "2025-02-07T10:30:00Z", instructorId: elian.id }, // 19:30 in Japan
      // { startAt: "2025-02-07T11:00:00Z", instructorId: elian.id }, // 20:00 in Japan
      // { startAt: "2024-07-01T07:30:00Z", instructorId: helen.id }, // 16:30 in Japan
      // { startAt: "2024-07-01T08:00:00Z", instructorId: elian.id }, // 17:00 in Japan
      // { startAt: "2024-07-02T08:00:00Z", instructorId: elian.id }, // 17:00 in Japan
      // {
      //   startAt: "2024-07-02T08:30:00Z",
      //   instructorId: elian.id,
      //   endAt: "2024-07-24T00:00:00Z",
      // }, // 17:30 in Japan
    ],
  });

  const insertAvailabilities = async (
    instructorId: number,
    startAt: string,
    dateTimes: string[],
  ) => {
    const r = await prisma.instructorRecurringAvailability.findFirst({
      where: { instructorId, startAt },
    });
    if (!r) {
      throw new Error("Recurring availability not found");
    }
    await prisma.instructorAvailability.createMany({
      data: dateTimes.map((dateTime) => ({
        dateTime,
        instructorId,
        instructorRecurringAvailabilityId: r!.id,
      })),
    });
  };

  await insertAvailabilities(helen.id, "2025-06-02T07:00:00Z", [
    "2025-07-14T07:00:00Z",
    "2025-07-21T07:00:00Z",
    "2025-07-28T07:00:00Z",
    "2025-08-04T07:00:00Z",
    "2025-08-11T07:00:00Z",
    "2025-08-18T07:00:00Z",
    "2025-08-25T07:00:00Z",
  ]);

  await insertAvailabilities(elian.id, "2025-06-02T07:00:00Z", [
    "2025-07-14T07:00:00Z",
    "2025-07-21T07:00:00Z",
    "2025-07-28T07:00:00Z",
    "2025-08-04T07:00:00Z",
    "2025-08-11T07:00:00Z",
    "2025-08-18T07:00:00Z",
    "2025-08-25T07:00:00Z",
  ]);

  await insertAvailabilities(helen.id, "2025-06-03T07:00:00Z", [
    "2025-07-08T07:00:00Z",
    "2025-07-15T07:00:00Z",
    "2025-07-22T07:00:00Z",
    "2025-07-29T07:00:00Z",
    "2025-08-05T07:00:00Z",
    "2025-08-12T07:00:00Z",
    "2025-08-19T07:00:00Z",
    "2025-08-26T07:00:00Z",
  ]);

  await insertAvailabilities(helen.id, "2025-06-04T07:00:00Z", [
    "2025-07-09T07:00:00Z",
    "2025-07-16T07:00:00Z",
    "2025-07-23T07:00:00Z",
    "2025-07-30T07:00:00Z",
    "2025-08-06T07:00:00Z",
    "2025-08-13T07:00:00Z",
    "2025-08-20T07:00:00Z",
    "2025-08-27T07:00:00Z",
  ]);

  await insertAvailabilities(helen.id, "2025-06-05T07:00:00Z", [
    "2025-07-10T07:00:00Z",
    "2025-07-17T07:00:00Z",
    "2025-07-24T07:00:00Z",
    "2025-07-31T07:00:00Z",
    "2025-08-07T07:00:00Z",
    "2025-08-14T07:00:00Z",
    "2025-08-21T07:00:00Z",
    "2025-08-28T07:00:00Z",
  ]);

  await insertAvailabilities(helen.id, "2025-06-06T07:00:00Z", [
    "2025-07-11T07:00:00Z",
    "2025-07-18T07:00:00Z",
    "2025-07-25T07:00:00Z",
    // "2025-08-01T07:00:00Z",
    "2025-08-08T07:00:00Z",
    "2025-08-15T07:00:00Z",
    "2025-08-22T07:00:00Z",
    "2025-08-29T07:00:00Z",
  ]);

  await insertAvailabilities(helen.id, "2025-06-07T07:00:00Z", [
    "2025-07-12T00:00:00Z",
    "2025-07-19T00:00:00Z",
    "2025-07-26T00:00:00Z",
    "2025-08-02T00:00:00Z",
    "2025-08-09T00:00:00Z",
    "2025-08-16T00:00:00Z",
    "2025-08-23T00:00:00Z",
    "2025-08-30T00:00:00Z",
  ]);

  await insertAvailabilities(helen.id, "2025-06-08T07:00:00Z", [
    "2025-08-01T06:00:00Z",
    "2025-08-01T06:30:00Z",
    "2025-08-01T07:00:00Z",
    "2025-08-01T07:30:00Z",
    "2025-08-01T08:00:00Z",
    "2025-08-01T08:30:00Z",
    "2025-08-01T09:00:00Z",
    "2025-08-01T09:30:00Z",
    "2025-08-01T10:00:00Z",
    "2025-08-01T10:30:00Z",
    "2025-08-01T11:00:00Z",
    "2025-08-01T11:30:00Z",
    "2025-08-01T12:00:00Z",
    "2025-08-01T12:30:00Z",
  ]);

  // await insertAvailabilities(helen.id, "2025-02-03T07:00:00Z", [
  //   "2025-02-03T07:00:00Z",
  //   "2025-02-10T07:00:00Z",
  //   "2025-02-17T07:00:00Z",
  //   "2025-02-24T07:00:00Z",
  //   "2025-03-03T07:00:00Z",
  //   "2025-03-10T07:00:00Z",
  //   "2025-03-17T07:00:00Z",
  //   "2025-03-24T07:00:00Z",
  //   "2025-03-31T07:00:00Z",
  // ]);

  // await insertAvailabilities(helen.id, "2025-02-03T07:30:00Z", [
  //   "2025-02-03T07:30:00Z",
  //   "2025-02-10T07:30:00Z",
  //   "2025-02-17T07:30:00Z",
  //   "2025-02-24T07:30:00Z",
  //   "2025-03-03T07:30:00Z",
  //   "2025-03-10T07:30:00Z",
  //   "2025-03-17T07:30:00Z",
  //   "2025-03-24T07:30:00Z",
  //   "2025-03-31T07:30:00Z",
  // ]);

  // await insertAvailabilities(elian.id, "2025-02-03T07:00:00Z", [
  //   "2025-02-03T07:00:00Z",
  //   "2025-02-10T07:00:00Z",
  //   "2025-02-17T07:00:00Z",
  //   "2025-02-24T07:00:00Z",
  //   "2025-03-03T07:00:00Z",
  //   "2025-03-10T07:00:00Z",
  //   "2025-03-17T07:00:00Z",
  //   "2025-03-24T07:00:00Z",
  //   "2025-03-31T07:00:00Z",
  // ]);

  // await insertAvailabilities(elian.id, "2025-02-03T07:30:00Z", [
  //   "2025-02-03T07:30:00Z",
  //   "2025-02-10T07:30:00Z",
  //   "2025-02-17T07:30:00Z",
  //   "2025-02-24T07:30:00Z",
  //   "2025-03-03T07:30:00Z",
  //   "2025-03-10T07:30:00Z",
  //   "2025-03-17T07:30:00Z",
  //   "2025-03-24T07:30:00Z",
  //   "2025-03-31T07:30:00Z",
  // ]);

  // await insertAvailabilities(helen.id, "2024-07-01T07:30:00Z", [
  //   "2024-07-01T07:30:00Z",
  //   "2024-07-08T07:30:00Z",
  //   "2024-07-15T07:30:00Z",
  //   "2024-07-22T07:30:00Z",
  //   "2024-07-27T07:30:00Z",
  //   "2024-07-29T07:30:00Z",
  //   "2024-07-30T07:30:00Z",
  //   "2024-07-31T07:30:00Z",
  //   "2024-08-01T07:30:00Z",
  //   "2024-08-02T07:30:00Z",
  //   "2024-08-03T07:30:00Z",
  //   "2024-08-04T07:30:00Z",
  //   "2024-08-05T07:30:00Z",
  //   "2024-08-06T07:30:00Z",
  //   "2024-08-07T07:30:00Z",
  //   "2024-08-08T07:30:00Z",
  //   "2024-08-09T07:30:00Z",
  //   "2024-08-10T07:30:00Z",
  //   "2024-08-12T07:30:00Z",
  //   "2024-08-13T07:30:00Z",
  //   "2024-08-14T07:30:00Z",
  //   "2024-08-15T07:30:00Z",
  //   "2024-08-16T07:30:00Z",
  //   "2024-08-17T07:30:00Z",
  //   "2024-08-19T07:30:00Z",
  //   "2024-08-20T07:30:00Z",
  //   "2024-08-21T07:30:00Z",
  //   "2024-08-22T07:30:00Z",
  //   "2024-08-23T07:30:00Z",
  // ]);
  // await insertAvailabilities(elian.id, "2024-07-01T08:00:00Z", [
  //   "2024-07-01T08:00:00Z",
  //   "2024-07-08T08:00:00Z",
  //   "2024-07-15T08:00:00Z",
  //   "2024-07-22T08:00:00Z",
  //   "2024-07-29T08:00:00Z",
  //   "2024-08-03T07:30:00Z",
  //   "2024-08-04T07:30:00Z",
  //   "2024-08-05T07:30:00Z",
  //   "2024-08-06T07:30:00Z",
  // ]);
  // await insertAvailabilities(elian.id, "2024-07-02T08:00:00Z", [
  //   "2024-07-02T08:00:00Z",
  //   "2024-07-09T08:00:00Z",
  //   "2024-07-16T08:00:00Z",
  //   "2024-07-23T08:00:00Z",
  //   "2024-07-30T08:00:00Z",
  // ]);
  // await insertAvailabilities(elian.id, "2024-07-02T08:30:00Z", [
  //   "2024-07-02T08:30:00Z",
  //   "2024-07-09T08:30:00Z",
  //   "2024-07-16T08:30:00Z",
  //   "2024-07-23T08:30:00Z",
  //   "2024-08-10T07:30:00Z",
  //   "2024-08-12T07:30:00Z",
  //   "2024-08-13T07:30:00Z",
  //   "2024-08-14T07:30:00Z",
  //   "2024-08-15T07:30:00Z",
  //   "2024-08-16T07:30:00Z",
  //   "2024-08-17T07:30:00Z",
  //   "2024-08-19T07:30:00Z",
  //   "2024-08-20T07:30:00Z",
  //   "2024-08-21T07:30:00Z",
  //   "2024-08-22T07:30:00Z",
  //   "2024-08-23T07:30:00Z",
  // ]);
}

async function insertCustomers() {
  await prisma.customer.createMany({
    data: [
      {
        name: "Alice",
        email: "alice@example.com",
        emailVerified: "2025-03-08T14:31:26.816Z",
        password:
          "$2b$12$GFM.a0hEjl/0/U3IjO057esEr7l.NMKZSeRC7c1he6wzDvoIW4oxy", // AaasoBo!Alice
        prefecture: "青森県 / Aomori",
        hasSeenWelcome: true,
        createdAt: "2024-08-01T00:00:00.000Z",
        updatedAt: "2024-08-10T00:00:00.000Z",
      },
      {
        name: "Bob",
        email: "bob@example.com",
        password:
          "$2b$12$txZ49345mBu/RNVfnKFw9.VahiO1wj4z.6aeKckM50LYkd2Upz3eC", // AaasoBo!Bob
        prefecture: "北海道 / Hokkaido",
        hasSeenWelcome: true,
        emailVerified: "2025-04-11T01:26:02.736Z",
        createdAt: "2024-08-01T00:00:00.000Z",
        updatedAt: "2024-08-10T00:00:00.000Z",
      },
      {
        name: "山田 花",
        email: "hana@example.com",
        password:
          "$2b$12$qbcPqqpR3nKgtCgrusCbQOfMqJJHiMlBSkeClYEeWkKM6Fc6xahD2", // AaasoBo!Hana
        prefecture: "北海道 / Hokkaido",
        hasSeenWelcome: true,
        emailVerified: "2025-04-11T01:26:02.736Z",
        createdAt: "2025-04-01T00:00:00.000Z",
        updatedAt: "2024-08-10T00:00:00.000Z",
      },
    ],
  });
}

async function insertAdmins() {
  await prisma.admins.createMany({
    data: [
      {
        name: "Admin",
        email: "admin@example.com",
        password:
          "$2b$12$47fH6clEdzE2Dd8d7KCeQe2WM2KVeGD25KugHll808LBI6kI.dQqK", // password: AaasoBo!Admin
      },
      {
        name: "Admin2",
        email: "admin2@example.com",
        password:
          "$2b$12$7eMUSK5aFgvlfHJ1Oxk3gOF4bb85id0mEhZgwNW1Y33SYW/5Qr582", // password: AaasoBo!Admin2
      },
    ],
  });
}

async function insertClasses() {
  const alice = await getCustomer("Alice");
  const bob = await getCustomer("Bob");
  const helen = await getInstructor("Helen");
  const elian = await getInstructor("Elian");

  await prisma.class.createMany({
    data: [
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-05T07:00:00Z",
      //   status: "completed",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      //   createdAt: "2024-08-05T07:00:00Z",
      //   updatedAt: "2024-08-05T07:00:00Z",
      //   classCode: "1-0",
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-12T07:00:00Z",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      //   createdAt: "2024-08-05T07:00:00Z",
      //   updatedAt: "2024-08-05T07:00:00Z",
      //   classCode: "1-1",
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-19T07:00:00Z",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      //   createdAt: "2024-08-05T07:00:00Z",
      //   updatedAt: "2024-08-05T07:00:00Z",
      //   classCode: "1-2",
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-26T07:00:00Z",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      //   createdAt: "2024-08-05T07:00:00Z",
      //   updatedAt: "2024-08-05T07:00:00Z",
      //   classCode: "1-3",
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-06T07:00:00Z",
      //   status: "completed",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      //   createdAt: "2024-08-05T07:00:00Z",
      //   updatedAt: "2024-08-05T07:00:00Z",
      //   classCode: "1-4",
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-13T07:00:00Z",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      //   createdAt: "2024-08-05T07:00:00Z",
      //   updatedAt: "2024-08-05T07:00:00Z",
      //   classCode: "1-5",
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-20T07:00:00Z",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      //   createdAt: "2024-08-05T07:00:00Z",
      //   updatedAt: "2024-08-05T07:00:00Z",
      //   classCode: "1-6",
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-27T07:00:00Z",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      //   createdAt: "2024-08-05T07:00:00Z",
      //   updatedAt: "2024-08-05T07:00:00Z",
      //   classCode: "1-7",
      // },
      {
        instructorId: helen.id,
        customerId: alice.id,
        dateTime: "2025-07-15T07:00:00Z",
        status: "booked",
        subscriptionId: alice.subscription[0].id,
        recurringClassId: 1,
        rebookableUntil: "2025-10-30T09:00:00Z",
        createdAt: "2025-05-20T07:00:00Z",
        updatedAt: "2025-05-20T07:00:00Z",
        classCode: "1-0",
        isFreeTrial: false,
      },
      {
        instructorId: helen.id,
        customerId: alice.id,
        dateTime: "2025-07-15T08:00:00Z",
        status: "rebooked",
        subscriptionId: alice.subscription[0].id,
        recurringClassId: 1,
        rebookableUntil: "2025-10-30T09:00:00Z",
        createdAt: "2025-05-20T07:00:00Z",
        updatedAt: "2025-05-20T07:00:00Z",
        classCode: "1-1",
        isFreeTrial: false,
      },
      {
        instructorId: helen.id,
        customerId: alice.id,
        dateTime: "2025-07-15T09:00:00Z",
        status: "canceledByCustomer",
        subscriptionId: alice.subscription[0].id,
        recurringClassId: 1,
        rebookableUntil: "2025-10-30T09:00:00Z",
        createdAt: "2025-05-20T07:00:00Z",
        updatedAt: "2025-05-20T07:00:00Z",
        classCode: "1-2",
        isFreeTrial: false,
      },
      {
        instructorId: helen.id,
        customerId: alice.id,
        dateTime: "2025-07-15T10:00:00Z",
        status: "canceledByInstructor",
        subscriptionId: alice.subscription[0].id,
        recurringClassId: 1,
        rebookableUntil: "2025-10-30T09:00:00Z",
        createdAt: "2025-05-20T07:00:00Z",
        updatedAt: "2025-05-20T07:00:00Z",
        classCode: "1-3",
        isFreeTrial: false,
      },
      {
        instructorId: helen.id,
        customerId: alice.id,
        dateTime: "2025-07-15T06:00:00Z",
        status: "completed",
        subscriptionId: alice.subscription[0].id,
        recurringClassId: 1,
        rebookableUntil: "2025-10-30T09:00:00Z",
        createdAt: "2025-05-20T07:00:00Z",
        updatedAt: "2025-05-20T07:00:00Z",
        classCode: "1-4",
        isFreeTrial: false,
      },
      {
        instructorId: helen.id,
        customerId: alice.id,
        dateTime: "2025-07-15T11:00:00Z",
        status: "rebooked",
        rebookableUntil: "2025-10-30T09:00:00Z",
        createdAt: "2025-05-20T07:00:00Z",
        updatedAt: "2025-05-20T07:00:00Z",
        classCode: "ft-0",
        isFreeTrial: true,
      },
      {
        customerId: alice.id,
        status: "pending",
        rebookableUntil: "2025-10-30T09:00:00Z",
        createdAt: "2025-05-20T07:00:00Z",
        updatedAt: "2025-05-20T07:00:00Z",
        classCode: "ft-0-2",
        isFreeTrial: true,
      },
      // {
      //   instructorId: helen.id,
      //   customerId: bob.id,
      //   dateTime: "2024-06-03T15:30:00+09:00",
      //   status: "completed",
      //   subscriptionId: bob.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: elian.id,
      //   customerId: bob.id,
      //   dateTime: "2024-06-03T16:00:00+09:00",
      //   status: "completed",
      //   subscriptionId: bob.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: elian.id,
      //   customerId: bob.id,
      //   dateTime: "2024-06-29T11:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: bob.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-08T10:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: bob.id,
      //   dateTime: "2024-08-08T10:30:00+09:00",
      //   status: "booked",
      //   subscriptionId: bob.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-08T11:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: bob.id,
      //   dateTime: "2024-08-08T11:30:00+09:00",
      //   status: "booked",
      //   subscriptionId: bob.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-08T12:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: bob.id,
      //   dateTime: "2024-08-08T12:30:00+09:00",
      //   status: "booked",
      //   subscriptionId: bob.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-08T13:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: bob.id,
      //   dateTime: "2024-08-08T13:30:00+09:00",
      //   status: "booked",
      //   subscriptionId: bob.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-08T14:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: bob.id,
      //   dateTime: "2024-08-08T14:30:00+09:00",
      //   status: "booked",
      //   subscriptionId: bob.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-08T15:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-13T11:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-14T11:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-14T12:00:00+09:00",
      //   status: "completed",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-14T13:00:00+09:00",
      //   status: "canceledByInstructor",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-14T14:00:00+09:00",
      //   status: "canceledByCustomer",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-15T11:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-16T11:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-17T11:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-19T11:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-20T11:00:00+09:00",
      //   status: "canceledByCustomer",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-21T11:00:00+09:00",
      //   status: "canceledByInstructor",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-22T11:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
      // {
      //   instructorId: helen.id,
      //   customerId: alice.id,
      //   dateTime: "2024-08-23T11:00:00+09:00",
      //   status: "booked",
      //   subscriptionId: alice.subscription[0].id,
      //   recurringClassId: 1,
      // },
    ],
  });
}

async function insertChildren() {
  const alice = await getCustomer("Alice");
  const bob = await getCustomer("Bob");

  await prisma.children.createMany({
    data: [
      {
        name: "Peppa",
        customerId: alice.id,
        birthdate: new Date("2018-05-15"),
        personalInfo:
          "Age: 6 years, English Level: Beginner. Enjoys playing with friends and loves jumping in muddy puddles.",
      },
      {
        name: "Suzy",
        customerId: alice.id,
        birthdate: new Date("2018-06-20"),
        personalInfo:
          "Age: 6 years, English Level: Beginner. Likes playing with dolls and has a pet sheep named Woolly.",
      },
      {
        name: "Emily",
        customerId: bob.id,
        birthdate: new Date("2017-11-02"),
        personalInfo:
          "Age: 7 years, English Level: Intermediate. Loves drawing and is very creative. Enjoys reading stories.",
      },
    ],
  });
}

async function insertClassAttendance() {
  const customers = await prisma.customer.findMany();
  const classes = await prisma.class.findMany();
  const children = await prisma.children.findMany();

  // if (classes.length < 4 || children.length < 1) {
  //   throw new Error("Not enough classes or children found");
  // }

  await prisma.classAttendance.createMany({
    data: [
      { classId: classes[0].id, childrenId: children[0].id },
      { classId: classes[0].id, childrenId: children[1].id },
      { classId: classes[1].id, childrenId: children[0].id },
      { classId: classes[2].id, childrenId: children[0].id },
      { classId: classes[4].id, childrenId: children[0].id },
      { classId: classes[5].id, childrenId: children[0].id },
      { classId: classes[5].id, childrenId: children[1].id },
    ],
  });

  // if (classes.length < 17 || children.length < 2) {
  //   throw new Error("Not enough classes or children found");
  // }

  // const august8ClassIds = classes.slice(6, 17).map((c) => c.id);

  // if (august8ClassIds.length !== 11) {
  //   throw new Error("August 8th class IDs count mismatch");
  // }

  // const aliceChildren = children.filter(
  //   (child) => child.customerId === customers[0].id,
  // );

  // const attendanceData = august8ClassIds.flatMap((classId) =>
  //   aliceChildren.map((child) => ({
  //     classId,
  //     childrenId: child.id,
  //   })),
  // );

  // await prisma.classAttendance.createMany({
  //   data: attendanceData,
  // });
}

async function insertPlans() {
  await prisma.plan.createMany({
    data: [
      {
        name: "3,180 yen/month",
        description: "2 classes per week",
        weeklyClassTimes: 2,
      },
      {
        name: "7,980 yen/month",
        description: "5 classes per week",
        weeklyClassTimes: 5,
      },
    ],
  });
}

async function insertSubscriptions() {
  const alice = await getCustomer("Alice");
  const bob = await getCustomer("Bob");
  const hana = await getCustomer("山田 花");
  const plan1 = await getPlan("3,180 yen/month");
  const plan2 = await getPlan("7,980 yen/month");

  await prisma.subscription.createMany({
    data: [
      {
        customerId: alice.id,
        planId: plan1.id,
        startAt: new Date("2024-08-01"),
        endAt: null,
      },
      {
        customerId: bob.id,
        planId: plan2.id,
        startAt: new Date("2024-06-01"),
        endAt: null,
      },
      {
        customerId: hana.id,
        planId: plan1.id,
        startAt: new Date("2025-04-04"),
        endAt: null,
      },
    ],
  });
}

async function insertRecurringClasses() {
  const alice = await getCustomer("Alice");
  const bob = await getCustomer("Bob");
  const hana = await getCustomer("山田 花");
  const helen = await getInstructor("Helen");
  const elian = await getInstructor("Elian");

  await prisma.recurringClass.create({
    data: {
      subscriptionId: alice.subscription[0].id,
      instructorId: helen.id,
      startAt: "2025-02-03T07:00:00Z",
      recurringClassAttendance: {
        create: [
          {
            childrenId: alice.children[0].id,
          },
          // {
          //   childrenId: alice.children[1].id,
          // },
        ],
      },
    },
  });

  await prisma.recurringClass.create({
    data: {
      subscriptionId: alice.subscription[0].id,
      instructorId: helen.id,
      startAt: "2025-02-04T07:00:00Z",
      recurringClassAttendance: {
        create: [
          {
            childrenId: alice.children[0].id,
          },
        ],
      },
    },
  });

  await prisma.recurringClass.create({
    data: {
      subscriptionId: bob.subscription[0].id,
      instructorId: helen.id,
      startAt: "2025-02-05T07:00:00Z",
      recurringClassAttendance: {
        create: [
          {
            childrenId: bob.children[0].id,
          },
        ],
      },
    },
  });

  await prisma.recurringClass.create({
    data: {
      subscriptionId: hana.subscription[0].id,
      instructorId: helen.id,
      startAt: "2025-04-03T07:00:00Z",
    },
  });

  // await prisma.recurringClass.create({
  //   data: {
  //     subscriptionId: alice.subscription[0].id,
  //     instructorId: elian.id,
  //     startAt: "2024-07-03T02:00:00Z",
  //     endAt: "2024-08-01T00:00:00Z",
  //     recurringClassAttendance: {
  //       create: [
  //         {
  //           childrenId: alice.children[0].id,
  //         },
  //       ],
  //     },
  //   },
  // });
  // await prisma.recurringClass.create({
  //   data: {
  //     subscriptionId: alice.subscription[0].id,
  //     instructorId: elian.id,
  //     startAt: "2024-07-18T03:00:00Z",
  //     endAt: "2024-09-01T00:00:00Z",
  //     recurringClassAttendance: {
  //       create: [
  //         {
  //           childrenId: alice.children[0].id,
  //         },
  //         {
  //           childrenId: alice.children[1].id,
  //         },
  //       ],
  //     },
  //   },
  // });
  // await prisma.recurringClass.create({
  //   data: {
  //     subscriptionId: alice.subscription[0].id,
  //     instructorId: elian.id,
  //     startAt: "2024-08-23T01:00:00Z",
  //     endAt: "2024-10-01T00:00:00Z",
  //     recurringClassAttendance: {
  //       create: [
  //         {
  //           childrenId: alice.children[0].id,
  //         },
  //         {
  //           childrenId: alice.children[1].id,
  //         },
  //       ],
  //     },
  //   },
  // });
  // await prisma.recurringClass.create({
  //   data: {
  //     subscriptionId: alice.subscription[0].id,
  //     instructorId: elian.id,
  //     startAt: "2024-09-02T04:00:00Z",
  //     recurringClassAttendance: {
  //       create: [
  //         {
  //           childrenId: alice.children[0].id,
  //         },
  //       ],
  //     },
  //   },
  // });
}

async function insertInstructorSchedules() {
  const helen = await getInstructor("Helen");
  const elian = await getInstructor("Elian");

  // Helen's current schedule (effective from 2024-08-01)
  const helenSchedule = await prisma.instructorSchedule.create({
    data: {
      instructorId: helen.id,
      effectiveFrom: new Date("2024-08-01T00:00:00Z"),
      effectiveTo: null, // Current schedule
    },
  });

  // Helen's weekly slots
  await prisma.instructorSlot.createMany({
    data: [
      // Monday (1)
      {
        scheduleId: helenSchedule.id,
        weekday: 1,
        startTime: new Date("1970-01-01T07:00:00Z"),
      },
      {
        scheduleId: helenSchedule.id,
        weekday: 1,
        startTime: new Date("1970-01-01T07:30:00Z"),
      },
      {
        scheduleId: helenSchedule.id,
        weekday: 1,
        startTime: new Date("1970-01-01T08:00:00Z"),
      },
      // Tuesday (2)
      {
        scheduleId: helenSchedule.id,
        weekday: 2,
        startTime: new Date("1970-01-01T07:00:00Z"),
      },
      {
        scheduleId: helenSchedule.id,
        weekday: 2,
        startTime: new Date("1970-01-01T07:30:00Z"),
      },
      // Wednesday (3)
      {
        scheduleId: helenSchedule.id,
        weekday: 3,
        startTime: new Date("1970-01-01T07:00:00Z"),
      },
      {
        scheduleId: helenSchedule.id,
        weekday: 3,
        startTime: new Date("1970-01-01T07:30:00Z"),
      },
      {
        scheduleId: helenSchedule.id,
        weekday: 3,
        startTime: new Date("1970-01-01T08:00:00Z"),
      },
      // Thursday (4)
      {
        scheduleId: helenSchedule.id,
        weekday: 4,
        startTime: new Date("1970-01-01T07:00:00Z"),
      },
      {
        scheduleId: helenSchedule.id,
        weekday: 4,
        startTime: new Date("1970-01-01T07:30:00Z"),
      },
      // Friday (5)
      {
        scheduleId: helenSchedule.id,
        weekday: 5,
        startTime: new Date("1970-01-01T07:00:00Z"),
      },
      {
        scheduleId: helenSchedule.id,
        weekday: 5,
        startTime: new Date("1970-01-01T07:30:00Z"),
      },
    ],
  });

  // Elian's current schedule
  const elianSchedule = await prisma.instructorSchedule.create({
    data: {
      instructorId: elian.id,
      effectiveFrom: new Date("2024-08-01T00:00:00Z"),
      effectiveTo: null,
    },
  });

  // Elian's weekly slots
  await prisma.instructorSlot.createMany({
    data: [
      // Monday (1)
      {
        scheduleId: elianSchedule.id,
        weekday: 1,
        startTime: new Date("1970-01-01T07:00:00Z"),
      },
      {
        scheduleId: elianSchedule.id,
        weekday: 1,
        startTime: new Date("1970-01-01T07:30:00Z"),
      },
      // Tuesday (2)
      {
        scheduleId: elianSchedule.id,
        weekday: 2,
        startTime: new Date("1970-01-01T07:00:00Z"),
      },
      // Wednesday (3)
      {
        scheduleId: elianSchedule.id,
        weekday: 3,
        startTime: new Date("1970-01-01T07:00:00Z"),
      },
    ],
  });
}

async function insertInstructorUnavailabilities() {
  const helen = await getInstructor("Helen");
  const elian = await getInstructor("Elian");

  await prisma.instructorUnavailability.createMany({
    data: [
      {
        instructorId: helen.id,
        dateTime: new Date("2025-03-17T07:00:00Z"),
      },
      {
        instructorId: helen.id,
        dateTime: new Date("2025-03-17T07:30:00Z"),
      },
      // Helen is unavailable on Saturday, May 31.
      {
        instructorId: helen.id,
        dateTime: new Date("2025-05-31T09:00:00Z"),
      },
      {
        instructorId: helen.id,
        dateTime: new Date("2025-05-31T09:30:00Z"),
      },
      {
        instructorId: helen.id,
        dateTime: new Date("2025-05-31T10:00:00Z"),
      },
      {
        instructorId: helen.id,
        dateTime: new Date("2025-05-31T10:30:00Z"),
      },
      {
        instructorId: helen.id,
        dateTime: new Date("2025-05-31T11:00:00Z"),
      },
      {
        instructorId: helen.id,
        dateTime: new Date("2025-05-31T11:30:00Z"),
      },
    ],
  });
}

async function insertEvents() {
  await prisma.event.createMany({
    data: [
      {
        name: "Regular Class Day",
        color: "#FFFFFF",
      },
      {
        name: "AaasoBo! Holiday", // お休み
        color: "#FAD7CD",
      },
      {
        name: "AaasoBo! Substitute Holiday", // お休み振替対象日
        color: "#FF0000",
      },
      {
        name: "Theme Class Week", // テーマクラスウィーク
        color: "#FFFF00",
      },
    ],
  });
}

async function insertSchedules() {
  await prisma.schedule.createMany({
    data: [
      {
        date: new Date("2025-01-01T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-01-02T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-01-03T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-01-04T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-01-05T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-01-12T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-01-13T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-01-14T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-01-15T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-01-16T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-01-17T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-01-18T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-01-19T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-01-26T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-02-02T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-02-09T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-02-10T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-02-11T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-02-12T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-02-13T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-02-14T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-02-15T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-02-16T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-02-23T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-03-02T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-03-09T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-03-10T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-03-11T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-03-12T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-03-13T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-03-14T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-03-15T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-03-16T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-03-23T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-03-30T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-03-31T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-04-01T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-04-02T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-04-06T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-04-13T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-04-14T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-04-15T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-04-16T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-04-17T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-04-18T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-04-19T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-04-20T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-04-27T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-04-29T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-04-30T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-05-01T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-05-02T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-05-03T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-05-04T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-05-05T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-05-06T00:00:00Z"),
        eventId: 3,
      },
      {
        date: new Date("2025-05-11T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-05-12T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-05-13T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-05-14T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-05-15T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-05-16T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-05-17T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-05-18T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-05-25T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-06-01T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-06-08T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-06-15T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-06-16T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-06-17T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-06-18T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-06-19T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-06-20T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-06-21T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-06-22T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-06-29T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-07-06T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-07-13T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-07-14T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-07-15T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-07-16T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-07-17T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-07-18T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-07-19T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-07-20T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-07-27T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-08-03T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-08-04T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-08-05T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-08-06T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-08-07T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-08-08T00:00:00Z"),
        eventId: 4,
      },

      {
        date: new Date("2025-08-09T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-08-10T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-08-11T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-08-12T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-08-13T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-08-14T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-08-15T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-08-16T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-08-17T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-08-24T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-08-31T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-09-07T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-09-14T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-09-15T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-09-16T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-09-17T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-09-18T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-09-19T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-09-20T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-09-21T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-09-28T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-10-05T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-10-12T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-10-19T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-10-20T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-10-21T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-10-22T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-10-23T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-10-24T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-10-25T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-10-26T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-10-30T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-10-31T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-11-01T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-11-02T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-11-09T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-11-16T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-11-17T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-11-18T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-11-19T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-11-20T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-11-21T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-11-22T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-11-23T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-11-30T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-12-07T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-12-14T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-12-17T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-12-18T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-12-19T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-12-20T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-12-21T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-12-22T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-12-23T00:00:00Z"),
        eventId: 4,
      },
      {
        date: new Date("2025-12-24T00:00:00Z"),
        eventId: 3,
      },
      {
        date: new Date("2025-12-25T00:00:00Z"),
        eventId: 3,
      },
      {
        date: new Date("2025-12-28T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-12-29T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-12-30T00:00:00Z"),
        eventId: 2,
      },
      {
        date: new Date("2025-12-31T00:00:00Z"),
        eventId: 2,
      },
    ],
  });
}

async function getCustomer(name: "Alice" | "Bob" | "山田 花") {
  const customer = await prisma.customer.findFirst({
    where: { name },
    include: { children: true, subscription: true },
  });
  if (!customer) {
    throw new Error(`Customer ${name} not found`);
  }
  // Include only active subscriptions.
  customer.subscription = customer.subscription.filter(
    ({ endAt }) => endAt === null,
  );
  return customer;
}

async function getInstructor(nickname: "Helen" | "Elian") {
  const customer = await prisma.instructor.findFirst({ where: { nickname } });
  if (!customer) {
    throw new Error(`Customer ${nickname} not found`);
  }
  return customer;
}

async function getPlan(name: "3,180 yen/month" | "7,980 yen/month") {
  const plan = await prisma.plan.findFirst({ where: { name } });
  if (!plan) {
    throw new Error(`Plan ${name} not found`);
  }
  return plan;
}

async function deleteAll(table: Uncapitalize<Prisma.ModelName>) {
  // @ts-ignore
  await prisma[table].deleteMany({});
}

async function main() {
  {
    // Dependent on the below
    await deleteAll("classAttendance");
    await deleteAll("recurringClassAttendance");

    // Dependent on the below
    await deleteAll("class");
    await deleteAll("recurringClass");
    await deleteAll("instructorAvailability");
    await deleteAll("instructorSlot");

    // Dependent on the below
    await deleteAll("children");
    await deleteAll("subscription");
    await deleteAll("instructorRecurringAvailability");
    await deleteAll("instructorSchedule");
    await deleteAll("schedule");
    await deleteAll("instructorUnavailability");

    // Independent
    await deleteAll("admins");
    await deleteAll("instructor");
    await deleteAll("customer");
    await deleteAll("plan");
    await deleteAll("event");
  }

  {
    // Independent
    await insertPlans();
    await insertCustomers();
    await insertInstructors();
    await insertAdmins();
    await insertEvents();

    // Dependant on the above
    await insertInstructorAvailabilities();
    await insertInstructorSchedules();
    await insertSubscriptions();
    await insertChildren();
    await insertSchedules();

    // Dependant on the above
    await insertRecurringClasses();
    await insertClasses();

    // Dependant on the above
    await insertInstructorUnavailabilities();

    // Dependant on the above
    await insertClassAttendance();
  }
}

main();
