"use server";

import { revalidatePath, revalidateTag } from "next/cache";

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
  const path = isAdminAuthenticated
    ? `/admins/customer-list/${customerId}`
    : `/customers/${customerId}/classes`;
  revalidatePath(path);
}

export async function revalidateUpcomingClasses() {
  revalidateTag("upcoming-classes");
}

export async function revalidatePlans() {
  revalidateTag("plans");
}
