export const GENERAL_ERROR_MESSAGE =
  "Something went wrong. Please try again shortly. If the problem persists, contact our staff. We apologize for the inconvenience.";
export const GENERAL_ERROR_MESSAGE_JA =
  "エラーが発生しました。しばらくしてから再度お試しください。問題が解決しない場合は、スタッフまでお問い合わせください。ご不便をおかけして申し訳ありません。";

// RegisterForm
export const EMAIL_ALREADY_REGISTERED_ERROR =
  "This email address is already registered. Try a different one.";

export const SINGLE_ITEM_ALREADY_REGISTERED_ERROR = (item: string) => {
  return (
    "The input value for the following item has already been registered. Please enter a different one: " +
    item
  );
};

export const MULTIPLE_ITEMS_ALREADY_REGISTERED_ERROR = (items: string) => {
  return (
    "The input values for the following items have already been registered. Please enter different ones: \n" +
    items
  );
};

export const CONFIRMATION_EMAIL_SENT =
  "We have sent a confirmation email. Please click the link in the email to activate your account.";

export const CONFIRMATION_EMAIL_SEND_FAILURE =
  "We couldn't send the confirmation email. Please check your email address and try again. If the problem persists, contact our staff. We apologize for the inconvenience.";

export const INSTRUCTOR_REGISTRATION_SUCCESS_MESSAGE =
  "The instructor account has been created successfully.";

export const ADMIN_REGISTRATION_SUCCESS_MESSAGE =
  "The admin account has been created successfully.";

// LoginForm
export const LOGIN_FAILED_MESSAGE = {
  ja: "メールアドレスまたはパスワードが正しくありません。",
  en: "Invalid email or password.",
};

export const CONFIRMATION_EMAIL_RESEND_FAILURE = {
  ja: "メールアドレスがまだ認証されていません。確認リンクの再送信を試みましたが、失敗しました。以前お送りしたリンクを受信トレイでご確認いただくか、後ほど再度ログインしてリンクの再送信をお試しください。",
  en: "Your email hasn't been verified yet. We tried to resend the verification link but failed. Please check your inbox for a previous link, or try logging in again later to resend it.",
};

export const EMAIL_VERIFICATION_RESENT_NOTICE = {
  ja: "メールアドレスがまだ認証されていません。認証リンクをメールで再送しましたのでご確認ください。",
  en: "Your email address is not verified yet. We have resent the verification link via email.",
};

// EmailVerificationForm
export const EMAIL_VERIFICATION_TOKEN_NOT_FOUND =
  "We couldn't verify your request. Please click the confirmation button in the email again. / 認証リクエストを確認できませんでした。もう一度メール内の認証ボタンをクリックしてください。";

export const EMAIL_VERIFICATION_SUCCESS_MESSAGE = {
  ja: "メールアドレスが認証されました。ログインページからログインしてください。",
  en: "Your email address has been verified. Please log in from the login page.",
};

export const EMAIL_VERIFICATION_FAILED_MESSAGE = {
  ja: "認証リクエストを確認できませんでした。認証メールが複数届いている場合は、最新のメールの認証ボタンをクリックしてみてください。うまくいかない場合は、下のリンクからログインし、新しい認証メールをリクエストしてください。",
  en: "We couldn't verify your request. Please click the confirmation button in the latest verification email. If that doesn't work, try logging in using the link below to request a new one.",
};

export const EMAIL_VERIFICATION_TOKEN_EXPIRED = {
  ja: "認証リンクの有効期限が切れています。新しいリンクをメールで再送しましたのでご確認ください。",
  en: "The confirmation link has expired. A new link has been sent to your email, so please check it.",
};

export const EMAIL_VERIFICATION_UNEXPECTED_ERROR = {
  ja: "認証リクエストを確認できませんでした。しばらくしてから下のリンクからログインし、新しい認証メールをリクエストしてください。問題が解決しない場合は、スタッフまでお問い合わせください。ご不便をおかけして申し訳ありません。",
  en: "We couldn't verify your request. Please try logging in using the link below to request a new confirmation link later. If the issue persists, contact our staff. We apologize for the inconvenience.",
};

export const CONFIRMATION_LINK_EXPIRED_RESEND_FAILED = {
  ja: "認証リンクの有効期限が切れていたため再送を試みましたが、失敗しました。しばらくしてから下のリンクからログインし、新しい認証メールをリクエストしてください。問題が解決しない場合は、スタッフまでお問い合わせください。ご不便をおかけして申し訳ありません。",
  en: "The confirmation link has expired, and resending it failed. Please try logging in using the link below to request a new one later. If the issue persists, contact our staff. We apologize for the inconvenience.",
};

// ForgotPasswordForm
export const PASSWORD_RESET_INSTRUCTION =
  "Enter your registered email address and click Submit to receive a password reset link.";

export const EMAIL_NOT_REGISTERED_MESSAGE =
  "That email address isn't registered. Could you double-check it?";

export const PASSWORD_RESET_EMAIL_SENT_MESSAGE =
  "We've sent you a password reset email. Please check your inbox and spam folder.";

export const PASSWORD_RESET_EMAIL_SEND_FAILURE =
  "We couldn't send a password reset email. Please try again shortly. If the problem persists, contact our staff. We apologize for the inconvenience.";

// ResetPasswordForm
export const PASSWORD_RESET_TOKEN_OR_USER_TYPE_ERROR =
  "We couldn't verify your request. Please click the reset button in the email again.";

export const PASSWORD_RESET_RESEND_FAILURE =
  "Your password reset link has expired. We tried to send a new one but couldn't. Please request a new link using the link below. If the problem persists, contact our staff.";

export const PASSWORD_RESET_EXPIRED_AND_RESENT =
  "Your password reset link has expired. We've sent you a new one. Please check your inbox and spam folder.";

export const TOKEN_OR_USER_NOT_FOUND_ERROR =
  "We couldn't reset your password. Please click the reset button in the email again to restart the process. We're sorry for the inconvenience.";

export const PASSWORD_RESET_FAILED_MESSAGE =
  "We couldn't reset your password. Please try submitting your new password again. If that doesn't work, request a new reset link using the link below. We're sorry for the inconvenience.";

export const PASSWORD_RESET_SUCCESS_MESSAGE =
  "Your password was updated successfully.";
