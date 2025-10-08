const { faker } = require("@faker-js/faker");
import { hashPasswordSync } from "../helper/commonUtils";
import { prisma } from "./setup";
import { SignJWT } from "jose";

/**
 * Generate a test admin
 */
export function generateTestAdmin() {
  return {
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
    name: faker.person.fullName(),
  };
}

/**
 * Generate a test customer
 */
export function generateTestCustomer(): {
  email: string;
  password: string;
  name: string;
  prefecture: string;
  emailVerified: Date | null;
} {
  return {
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
    name: faker.person.fullName(),
    prefecture: faker.location.state({ abbreviated: false }),
    emailVerified: new Date(),
  };
}

/**
 * Generate a test instructor
 */
export function generateTestInstructor() {
  const birthdate = faker.date.past({ years: 30 });
  return {
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
    name: faker.person.fullName(),
    classURL: faker.internet.url(),
    icon: faker.image.avatar(),
    nickname: faker.person.firstName(),
    birthdate: birthdate.toISOString().split("T")[0], // YYYY-MM-DD format for API
    lifeHistory: faker.lorem.paragraph(),
    favoriteFood: faker.food.dish(),
    hobby: faker.lorem.sentence(),
    messageForChildren: faker.lorem.sentence(),
    workingTime: faker.lorem.words(3),
    skill: faker.lorem.sentence(),
    meetingId: faker.string.numeric(11),
    passcode: faker.string.alphanumeric(8),
    introductionURL: faker.internet.url(),
  };
}

/**
 * Create an admin in the database
 */
export async function createAdmin(data = generateTestAdmin()) {
  return await prisma.admins.create({
    data: {
      ...data,
      password: hashPasswordSync(data.password),
    },
  });
}

/**
 * Create a customer in the database
 */
export async function createCustomer(data = generateTestCustomer()) {
  return await prisma.customer.create({
    data: {
      ...data,
      password: hashPasswordSync(data.password),
    },
  });
}

/**
 * Create an instructor in the database
 */
export async function createInstructor(data = generateTestInstructor()) {
  return await prisma.instructor.create({
    data: {
      ...data,
      birthdate: new Date(data.birthdate),
      password: hashPasswordSync(data.password),
    },
  });
}

/**
 * Generate a test plan
 */
export function generateTestPlan() {
  return {
    name: faker.commerce.productName(),
    weeklyClassTimes: faker.number.int({ min: 1, max: 5 }),
    description: faker.lorem.sentence(),
  };
}

/**
 * Create a plan in the database
 */
export async function createPlan(data = generateTestPlan()) {
  return await prisma.plan.create({ data });
}

/**
 * Generate a test child
 */
export function generateTestChild(customerId: number) {
  return {
    customerId,
    name: faker.person.fullName(),
    birthdate: faker.date.past({ years: 10 }),
    personalInfo: faker.lorem.sentence(),
  };
}

/**
 * Create a child in the database
 */
export async function createChild(
  customerId: number,
  data?: Partial<ReturnType<typeof generateTestChild>>,
) {
  return await prisma.children.create({
    data: {
      ...generateTestChild(customerId),
      ...data,
    },
  });
}

/**
 * Generate a test event
 */
export function generateTestEvent() {
  return {
    name: `イベント / Event${faker.number.int({ min: 1000, max: 9999 })}`,
    color: faker.color.rgb(),
  };
}

/**
 * Create an event in the database
 */
export async function createEvent(data = generateTestEvent()) {
  return await prisma.event.create({ data });
}

/**
 * Generate a test subscription
 */
function generateTestSubscription(planId: number, customerId: number) {
  const startAt = faker.date.past();
  return {
    planId,
    customerId,
    startAt,
    endAt: faker.date.future({ refDate: startAt }),
  };
}

/**
 * Create a subscription in the database
 */
export async function createSubscription(
  planId: number,
  customerId: number,
  data?: Partial<ReturnType<typeof generateTestSubscription>>,
) {
  return await prisma.subscription.create({
    data: {
      ...generateTestSubscription(planId, customerId),
      ...data,
    },
  });
}

/**
 * Generate a test schedule
 */
function generateTestSchedule(eventId: number, date?: Date) {
  return {
    eventId,
    date: date || faker.date.future(),
  };
}

/**
 * Create a schedule in the database
 */
export async function createSchedule(eventId: number, date?: Date) {
  return await prisma.schedule.create({
    data: generateTestSchedule(eventId, date),
  });
}

/**
 * Generate a test class
 */
function generateTestClass(
  customerId: number,
  instructorId?: number,
  dateTime?: Date,
) {
  return {
    customerId,
    instructorId: instructorId || null,
    dateTime: dateTime || null,
    status: instructorId ? "booked" : "pending",
    classCode: faker.string.alphanumeric(8).toUpperCase(),
    isFreeTrial: false,
    updatedAt: new Date(),
  };
}

/**
 * Create a class in the database
 */
export async function createClass(
  customerId: number,
  instructorId?: number,
  dateTime?: Date,
) {
  return await prisma.class.create({
    data: generateTestClass(customerId, instructorId, dateTime),
  });
}

/**
 * Create a password reset token in the database
 */
export async function createPasswordResetToken(
  email: string,
  expiresInHours: number = 1,
) {
  return await prisma.passwordResetToken.create({
    data: {
      email,
      token: faker.string.alphanumeric(32),
      expires: new Date(Date.now() + expiresInHours * 60 * 60 * 1000),
    },
  });
}

/**
 * Create a verification token in the database
 */
export async function createVerificationToken(
  email: string,
  expiresInHours: number = 1,
) {
  return await prisma.verificationToken.create({
    data: {
      email,
      token: faker.string.alphanumeric(32),
      expires: new Date(Date.now() + expiresInHours * 60 * 60 * 1000),
    },
  });
}

/**
 * Create a class attendance record in the database
 */
export async function createClassAttendance(classId: number, childId: number) {
  return await prisma.classAttendance.create({
    data: {
      classId,
      childrenId: childId,
    },
  });
}

/**
 * Generate a JWT token for testing authenticated endpoints
 */
async function generateAuthToken(
  userId: number,
  userType: "admin" | "customer" | "instructor",
): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set");
  }

  const token = await new SignJWT({
    id: userId.toString(),
    userType,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(secret));

  return token;
}

/**
 * Generate cookie header for authenticated requests
 */
export async function generateAuthCookie(
  userId: number,
  userType: "admin" | "customer" | "instructor",
): Promise<string> {
  const salt = process.env.AUTH_SALT || "authjs.session-token";
  const token = await generateAuthToken(userId, userType);
  return `${salt}=${token}`;
}
