export const GENERAL_ERROR_MESSAGE =
  "Something went wrong. Please try again shortly. If the problem persists, contact our staff. We apologize for the inconvenience.";

export const UNEXPECTED_ERROR_MESSAGE = {
  ja: "エラーが発生しました。しばらくしてから、もう一度お試しください。解決しない場合は、contact@aaasobo.orgまでご連絡ください。ご不便をおかけし、申し訳ありません。",
  en: "Something went wrong. Please try again after some time. If the issue persists, contact us at contact@aaasobo.org. We apologize for the inconvenience.",
};

// RegisterForm
export const EMAIL_ALREADY_REGISTERED_ERROR = {
  ja: "このメールアドレスは既に登録されています。別のアドレスをお試しください。",
  en: "This email address is already registered. Try a different one.",
};

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

export const CONFIRMATION_EMAIL_SENT = {
  ja: "確認メールを送信しました。メール内のボタンをクリックしてアカウントを有効化してください。",
  en: "We have sent a confirmation email. Please click the button in the email to activate your account.",
};

export const CONFIRMATION_EMAIL_SEND_FAILURE = {
  ja: "確認メールの送信に失敗しました。メールアドレスをご確認のうえ、再度「アカウント登録」ボタンをクリックしてみてください。問題が解決しない場合は、スタッフまでご連絡ください。ご不便をおかけして申し訳ございません。",
  en: "We couldn't send the confirmation email. Please check your email address and try again. If the problem persists, contact our staff. We apologize for the inconvenience.",
};

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
export const PASSWORD_RESET_INSTRUCTION = {
  ja: "ご登録されているメールアドレスを入力して「送信」をクリックすると、パスワード再設定用のリンクが届きます。",
  en: "Enter your registered email address and click 'Submit' to receive a password reset link.",
};

export const EMAIL_NOT_REGISTERED_MESSAGE = {
  ja: "このメールアドレスは登録されていないようです。もう一度ご確認をお願いします。",
  en: "It looks like this email address isn't registered. Please double-check it.",
};

export const PASSWORD_RESET_EMAIL_SENT_MESSAGE = {
  ja: "パスワード再設定用のメールをお送りしました。受信ボックスをご確認ください。",
  en: "We've sent you a password reset email. Please check your inbox.",
};

export const PASSWORD_RESET_EMAIL_SEND_FAILURE = {
  ja: "パスワード再設定メールを送信できませんでした。後ほど再度お試しください。問題が続く場合は、contact@aaasobo.org までご連絡ください。ご迷惑をおかけして申し訳ありません。",
  en: "We couldn't send the password reset email. Please try again later. If the issue continues, contact us at contact@aaasobo.org. Sorry for the inconvenience.",
};

// ResetPasswordForm
export const PASSWORD_RESET_TOKEN_OR_USER_TYPE_ERROR = {
  ja: "リクエストを確認できませんでした。メール内のパスワード再設定ボタンをもう一度クリックしてください。",
  en: "We couldn't verify your request. Please click the password reset button in the email again.",
};

export const PASSWORD_SECURITY_CHECK_FAILED_MESSAGE = {
  ja: "パスワードの安全性を確認できませんでした。時間をおいて、もう一度お試しください。問題が解決しない場合は、contact@aaasobo.orgまでご連絡ください。ご不便をおかけし、申し訳ありません。",
  en: "We couldn't check your password's security. Please try again later. If the issue continues, contact us at contact@aaasobo.org. Sorry for the inconvenience.",
};

export const PASSWORD_RESET_LINK_EXPIRED = {
  ja: "パスワード再設定用リンクの有効期限が切れています。お手数ですが、下のリンクから再発行をお願いします。",
  en: "The password reset link has expired. Please request a new one using the link below.",
};

export const TOKEN_OR_USER_NOT_FOUND_ERROR = {
  ja: "パスワードの再設定に失敗しました。再設定メールが複数届いている場合は、最新のメールにある再設定ボタンをクリックしてください。問題が解決しない場合は、contact@aaasobo.orgまでご連絡ください。",
  en: "We couldn't reset your password. If you've received multiple reset emails, please click the reset button in the most recent one. If the issue persists, contact us at contact@aaasobo.org.",
};

export const PASSWORD_RESET_FAILED_MESSAGE = {
  ja: "パスワードの再設定に失敗しました。新しいパスワードをもう一度送信してみてください。うまくいかない場合は、下のリンクから新しい再設定リンクを再発行してください。ご不便をおかけし、申し訳ありません。",
  en: "We couldn't reset your password. Please try submitting your new password again. If that doesn't work, request a new reset link using the link below. We're sorry for the inconvenience.",
};

export const PASSWORD_RESET_SUCCESS_MESSAGE = {
  ja: "パスワードの再設定が完了しました。新しいパスワードでログインできます。",
  en: "Your password was reset successfully. You can now log in with your new password.",
};
