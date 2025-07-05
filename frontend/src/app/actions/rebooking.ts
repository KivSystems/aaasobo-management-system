"use server";

import { rebookClass } from "../helper/api/classesApi";
import { getUserSession } from "../helper/auth/sessionUtils";
import { revalidateCustomerCalendar } from "./revalidate";

export async function rebookClassWithValidation({
  customerId,
  classId,
  dateTime,
  instructorId,
  childrenIds,
  isAdminAuthenticated,
}: {
  customerId: number;
  classId: number;
  dateTime: string;
  instructorId: number;
  childrenIds: number[];
  isAdminAuthenticated?: boolean;
}) {
  const session = await getUserSession();

  if (!session) {
    return { error: "unauthorized" };
  }

  if (session.user.userType === "customer") {
    if (Number(session.user.id) !== customerId) {
      return { error: "unauthorized" };
    }
  } else if (session.user.userType === "admin") {
    const adminId = Number(session.user.id);
    if (!adminId && isAdminAuthenticated) {
      return { error: "Admin ID is required for authenticated admin actions." };
    }
  } else {
    return { error: "unauthorized" };
  }

  const result = await rebookClass(classId, {
    dateTime,
    instructorId,
    customerId,
    childrenIds,
  });

  if ("errorMessage" in result) {
    return { error: result.errorMessage };
  }

  await revalidateCustomerCalendar(customerId, isAdminAuthenticated);

  return { success: true };
}
