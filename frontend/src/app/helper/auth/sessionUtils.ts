import { auth } from "../../../../auth.config";

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
