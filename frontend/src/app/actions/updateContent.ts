"use server";

import { updateEvent } from "@/app/helper/api/eventsApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/messages/formValidation";
import { extractUpdateValidationErrors } from "../helper/utils/validationErrorUtils";
import { eventUpdateSchema } from "../schemas/authSchema";
import { revalidateEventList } from "./revalidate";
import { getCookie } from "../../middleware";

export async function updateEventAction(
  prevState: UpdateFormState | undefined,
  formData: FormData,
): Promise<UpdateFormState> {
  try {
    const name = formData.get("name");
    const color = formData.get("color");
    // Hidden input tag fields
    const id = Number(formData.get("id"));

    const parsedForm = eventUpdateSchema.safeParse({
      name,
      color,
    });

    if (!parsedForm.success) {
      const validationErrors = parsedForm.error.errors;
      return extractUpdateValidationErrors(validationErrors);
    }

    // Get the cookies from the request headers
    const cookie = await getCookie();

    const response = await updateEvent(
      id,
      parsedForm.data.name,
      parsedForm.data.color,
      cookie,
    );

    // Refresh cached event data for the event list page
    revalidateEventList();

    return response;
  } catch (error) {
    console.error("Unexpected error in updateContent server action:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
}
