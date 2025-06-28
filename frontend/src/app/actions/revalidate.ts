"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getUserSession } from "@/app/helper/auth/sessionUtils";

export async function revalidateBookableClasses() {
  revalidateTag("bookable-classes");
}

export async function revalidateClassesForCalendar() {
  revalidateTag("classes-calendar");
}

export async function revalidateCustomerCalendar(
  customerId: number,
  isAdminAuthenticated: boolean,
) {
  let path = `/customers/${customerId}/classes`;

  if (isAdminAuthenticated) {
    const session = await getUserSession("admin");
    const adminId = session?.user.id ? parseInt(session.user.id) : undefined;

    path = `/admins/${adminId}/customer-list/${customerId}`;
  }
  revalidatePath(path);
}

export async function revalidateUpcomingClasses() {
  revalidateTag("upcoming-classes");
}

export async function revalidateAdminList() {
  revalidateTag("admin-list");
}

export async function revalidateInstructorList() {
  revalidateTag("instructor-list");
}

export async function revalidateCustomerList() {
  revalidateTag("customer-list");
}

export async function revalidateChildList() {
  revalidateTag("child-list");
}

export async function revalidatePlanList() {
  revalidateTag("plan-list");
}

export async function revalidateBusinessSchedule() {
  revalidateTag("business-schedule");
}
