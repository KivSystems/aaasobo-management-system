"use server";

import { updateEvent } from "@/app/helper/api/eventsApi";
import { updateBusinessSchedule } from "@/app/helper/api/calendarsApi";
import { GENERAL_ERROR_MESSAGE } from "../helper/messages/formValidation";
import { extractUpdateValidationErrors } from "../helper/utils/validationErrorUtils";
import {
  eventUpdateSchema,
  generateClassesSchema,
  scheduleUpdateSchema,
} from "../schemas/authSchema";
import { revalidateEventList, revalidateBusinessSchedule } from "./revalidate";
import { getCookie } from "../../middleware";
import { validateSession } from "./validateSession";
import {
  generateClasses,
  updateAttendance,
  updateClassStatus,
} from "../helper/api/classesApi";
import { revalidatePath } from "next/cache";

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

export async function updateAttendanceAction(
  classId: number,
  childrenIds: number[],
  instructorId: number,
  isAdminAuthenticated: boolean,
  adminId?: number,
): Promise<{ success: boolean; message: string }> {
  const userId = isAdminAuthenticated ? adminId : instructorId;

  const { isValid, error } = await validateSession(
    userId,
    isAdminAuthenticated,
  );

  if (!isValid) {
    return { success: false, message: error! };
  }

  const result = await updateAttendance(classId, childrenIds);

  if (!result.success)
    return {
      success: false,
      message:
        "Failed to update attendance. Please try again later. If the problem persists, contact the staff.",
    };

  const path = isAdminAuthenticated
    ? `/admins/${userId}/instructor-list/${instructorId}/class-schedule`
    : `/instructors/${userId}/class-schedule`;

  revalidatePath(path);

  return { success: true, message: "Attendance updated successfully." };
}

export async function updateClassStatusAction(
  classId: number,
  status: ClassStatus,
  instructorId: number,
  isAdminAuthenticated: boolean,
  adminId?: number,
): Promise<{ success: boolean; message: string }> {
  const userId = isAdminAuthenticated ? adminId : instructorId;

  const { isValid, error } = await validateSession(
    userId,
    isAdminAuthenticated,
  );

  if (!isValid) {
    return { success: false, message: error! };
  }

  const result = await updateClassStatus(classId, status);

  if (!result.success)
    return {
      success: false,
      message: isAdminAuthenticated
        ? "Failed to update class status. Please try again later."
        : "Failed to complete the class. Please try again later. If the problem persists, contact the staff.",
    };

  const path = isAdminAuthenticated
    ? `/admins/${userId}/instructor-list/${instructorId}/class-schedule`
    : `/instructors/${userId}/class-schedule`;

  revalidatePath(path);

  return {
    success: true,
    message: isAdminAuthenticated
      ? "Class status updated successfully."
      : "Class completed successfully.",
  };
}

export async function generateClassesAction(
  prevState: UpdateFormState | undefined,
  formData: FormData,
): Promise<UpdateFormState> {
  try {
    const yearMonth = String(formData.get("yearMonth"));
    const [month, year] = yearMonth.split(" ");

    const parsedForm = generateClassesSchema.safeParse({
      year,
      month,
    });

    if (!parsedForm.success) {
      const fieldErrors = parsedForm.error.flatten().fieldErrors;
      const firstError =
        fieldErrors.year?.[0] || fieldErrors.month?.[0] || "Validation failed.";
      return {
        isSuccess: false,
        errorMessage: firstError,
      };
    }

    // Get the cookies from the request headers
    const cookie = await getCookie();

    // Update the business schedule
    await generateClasses(year, month, cookie);

    return {
      isSuccess: true,
      successMessage: "Classes generated successfully!",
      errorMessage: "",
    };
  } catch (error) {
    console.error("Unexpected error in updateContent server action:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
}
