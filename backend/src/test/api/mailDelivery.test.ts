import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("../../lib/email/resendClient", () => ({
  resend: { emails: { send } },
}));
import {
  getAdminNotificationRecipient,
  sendEmail,
} from "../../lib/email/delivery";

import {
  sendVerificationEmail,
  resendVerificationEmail,
  sendPasswordResetEmail,
  sendAdminSameDayRebookEmail,
  sendInstructorSameDayRebookEmail,
} from "../../lib/email/mail";

const message = {
  to: "customer@example.com",
  cc: ["copy@example.com"],
  bcc: ["hidden@example.com"],
  replyTo: "reply@example.com",
  subject: "Test",
  html: "<p>Private token</p>",
};

describe("email delivery routing", () => {
  beforeEach(() => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_GIT_COMMIT_REF", "");
    vi.stubEnv("EMAIL_FROM", "sender@example.com");
    send
      .mockReset()
      .mockResolvedValue({ data: { id: "email-id" }, error: null });
    vi.spyOn(console, "info").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });
  it.each(["development", "test"])(
    "routes %s exclusively to Resend test addresses",
    async (env) => {
      vi.stubEnv("NODE_ENV", env);
      const original = structuredClone(message);
      await sendEmail(message);
      expect(send).toHaveBeenCalledWith({
        ...message,
        from: "onboarding@resend.dev",
        to: "delivered@resend.dev",
        cc: undefined,
        bcc: undefined,
        replyTo: undefined,
      });
      expect(getAdminNotificationRecipient()).toBe("delivered@resend.dev");
      expect(message).toEqual(original);
      expect(console.info).toHaveBeenCalledWith("Email sent", {
        emailId: "email-id",
        environment: "develop",
      });
    },
  );
  it.each([
    ["production", "develop"],
    ["preview", "main"],
    ["preview", "feature/test"],
  ])(
    "isolates Vercel %s / %s even with production NODE_ENV",
    async (environment, branch) => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("VERCEL", "1");
      vi.stubEnv("VERCEL_ENV", environment);
      vi.stubEnv("VERCEL_GIT_COMMIT_REF", branch);
      await sendEmail(message);
      expect(send.mock.calls[0][0].to).toBe("delivered@resend.dev");
      expect(send.mock.calls[0][0].from).toBe("onboarding@resend.dev");
    },
  );
  it("preserves intended recipients on main production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_GIT_COMMIT_REF", "main");
    await sendEmail(message);
    expect(send).toHaveBeenCalledWith({
      ...message,
      from: "sender@example.com",
    });
    expect(getAdminNotificationRecipient()).toBe("sender@example.com");
  });
  it.each(["", "develop", "invalid"])(
    "rejects unknown NODE_ENV %s before sending",
    async (env) => {
      vi.stubEnv("NODE_ENV", env);
      await expect(sendEmail(message)).rejects.toThrow("NODE_ENV");
      expect(send).not.toHaveBeenCalled();
    },
  );
  it("prevents real delivery when all Vercel metadata is absent", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(sendEmail(message)).rejects.toThrow("Git branch");
    expect(send).not.toHaveBeenCalled();
  });
  it("rejects missing Vercel branch metadata", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    await expect(sendEmail(message)).rejects.toThrow("Git branch");
    expect(send).not.toHaveBeenCalled();
  });
  it("rejects invalid production EMAIL_FROM", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_GIT_COMMIT_REF", "main");
    vi.stubEnv("EMAIL_FROM", "not-an-email");
    await expect(sendEmail(message)).rejects.toThrow("EMAIL_FROM");
    expect(send).not.toHaveBeenCalled();
  });
  it("routes all five application email flows through the test transport", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const booking = {
      classCode: "TEST",
      dateTime: "2026-10-08",
      instructorName: "Instructor",
      instructorEmail: "instructor@example.com",
      customerName: "Customer",
      customerEmail: "customer@example.com",
      children: "Child",
    };
    await sendVerificationEmail("customer@example.com", "Customer", "token");
    await resendVerificationEmail("customer@example.com", "Customer", "token");
    await sendPasswordResetEmail(
      "instructor@example.com",
      "Instructor",
      "token",
      "instructor",
    );
    await sendAdminSameDayRebookEmail(booking);
    await sendInstructorSameDayRebookEmail(booking);
    expect(send).toHaveBeenCalledTimes(5);
    for (const [payload] of send.mock.calls) {
      expect(payload.from).toBe("onboarding@resend.dev");
      expect(payload.to).toBe("delivered@resend.dev");
    }
    expect(booking.instructorEmail).toBe("instructor@example.com");
    expect(booking.customerEmail).toBe("customer@example.com");
  });
  it("returns provider errors without logging success", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const response = { data: null, error: { message: "Rejected" } };
    send.mockResolvedValue(response);
    expect(await sendEmail(message)).toBe(response);
    expect(console.info).not.toHaveBeenCalled();
  });
});
