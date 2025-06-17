"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateCustomerCalendar(
  customerId: number,
  isAdminAuthenticated: boolean | undefined,
) {
  const path = isAdminAuthenticated
    ? `/admins/customer-list/${customerId}`
    : `/customers/${customerId}/classes`;
  revalidatePath(path);
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
