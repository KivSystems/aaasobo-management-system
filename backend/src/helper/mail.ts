import { CreateEmailResponse, Resend } from "resend";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);
export type UserType = "admin" | "customer" | "instructor";

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string,
) => {
  const confirmLink = `${process.env.FRONTEND_ORIGIN}/auth/new-verification/${token}`;

  try {
    const response: CreateEmailResponse = await resend.emails.send({
      from: "contact@aaasobo.org",
      to: email,
      subject:
        "【KIVこどもオンライン英会話AaasoBo!】メールアドレス認証のお願い / Please confirm your email address",
      html: `
      <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
        <p>${name} 様</p>
  
        <p>
          このたびは「KIVこどもオンライン英会話AaasoBo!」にご登録いただき、誠にありがとうございます。<br>
          無料アカウントの作成が完了いたしました。<br>
          下のボタンをクリックして、メールアドレスの認証をお願いいたします。
        </p>

        <p style="font-size: 14px; color: #555;">
          ※このリンクは一定時間で無効になりますので、お早めにご対応ください。
        </p>
  
        <p>
          <a href="${confirmLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            メールアドレスを認証
          </a>
        </p>
  
        <p style="font-size: 14px; color: #555;">
          ※このメールにお心当たりがない場合は、お手数ですが破棄してください。
        </p>
  
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #ccc;" />
  
        <p>
          Dear ${name},
        </p>
  
        <p>
          Thank you for signing up with <strong>KIV Kids Online English AaasoBo!</strong>.<br>
          Your free account has been created.<br>
          Please click the button below to confirm your email address.
        </p>
  
        <p style="font-size: 12px; color: #555;">
          Note: This link will expire after a certain period. Please complete the process promptly.
        </p>

        <p>
          <a href="${confirmLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Confirm your email address
          </a>
        </p>
  
        <p style="font-size: 12px; color: #555;">
          If you did not sign up for this service, please disregard this email.
        </p>
  
        <br />
  
        <p style="color: #999; margin: 10px 0;">
        -----------------------------------------------------------------------
        </p>
        <p style="font-size: 14px;">
          KIVこどもオンライン英会話AaasoBo! / KIV Online English Program AaasoBo!<br>
          contact@aaasobo.org
        </p>
      </div>
    `,
    });

    if ("error" in response && response.error) {
      console.error("Error sending verification email with Resend", {
        error: response.error,
        context: {
          email: email,
          time: new Date().toISOString(),
        },
      });
      return { success: false };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error sending verification email with Resend", {
      error,
      context: {
        email: email,
        time: new Date().toISOString(),
      },
    });
    return { success: false };
  }
};

export const resendVerificationEmail = async (
  email: string,
  name: string,
  token: string,
) => {
  const confirmLink = `${process.env.FRONTEND_ORIGIN}/auth/new-verification/${token}`;

  try {
    const response: CreateEmailResponse = await resend.emails.send({
      // TODO: Replace 'onboarding@resend.dev' with KIV's verified email address before going live.
      from: "onboarding@resend.dev", // Resend-provided email
      to: email,
      subject:
        "【KIVこどもオンライン英会話AaasoBo!】メールアドレス認証リンクを再送しました / We've re-sent your email confirmation link",
      html: `
      <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
        <p>${name} 様</p>
  
        <p>
          新しいメールアドレス認証リンクをお送りしました。<br>
          下のボタンをクリックして、メールアドレスの認証をお願いいたします。
        </p>

        <p style="font-size: 14px; color: #555;">
          ※このリンクは一定時間で無効になりますので、お早めにご対応ください。
        </p>
  
        <p>
          <a href="${confirmLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            メールアドレスを認証
          </a>
        </p>
  
        <p style="font-size: 14px; color: #555;">
          ※このメールにお心当たりがない場合は、お手数ですが破棄してください。
        </p>
  
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #ccc;" />
  
        <p>
          Dear ${name},
        </p>
  
        <p>
          We've sent you a new email confirmation link.<br>
          Please click the button below to confirm your email address.
        </p>
  
        <p style="font-size: 12px; color: #555;">
          Note: This link will expire after a certain period. Please complete the process promptly.
        </p>

        <p>
          <a href="${confirmLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Confirm your email address
          </a>
        </p>
  
        <p style="font-size: 12px; color: #555;">
          If you did not sign up for this service, please disregard this email.
        </p>
  
        <br />
  
        <p style="color: #999; margin: 10px 0;">
        -----------------------------------------------------------------------
        </p>
        <p style="font-size: 14px;">
          KIVこどもオンライン英会話AaasoBo! / KIV Online English Program AaasoBo!<br>
          contact@aaasobo.org
        </p>
      </div>
    `,
    });

    if ("error" in response && response.error) {
      console.error("Error re-sending verification email with Resend", {
        error: response.error,
        context: {
          email: email,
          time: new Date().toISOString(),
        },
      });
      return { success: false };
    }

    return { success: true };
  } catch (error: any) {
    console.error(
      "Unexpected error re-sending verification email with Resend",
      {
        error,
        context: {
          email: email,
          time: new Date().toISOString(),
        },
      },
    );
    return { success: false };
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string,
  userType: UserType,
) => {
  const resetLink = `${process.env.FRONTEND_ORIGIN}/auth/reset-password?token=${token}&type=${userType}`;

  try {
    const response: CreateEmailResponse = await resend.emails.send({
      // TODO: Replace 'onboarding@resend.dev' with KIV's verified email address before going live.
      from: "onboarding@resend.dev", // Resend-provided email
      to: email,
      subject:
        "【KIVこどもオンライン英会話AaasoBo!】パスワード再設定のお知らせ / Password Reset Notification",
      html: `
    <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
      <p>${name} 様</p>

      <p>
        下のボタンをクリックして、パスワードの再設定を行ってください。
      </p>

      <p style="font-size: 14px; color: #555;">
        ※このリンクは一定時間で無効になりますので、お早めにご対応ください。
      </p>

      <p>
        <a href="${resetLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          パスワードを再設定
        </a>
      </p>

      <p style="font-size: 14px; color: #555;">
        ※このメールにお心当たりがない場合は、お手数ですが破棄してください。
      </p>

      <hr style="margin: 32px 0; border: none; border-top: 1px solid #ccc;" />

      <p>
        Dear ${name},
      </p>

      <p>
        Please click the button below to reset your password.
      </p>

      <p style="font-size: 14px; color: #555;">
        Note: This link will expire after a certain period. Please complete the process promptly.
      </p>

      <p>
        <a href="${resetLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset password
        </a>
      </p>

      <p style="font-size: 14px; color: #555;">
        If you did not sign up for this service, please disregard this email.
      </p>

      <br />

      <p style="color: #999; margin: 10px 0;">
      -----------------------------------------------------------------------
      </p>
      <p style="font-size: 14px;">
        KIVこどもオンライン英会話AaasoBo! / KIV Online English Program AaasoBo!<br>
        contact@aaasobo.org
      </p>
    </div>
  `,
    });

    if ("error" in response && response.error) {
      console.error("Error sending password reset email with Resend", {
        error: response.error,
        context: {
          email: email,
          time: new Date().toISOString(),
        },
      });
      return { success: false };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error sending password reset email with Resend", {
      error,
      context: {
        email: email,
        time: new Date().toISOString(),
      },
    });
    return { success: false };
  }
};
