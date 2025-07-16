"use client";

import TabFunction from "@/app/components/admins-dashboard/TabFunction";
import CustomerProfile from "@/app/components/customers-dashboard/profile/CustomerProfile";
import ChildrenProfiles from "@/app/components/customers-dashboard/children-profiles/ChildrenProfiles";
import RegularClasses from "@/app/components/customers-dashboard/regular-classes/RegularClasses";
import { useTabSelect } from "@/app/hooks/useTabSelect";
import Loading from "@/app/components/elements/loading/Loading";

function CustomerDashboardClient({
  adminId,
  customerId,
  classCalendarComponent,
  customerProfile,
  childProfiles,
}: {
  adminId: number;
  customerId: number;
  classCalendarComponent: React.ReactNode;
  customerProfile: CustomerProfile;
  childProfiles: Child[];
}) {
  // Get the previous list page from local storage to set the breadcrumb.
  const previousListPage = localStorage.getItem("previousListPage");
  let breadcrumb: string[] = [];
  switch (previousListPage) {
    case "customer-list":
      breadcrumb = [
        "Customer List",
        `/admins/${adminId}/customer-list`,
        `ID: ${customerId}`,
      ];
      break;
    case "child-list":
      breadcrumb = [
        "Child List",
        `/admins/${adminId}/child-list`,
        `Customer ID: ${customerId}`,
      ];
      break;
  }

  // Get the active tab name to set the active tab in the TabFunction component.
  const activeTabName = "activeCustomerTab";

  // Set the authentication status as true.
  const isAuthenticated = true;

  // Get the active tab from local storage
  const { initialActiveTab, isTabInitialized } =
    useTabSelect("activeCustomerTab");

  const tabs = [
    {
      label: "Class Calendar",
      content: classCalendarComponent,
    },
    {
      label: "Customer's Profile",
      content: (
        <CustomerProfile
          customerProfile={customerProfile}
          isAdminAuthenticated={isAuthenticated}
        />
      ),
    },
    {
      label: "Children's Profile",
      content: (
        <ChildrenProfiles
          adminId={adminId}
          customerId={customerId}
          isAdminAuthenticated={isAuthenticated}
          childProfiles={childProfiles}
        />
      ),
    },
    {
      label: "Regular Classes",
      content: (
        <RegularClasses
          adminId={adminId}
          customerId={customerId}
          isAdminAuthenticated={isAuthenticated}
        />
      ),
    },
  ];

  if (!isTabInitialized) {
    return <Loading />;
  }

  return isAuthenticated ? (
    <TabFunction
      tabs={tabs}
      breadcrumb={breadcrumb}
      activeTabName={activeTabName}
      initialActiveTab={initialActiveTab}
    />
  ) : (
    <p>Not authorized.</p>
  );
}

export default CustomerDashboardClient;
