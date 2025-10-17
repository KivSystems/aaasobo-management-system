"use client";

import TabFunction from "@/app/components/admins-dashboard/TabFunction";
import EventProfile from "@/app/components/admins-dashboard/events-dashboard/EventProfile";
import { useTabSelect } from "@/app/hooks/useTabSelect";
import { getLocalizedText } from "@/app/helper/utils/stringUtils";
import Loading from "@/app/components/elements/loading/Loading";

export default function EventTabs({
  userId,
  eventId,
  event,
  userSessionType,
}: {
  userId: number;
  eventId: number;
  event: BusinessEventType | string;
  userSessionType: UserType;
}) {
  const eventName =
    typeof event !== "string" ? getLocalizedText(event.name, "en") : "Unknown";
  const breadcrumb = [
    "Event List",
    `/admins/${userId}/event-list`,
    `Event Page (${eventName})`,
  ];
  const activeTabName = "activeEventTab";

  // Get the active tab from the local storage.
  const { initialActiveTab, isTabInitialized } = useTabSelect("activeEventTab");

  // Tabs with labels and content
  const tabs = [
    {
      label: "Event's Profile",
      content: <EventProfile event={event} userSessionType={userSessionType} />,
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
