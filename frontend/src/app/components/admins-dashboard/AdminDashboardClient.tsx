"use client";

import TabFunction from "@/app/components/admins-dashboard/TabFunction";
import AdminProfile from "@/app/components/admins-dashboard/AdminProfile";
import { useTabSelect } from "@/app/hooks/useTabSelect";
import Loading from "@/app/components/elements/loading/Loading";

export default function AdminTabs({
  userId,
  adminId,
  admin,
  userSessionType,
}: {
  userId: number;
  adminId: number;
  admin: Admin | string;
  userSessionType: UserType;
}) {
  const breadcrumb = [
    "Admin List",
    `/admins/${userId}/admin-list`,
    `ID: ${adminId}`,
  ];
  const activeTabName = "activeAdminTab";

  // Get the active tab from the local storage.
  const { initialActiveTab, isTabInitialized } = useTabSelect("activeAdminTab");

  // Tabs with labels and content
  const tabs = [
    {
      label: "Admin's Profile",
      content: (
        <AdminProfile
          userId={userId}
          admin={admin}
          userSessionType={userSessionType}
        />
      ),
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
