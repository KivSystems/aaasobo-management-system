"use client";

import TabFunction from "@/app/components/admins-dashboard/TabFunction";
import PlanProfile from "@/app/components/admins-dashboard/plans-dashboard/PlanProfile";
import { useContext } from "react";
import { AuthContext } from "@/app/admins/(authenticated)/authContext";
import { useTabSelect } from "@/app/hooks/useTabSelect";
import Loading from "@/app/components/elements/loading/Loading";

export default function PlanTabs({
  planId,
  plan,
}: {
  planId: number;
  plan: Plan | string;
}) {
  const breadcrumb = ["Plan List", `/admins/plan-list`, `ID: ${planId}`];
  const activeTabName = "activePlanTab";

  // TODO: Update the logic using NextAuth.
  // Check the authentication of the admin.
  // const { isAuthenticated } = useContext(AuthContext);

  // Get the active tab from the local storage.
  const { initialActiveTab, isTabInitialized } = useTabSelect("activeAdminTab");

  // Tabs with labels and content
  const tabs = [
    {
      label: "Plan's Profile",
      content: <PlanProfile plan={plan} isAdminAuthenticated={true} />,
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
