export const FAILED_TO_FETCH_REBOOKABLE_CLASSES =
  "We couldn't load your available classes to rebook. Please refresh the page or try again later. / 振替予約可能クラスの読み込みに失敗しました。ページを再読み込みするか、しばらくしてからもう一度お試しください。";

export const INVALID_CUSTOMER_ID =
  "We encountered an issue while processing your ID. Please refresh the page or try again later. / カスタマーIDの処理中に問題が発生しました。ページを再読み込みするか、しばらくしてからもう一度お試しください。";

export const INVALID_CLASS_ID =
  "We encountered an issue while processing the class ID. Please try again later. / クラスIDの処理中に問題が発生しました。後ほどもう一度お試しください。";

export const FAILED_TO_FETCH_UPCOMING_CLASSES =
  "We couldn't load your upcoming classes. Please refresh the page or try again later. / 予約済みクラスの読み込みに失敗しました。ページを再読み込みするか、しばらくしてからもう一度お試しください。";

export const FAILED_TO_FETCH_CUSTOMER_CLASSES =
  "We couldn't load your classes. Please refresh the page or try again later. / クラスの読み込みに失敗しました。ページを再読み込みするか、しばらくしてからもう一度お試しください。";

export const FAILED_TO_FETCH_CUSTOMER_PROFILE =
  "We couldn't load your profile. Please refresh the page or try again later. / プロフィールの読み込みに失敗しました。ページを再読み込みするか、しばらくしてからもう一度お試しください。";

export const CANCELATION_NOT_ALLOWED_MESSAGE = {
  ja: "日本時間を基準とし、クラスは予定日の当日以降、キャンセルできません。",
  en: "Based on Japan Standard Time, classes cannot be canceled on or after the scheduled day.",
};

export const CONFIRM_CLASS_CANCELLATION = {
  ja: "選択したクラスをキャンセルしてもよろしいですか？",
  en: "Are you sure you want to cancel the selected class(es)?",
};

export const SELECTED_CLASSES_CANCELLATION_SUCCESS = {
  ja: "選択したクラスのキャンセルが完了しました。",
  en: "The selected class(es) have been successfully canceled.",
};

export const FAILED_TO_CANCEL_INVALID_CLASSES = {
  ja: "無効なクラスIDが含まれていたため、キャンセルに失敗しました。しばらくしてから再度お試しください。解決しない場合は contact@aaasobo.org までご連絡ください。",
  en: "The cancellation failed due to an invalid class ID. Please try again after some time. If the issue persists, contact us at contact@aaasobo.org.",
};

export const FAILED_TO_CANCEL_CLASSES = {
  ja: "選択したクラスのキャンセルに失敗しました。お手数ですが、しばらくしてから再度お試しください。解決しない場合は contact@aaasobo.org までご連絡ください。",
  en: "Failed to cancel the selected classes. Please try again after a short while. If the issue persists, contact us at contact@aaasobo.org.",
};

export const NO_CANCELABLE_CLASSES_MESSAGE = {
  ja: "キャンセル可能なクラスはありません。",
  en: "You have no classes that can be canceled.",
};

export const TODAYS_CLASS_REBOOKING_NOTICE = {
  ja: "当日の振替は、クラス開始の3時間前まで可能です。ただし、インストラクターの準備が間に合わない場合、キャンセルとなることがございますのでご了承ください。",
  en: "You can rebook a class on the same day up to 3 hours before it starts. However, please note that in some cases, the class may be canceled if the instructor doesn't have enough time to prepare.",
};

export const REBOOKING_TOO_LATE_NOTICE = {
  ja: "当日の振替は、クラス開始の3時間前まで可能です。申し訳ありませんが、すでに時間を過ぎているため、振替予約はできません。",
  en: "You can rebook a class on the same day up to 3 hours before it starts. However, since that time has already passed, rebooking is no longer possible.",
};

export const CHILD_PROFILE_REQUIRED_MESSAGE = {
  ja: "お子様のプロフィールが未登録のため、振替予約を行うことができません。サイドメニューの「お子様プロフィール」からプロフィールを登録のうえ、再度振替予約を行ってください。",
  en: "You cannot rebook a class because your child's profile has not been registered. Please go to 'Child Profile' in the side menu to register the profile, then try rebooking again.",
};

// ClassDetail Modal
export const NO_CLASS_DETAILS = {
  ja: "クラス情報が取得できませんでした。",
  en: "No class details available",
};

export const CANNOT_CANCEL_ON_OR_AFTER_CLASS_DAY = {
  ja: "クラス当日以降のキャンセルは承っておりません。当日キャンセルをご希望の方は、contact@aaasobo.org までご連絡ください。",
  en: "Same-day or later cancellations aren't available. Please contact contact@aaasobo.org if needed.",
};

export const CANCEL_CLASS_CONFIRM_MESSAGE = {
  ja: "このクラスをキャンセルしてもよろしいですか？",
  en: "Are you sure you want to cancel this class?",
};

export const CLASS_CANCELLATION_SUCCESS = {
  ja: "クラスのキャンセルが完了しました。",
  en: "The class has been successfully canceled.",
};

export const FAILED_TO_CANCEL_INVALID_CLASS = {
  ja: "クラスIDが無効だったため、キャンセルに失敗しました。しばらくしてから再度お試しください。解決しない場合は contact@aaasobo.org までご連絡ください。",
  en: "The cancellation failed due to an invalid class ID. Please try again after some time. If the issue persists, contact us at contact@aaasobo.org.",
};

export const FAILED_TO_CANCEL_CLASS = {
  ja: "クラスのキャンセルに失敗しました。お手数ですが、しばらくしてから再度お試しください。解決しない場合は contact@aaasobo.org までご連絡ください。",
  en: "Failed to cancel the class. Please try again after a short while. If the issue persists, contact us at contact@aaasobo.org.",
};

export const CANCELED_BY_INSTRUCTOR_NOTICE = {
  ja: "インストラクターの都合でキャンセルとなったクラスは、振替可能クラスとしてカウントされ、180日間有効です。",
  en: "Classes canceled by the instructor count toward your rebookable class total and are valid for 180 days.",
};

export const CANCELED_BY_CUSTOMER_NOTICE = {
  ja: "前日まで（日本時間基準）にキャンセルされたクラスは、180日間振替可能です。当日キャンセルは振替できませんのでご了承ください。",
  en: "Cancellations made by the day before (Japan time) are rebookable within 180 days. For multiple cancellations, the period starts from the original booking. Same-day cancellations aren't rebookable.",
};

// Profile page
export const NO_CHANGES_MADE_MESSAGE = {
  ja: "変更された項目がありません。",
  en: "No changes were made.",
};

export const PROFILE_UPDATE_EMAIL_VERIFICATION_FAILED_MESSAGE = {
  ja: "新しいメールアドレスへ認証リンクを送信できなかったため、プロフィールを更新できませんでした。メールアドレスをご確認のうえ、再度お試しください。解決しない場合は contact@aaasobo.org までご連絡ください。",
  en: "We couldn't update your profile because we were unable to send a verification link to your new email address. Please check your email address and try again. If the issue persists, contact us at contact@aaasobo.org.",
};

export const PROFILE_UPDATED_VERIFICATION_EMAIL_SENT = {
  ja: "プロフィールの更新が完了しました。新しいメールアドレス宛に認証リンクを送信しましたので、メール内のボタンをクリックして認証を完了してください。",
  en: "Your profile has been updated. A verification link has been sent to your new email address. Please click the button in the email to complete the verification.",
};

export const PROFILE_UPDATE_SUCCESS_MESSAGE = {
  ja: "プロフィールの更新が完了しました。",
  en: "Your profile has been updated.",
};

export const PROFILE_UPDATE_FAILED_MESSAGE = {
  ja: "プロフィールを更新できませんでした。時間をおいて、もう一度お試しください。解決しない場合は contact@aaasobo.org までご連絡ください。",
  en: "We couldn't update your profile. Please wait a moment and try again. If the issue persists, contact us at contact@aaasobo.org.",
};
