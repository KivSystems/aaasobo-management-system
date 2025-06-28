"use server";

import { registerPlan } from "../helper/api/plansApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/messages/formValidation";
import { extractRegisterValidationErrors } from "../helper/utils/validationErrorUtils";
import { planRegisterSchema } from "../schemas/authSchema";
import { revalidatePlanList } from "./revalidate";
import { getCookie } from "../../middleware";

export async function registerContent(
  prevState: RegisterFormState | undefined,
  formData: FormData,
): Promise<RegisterFormState> {
  try {
    const name = formData.get("name");
    const weeklyClassTimes = Number(formData.get("weeklyClassTimes"));
    const description = formData.get("description");
    const categoryType = formData.get("categoryType");

    // Get the cookies from the request headers
    const cookie = await getCookie();

    let parsedForm;
    let response;

    switch (categoryType) {
      case "plan":
        parsedForm = planRegisterSchema.safeParse({
          name,
          weeklyClassTimes,
          description,
          cookie,
        });
        if (!parsedForm.success) {
          const validationErrors = parsedForm.error.errors;
          return extractRegisterValidationErrors(validationErrors);
        }

        response = await registerPlan({
          name: parsedForm.data.name,
          weeklyClassTimes: parsedForm.data.weeklyClassTimes,
          description: parsedForm.data.description,
          cookie,
        });

        // Refresh cached admin data for the admin list page
        await revalidatePlanList();

        return response;

      default:
        return {
          errorMessage: "Invalid category type.",
        };
    }
  } catch (error) {
    console.error("Unexpected error in registerContent server action:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
}
