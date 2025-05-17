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

export const FAILED_TO_CANCEL_CLASSES = {
  ja: "選択したクラスのキャンセルに失敗しました。後ほど、もう一度お試しください。",
  en: "Failed to cancel the selected classes. Please try again later.",
};

export const TODAYS_CLASS_CANCELLATION_NOTICE = {
  ja: "当日のクラスをキャンセルする場合は、LINEでスタッフにご連絡ください。この場合、振替クラスはご利用いただけませんのでご注意ください。なお、日本時間を基準としております。",
  en: "If you need to cancel the class on the scheduled day, please contact our staff via LINE. Please note that make-up classes will not be available in this case. Note that Japan Standard Time is used as the reference.",
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
