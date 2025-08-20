import EditRegularClass from "@/app/components/customers-dashboard/regular-classes/EditRegularClass";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";

async function Page({
  params,
}: {
  params: { id: string; customerId: string };
}) {
  // Authenticate user session
  const userSessionType: UserType = await authenticateUserSession(
    "admin",
    params.id,
  );
  const adminId = parseInt(params.id);
  const customerId = parseInt(params.customerId);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  return (
    <EditRegularClass
      adminId={adminId}
      customerId={customerId}
      userSessionType={userSessionType}
    />
  );
}

export default Page;
