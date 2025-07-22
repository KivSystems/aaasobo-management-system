"use server";

import { getUserSession } from "../helper/auth/sessionUtils";

export const validateSession = async (
  userId?: number,
  isAdminAuthenticated?: boolean,
) => {
  const session = await getUserSession();

  if (!session) {
    return { isValid: false, error: "unauthorized" };
  }

  const loggedInUserId = Number(session.user.id);

  if (
    session.user.userType === "customer" ||
    session.user.userType === "instructor"
  ) {
    if (userId !== undefined && userId !== loggedInUserId) {
      return { isValid: false, error: "unauthorized" };
    }
  } else if (session.user.userType === "admin") {
    if (!userId && isAdminAuthenticated) {
      return {
        isValid: false,
        error: "Admin ID is required for authenticated admin actions.",
      };
    }
  } else {
    return { isValid: false, error: "unauthorized" };
  }

  return { isValid: true, session };
};
