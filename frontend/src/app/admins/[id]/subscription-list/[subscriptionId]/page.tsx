import PlanDashboardForAdmin from "@/app/components/admins-dashboard/plans-dashboard/PlanDashboardForAdmin";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";

async function Page(props: {
  params: Promise<{ id: string; planId: string }>;
}) {
  const params = await props.params;
  // Authenticate user session
  const userSessionType: UserType = await authenticateUserSession(
    "admin",
    params.id,
  );
  const userId = parseInt(params.id);
  const planId = parseInt(params.planId);
  if (isNaN(planId)) {
    throw new Error("Invalid planId");
  }

  return (
    <PlanDashboardForAdmin
      userId={userId}
      planId={planId}
      userSessionType={userSessionType}
    />
  );
}

export default Page;
