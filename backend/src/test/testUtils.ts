const { faker } = require("@faker-js/faker");
import { hashPasswordSync } from "../helper/commonUtils";
import { prisma } from "./setup";

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
  return {
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
    name: faker.person.fullName(),
    classURL: faker.internet.url(),
    icon: faker.image.avatar(),
    nickname: faker.person.firstName(),
    birthdate: faker.date.past({ years: 30 }),
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
      password: hashPasswordSync(data.password),
    },
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
