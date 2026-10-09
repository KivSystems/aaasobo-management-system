import { CreateEmailOptions } from "resend";
import { z } from "zod";
import { resend } from "./resendClient";

type EmailMessage = Omit<CreateEmailOptions, "from"> & { html: string };

const emailAddressSchema = z.string().trim().email();

function requiredEmail() {
  const result = emailAddressSchema.safeParse(process.env.EMAIL_FROM);
  if (!result.success) {
    throw new Error("EMAIL_FROM must be a valid email address");
  }
  return result.data;
}

function getDeliveryConfig() {
  const nodeEnv = process.env.NODE_ENV;
  if (!["development", "test", "production"].includes(nodeEnv ?? "")) {
    throw new Error("NODE_ENV must be development, test or production");
  }
  if (
    nodeEnv === "production" &&
    (!process.env.VERCEL_ENV || !process.env.VERCEL_GIT_COMMIT_REF)
  ) {
    throw new Error(
      "Vercel environment and Git branch are required for email delivery",
    );
  }
  const production =
    nodeEnv === "production" &&
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_GIT_COMMIT_REF === "main";
  if (production) {
    const from = requiredEmail();
    return {
      environment: "production" as const,
      from,
      adminTo: from,
    };
  }
  return {
    environment: "develop" as const,
    from: "onboarding@resend.dev",
    adminTo: "delivered@resend.dev",
  };
}

export function getAdminNotificationRecipient() {
  return getDeliveryConfig().adminTo;
}

export async function sendEmail(message: EmailMessage) {
  const config = getDeliveryConfig();
  const payload: CreateEmailOptions =
    config.environment === "develop"
      ? {
          ...message,
          from: config.from,
          to: "delivered@resend.dev",
          cc: undefined,
          bcc: undefined,
          replyTo: undefined,
        }
      : { ...message, from: config.from };

  const response = await resend.emails.send(payload);
  if (response.data?.id && !response.error) {
    console.info("Email sent", {
      emailId: response.data.id,
      environment: config.environment,
    });
  }
  return response;
}
