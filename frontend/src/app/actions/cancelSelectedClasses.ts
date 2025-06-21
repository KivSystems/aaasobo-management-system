"use server";

import { revalidatePath } from "next/cache";
import { cancelClass, cancelClasses } from "../helper/api/classesApi";
import { getUserSession } from "@/app/helper/auth/sessionUtils";

export const cancelSelectedClasses = async (
  classesToCancel: number[],
  isAdminAuthenticated: boolean | undefined,
  customerId: number,
) => {
  // Get the admin ID from the session if the action is admin authenticated
  const session = await getUserSession("admin");
  const adminId = session?.user.id ? parseInt(session.user.id) : undefined;
  if (!adminId && isAdminAuthenticated) {
    throw new Error("Admin ID is required for authenticated admin actions.");
  }
  const path = isAdminAuthenticated
    ? `/admins/${adminId}/customer-list/${customerId}`
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
  // Get the admin ID from the session if the action is admin authenticated
  const session = await getUserSession("admin");
  const adminId = session?.user.id ? parseInt(session.user.id) : undefined;
  if (!adminId && isAdminAuthenticated) {
    throw new Error("Admin ID is required for authenticated admin actions.");
  }
  const path = isAdminAuthenticated
    ? `/admins/${adminId}/customer-list/${customerId}`
    : `/customers/${customerId}/classes`;

  const cancelationResult = await cancelClass(classId);

  if (cancelationResult.success) {
    revalidatePath(path);
  }

  return cancelationResult;
};
