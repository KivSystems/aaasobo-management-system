"use server";

import { registerPlan } from "../helper/api/plansApi";
import { registerEvent } from "../helper/api/eventsApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/messages/formValidation";
import { extractRegisterValidationErrors } from "../helper/utils/validationErrorUtils";
import { planRegisterSchema, eventRegisterSchema } from "../schemas/authSchema";
import { revalidatePlanList, revalidateEventList } from "./revalidate";
import { getCookie } from "../../proxy";

export async function registerContent(
  prevState: RegisterFormState | undefined,
  formData: FormData,
): Promise<RegisterFormState> {
  try {
    const planNameEng = formData.get("planNameEng");
    const planNameJpn = formData.get("planNameJpn");
    const eventNameEng = formData.get("eventNameEng");
    const eventNameJpn = formData.get("eventNameJpn");
    const weeklyClassTimes = Number(formData.get("weeklyClassTimes"));
    const color = formData.get("color");
    const description = formData.get("description");
    const categoryType = formData.get("categoryType");
    const isNative = formData.get("isNative");

    // Get the cookies from the request headers
    const cookie = await getCookie();

    let parsedForm;
    let response;

    switch (categoryType) {
      case "plan":
        parsedForm = planRegisterSchema.safeParse({
          planNameEng,
          planNameJpn,
          weeklyClassTimes,
          description,
          isNative,
        });
        if (!parsedForm.success) {
          const validationErrors = parsedForm.error.issues;
          return extractRegisterValidationErrors(validationErrors);
        }

        const isNativeStr = parsedForm.data.isNative ? "true" : "false";

        response = await registerPlan({
          planNameEng: parsedForm.data.planNameEng,
          planNameJpn: parsedForm.data.planNameJpn,
          weeklyClassTimes: parsedForm.data.weeklyClassTimes,
          description: parsedForm.data.description,
          isNative: isNativeStr,
          cookie,
        });

        // Refresh cached admin data for the admin list page
        await revalidatePlanList();

        return response;

      case "event":
        parsedForm = eventRegisterSchema.safeParse({
          eventNameEng,
          eventNameJpn,
          color,
        });
        if (!parsedForm.success) {
          const validationErrors = parsedForm.error.issues;
          return extractRegisterValidationErrors(validationErrors);
        }

        response = await registerEvent({
          eventNameJpn: parsedForm.data.eventNameJpn,
          eventNameEng: parsedForm.data.eventNameEng,
          color: parsedForm.data.color,
          cookie,
        });

        // Refresh cached admin data for the admin list page
        await revalidateEventList();

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
