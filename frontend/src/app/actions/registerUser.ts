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
} from "../schemas/authSchema";
import { revalidateAdminList } from "./revalidate";

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
    const icon = formData.get("icon") as File;
    const classURL = formData.get("classURL");
    const meetingId = formData.get("meetingId");
    const passcode = formData.get("passcode");
    const introductionURL = formData.get("introductionURL");
    const passwordStrength = parseInt(
      formData.get("passwordStrength") as string,
      10,
    );
    const userType = formData.get("userType");

    let parsedForm;
    let response;

    switch (userType) {
      case "customer":
        parsedForm = customerRegisterSchema.safeParse({
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
          return extractRegisterValidationErrors(validationErrors);
        }
        response = await registerCustomer({
          name: parsedForm.data.name,
          email: parsedForm.data.email,
          password: parsedForm.data.password,
          prefecture: parsedForm.data.prefecture,
        });
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
        const userData = new FormData();
        userData.append("name", parsedForm.data.name);
        userData.append("nickname", parsedForm.data.nickname);
        userData.append("email", parsedForm.data.email);
        userData.append("password", parsedForm.data.password);
        userData.append("icon", parsedForm.data.icon);
        userData.append("classURL", parsedForm.data.classURL);
        userData.append("meetingId", parsedForm.data.meetingId);
        userData.append("passcode", parsedForm.data.passcode);
        userData.append("introductionURL", parsedForm.data.introductionURL);
        response = await registerInstructor(userData);
        // TODO: Add revalidation logic for instructor list
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
        });
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
