"use client";

import TabFunction from "@/app/components/admins-dashboard/TabFunction";
import CustomerProfile from "@/app/components/customers-dashboard/profile/CustomerProfile";
import ChildrenProfiles from "@/app/components/customers-dashboard/children-profiles/ChildrenProfiles";
import RegularClasses from "@/app/components/customers-dashboard/regular-classes/RegularClasses";
import { useTabSelect } from "@/app/hooks/useTabSelect";
import Loading from "@/app/components/elements/loading/Loading";

function CustomerDashboardClient({
  userId,
  customerId,
  classCalendarComponent,
  customerProfile,
}: {
  userId: number;
  customerId: number;
  classCalendarComponent: React.ReactNode;
  customerProfile: CustomerProfile;
}) {
  const breadcrumb = [
    "Customer List",
    `/admins/${userId}/customer-list`,
    `ID: ${customerId}`,
  ];
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
          customerId={customerId}
          isAdminAuthenticated={isAuthenticated}
        />
      ),
    },
    {
      label: "Regular Classes",
      content: (
        <RegularClasses
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
