import { z } from "zod";
import {
  ALPHABET_ONLY_MESSAGE,
  EMAIL_INVALID_MESSAGE,
  EMAIL_REQUIRED_MESSAGE,
  INVALID_DATE_MESSAGE,
  NAME_REQUIRED_MESSAGE,
  PASSWORD_MIN_LENGTH_MESSAGE,
  PASSWORD_WEAK_MESSAGE,
  PREFECTURE_REQUIRED_MESSAGE,
  PRIVACY_POLICY_AGREEMENT_MESSAGE,
  REQUIRED_MESSAGE,
} from "../helper/messages/authSchemas";

export const createCustomerRegisterSchema = (language: LanguageType) => {
  return z
    .object({
      name: z.string().min(1, NAME_REQUIRED_MESSAGE[language]),
      email: z
        .string()
        .email(EMAIL_INVALID_MESSAGE[language])
        .min(1, EMAIL_REQUIRED_MESSAGE[language]),
      password: z.string().min(8, PASSWORD_MIN_LENGTH_MESSAGE[language]),
      passwordStrength: z.number(),
      prefecture: z.string().min(1, PREFECTURE_REQUIRED_MESSAGE[language]),
      isAgreed: z.literal(true, {
        errorMap: () => ({
          message: PRIVACY_POLICY_AGREEMENT_MESSAGE[language],
        }),
      }),
    })
    .refine((data) => data.passwordStrength >= 3, {
      message: PASSWORD_WEAK_MESSAGE[language],
      path: ["password"],
    });
};

export const instructorRegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required."),
    nickname: z.string().min(1, "Nickname is required."),
    email: z
      .string()
      .email("Please enter a valid email address.")
      .min(1, "Email is required."),
    password: z.string().min(8, "At least 8 characters long."),
    passConfirmation: z.string(),
    passwordStrength: z.number(),
    icon: z
      .instanceof(File)
      .refine((file) => file.size > 0, {
        message: "Instructor profile image is required.",
      })
      .refine((file) => file.size <= 5 * 1024 * 1024, {
        message: "Instructor profile image must be less than 5MB.",
      })
      .refine((file) => ["image/png", "image/jpeg"].includes(file.type), {
        message: "Only JPG and PNG files are allowed.",
      }),
    classURL: z
      .string()
      .url("Invalid URL format.")
      .min(1, "Class URL is required.")
      .refine(
        (url) => url.startsWith("http://") || url.startsWith("https://"),
        {
          message: "URL must start with http:// or https://",
        },
      ),
    meetingId: z.string().min(1, "Meeting ID is required."),
    passcode: z.string().min(1, "Passcode is required."),
    introductionURL: z
      .string()
      .url("Invalid URL format.")
      .min(1, "Introduction URL is required.")
      .refine(
        (url) => url.startsWith("http://") || url.startsWith("https://"),
        {
          message: "URL must start with http:// or https://",
        },
      ),
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

export const adminRegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required."),
    email: z
      .string()
      .email("Please enter a valid email address.")
      .min(1, "Email is required."),
    password: z.string().min(8, "At least 8 characters long."),
    passConfirmation: z.string(),
    passwordStrength: z.number(),
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

export const planRegisterSchema = z.object({
  name: z.string().min(1, "Plan Name is required."),
  weeklyClassTimes: z.number(),
  description: z.string().min(1, "Description is required."),
});

export const eventRegisterSchema = z.object({
  name: z.string().min(1, "Event Name is required."),
  color: z.string().min(1, "Color Code is required."),
});

export const eventUpdateSchema = z.object({
  name: z.string().min(1, "Event Name is required."),
  color: z.string().min(1, "Color Code is required."),
});

export const scheduleUpdateSchema = z.object({
  eventId: z
    .number({
      required_error: "Event ID must be a number.",
      invalid_type_error: "Please select one event.",
    })
    .min(0, "Event ID is required."),
});

export const instructorUpdateSchema = z.object({
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

export const instructorUpdateSchemaWithIcon = z.object({
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
  icon: z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: "Instructor profile image is required.",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Instructor profile image must be less than 5MB.",
    })
    .refine((file) => ["image/png", "image/jpeg"].includes(file.type), {
      message: "Only JPG and PNG files are allowed.",
    }),
});

export const adminUpdateSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .min(1, "Email is required."),
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

export const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email format" }),
  userType: z.enum(["admin", "customer", "instructor"], {
    message: "We couldn't verify the user type. Please try again later.",
  }),
});

export const forgotPasswordFormSchemaJa = z.object({
  email: z
    .string()
    .min(1, { message: "メールアドレスを入力してください。" })
    .email({ message: "メールアドレスの形式が正しくありません。" }),
  userType: z.enum(["admin", "customer", "instructor"], {
    message:
      "ユーザータイプを確認できませんでした。時間をおいて、もう一度お試しください。",
  }),
});

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
    passConfirmation: z.string(),
    passwordStrength: z.number(),
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

export const resetPasswordFormSchemaJa = z
  .object({
    token: z
      .string()
      .min(1, { message: "トークンが見つかりません。" })
      .uuid({ message: "無効なトークンです。" }),
    userType: z.enum(["admin", "customer", "instructor"], {
      message: "無効なユーザータイプです。",
    }),
    password: z.string().min(8, { message: "8文字以上で入力してください。" }),
    passConfirmation: z.string(),
    passwordStrength: z.number(),
  })
  .refine((data) => data.password === data.passConfirmation, {
    message: "パスワードが一致しません。",
    path: ["passConfirmation"],
  })
  .refine((data) => data.passwordStrength >= 3, {
    message: "パスワードの安全性が低過ぎます。",
    path: ["password"],
  });

export const createBirthdateSchema = (errorMessage: string) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, errorMessage)
    .refine((val) => {
      const [y, m, d] = val.split("-").map(Number);

      if (y.toString().length !== 4 || m === 0 || d === 0) return false;

      const date = new Date(y, m - 1, d);

      const today = new Date();

      const isValidDate =
        date.getFullYear() === y &&
        date.getMonth() + 1 === m &&
        date.getDate() === d;

      if (!isValidDate || date > today) return false;

      return true;
    }, errorMessage);

export const createChildRegisterSchema = (language: LanguageType) => {
  return z.object({
    name: z
      .string()
      .min(1, REQUIRED_MESSAGE[language])
      .regex(/^[A-Za-z\s]+$/, { message: ALPHABET_ONLY_MESSAGE[language] }),
    birthdate: createBirthdateSchema(INVALID_DATE_MESSAGE[language]),
    personalInfo: z.string().min(1, REQUIRED_MESSAGE[language]),
  });
};
