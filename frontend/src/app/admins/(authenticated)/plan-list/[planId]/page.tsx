import PlanDashboardForAdmin from "@/app/components/admins-dashboard/plans-dashboard/PlanDashboardForAdmin";

function Page({ params }: { params: { planId: string } }) {
  const planId = parseInt(params.planId);

  if (isNaN(planId)) {
    throw new Error("Invalid planId");
  }

  return <PlanDashboardForAdmin planId={planId} />;
}

export default Page;
