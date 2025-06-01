import { z } from "zod";

export const customerProfileSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .min(1, "Email is required."),
  prefecture: z.string().min(1, "Prefecture is required."),
});

export const customerProfileSchemaJa = z.object({
  name: z.string().min(1, "名前は必須項目です。"),
  email: z
    .string()
    .email("有効なメールアドレスを入力してください。")
    .min(1, "メールアドレスは必須項目です。"),
  prefecture: z.string().min(1, "都道府県は必須項目です。"),
});
