"use server";

import { registerCustomer } from "../helper/api/customersApi";
import { registerInstructor } from "../helper/api/instructorsApi";
import { registerAdmin } from "../helper/api/adminsApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/messages/formValidation";
import { extractRegisterValidationErrors } from "../helper/utils/validationErrorUtils";
import {
  customerRegisterSchema,
  instructorRegisterSchema,
  adminRegisterSchema,
  customerRegisterSchemaJa,
} from "../schemas/authSchema";
import { revalidateInstructorList, revalidateAdminList } from "./revalidate";
import { getCookie } from "../../middleware";

export async function registerUser(
  prevState: RegisterFormState | undefined,
  formData: FormData,
): Promise<RegisterFormState> {
  try {
    const name = formData.get("name");
    const nickname = formData.get("nickname");
    const email = formData.get("email");
    const password = formData.get("password");
    const passConfirmation = formData.get("passConfirmation");
    const prefecture = formData.get("prefecture");
    const isAgreed = formData.get("isAgreed") === "on";
    const icon = formData.get("icon");
    const classURL = formData.get("classURL");
    const meetingId = formData.get("meetingId");
    const passcode = formData.get("passcode");
    const introductionURL = formData.get("introductionURL");
    const passwordStrength = parseInt(
      formData.get("passwordStrength") as string,
      10,
    );
    const userType = formData.get("userType");
    const language = formData.get("language") as LanguageType;

    // Get the cookies from the request headers
    const cookie = await getCookie();

    let parsedForm;
    let response;

    switch (userType) {
      case "customer":
        const schema =
          language === "ja" ? customerRegisterSchemaJa : customerRegisterSchema;

        parsedForm = schema.safeParse({
          name,
          email,
          password,
          passConfirmation,
          passwordStrength,
          prefecture,
          isAgreed,
          userType,
        });
        if (!parsedForm.success) {
          const validationErrors = parsedForm.error.errors;
          return extractRegisterValidationErrors(validationErrors, language);
        }
        response = await registerCustomer(
          {
            name: parsedForm.data.name,
            email: parsedForm.data.email,
            password: parsedForm.data.password,
            prefecture: parsedForm.data.prefecture,
          },
          language,
        );
        return response;

      case "instructor":
        parsedForm = instructorRegisterSchema.safeParse({
          name,
          nickname,
          email,
          password,
          passConfirmation,
          passwordStrength,
          icon,
          classURL,
          meetingId,
          passcode,
          introductionURL,
          userType,
        });
        if (!parsedForm.success) {
          const validationErrors = parsedForm.error.errors;
          return extractRegisterValidationErrors(validationErrors);
        }

        response = await registerInstructor({
          name: parsedForm.data.name,
          nickname: parsedForm.data.nickname,
          email: parsedForm.data.email,
          password: parsedForm.data.password,
          icon: parsedForm.data.icon,
          classURL: parsedForm.data.classURL,
          meetingId: parsedForm.data.meetingId,
          passcode: parsedForm.data.passcode,
          introductionURL: parsedForm.data.introductionURL,
          cookie,
        });

        // Refresh cached instructor data for the instructor list page
        revalidateInstructorList();

        return response;

      case "admin":
        parsedForm = adminRegisterSchema.safeParse({
          name,
          email,
          password,
          passConfirmation,
          passwordStrength,
          userType,
        });
        if (!parsedForm.success) {
          const validationErrors = parsedForm.error.errors;
          return extractRegisterValidationErrors(validationErrors);
        }

        response = await registerAdmin({
          name: parsedForm.data.name,
          email: parsedForm.data.email,
          password: parsedForm.data.password,
          cookie,
        });

        // Refresh cached admin data for the admin list page
        await revalidateAdminList();

        return response;

      default:
        return {
          errorMessage: "Invalid user type.",
        };
    }
  } catch (error) {
    console.error("Unexpected error in registerUser server action:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
}
