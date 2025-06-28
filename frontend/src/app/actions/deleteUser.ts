"use server";

import { deleteAdmin } from "@/app/helper/api/adminsApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/messages/formValidation";
import { revalidateAdminList } from "./revalidate";
import { getCookie } from "../../middleware";

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
