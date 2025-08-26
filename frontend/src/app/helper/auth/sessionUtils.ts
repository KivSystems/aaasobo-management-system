import { auth } from "../../../../auth.config";
import { INVALID_ADMIN_ID } from "@/app/helper/messages/adminDashboard";
import { INVALID_CUSTOMER_ID } from "@/app/helper/messages/customerDashboard";
import { INVALID_INSTRUCTOR_ID } from "@/app/helper/messages/instructorDashboard";

export async function getUserSession(userType?: UserType) {
  const session = await auth();

  if (!session) {
    return null;
  }

  if (userType && session.user.userType !== userType) {
    return null;
  }

  return session;
}

export async function getUserSessionType(userType: UserType, id: string) {
  const userSession = await getUserSession(userType);

  if (!userSession) {
    return null;
  }
  if (
    userType &&
    (userSession.user.userType !== userType || userSession.user.id !== id)
  ) {
    return null;
  }

  return userSession.user.userType;
}

export async function authenticateUserSession(userType: UserType, id: string) {
  const userSessionType = await getUserSessionType(userType, id);
  if (!userSessionType || userSessionType !== userType) {
    switch (userType) {
      case "customer":
        console.error(`Invalid customer ID: ID = ${id}`);
        throw new Error(INVALID_CUSTOMER_ID);
      case "instructor":
        console.error(`Invalid instructor ID: ID = ${id}`);
        throw new Error(INVALID_INSTRUCTOR_ID);
      case "admin":
        console.error(`Invalid admin ID: ID = ${id}`);
        throw new Error(INVALID_ADMIN_ID);
      default:
        throw new Error("Invalid user type");
    }
  }

  return userSessionType;
}
