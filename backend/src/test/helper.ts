import { vi } from "vitest";

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
