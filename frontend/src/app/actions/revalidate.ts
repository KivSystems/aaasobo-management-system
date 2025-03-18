"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateBookableClasses() {
  revalidateTag("bookable-classes");
}

export async function revalidateClassesForCalendar() {
  revalidateTag("classes-calendar");
}

export async function revalidateCustomerCalendar(customerId: number) {
  revalidatePath(`/customers/${customerId}/classes`);
}
