"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getUserSession } from "@/lib/auth/sessionUtils";

export async function revalidateCustomerCalendar(
  customerId: number,
  userSessionType?: UserType,
) {
  let path = `/customers/${customerId}/classes`;

  if (userSessionType === "admin") {
    const session = await getUserSession("admin");
    const adminId = session?.user.id ? parseInt(session.user.id) : undefined;

    path = `/admins/${adminId}/customer-list/${customerId}`;
  }
  revalidatePath(path);
}

export async function revalidateSystemStatus() {
  revalidateTag("system-status", "default");
}

export async function revalidateAdminList() {
  revalidateTag("admin-list", "default");
}

export async function revalidateCustomerList() {
  revalidateTag("customer-list", "default");
}

export async function revalidateInstructorList() {
  revalidateTag("instructor-list", "default");
}

export async function revalidatePlanList() {
  revalidateTag("plan-list", "default");
}

export async function revalidateEventList() {
  revalidateTag("event-list", "default");
}

export async function revalidateBusinessSchedule() {
  revalidateTag("business-schedule", "default");
}

export async function revalidateClassList() {
  revalidateTag("class-list", "default");
}

export async function revalidateSubscriptionList() {
  revalidateTag("subscription-list", "default");
}
