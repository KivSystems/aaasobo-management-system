import { Resend } from "resend";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.FRONTEND_ORIGIN}/auth/new-verification?token=${token}`;

  try {
    await resend.emails.send({
      // TODO: Replace 'onboarding@resend.dev' with KIV's verified email address before going live.
      from: "onboarding@resend.dev", // Resend-provided email
      to: email,
      subject: "メールアドレスの確認 (Email Verification)",
      html: `<p>
      以下のリンクをクリックして、メールアドレスの確認を行ってください。<br>
      <small><em>(Click the link below to verify your email address.)</em></small>
    </p>
    <p>
      <a href="${confirmLink}" style="font-size: 16px; font-weight: bold;">
        ここをクリック
      </a><br>
      <small><em>(Click here)</em></small>
    </p>`,
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};
