import { z } from "zod";

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
