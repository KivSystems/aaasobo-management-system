import { Express } from "express";
import { vi } from "vitest";
import { hashPasswordSync } from "../helper/commonUtils";
import request from "supertest";

export const createMockPrisma = () => {
  const mock = {
    instructor: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    customer: {
      findUnique: vi.fn(),
    },
    admins: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    passwordResetToken: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    instructorRecurringAvailability: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    instructorAvailability: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    instructorUnavailability: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    instructorSchedule: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    instructorSlot: {
      findMany: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    instructorAbsence: {
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    class: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    schedule: {
      findMany: vi.fn(),
    },
    event: {
      findMany: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
    },
    plan: {
      findFirst: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
  };

  mock.$transaction = vi.fn((callback) => callback(mock));
  return mock;
};

export const createMockResend = () => {
  return {
    emails: {
      send: vi.fn(),
    },
  };
};

// Mock factories for test entities
export const createTestAdmin = () => ({
  id: 1,
  email: "admin@example.com",
  password: "admin_password123",
  name: "Test Admin",
});

export const createTestCustomer = () => ({
  id: 1,
  name: "Test Customer",
  email: "customer@example.com",
  password: "customer_password123",
  emailVerified: new Date(),
  prefecture: "Tokyo",
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createTestInstructor = () => ({
  id: 1,
  name: "Test Instructor",
  email: "instructor@example.com",
  password: "instructor_password123",
  classURL: "https://example.com/class/test-instructor",
  icon: "test-icon.jpg",
  nickname: "Test Nickname",
  meetingId: "123 456 7890",
  passcode: "passcode123",
  introductionURL: "https://example.com/intro/test-instructor",
  createdAt: new Date(),
  updatedAt: new Date(),
  inactiveAt: null,
});

export const loginAsAdmin = async (
  server: Express,
  mockPrisma: ReturnType<typeof createMockPrisma>,
  admin = createTestAdmin(),
) => {
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
