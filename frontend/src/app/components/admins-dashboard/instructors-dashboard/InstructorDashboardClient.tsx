"use client";

import TabFunction from "@/app/components/admins-dashboard/TabFunction";
import InstructorProfile from "@/app/components/instructors-dashboard/instructor-profile/InstructorProfile";
import { useContext } from "react";
import { AuthContext } from "@/app/admins/(authenticated)/authContext";
import { useTabSelect } from "@/app/hooks/useTabSelect";
import AvailabilityCalendar from "../../../admins/(authenticated)/[id]/instructor-list/[instructorId]/AvailabilityCalendar";
import InstructorSchedule from "../../../admins/(authenticated)/[id]/instructor-list/[instructorId]/InstructorSchedule";
import Loading from "@/app/components/elements/loading/Loading";

export default function InstructorTabs({
  instructorId,
  instructor,
  classScheduleComponent,
}: {
  instructorId: number;
  instructor: Instructor | string;
  classScheduleComponent: React.ReactNode;
}) {
  const breadcrumb = [
    "Instructor List",
    `/admins/instructor-list`,
    `ID: ${instructorId}`,
  ];
  const activeTabName = "activeInstructorTab";

  // Check the authentication of the admin.
  const { isAuthenticated } = useContext(AuthContext);

  // Get the active tab from the local storage.
  const { initialActiveTab, isTabInitialized } = useTabSelect(
    "activeInstructorTab",
  );

  // Tabs with labels and content
  const tabs = [
    {
      label: "Class Schedule",
      content: classScheduleComponent,
    },
    {
      label: "Instructor's Profile",
      content: (
        <InstructorProfile
          instructor={instructor}
          isAdminAuthenticated={isAuthenticated}
        />
      ),
    },
    {
      label: "Instructor's Availability",
      content: <AvailabilityCalendar instructorId={instructorId} />,
    },
    {
      label: "Instructor's Schedule",
      content: <InstructorSchedule instructorId={instructorId} />,
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
