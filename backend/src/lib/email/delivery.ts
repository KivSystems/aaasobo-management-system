import { CreateEmailOptions } from "resend";
import { z } from "zod";
import { resend } from "./resendClient";

type EmailMessage = Omit<CreateEmailOptions, "from"> & { html: string };

const senderSchema = z.string().trim().email();
export const testEmailRecipient = "delivered@resend.dev";

export async function sendEmail(message: EmailMessage) {
  const sender = senderSchema.safeParse(process.env.EMAIL_FROM);
  const payload: CreateEmailOptions = sender.success
    ? { ...message, from: sender.data }
    : {
        ...message,
        from: "onboarding@resend.dev",
        to: testEmailRecipient,
        cc: undefined,
        bcc: undefined,
        replyTo: undefined,
      };

  const response = await resend.emails.send(payload);
  if (response.data?.id && !response.error) {
    console.info("Email sent", {
      emailId: response.data.id,
      environment: sender.success ? "production" : "develop",
    });
  }
  return response;
}
