import PlanTabs from "@/app/components/admins-dashboard/plans-dashboard/PlanDashboardClient";
import { getPlanById } from "@/app/helper/api/plansApi";
import { getCookie } from "../../../../proxy";

export default async function PlanDashboardForAdmin({
  userId,
  planId,
  userSessionType,
}: {
  userId: number;
  planId: number;
  userSessionType: UserType;
}) {
  // Get the cookies from the request headers
  const cookie = await getCookie();

  // Fetch plan data
  const data = await getPlanById(planId, cookie);
  let plan = null;
  if ("message" in data) {
    plan = data.message;
  } else {
    plan = data.plan;
  }

  return (
    <PlanTabs
      userId={userId}
      planId={planId}
      plan={plan}
      userSessionType={userSessionType}
    />
  );
}
