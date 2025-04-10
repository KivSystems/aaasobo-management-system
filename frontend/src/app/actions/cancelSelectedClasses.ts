"use server";

import { revalidatePath } from "next/cache";
import { cancelClasses } from "../helper/api/classesApi";

export const cancelSelectedClasses = async (
  classesToCancel: number[],
  isAdminAuthenticated: boolean | undefined,
  customerId: number,
) => {
  const path = isAdminAuthenticated
    ? `/admins/customer-list/${customerId}`
    : `/customers/${customerId}/classes`;

  await cancelClasses(classesToCancel);

  revalidatePath(path);
};
