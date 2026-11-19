import { CreateEmailOptions } from "resend";
import { z } from "zod";
import { resend } from "./resendClient";

type EmailMessage = Omit<CreateEmailOptions, "from"> & { html: string };

const emailAddressSchema = z.string().trim().email();

function requiredEmail(variable: "EMAIL_FROM" | "EMAIL_REPLY_TO") {
  const result = emailAddressSchema.safeParse(process.env[variable]);
  if (!result.success) {
    throw new Error(`${variable} must be a valid email address`);
  }
  return result.data;
}

function getDeliveryConfig() {
  const environment = process.env.EMAIL_ENV;
  if (environment !== "develop" && environment !== "production") {
    throw new Error("EMAIL_ENV must be develop or production");
  }
  if (environment === "production") {
    const from = requiredEmail("EMAIL_FROM");
    const replyTo = process.env.EMAIL_REPLY_TO
      ? requiredEmail("EMAIL_REPLY_TO")
      : undefined;
    return {
      environment: "production" as const,
      from,
      replyTo,
    };
  }
  return {
    environment: "develop" as const,
    from: "onboarding@resend.dev",
  };
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
      : {
          ...message,
          from: config.from,
          replyTo: message.replyTo ?? config.replyTo,
        };

  const response = await resend.emails.send(payload);
  if (response.data?.id && !response.error) {
    console.info("Email sent", {
      emailId: response.data.id,
      environment: config.environment,
    });
  }
  return response;
}
