import * as authMessages from "./authSchemas";
import {
  GENERAL_ERROR_MESSAGE,
  UNEXPECTED_ERROR_MESSAGE,
} from "./formValidation";

const translations: Record<string, string> = {
  "Failed to update attendance. Please try again later. If the problem persists, contact the staff.":
    "出席状況を更新できませんでした。時間をおいて再度お試しください。問題が続く場合は担当者にご連絡ください。",
  "Failed to update class status. Please try again later.":
    "クラスの状態を更新できませんでした。時間をおいて再度お試しください。",
  "Normalized import executed successfully": "データを取り込みました。",
  [GENERAL_ERROR_MESSAGE]: UNEXPECTED_ERROR_MESSAGE.ja,
  ...Object.fromEntries(
    Object.values(authMessages).map(({ en, ja }) => [en, ja]),
  ),
  "Invalid URL format.": "URLの形式が正しくありません。",
  "URL must start with http:// or https://":
    "URLは http:// または https:// で始めてください。",
  "Invalid user type.": "ユーザー種別が正しくありません。",
  "Passwords do not match.": "パスワードが一致しません。",
  "Your password is too weak. Try using a longer passphrase or a password manager.":
    "パスワードの安全性が低すぎます。長いパスフレーズやパスワード管理ツールを使用してください。",
  "Instructor profile image must be less than 5MB.":
    "プロフィール画像は5MB以下にしてください。",
  "Only JPG and PNG files are allowed.":
    "JPGまたはPNGファイルを選択してください。",
  "Plan Name (English) must not contain Japanese characters.":
    "プラン名（英語）は半角英数字・記号で入力してください。",
  "Plan Name (Japanese) must contain Japanese characters.":
    "プラン名（日本語）には日本語を含めてください。",
  "Event Name (English) must contain only alphabetic characters.":
    "イベント名（英語）は半角英数字とスペースで入力してください。",
  "Event Name (Japanese) must contain Japanese characters.":
    "イベント名（日本語）には日本語を含めてください。",
  "Please select one event.": "イベントを選択してください。",
  "Please remove the event from AaasoBo! Calendar before deleting it.":
    "イベントを削除する前に、AaasoBo! カレンダーからこのイベントを取り除いてください。",
  "The instructor account has been created successfully.":
    "インストラクターを登録しました。",
  "The admin account has been created successfully.": "管理者を登録しました。",
  "The admin account has been updated successfully.":
    "管理者情報を更新しました。",
  "The admin account has been deleted successfully.": "管理者を削除しました。",
  "Tags saved successfully.": "タグを保存しました。",
  "Tag created successfully.": "タグを作成しました。",
  "Tag deleted successfully.": "タグを削除しました。",
  "Failed to save tags.": "タグの保存に失敗しました。",
  "Failed to create tag.": "タグの作成に失敗しました。",
  "Failed to delete tag.": "タグの削除に失敗しました。",
  "Failed to normalize the source CSV": "CSVデータの整形に失敗しました。",
  "Failed to execute normalized import": "データの取り込みに失敗しました。",
  "Failed to download normalized package":
    "整形済みファイルのダウンロードに失敗しました。",
  "Failed to execute incremental import": "データの追加に失敗しました。",
  "Provide either a normalization job or normalized zip file.":
    "整形処理を実行するか、整形済みZIPファイルを選択してください。",
  "Uploaded file is not a valid ZIP archive":
    "アップロードしたファイルは有効なZIPファイルではありません。",
  "Header row for raw schedule CSV not found":
    "CSVにスケジュールの見出し行が見つかりません。",
  "Normalized import validation failed": "取り込みデータに問題があります。",
  "Normalized import parsing failed": "取り込みデータを読み取れませんでした。",
};

const fieldLabels: Record<string, string> = {
  Name: "名前",
  Nickname: "ニックネーム",
  Email: "メールアドレス",
  email: "メールアドレス",
  "Class URL": "クラスURL",
  "Meeting ID": "ミーティングID",
  Passcode: "パスコード",
  "Instructor profile image": "プロフィール画像",
  "Plan Name (English)": "プラン名（英語）",
  "Plan Name (Japanese)": "プラン名（日本語）",
  "Event Name (English)": "イベント名（英語）",
  "Event Name (Japanese)": "イベント名（日本語）",
  "event name (Japanese)": "イベント名（日本語）",
  "event name (English)": "イベント名（英語）",
  Description: "説明",
  "Color Code": "カラーコード",
  "color code": "カラーコード",
  "Event ID": "イベント",
};

export function localizeAdminMessage(message: string): string {
  if (translations[message]) return translations[message];
  const required = message.match(/^(?:This )?(.+) is required\.$/);
  if (required && fieldLabels[required[1]])
    return `${fieldLabels[required[1]]}は必須です。`;
  const duplicate = message.match(
    /^This (.+) is already registered\. Try a different one\.$/,
  );
  if (duplicate && fieldLabels[duplicate[1]])
    return `この${fieldLabels[duplicate[1]]}は既に登録されています。別の値を入力してください。`;
  const success = message.match(
    /^The (plan|event|schedule) has been (registered|updated|deleted) successfully\.$/,
  );
  if (success) {
    const category: Record<string, string> = {
      plan: "プラン",
      event: "イベント",
      schedule: "スケジュール",
    };
    const action: Record<string, string> = {
      registered: "登録",
      updated: "更新",
      deleted: "削除",
    };
    return `${category[success[1]]}を${action[success[2]]}しました。`;
  }
  return message;
}
