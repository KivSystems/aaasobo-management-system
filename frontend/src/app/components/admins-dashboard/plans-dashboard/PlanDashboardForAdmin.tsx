import PlanTabs from "@/app/components/admins-dashboard/plans-dashboard/PlanDashboardClient";
import { getPlanById } from "@/app/helper/api/plansApi";

export default async function PlanDashboardForAdmin({
  userId,
  planId,
}: {
  userId: number;
  planId: number;
}) {
  // Fetch plan data
  const data = await getPlanById(planId);
  let plan = null;
  if ("message" in data) {
    plan = data.message;
  } else {
    plan = data.plan;
  }

  return <PlanTabs userId={userId} planId={planId} plan={plan} />;
}
