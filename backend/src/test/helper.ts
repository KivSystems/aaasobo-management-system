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
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    admins: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    passwordResetToken: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
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
      findFirst: vi.fn(),
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
      findUnique: vi.fn(),
      create: vi.fn(),
      createManyAndReturn: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    classAttendance: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    schedule: {
      findMany: vi.fn(),
    },
    event: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    plan: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    verificationToken: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    recurringClass: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    recurringClassAttendance: {
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    children: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
    $executeRaw: vi.fn(),
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
  determinationAt: null,
});

export const createTestChild = () => ({
  id: 1,
  name: "Test Child",
  birthdate: "2016-03-15",
  personalInfo: "Loves art",
  customerId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
});

/**
 * Convert JST datetime to UTC
 * @returns UTC ISO string
 */
export function jst(strings: TemplateStringsArray, ...values: any[]): string {
  const input = strings[0] + (values[0] || "");

  // Match date only: YYYY-MM-DD
  const dateOnlyMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    // Create JST date at 00:00 and convert to UTC
    const jstDate = new Date(`${year}-${month}-${day}T00:00:00+09:00`);
    return jstDate.toISOString();
  }

  // Match datetime: YYYY-MM-DD HH:MM
  const dateTimeMatch = input.match(
    /^(\d{4})-(\d{2})-(\d{2})[ ](\d{1,2}):(\d{2})$/,
  );
  if (dateTimeMatch) {
    const [, year, month, day, hours, minutes] = dateTimeMatch;
    // Create a Date object in JST and convert to UTC
    const jstDate = new Date(
      `${year}-${month}-${day}T${hours.padStart(2, "0")}:${minutes}:00+09:00`,
    );
    return jstDate.toISOString();
  }

  throw new Error(
    `Invalid JST format: "${input}". Use "YYYY-MM-DD" or "YYYY-MM-DD HH:MM" format.`,
  );
}
