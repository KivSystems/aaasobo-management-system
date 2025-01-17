"use server";
import { redirect } from "next/navigation";
import { logoutCustomer } from "./customersApi";
import { logoutAdmin } from "./adminsApi";
import { logoutInstructor } from "./instructorsApi";

export async function handleLogout(
  userType: "admin" | "customer" | "instructor",
) {
  const logoutActions = {
    admin: { logoutFn: logoutAdmin, redirectUrl: "/admins/login" },
    customer: { logoutFn: logoutCustomer, redirectUrl: "/customers/login" },
    instructor: {
      logoutFn: logoutInstructor,
      redirectUrl: "/instructors/login",
    },
  };

  const action = logoutActions[userType];

  if (!action) {
    throw new Error("Invalid user type");
  }

  const result = await action.logoutFn();
  if (result.ok) {
    redirect(action.redirectUrl);
  } else {
    console.error(`Logout failed for ${userType}: ${result.error}`);
    throw new Error(result.error || "Logout failed");
  }
}
