"use client";

import TabFunction from "@/app/components/admins-dashboard/TabFunction";
import EventProfile from "@/app/components/admins-dashboard/events-dashboard/EventProfile";
import { useTabSelect } from "@/app/hooks/useTabSelect";
import Loading from "@/app/components/elements/loading/Loading";

export default function EventTabs({
  userId,
  eventId,
  event,
}: {
  userId: number;
  eventId: number;
  event: BusinessEventType | string;
}) {
  const breadcrumb = [
    "Event List",
    `/admins/${userId}/event-list`,
    `ID: ${eventId}`,
  ];
  const activeTabName = "activeEventTab";

  // Set the authentication status as true.
  const isAuthenticated = true;

  // Get the active tab from the local storage.
  const { initialActiveTab, isTabInitialized } = useTabSelect("activeEventTab");

  // Tabs with labels and content
  const tabs = [
    {
      label: "Event's Profile",
      content: (
        <EventProfile event={event} isAdminAuthenticated={isAuthenticated} />
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
