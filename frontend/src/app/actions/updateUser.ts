"use server";

import {
  updateInstructor,
  updateInstructorWithIcon,
} from "@/app/helper/api/instructorsApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/messages/formValidation";
import { extractUpdateValidationErrors } from "../helper/utils/validationErrorUtils";
import {
  userUpdateSchema,
  userUpdateSchemaWithIcon,
} from "../schemas/authSchema";

export async function updateUser(
  prevState: UpdateFormState | undefined,
  formData: FormData,
): Promise<UpdateFormState> {
  try {
    const name = formData.get("name");
    const nickname = formData.get("nickname");
    const email = formData.get("email");
    const classURL = formData.get("classURL");
    const meetingId = formData.get("meetingId");
    const passcode = formData.get("passcode");
    const introductionURL = formData.get("introductionURL");
    // Hidden input tag fields
    const userType = formData.get("userType");
    const id = Number(formData.get("id"));
    const icon = formData.get("icon") as File;

    // If the icon file is empty, update the instructor data without icon.
    if (icon.name === "undefined") {
      const parsedForm = userUpdateSchema.safeParse({
        name,
        nickname,
        email,
        classURL,
        meetingId,
        passcode,
        introductionURL,
        userType,
      });

      if (!parsedForm.success) {
        const validationErrors = parsedForm.error.errors;
        return extractUpdateValidationErrors(validationErrors);
      }

      // TODO: If this component handles different user types,
      // the appropriate API function must be called for each based on the userType.

      const response = await updateInstructor(
        id,
        parsedForm.data.name,
        parsedForm.data.email,
        parsedForm.data.classURL,
        parsedForm.data.nickname,
        parsedForm.data.meetingId,
        parsedForm.data.passcode,
        parsedForm.data.introductionURL,
      );

      return response;
    } else {
      // If the icon file is not empty, update the instructor data with icon.
      const parsedForm = userUpdateSchemaWithIcon.safeParse({
        name,
        nickname,
        email,
        classURL,
        meetingId,
        passcode,
        introductionURL,
        userType,
        icon,
      });

      if (!parsedForm.success) {
        const validationErrors = parsedForm.error.errors;
        return extractUpdateValidationErrors(validationErrors);
      }

      const userData = new FormData();
      userData.append("name", parsedForm.data.name);
      userData.append("nickname", parsedForm.data.nickname);
      userData.append("email", parsedForm.data.email);
      userData.append("icon", parsedForm.data.icon);
      userData.append("classURL", parsedForm.data.classURL);
      userData.append("meetingId", parsedForm.data.meetingId);
      userData.append("passcode", parsedForm.data.passcode);
      userData.append("introductionURL", parsedForm.data.introductionURL);
      const response = await updateInstructorWithIcon(id, userData);

      return response;
    }
  } catch (error) {
    console.error("Unexpected error in updateUser server action:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
}
