"use client";

import TabFunction from "@/app/components/admins-dashboard/TabFunction";
import AdminProfile from "@/app/components/admins-dashboard/AdminProfile";
import { useTabSelect } from "@/app/hooks/useTabSelect";
import Loading from "@/app/components/elements/loading/Loading";

export default function AdminTabs({
  adminId,
  admin,
}: {
  adminId: number;
  admin: Admin | string;
}) {
  const breadcrumb = ["Admin List", `/admins/admin-list`, `ID: ${adminId}`];
  const activeTabName = "activeAdminTab";

  // Check the authentication of the admin.
  const isAuthenticated = true;

  // Get the active tab from the local storage.
  const { initialActiveTab, isTabInitialized } = useTabSelect("activeAdminTab");

  // Tabs with labels and content
  const tabs = [
    {
      label: "Admin's Profile",
      content: (
        <AdminProfile admin={admin} isAdminAuthenticated={isAuthenticated} />
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
