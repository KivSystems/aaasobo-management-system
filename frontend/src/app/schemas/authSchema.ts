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
    passwordStrength: z.number(),
    prefecture: z.string().min(1, "Prefecture is required."),
    isAgreed: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the privacy policy." }),
    }),
    userType: z.enum(["admin", "customer", "instructor"], {
      message: "Invalid user type.",
    }),
  })
  .refine((data) => data.password === data.passConfirmation, {
    message: "Passwords do not match.",
    path: ["passConfirmation"],
  })
  .refine((data) => data.passwordStrength >= 3, {
    message:
      "Your password is too weak. Try using a longer passphrase or a password manager.",
    path: ["password"],
  });

export const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required."),
  nickname: z.string().min(1, "Nickname is required."),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .min(1, "Email is required."),
  classURL: z
    .string()
    .url("Invalid URL format.")
    .min(1, "Class URL is required."),
  // TODO: Display error message if URL does not start with http:// or https:// (GSS No.97)
  // .refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
  //   message: "URL must start with http:// or https://",
  // }),
  meetingId: z.string().min(1, "Meeting ID is required."),
  passcode: z.string().min(1, "Passcode is required."),
  introductionURL: z.string().url("Invalid URL format."),
  // TODO: Display error message if URL does not start with http:// or https:// (GSS No.97)
  // .refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
  //   message: "URL must start with http:// or https://",
  // }),
  userType: z.enum(["admin", "customer", "instructor"], {
    message: "Invalid user type.",
  }),
});

export const userLoginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .min(1, "Email is required."),
  password: z.string().min(8, "At least 8 characters long."),
  userType: z.enum(["admin", "customer", "instructor"], {
    message: "Invalid user type.",
  }),
});

export const userTypeSchema = z.enum(["admin", "customer", "instructor"]);
