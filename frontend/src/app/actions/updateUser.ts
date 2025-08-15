"use server";

import { updateAdmin } from "@/app/helper/api/adminsApi";
import {
  updateInstructor,
  updateInstructorWithIcon,
} from "@/app/helper/api/instructorsApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/messages/formValidation";
import {
  extractProfileUpdateErrors,
  extractUpdateValidationErrors,
} from "../helper/utils/validationErrorUtils";
import {
  adminUpdateSchema,
  instructorUpdateSchema,
  instructorUpdateSchemaWithIcon,
} from "../schemas/authSchema";
import { revalidateAdminList, revalidateInstructorList } from "./revalidate";
import { getCookie } from "../../middleware";
import {
  childProfileSchema,
  customerProfileSchema,
} from "../schemas/customerDashboardSchemas.ts";
import { updateCustomerProfile } from "../helper/api/customersApi";
import { revalidatePath } from "next/cache";
import {
  LOGIN_REQUIRED_MESSAGE,
  NO_CHANGES_MADE_MESSAGE,
} from "../helper/messages/customerDashboard";
import { getUserSession } from "@/app/helper/auth/sessionUtils";
import { addChild, updateChildProfile } from "../helper/api/childrenApi";

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

    // Get the cookies from the request headers
    const cookie = await getCookie();

    const response = await updateAdmin(
      id,
      parsedForm.data.name,
      parsedForm.data.email,
      cookie,
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
    const birthdate = String(formData.get("birthdate"));
    const workingTime = String(formData.get("workingTime"));
    const lifeHistory = String(formData.get("lifeHistory"));
    const favoriteFood = String(formData.get("favoriteFood"));
    const hobby = String(formData.get("hobby"));
    const messageForChildren = String(formData.get("messageForChildren"));
    const skill = String(formData.get("skill"));
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

      // Get the cookies from the request headers
      const cookie = await getCookie();

      // Call the API to update the instructor data
      const response = await updateInstructor(
        id,
        parsedForm.data.name,
        parsedForm.data.nickname,
        birthdate,
        workingTime,
        lifeHistory,
        favoriteFood,
        hobby,
        messageForChildren,
        skill,
        parsedForm.data.email,
        parsedForm.data.classURL,
        parsedForm.data.meetingId,
        parsedForm.data.passcode,
        parsedForm.data.introductionURL,
      );

      // Refresh cached instructor data for the instructor list page
      revalidateInstructorList();

      return response;
    } else {
      // If the icon file is not empty, update the instructor data with icon.
      const parsedForm = instructorUpdateSchemaWithIcon.safeParse({
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

export async function updateCustomerProfileAction(
  prevState: LocalizedMessages | undefined,
  formData: FormData,
): Promise<LocalizedMessages> {
  const updatedName = formData.get("name");
  const updatedEmail = formData.get("email");
  const updatedPrefecture = formData.get("prefecture");
  // Hidden input tag fields
  const currentName = formData.get("currentName");
  const currentEmail = formData.get("currentEmail");
  const currentPrefecture = formData.get("currentPrefecture");
  const id = Number(formData.get("id")); // The form includes "id" (customer ID) only when submitted by an admin.

  let customerId;

  // If "id" is present (only submitted by an admin), use it as the customerId.
  // Otherwise, retrieve the customer ID from the session for security.
  if (id) {
    customerId = id;
  } else {
    const session = await getUserSession("customer");

    if (!session) {
      throw new Error("Unauthorized / 認証されていません");
    }

    customerId = Number(session.user.id);
  }

  // Get the admin ID from the session if the action is admin authenticated
  const session = await getUserSession("admin");
  const adminId = session?.user.id ? parseInt(session.user.id) : undefined;

  // Check if there are any changes
  if (
    updatedName === currentName &&
    updatedEmail === currentEmail &&
    updatedPrefecture === currentPrefecture
  ) {
    return {
      errorMessage: NO_CHANGES_MADE_MESSAGE,
    };
  }

  const parsedForm = customerProfileSchema.safeParse({
    name: updatedName,
    email: updatedEmail,
    prefecture: updatedPrefecture,
  });

  if (!parsedForm.success) {
    const validationErrors = parsedForm.error.errors;
    return extractProfileUpdateErrors(validationErrors);
  }

  const updateResultMessage = await updateCustomerProfile(
    customerId,
    parsedForm.data.name,
    parsedForm.data.email,
    parsedForm.data.prefecture,
  );

  const path = id
    ? `/admins/${adminId}/customer-list/${customerId}`
    : `/customers/${customerId}/profile`;

  revalidatePath(path);

  return updateResultMessage;
}

export async function updateChildProfileAction(
  prevState: LocalizedMessages | undefined,
  formData: FormData,
): Promise<LocalizedMessages> {
  const name = formData.get("name");
  const birthdate = formData.get("birthdate");
  const personalInfo = formData.get("personalInfo");
  // Hidden input tag fields
  const id = Number(formData.get("id"));
  const customerIdFromForm = Number(formData.get("customerId")); // The form includes "customerId" only when submitted by an admin.

  const session = await getUserSession();

  if (!session || session.user.userType === "instructor") {
    return { errorMessage: LOGIN_REQUIRED_MESSAGE };
  }

  const loggedInUserId = Number(session.user.id);
  const loggedInUserType = session.user.userType;

  const customerId =
    loggedInUserType === "customer" ? loggedInUserId : customerIdFromForm;

  const parsedForm = childProfileSchema.safeParse({
    name,
    birthdate,
    personalInfo,
  });

  if (!parsedForm.success) {
    const validationErrors = parsedForm.error.errors;
    return extractProfileUpdateErrors(validationErrors);
  }

  const updateResultMessage = await updateChildProfile(
    id,
    parsedForm.data.name,
    parsedForm.data.birthdate,
    parsedForm.data.personalInfo,
    customerId,
  );

  const path =
    loggedInUserType === "admin"
      ? `/admins/${loggedInUserId}/customer-list/${customerId}`
      : `/customers/${loggedInUserId}/children-profiles`;

  revalidatePath(path);

  return updateResultMessage;
}

export async function addChildProfileAction(
  prevState: LocalizedMessages | undefined,
  formData: FormData,
): Promise<LocalizedMessages> {
  const name = formData.get("name");
  const birthdate = formData.get("birthdate");
  const personalInfo = formData.get("personalInfo");
  // Hidden input tag fields
  const customerIdFromForm = Number(formData.get("customerId")); // The form includes "customerId" only when submitted by an admin.

  const session = await getUserSession();

  if (!session || session.user.userType === "instructor") {
    return { errorMessage: LOGIN_REQUIRED_MESSAGE };
  }

  const loggedInUserId = Number(session.user.id);
  const loggedInUserType = session.user.userType;

  const customerId =
    loggedInUserType === "customer" ? loggedInUserId : customerIdFromForm;

  const parsedForm = childProfileSchema.safeParse({
    name,
    birthdate,
    personalInfo,
  });

  if (!parsedForm.success) {
    const validationErrors = parsedForm.error.errors;
    return extractProfileUpdateErrors(validationErrors);
  }

  const resultMessage = await addChild(
    parsedForm.data.name,
    parsedForm.data.birthdate,
    parsedForm.data.personalInfo,
    customerId,
  );

  const path =
    loggedInUserType === "admin"
      ? `/admins/${loggedInUserId}/customer-list/${customerId}`
      : `/customers/${loggedInUserId}/children-profiles`;

  revalidatePath(path);

  return resultMessage;
}
