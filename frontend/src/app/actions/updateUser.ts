"use server";

import { updateAdmin } from "@/app/helper/api/adminsApi";
import { updateInstructor } from "@/app/helper/api/instructorsApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/messages/formValidation";
import { extractUpdateValidationErrors } from "../helper/utils/validationErrorUtils";
import {
  adminUpdateSchema,
  instructorUpdateSchema,
} from "../schemas/authSchema";
import { revalidateAdminList, revalidateInstructorList } from "./revalidate";
import {
  customerProfileSchema,
  customerProfileSchemaJa,
} from "../schemas/customerDashboardSchemas.ts";
import { updateCustomerProfile } from "../helper/api/customersApi";

export async function updateAdminAction(
  prevState: UpdateFormState | undefined,
  formData: FormData,
): Promise<UpdateFormState> {
  try {
    const name = formData.get("name");
    const email = formData.get("email");
    // Hidden input tag fields
    const id = Number(formData.get("id"));

    const parsedForm = adminUpdateSchema.safeParse({
      name,
      email,
    });

    if (!parsedForm.success) {
      const validationErrors = parsedForm.error.errors;
      return extractUpdateValidationErrors(validationErrors);
    }

    const response = await updateAdmin(
      id,
      parsedForm.data.name,
      parsedForm.data.email,
    );

    // Refresh cached admin data for the admin list page
    revalidateAdminList();

    return response;
  } catch (error) {
    console.error("Unexpected error in updateUser server action:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
}

export async function updateInstructorAction(
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
    const icon = String(formData.get("icon"));

    const parsedForm = instructorUpdateSchema.safeParse({
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

    const response = await updateInstructor(
      id,
      parsedForm.data.name,
      parsedForm.data.email,
      parsedForm.data.classURL,
      icon,
      parsedForm.data.nickname,
      parsedForm.data.meetingId,
      parsedForm.data.passcode,
      parsedForm.data.introductionURL,
    );

    // Refresh cached instructor data for the instructor list page
    revalidateInstructorList();

    return response;
  } catch (error) {
    console.error("Unexpected error in updateUser server action:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
}

export async function updateCustomerProfileAction(
  prevState: UpdateFormState | undefined,
  formData: FormData,
): Promise<UpdateFormState> {
  const name = formData.get("name");
  const email = formData.get("email");
  const prefecture = formData.get("prefecture");
  // Hidden input tag fields
  const id = Number(formData.get("id"));
  const oldName = formData.get("oldName");
  const oldEmail = formData.get("oldEmail");
  const oldPrefecture = formData.get("oldPrefecture");
  const language = formData.get("language") as LanguageType;

  const schema =
    language === "ja" ? customerProfileSchemaJa : customerProfileSchema;

  // Check if there are any changes
  if (name === oldName && email === oldEmail && prefecture === oldPrefecture) {
    return {
      errorMessage:
        language === "ja"
          ? "変更された項目がありません。"
          : "No changes were made.",
    };
  }

  const parsedForm = schema.safeParse({
    name,
    email,
    prefecture,
  });

  if (!parsedForm.success) {
    const validationErrors = parsedForm.error.errors;
    return extractUpdateValidationErrors(validationErrors);
  }

  const responseMessage = await updateCustomerProfile(
    id,
    parsedForm.data.name,
    parsedForm.data.email,
    parsedForm.data.prefecture,
  );

  // TODO: RevalidatePath

  return responseMessage;
}
