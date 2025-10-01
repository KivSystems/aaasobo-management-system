import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma, createMockResend } from "./helper";
import request from "supertest";
import { server } from "../server";

vi.mock("../../prisma/prismaClient", () => ({
  prisma: createMockPrisma(),
}));

vi.mock("../helper/resendClient", () => ({
  resend: createMockResend(),
}));

// Mock password hashing (external dependency)
vi.mock("../helper/commonUtils", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashedPassword123"),
  FREE_TRIAL_BOOKING_HOURS: 72,
  REGULAR_REBOOKING_HOURS: 3,
  MONTHS_TO_DELETE_CLASSES: 6,
}));

import { prisma } from "../../prisma/prismaClient";
import { resend } from "../helper/resendClient";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;
const mockResend = resend as unknown as ReturnType<typeof createMockResend>;

describe("Customers Router - Validation Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup resend mock to return success for email operations
    mockResend.emails.send.mockResolvedValue({
      data: {
        id: "test-email-id",
        from: "test@example.com",
        to: ["user@example.com"],
        created_at: new Date().toISOString(),
      },
    });
  });

  describe("POST /customers/register", () => {
    it("should register customer successfully with valid data", async () => {
      const validRequestBody = {
        customerData: {
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          prefecture: "Tokyo",
        },
        childData: {
          name: "Jane Doe",
          birthdate: "2015-01-01",
          personalInfo: "Some personal info",
        },
      };

      // Mock: customer doesn't exist (email check passes)
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      // Mock: successful customer creation
      mockPrisma.customer.create.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        password: "hashedPassword",
        prefecture: "Tokyo",
        emailVerified: null,
        hasSeenWelcome: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock: successful child creation
      mockPrisma.children.create.mockResolvedValue({
        id: 1,
        name: "Jane Doe",
        birthdate: new Date("2015-01-01"),
        personalInfo: "Some personal info",
        customerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock: no existing verification token
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);

      // Mock: successful verification token creation
      mockPrisma.verificationToken.create.mockResolvedValue({
        id: "token-id",
        email: "john@example.com",
        token: "verification-token-123",
        expires: new Date(Date.now() + 3600000),
      });

      // Mock: successful free trial class creation
      mockPrisma.class.create.mockResolvedValue({
        id: 1,
        customerId: 1,
        status: "pending",
        isFreeTrial: true,
        classCode: "ft-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        instructorId: null,
        recurringClassId: null,
        dateTime: null,
        subscriptionId: null,
        rebookableUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      });

      const response = await request(server)
        .post("/customers/register")
        .send(validRequestBody);

      expect(response.status).toBe(201);
    });

    it("should return 400 for missing customerData fields", async () => {
      const invalidRequestBody = {
        customerData: {
          name: "John Doe",
          // Missing email, password, prefecture
        },
        childData: {
          name: "Jane Doe",
          birthdate: "2015-01-01",
          personalInfo: "Some personal info",
        },
      };

      const response = await request(server)
        .post("/customers/register")
        .send(invalidRequestBody);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });

    it("should return 400 for missing childData fields", async () => {
      const invalidRequestBody = {
        customerData: {
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          prefecture: "Tokyo",
        },
        childData: {
          name: "Jane Doe",
          // Missing birthdate, personalInfo
        },
      };

      const response = await request(server)
        .post("/customers/register")
        .send(invalidRequestBody);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });

    it("should return 400 for invalid email format", async () => {
      const invalidRequestBody = {
        customerData: {
          name: "John Doe",
          email: "invalid-email",
          password: "password123",
          prefecture: "Tokyo",
        },
        childData: {
          name: "Jane Doe",
          birthdate: "2015-01-01",
          personalInfo: "Some personal info",
        },
      };

      const response = await request(server)
        .post("/customers/register")
        .send(invalidRequestBody);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });
  });

  describe("POST /customers/check-email-conflicts", () => {
    it("should return 200 for available email", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      const response = await request(server)
        .post("/customers/check-email-conflicts")
        .send({ email: "available@example.com" });

      expect(response.status).toBe(200);
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(server)
        .post("/customers/check-email-conflicts")
        .send({ email: "invalid-email" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });

    it("should return 400 for missing email field", async () => {
      const response = await request(server)
        .post("/customers/check-email-conflicts")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });
  });

  describe("PATCH /customers/verify-email", () => {
    it("should verify email successfully with valid token", async () => {
      const mockToken = {
        email: "test@example.com",
        expires: new Date(Date.now() + 3600000), // 1 hour from now
      };

      const mockCustomer = {
        id: 1,
        email: "test@example.com",
        emailVerified: null,
      };

      mockPrisma.verificationToken.findUnique.mockResolvedValue(mockToken);
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.customer.update.mockResolvedValue({
        ...mockCustomer,
        emailVerified: new Date(),
      });

      const response = await request(server)
        .patch("/customers/verify-email")
        .send({ token: "valid-token-123" });

      expect(response.status).toBe(200);
    });

    it("should return 400 for missing token", async () => {
      const response = await request(server)
        .patch("/customers/verify-email")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });
  });

  describe("GET /customers/:id/subscriptions", () => {
    it("should return subscriptions for valid customer ID", async () => {
      const mockSubscriptions = [
        {
          id: 1,
          planId: 1,
          customerId: 1,
          startAt: new Date(),
          endAt: null,
          plan: {
            id: 1,
            name: "Basic Plan",
            weeklyClassTimes: 2,
            description: "Basic English conversation plan",
            createdAt: new Date(),
            updatedAt: new Date(),
            terminationAt: null,
          },
        },
      ];

      mockPrisma.subscription.findMany.mockResolvedValue(mockSubscriptions);

      const response = await request(server).get(
        "/customers/123/subscriptions",
      );

      expect(response.status).toBe(200);
    });

    it("should return 400 for invalid customer ID", async () => {
      const response = await request(server).get(
        "/customers/invalid/subscriptions",
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Invalid parameters");
    });
  });

  describe("GET /customers/:id/customer", () => {
    it("should return customer profile for valid customer ID", async () => {
      const mockCustomer = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        prefecture: "Tokyo",
        emailVerified: new Date().toISOString(),
        hasSeenWelcome: false,
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);

      const response = await request(server).get("/customers/123/customer");

      expect(response.status).toBe(200);
    });

    it("should return 400 for invalid customer ID parameter", async () => {
      const response = await request(server).get("/customers/abc/customer");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Invalid parameters");
    });
  });

  describe("PATCH /customers/:id", () => {
    it("should update customer profile successfully", async () => {
      const mockCustomer = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        prefecture: "Tokyo",
      };

      const updateData = {
        name: "John Smith",
        email: "johnsmith@example.com",
        prefecture: "Osaka",
      };

      mockPrisma.customer.findUnique.mockResolvedValueOnce(mockCustomer);
      mockPrisma.customer.findUnique.mockResolvedValueOnce(null); // No existing customer with new email
      mockPrisma.verificationToken.create.mockResolvedValue({
        id: "token-id",
        email: "johnsmith@example.com",
        token: "verification-token",
        expires: new Date(Date.now() + 3600000),
      });
      mockPrisma.customer.update.mockResolvedValue({
        ...mockCustomer,
        ...updateData,
        emailVerified: null,
      });

      const response = await request(server)
        .patch("/customers/1")
        .send(updateData);

      expect(response.status).toBe(200);
    });

    it("should return 400 for invalid email format", async () => {
      const updateData = {
        name: "John Smith",
        email: "invalid-email",
        prefecture: "Osaka",
      };

      const response = await request(server)
        .patch("/customers/1")
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });

    it("should return 400 for missing required fields", async () => {
      const updateData = {
        name: "John Smith",
        // Missing email and prefecture
      };

      const response = await request(server)
        .patch("/customers/1")
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });
  });

  describe("POST /customers/:id/subscription", () => {
    it("should create subscription with valid data", async () => {
      const mockPlan = { id: 1, weeklyClassTimes: 2 };
      const mockSubscription = {
        id: 1,
        planId: 1,
        customerId: 1,
        startAt: new Date("2024-01-01T00:00:00Z").toISOString(),
      };

      mockPrisma.plan.findUnique.mockResolvedValue(mockPlan);
      mockPrisma.subscription.create.mockResolvedValue(mockSubscription);
      mockPrisma.recurringClass.create.mockResolvedValue({ id: 1 });

      const subscriptionData = {
        planId: 1,
        startAt: "2024-01-01T00:00:00Z",
      };

      const response = await request(server)
        .post("/customers/1/subscription")
        .send(subscriptionData);

      expect(response.status).toBe(200);
    });

    it("should return 400 for invalid planId type", async () => {
      const subscriptionData = {
        planId: "invalid",
        startAt: "2024-01-01T00:00:00Z",
      };

      const response = await request(server)
        .post("/customers/1/subscription")
        .send(subscriptionData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(server)
        .post("/customers/1/subscription")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });
  });

  describe("GET /customers/:id/rebookable-classes", () => {
    it("should return rebookable classes for valid customer ID", async () => {
      const regularClasses = [
        {
          id: 1,
          rebookableUntil: new Date(Date.now() + 86400000),
          classCode: "CLASS001",
          isFreeTrial: false,
        },
      ];

      const freeTrialClasses = [
        {
          id: 2,
          rebookableUntil: new Date(Date.now() + 172800000),
          classCode: "TRIAL001",
          isFreeTrial: true,
        },
      ];

      // Mock the two separate findMany calls made by getRebookableClasses
      mockPrisma.class.findMany
        .mockResolvedValueOnce(regularClasses) // First call for regular classes
        .mockResolvedValueOnce(freeTrialClasses); // Second call for free trial classes

      const response = await request(server).get(
        "/customers/123/rebookable-classes",
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe("GET /customers/:id/upcoming-classes", () => {
    it("should return upcoming classes for valid customer ID", async () => {
      const mockClasses = [
        {
          id: 1,
          dateTime: new Date(Date.now() + 86400000),
          instructor: { nickname: "Sarah", icon: "sarah.jpg" },
          classAttendance: [{ children: { name: "Jane Doe" } }],
        },
      ];

      mockPrisma.class.findMany.mockResolvedValue(mockClasses);

      const response = await request(server).get(
        "/customers/123/upcoming-classes",
      );

      expect(response.status).toBe(200);
    });
  });

  describe("GET /customers/:id/classes", () => {
    it("should return customer classes for valid customer ID", async () => {
      const mockClasses = [
        {
          id: 1,
          dateTime: new Date(),
          status: "completed",
          isFreeTrial: false,
          classCode: "CLASS001",
          rebookableUntil: new Date(),
          updatedAt: new Date(),
          instructor: {
            name: "Sarah Johnson",
            nickname: "Sarah",
            icon: "sarah.jpg",
            classURL: "https://zoom.us/j/123",
            meetingId: "123 456 789",
            passcode: "abc123",
          },
          classAttendance: [{ children: { name: "Jane Doe" } }],
        },
      ];

      mockPrisma.class.findMany.mockResolvedValue(mockClasses);

      const response = await request(server).get("/customers/123/classes");

      expect(response.status).toBe(200);
    });
  });

  describe("GET /customers/:id/child-profiles", () => {
    it("should return child profiles for valid customer ID", async () => {
      const mockChildren = [
        {
          id: 1,
          name: "Jane Doe",
          birthdate: new Date("2015-01-01"),
          personalInfo: "Loves art and music",
        },
        {
          id: 2,
          name: "John Doe Jr",
          birthdate: new Date("2017-03-15"),
          personalInfo: "Enjoys sports",
        },
      ];

      mockPrisma.children.findMany.mockResolvedValue(mockChildren);

      const response = await request(server).get(
        "/customers/123/child-profiles",
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe("PATCH /customers/:id/seen-welcome", () => {
    it("should mark welcome as seen successfully", async () => {
      mockPrisma.customer.update.mockResolvedValue({
        id: 1,
        hasSeenWelcome: true,
      });

      const response = await request(server).patch(
        "/customers/123/seen-welcome",
      );

      expect(response.status).toBe(200);
    });
  });

  describe("PATCH /customers/:id/free-trial/decline", () => {
    it("should decline free trial with valid data", async () => {
      mockPrisma.class.updateMany.mockResolvedValue({ count: 1 });

      const response = await request(server)
        .patch("/customers/1/free-trial/decline")
        .send({ classCode: "TRIAL123" });

      expect(response.status).toBe(200);
    });

    it("should return 400 for missing classCode", async () => {
      const response = await request(server)
        .patch("/customers/1/free-trial/decline")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });
  });
});
