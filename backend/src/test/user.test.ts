import { describe, it, expect, vi } from "vitest";
import {
  createMockPrisma,
  createMockResend,
  createTestAdmin,
  createTestCustomer,
  createTestInstructor,
} from "./helper";
import { hashPasswordSync } from "../helper/commonUtils";

vi.mock("../../prisma/prismaClient", () => ({
  prisma: createMockPrisma(),
}));

vi.mock("../helper/resendClient", () => ({
  resend: createMockResend(),
}));

import { prisma } from "../../prisma/prismaClient";
import { resend } from "../helper/resendClient";
import request from "supertest";
import { server } from "../server";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;
const mockResend = resend as unknown as ReturnType<typeof createMockResend>;

describe("Admin Login", () => {
  it("should successfully log in with valid credentials", async () => {
    const admin = createTestAdmin();
    mockPrisma.admins.findUnique.mockResolvedValue({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      password: hashPasswordSync(admin.password),
    });

    const response = await request(server)
      .post("/users/authenticate")
      .send({
        email: admin.email,
        password: admin.password,
        userType: "admin",
      })
      .expect(200);

    expect(response.body).toEqual({ id: admin.id });
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
    const admin = createTestAdmin();
    mockPrisma.admins.findUnique.mockResolvedValue({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      password: hashPasswordSync(admin.password),
    });

    await request(server)
      .post("/users/authenticate")
      .send({
        email: admin.email,
        password: "wrongpassword",
        userType: "admin",
      })
      .expect(401);
  });
});

describe("Customer Login", () => {
  it("should successfully log in with valid credentials", async () => {
    const customer = createTestCustomer();
    mockPrisma.customer.findUnique.mockResolvedValue({
      ...customer,
      password: hashPasswordSync(customer.password),
    });

    const response = await request(server)
      .post("/users/authenticate")
      .send({
        email: customer.email,
        password: customer.password,
        userType: "customer",
      })
      .expect(200);

    expect(response.body).toEqual({ id: customer.id });
  });
});

describe("Instructor Login", () => {
  it("should successfully log in with valid credentials", async () => {
    const instructor = createTestInstructor();
    mockPrisma.instructor.findUnique.mockResolvedValue({
      ...instructor,
      password: hashPasswordSync(instructor.password),
    });

    const response = await request(server)
      .post("/users/authenticate")
      .send({
        email: instructor.email,
        password: instructor.password,
        userType: "instructor",
      })
      .expect(200);

    expect(response.body).toEqual({ id: instructor.id });
  });
});

describe("Admin Password Reset", () => {
  it("should successfully reset password", async () => {
    const mockToken = "test-reset-token-123";
    const mockAdmin = createTestAdmin();

    // Setup mocks
    mockPrisma.admins.findUnique.mockResolvedValue({
      ...mockAdmin,
      password: hashPasswordSync(mockAdmin.password),
    });
    mockPrisma.passwordResetToken.create.mockResolvedValue({
      id: 1,
      email: mockAdmin.email,
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
        email: mockAdmin.email,
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
      email: mockAdmin.email,
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
      password: hashPasswordSync(newPassword),
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
        email: mockAdmin.email,
        password: newPassword,
        userType: "admin",
      })
      .expect(200);

    expect(loginResponse.body).toEqual({ id: mockAdmin.id });
  });
});
