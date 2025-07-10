import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import { server } from "../server";
import { saltRounds } from "../helper/commonUtils";

const mockResend = vi.hoisted(() => {
  return {
    emails: {
      send: vi.fn(),
    },
  };
});

vi.mock("resend", () => ({
  Resend: vi.fn(() => mockResend),
}));

const mockPrisma = vi.hoisted(() => {
  return {
    instructor: {
      findUnique: vi.fn(),
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
    },
  };
});

vi.mock("../../prisma/prismaClient", () => ({
  prisma: mockPrisma,
}));

describe("Admin Login", () => {
  it("should successfully log in with valid credentials", async () => {
    mockPrisma.admins.findUnique.mockResolvedValue({
      id: 1,
      name: "Test Admin",
      email: "admin@example.com",
      password: bcrypt.hashSync("adminpass123", saltRounds),
    });

    const response = await request(server)
      .post("/users/authenticate")
      .send({
        email: "admin@example.com",
        password: "adminpass123",
        userType: "admin",
      })
      .expect(200);

    expect(response.body).toEqual({ id: 1 });
  });

  it("should fail with invalid credentials", async () => {
    mockPrisma.admins.findUnique.mockResolvedValue(null);

    await request(server)
      .post("/users/authenticate")
      .send({
        email: "nonexistent@example.com",
        password: "wrongpassword",
        userType: "admin",
      })
      .expect(401);
  });

  it("should fail with wrong password", async () => {
    mockPrisma.admins.findUnique.mockResolvedValue({
      id: 1,
      name: "Test Admin",
      email: "admin@example.com",
      password: bcrypt.hashSync("adminpass123", saltRounds),
    });

    await request(server)
      .post("/users/authenticate")
      .send({
        email: "admin@example.com",
        password: "wrongpassword",
        userType: "admin",
      })
      .expect(401);
  });
});

describe("Customer Login", () => {
  it("should successfully log in with valid credentials", async () => {
    mockPrisma.customer.findUnique.mockResolvedValue({
      id: 1,
      name: "Test Customer",
      email: "customer@example.com",
      password: bcrypt.hashSync("password123", saltRounds),
      emailVerified: new Date(),
      prefecture: "Tokyo",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(server)
      .post("/users/authenticate")
      .send({
        email: "customer@example.com",
        password: "password123",
        userType: "customer",
      })
      .expect(200);

    expect(response.body).toEqual({ id: 1 });
  });
});

describe("Instructor Login", () => {
  it("should successfully log in with valid credentials", async () => {
    mockPrisma.instructor.findUnique.mockResolvedValue({
      id: 1,
      name: "Test Instructor",
      email: "instructor@example.com",
      password: bcrypt.hashSync("password123", saltRounds),
      classURL: "test-url",
      icon: "test-icon",
      nickname: "test-nick",
      meetingId: "test-meeting",
      passcode: "test-pass",
      introductionURL: "test-intro",
      createdAt: new Date(),
      inactiveAt: null,
    });

    const response = await request(server)
      .post("/users/authenticate")
      .send({
        email: "instructor@example.com",
        password: "password123",
        userType: "instructor",
      })
      .expect(200);

    expect(response.body).toEqual({ id: 1 });
  });
});

describe("Admin Password Reset", () => {
  it("should successfully reset password", async () => {
    const mockToken = "test-reset-token-123";

    // Setup mocks
    const mockAdmin = {
      id: 1,
      name: "Test Admin",
      email: "admin@example.com",
      password: bcrypt.hashSync("adminpass123", saltRounds),
    };
    mockPrisma.admins.findUnique.mockResolvedValue(mockAdmin);
    mockPrisma.passwordResetToken.create.mockResolvedValue({
      id: 1,
      email: "admin@example.com",
      token: mockToken,
      expires: new Date(Date.now() + 60 * 60 * 1000),
      createdAt: new Date(),
    });
    mockResend.emails.send.mockResolvedValue({
      id: "mock-email-id",
    });

    // Step 1: Request password reset
    await request(server)
      .post("/users/send-password-reset")
      .send({
        email: "admin@example.com",
        userType: "admin",
      })
      .expect(201);

    // Extract token and userType from URL
    const emailHtml = mockResend.emails.send.mock.calls[0][0].html;
    const [, resetUrl] = emailHtml.match(
      /href="([^"]*\/auth\/reset-password[^"]*)"/,
    );
    const [, extractedToken] = resetUrl.match(/token=([^&]+)/);
    const [, extractedUserType] = resetUrl.match(/type=([^&]+)/);

    expect(extractedToken).toBe(mockToken);
    expect(extractedUserType).toBe("admin");

    // Step 2: Verify token
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 1,
      email: "admin@example.com",
      token: extractedToken,
      expires: new Date(Date.now() + 60 * 60 * 1000),
      createdAt: new Date(),
    });

    await request(server)
      .post("/users/verify-reset-token")
      .send({
        token: extractedToken,
        userType: extractedUserType,
      })
      .expect(200);

    // Step 3: Update password
    const newPassword = "newPassword456";
    const updatedMockAdmin = {
      ...mockAdmin,
      password: bcrypt.hashSync(newPassword, saltRounds),
    };
    mockPrisma.admins.update.mockResolvedValue(updatedMockAdmin);

    await request(server)
      .patch("/users/update-password")
      .send({
        token: extractedToken,
        userType: extractedUserType,
        password: newPassword,
      })
      .expect(201);

    // Step 4: Verify new password works by logging in
    mockPrisma.admins.findUnique.mockResolvedValue(updatedMockAdmin);

    const loginResponse = await request(server)
      .post("/users/authenticate")
      .send({
        email: "admin@example.com",
        password: newPassword,
        userType: "admin",
      })
      .expect(200);

    expect(loginResponse.body).toEqual({ id: 1 });
  });
});
