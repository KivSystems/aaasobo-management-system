import { auth } from "../../../../auth.config";

export async function getCustomerSession() {
  const session = await auth();

  // Check if session exists and is a customer
  if (!session || session.user.userType !== "customer") {
    return null;
  }

  return session;
}
