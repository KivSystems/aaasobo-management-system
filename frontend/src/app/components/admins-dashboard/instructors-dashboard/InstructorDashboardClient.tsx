"use client";

import TabFunction from "@/app/components/admins-dashboard/TabFunction";
import InstructorProfile from "@/app/components/instructors-dashboard/instructor-profile/InstructorProfile";
import { useTabSelect } from "@/app/hooks/useTabSelect";
import InstructorSchedule from "./instructor-schedule/InstructorSchedule";
import AvailabilityCalendar from "./instructor-schedule/AvailabilityCalendar";
import Loading from "@/app/components/elements/loading/Loading";

export default function InstructorTabs({
  adminId,
  instructorId,
  instructor,
  token,
  userSessionType,
  classScheduleComponent,
}: {
  adminId: number;
  instructorId: number;
  instructor: Instructor | string;
  token: string;
  userSessionType: UserType;
  classScheduleComponent: React.ReactNode;
}) {
  const breadcrumb = [
    "Instructor List",
    `/admins/${adminId}/instructor-list`,
    `ID: ${instructorId}`,
  ];
  const activeTabName = "activeInstructorTab";

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
          token={token}
          userSessionType={userSessionType}
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
