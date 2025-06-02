"use server";

import { revalidatePath } from "next/cache";
import { cancelClass, cancelClasses } from "../helper/api/classesApi";

export const cancelSelectedClasses = async (
  classesToCancel: number[],
  isAdminAuthenticated: boolean | undefined,
  customerId: number,
) => {
  const path = isAdminAuthenticated
    ? `/admins/customer-list/${customerId}`
    : `/customers/${customerId}/classes`;

  const cancelationResult = await cancelClasses(classesToCancel);

  if (cancelationResult.success) {
    revalidatePath(path);
  }

  return cancelationResult;
};

export const cancelClassAction = async (
  classId: number,
  isAdminAuthenticated: boolean | undefined,
  customerId: number,
) => {
  const path = isAdminAuthenticated
    ? `/admins/customer-list/${customerId}`
    : `/customers/${customerId}/classes`;

  const cancelationResult = await cancelClass(classId);

  if (cancelationResult.success) {
    revalidatePath(path);
  }

  return cancelationResult;
};
