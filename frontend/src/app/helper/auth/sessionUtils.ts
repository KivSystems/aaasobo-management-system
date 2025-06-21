import { auth } from "../../../../auth.config";

export async function getUserSession(userType: UserType) {
  const session = await auth();

  // Check if session exists and is a designated user type
  if (!session || session.user.userType !== userType) {
    return null;
  }

  return session;
}
