import { z } from "zod";

export const customerRegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required."),
    email: z
      .string()
      .email("Please enter a valid email address.")
      .min(1, "Email is required."),
    password: z.string().min(8, "At least 8 characters long."),
    passConfirmation: z.string(),
    prefecture: z.string().min(1, "Prefecture is required."),
    isAgreed: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the privacy policy." }),
    }),
  })
  .refine((data) => data.password === data.passConfirmation, {
    message: "Passwords do not match.",
    path: ["passConfirmation"],
  });

export const userLoginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .min(1, "Email is required."),
  password: z.string().min(8, "At least 8 characters long."),
});

export const userTypeSchema = z.enum(["admin", "customer", "instructor"]);

export const emailSchema = z
  .string()
  .min(1, { message: "Email is required" })
  .email({ message: "Invalid email format" });

export const resetPasswordFormSchema = z
  .object({
    token: z
      .string()
      .min(1, { message: "Token not found." })
      .uuid({ message: "Invalid token." }),
    userType: z.enum(["admin", "customer", "instructor"], {
      message: "Invalid user type.",
    }),
    password: z.string().min(8, { message: "At least 8 characters long." }),
    passwordConfirmation: z.string(),
    passwordStrength: z.number(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  })
  .refine((data) => data.passwordStrength >= 3, {
    message:
      "Your password is too weak. Try using a longer passphrase or a password manager.",
    path: ["password"],
  });
