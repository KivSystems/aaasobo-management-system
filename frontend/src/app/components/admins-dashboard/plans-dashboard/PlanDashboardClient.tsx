"use client";

import TabFunction from "@/app/components/admins-dashboard/TabFunction";
import PlanProfile from "@/app/components/admins-dashboard/plans-dashboard/PlanProfile";
import { useTabSelect } from "@/app/hooks/useTabSelect";
import Loading from "@/app/components/elements/loading/Loading";

export default function PlanTabs({
  userId,
  planId,
  plan,
  userSessionType,
}: {
  userId: number;
  planId: number;
  plan: Plan | string;
  userSessionType: UserType;
}) {
  const breadcrumb = [
    "Plan List",
    `/admins/${userId}/plan-list`,
    `ID: ${planId}`,
  ];
  const activeTabName = "activePlanTab";

  // Get the active tab from the local storage.
  const { initialActiveTab, isTabInitialized } = useTabSelect("activePlanTab");

  // Tabs with labels and content
  const tabs = [
    {
      label: "Plan's Profile",
      content: <PlanProfile plan={plan} userSessionType={userSessionType} />,
    },
  ];

  // Display a loading message while initializing the tab.
  if (!isTabInitialized) {
    return <Loading />;
  }

  return (
    <TabFunction
      tabs={tabs}
      breadcrumb={breadcrumb}
      activeTabName={activeTabName}
      initialActiveTab={initialActiveTab}
    />
  );
}
