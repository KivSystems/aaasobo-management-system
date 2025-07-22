"use server";

import { registerInstructor } from "../helper/api/instructorsApi";
import { registerAdmin } from "../helper/api/adminsApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/messages/formValidation";
import { extractRegisterValidationErrors } from "../helper/utils/validationErrorUtils";
import {
  instructorRegisterSchema,
  adminRegisterSchema,
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

    // Get the cookies from the request headers
    const cookie = await getCookie();

    let parsedForm;
    let response;

    switch (userType) {
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
        response = await registerInstructor(userData, cookie);

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
