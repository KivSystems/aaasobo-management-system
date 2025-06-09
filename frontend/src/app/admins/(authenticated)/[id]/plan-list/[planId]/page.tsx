import PlanDashboardForAdmin from "@/app/components/admins-dashboard/plans-dashboard/PlanDashboardForAdmin";

function Page({ params }: { params: { id: string; planId: string } }) {
  const userId = parseInt(params.id);
  if (isNaN(userId)) {
    throw new Error("Invalid userId");
  }

  const planId = parseInt(params.planId);
  if (isNaN(planId)) {
    throw new Error("Invalid planId");
  }

  return <PlanDashboardForAdmin userId={userId} planId={planId} />;
}

export default Page;
