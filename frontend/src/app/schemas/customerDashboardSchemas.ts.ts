import { z } from "zod";
import { createBirthdateSchema } from "./authSchema";

export const customerProfileSchema = z.object({
  name: z.string().min(1, "名前は必須項目です。 / Name is required."),
  email: z
    .string()
    .email(
      "有効なメールアドレスを入力してください。 / Please enter a valid email address.",
    )
    .min(1, "メールアドレスは必須項目です。 / Email is required."),
  prefecture: z
    .string()
    .min(1, "都道府県は必須項目です。 / Prefecture is required."),
});

export const childProfileSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須項目です。 / Name is required.")
    .regex(
      /^[A-Za-z\s]+$/,
      "ローマ字（英字）のみ使用してください。 / Only English letters are allowed.",
    ),
  birthdate: createBirthdateSchema(
    "日付が正しくありません。もう一度ご確認ください。 / The date is incorrect. Please check it again.",
  ),
  personalInfo: z
    .string()
    .min(1, "プロフィールは必須項目です。 / Profile is required."),
});
