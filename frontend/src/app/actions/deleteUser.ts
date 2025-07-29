"use server";

import { deleteAdmin } from "@/app/helper/api/adminsApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/messages/formValidation";
import { revalidateAdminList } from "./revalidate";
import { getCookie } from "../../middleware";
import { getUserSession } from "../helper/auth/sessionUtils";
import { LOGIN_REQUIRED_MESSAGE } from "../helper/messages/customerDashboard";
import { deleteChild } from "../helper/api/childrenApi";
import { revalidatePath } from "next/cache";

export async function deleteAdminAction(
  prevState: DeleteFormState | undefined,
  formData: FormData,
): Promise<DeleteFormState> {
  try {
    // Hidden input tag field
    const id = Number(formData.get("id"));

    // Get the cookies from the request headers
    const cookie = await getCookie();

    // Delete the admin using the API
    const response = await deleteAdmin(id, cookie);

    // Refresh cached admin data for the admin list page
    revalidateAdminList();

    return response;
  } catch (error) {
    console.error("Unexpected error in deleteUser server action:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
}

export async function deleteChildProfileAction(
  childId: number,
  customerId: number,
): Promise<LocalizedMessages> {
  const session = await getUserSession();

  if (!session || session.user.userType === "instructor") {
    return { errorMessage: LOGIN_REQUIRED_MESSAGE };
  }

  const loggedInUserId = Number(session.user.id);
  const loggedInUserType = session.user.userType;

  if (loggedInUserType === "customer" && loggedInUserId !== customerId) {
    return { errorMessage: LOGIN_REQUIRED_MESSAGE };
  }

  const resultMessage = await deleteChild(childId);

  const path =
    loggedInUserType === "admin"
      ? `/admins/${loggedInUserId}/customer-list/${customerId}`
      : `/customers/${loggedInUserId}/children-profiles`;

  revalidatePath(path);

  return resultMessage;
}
