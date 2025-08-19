import { auth } from "../../../../auth.config";
import { INVALID_CUSTOMER_ID } from "@/app/helper/messages/customerDashboard";

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
        throw new Error(INVALID_CUSTOMER_ID);
      // TODO: Add more cases as needed
      default:
        throw new Error("Invalid user type or id");
    }
  }

  return userSessionType;
}
