import { vi } from "vitest";

vi.mock("../lib/email/resendClient", () => ({
  resend: {
    emails: {
      send: vi
        .fn()
        .mockResolvedValue({ data: { id: "mock-email-id" }, error: null }),
    },
  },
}));

vi.mock("../lib/email/mail", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/email/mail")>();
  return {
    ...actual,
    sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
    resendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
    sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
  };
});
