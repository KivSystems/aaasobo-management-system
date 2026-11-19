import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("../../lib/email/resendClient", () => ({
  resend: { emails: { send } },
}));
import { sendEmail } from "../../lib/email/delivery";

import {
  sendVerificationEmail,
  resendVerificationEmail,
  sendPasswordResetEmail,
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
    vi.stubEnv("EMAIL_FROM", "");
    send
      .mockReset()
      .mockResolvedValue({ data: { id: "email-id" }, error: null });
    vi.spyOn(console, "info").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });
  it.each([undefined, "", "  ", "not-an-email"])(
    "routes %s exclusively to Resend test addresses",
    async (sender) => {
      vi.stubEnv("EMAIL_FROM", sender);
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
  it("preserves intended recipients in production without deployment metadata", async () => {
    vi.stubEnv("EMAIL_FROM", " sender@example.com ");
    vi.stubEnv("NODE_ENV", "development");
    await sendEmail(message);
    expect(send).toHaveBeenCalledWith({
      ...message,
      from: "sender@example.com",
    });
  });
  it("routes all four application email flows through the test transport", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const booking = {
      classCode: "TEST",
      dateTime: "2026-10-08",
      instructorName: "Instructor",
      instructorEmail: "instructor@example.com",
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
    await sendInstructorSameDayRebookEmail(booking);
    expect(send).toHaveBeenCalledTimes(4);
    for (const [payload] of send.mock.calls) {
      expect(payload.from).toBe("onboarding@resend.dev");
      expect(payload.to).toBe("delivered@resend.dev");
    }
    expect(booking.instructorEmail).toBe("instructor@example.com");
  });
  it("returns provider errors without logging success", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const response = { data: null, error: { message: "Rejected" } };
    send.mockResolvedValue(response);
    expect(await sendEmail(message)).toBe(response);
    expect(console.info).not.toHaveBeenCalled();
  });
});
