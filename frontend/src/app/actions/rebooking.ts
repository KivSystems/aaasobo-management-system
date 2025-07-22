"use server";

import { rebookClass } from "../helper/api/classesApi";
import { getUserSession } from "../helper/auth/sessionUtils";
import { revalidateCustomerCalendar } from "./revalidate";
import { validateSession } from "./validateSession";

export async function rebookClassWithValidation({
  customerId,
  classId,
  dateTime,
  instructorId,
  childrenIds,
  isAdminAuthenticated,
  language,
}: {
  customerId: number;
  classId: number;
  dateTime: string;
  instructorId: number;
  childrenIds: number[];
  isAdminAuthenticated?: boolean;
  language: LanguageType;
}) {
  const { isValid, error } = await validateSession(
    customerId,
    isAdminAuthenticated,
  );

  if (!isValid) {
    return { error };
  }

  const result = await rebookClass(classId, {
    dateTime,
    instructorId,
    customerId,
    childrenIds,
  });

  if (!result.success) {
    return { error: result.errorMessage[language] };
  }

  await revalidateCustomerCalendar(customerId, isAdminAuthenticated);

  return { success: true };
}
