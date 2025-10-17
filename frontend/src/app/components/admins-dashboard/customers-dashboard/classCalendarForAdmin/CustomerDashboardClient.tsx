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
  userSessionType,
  classCalendarComponent,
  customerProfile,
  childProfiles,
}: {
  adminId: number;
  customerId: number;
  userSessionType: UserType;
  classCalendarComponent: React.ReactNode;
  customerProfile: CustomerProfile;
  childProfiles: Child[];
}) {
  // Get the previous list page from local storage to set the breadcrumb.
  const previousListPage = localStorage.getItem("previousListPage");
  let breadcrumb: string[] = [];
  switch (previousListPage) {
    case "class-list":
      breadcrumb = [
        "Class List",
        `/admins/${adminId}/class-list`,
        `Customer Page (${customerProfile.name})`,
      ];
      break;
    case "customer-list":
      breadcrumb = [
        "Customer List",
        `/admins/${adminId}/customer-list`,
        `Customer Page (${customerProfile.name})`,
      ];
      break;
    case "child-list":
      breadcrumb = [
        "Child List",
        `/admins/${adminId}/child-list`,
        `Customer Page (${customerProfile.name})`,
      ];
      break;
    case "subscription-list":
      breadcrumb = [
        "Subscription List",
        `/admins/${adminId}/subscription-list`,
        `Customer Page (${customerProfile.name})`,
      ];
      break;
  }

  // Get the active tab name to set the active tab in the TabFunction component.
  const activeTabName = "activeCustomerTab";

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
          userSessionType={userSessionType}
        />
      ),
    },
    {
      label: "Children's Profile",
      content: (
        <ChildrenProfiles
          customerId={customerId}
          userSessionType={userSessionType}
          childProfiles={childProfiles}
          terminationAt={customerProfile.terminationAt ?? null}
        />
      ),
    },
    {
      label: "Regular Classes",
      content: (
        <RegularClasses
          adminId={adminId}
          customerId={customerId}
          userSessionType={userSessionType}
        />
      ),
    },
  ];

  if (!isTabInitialized) {
    return <Loading />;
  }

  return userSessionType === "admin" ? (
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
