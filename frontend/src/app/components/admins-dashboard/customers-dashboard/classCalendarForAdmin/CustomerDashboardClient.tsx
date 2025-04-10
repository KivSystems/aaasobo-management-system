"use client";

import { useContext } from "react";
import { AuthContext } from "@/app/admins/(authenticated)/authContext";
import TabFunction from "@/app/components/admins-dashboard/TabFunction";
import CustomerProfile from "@/app/components/customers-dashboard/profile/CustomerProfile";
import ChildrenProfiles from "@/app/components/customers-dashboard/children-profiles/ChildrenProfiles";
import RegularClasses from "@/app/components/customers-dashboard/regular-classes/RegularClasses";
import { useTabSelect } from "@/app/hooks/useTabSelect";
import Loading from "@/app/components/elements/loading/Loading";

function CustomerDashboardClient({
  customerId,
  classCalendarComponent,
}: {
  customerId: number;
  classCalendarComponent: React.ReactNode;
}) {
  const breadcrumb = [
    "Customer List",
    `/admins/customer-list`,
    `ID: ${customerId}`,
  ];
  const activeTabName = "activeCustomerTab";

  // Check authentication
  const { isAuthenticated } = useContext(AuthContext);

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
      content: <CustomerProfile customerId={customerId} />,
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
