import "dotenv/config";
import { z } from "zod";
import { resend } from "../lib/email/resendClient";

async function main() {
  const id = z.string().uuid().safeParse(process.argv[2]);
  if (!id.success || process.argv.length !== 3) {
    throw new Error("Usage: npm run email:inspect -- <email-id>");
  }

  const { data, error } = await resend.emails.get(id.data);
  if (error || !data) {
    throw new Error(
      `Unable to retrieve email: ${error?.message ?? "empty response"}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        id: data.id,
        from: data.from,
        to: data.to,
        cc: data.cc,
        bcc: data.bcc,
        replyTo: data.reply_to,
        subject: data.subject,
        lastEvent: data.last_event,
        createdAt: data.created_at,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Email lookup failed");
  process.exitCode = 1;
});
