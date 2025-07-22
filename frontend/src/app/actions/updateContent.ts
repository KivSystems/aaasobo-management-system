"use server";

import { updateEvent } from "@/app/helper/api/eventsApi";
import { updateBusinessSchedule } from "@/app/helper/api/calendarsApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/messages/formValidation";
import { extractUpdateValidationErrors } from "../helper/utils/validationErrorUtils";
import { eventUpdateSchema, scheduleUpdateSchema } from "../schemas/authSchema";
import { revalidateEventList, revalidateBusinessSchedule } from "./revalidate";
import { getCookie } from "../../middleware";

export async function updateEventAction(
  prevState: UpdateFormState | undefined,
  formData: FormData,
): Promise<UpdateFormState> {
  try {
    const name = formData.get("eventName");
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

export async function updateScheduleAction(
  prevState: UpdateFormState | undefined,
  formData: FormData,
): Promise<UpdateFormState> {
  try {
    const startDate = String(formData.get("startDate"));
    const endDate = String(formData.get("endDate")) || undefined;
    const eventId = Number(formData.get("eventId"));

    const parsedForm = scheduleUpdateSchema.safeParse({
      eventId,
    });

    if (!parsedForm.success) {
      const validationErrors = parsedForm.error.errors;
      return extractUpdateValidationErrors(validationErrors);
    }

    // Get the cookies from the request headers
    const cookie = await getCookie();

    // Update the business schedule
    const response = await updateBusinessSchedule(
      eventId,
      startDate,
      endDate,
      cookie,
    );

    // Refresh cached schedule data for the business calendar page
    revalidateBusinessSchedule();

    return response;
  } catch (error) {
    console.error("Unexpected error in updateContent server action:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
}
