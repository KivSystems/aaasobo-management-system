"use client";

import Loading from "@/app/components/elements/loading/Loading";
import CalendarView from "@/app/components/features/calendarView/CalendarView";
import { useCallback, useEffect, useState } from "react";

export type CustomerCalendarProps = {
  isAdminAuthenticated?: boolean;
  customerId: number;
  classes: ClassForCalendar[] | null;
};

export default function CustomerCalendar({
  isAdminAuthenticated,
  customerId,
  classes,
}: CustomerCalendarProps) {
  const [classesAsEvents, setClassesAsEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch and format classes as calendar events, then set them in state.
  const fetchData = useCallback(async () => {
    if (!customerId) return;
    try {
      if (!classes) return;
      const formattedClasses = classes.map((eachClass) => {
        const start = eachClass.dateTime;
        const end = new Date(
          new Date(start).getTime() + 25 * 60000,
        ).toISOString();

        const color =
          eachClass.status === "booked"
            ? "#E7FBD9"
            : eachClass.status === "completed"
              ? "#B5C4AB"
              : "#FFEBE0";

        const childrenNames = eachClass.classAttendance.children
          .map((child) => child.name)
          .join(", ");

        return {
          classId: eachClass.id,
          start,
          end,
          title: childrenNames,
          color,
          instructorIcon: eachClass.instructor?.icon,
          instructorNickname: eachClass.instructor?.nickname,
          classStatus: eachClass.status,
        };
      });

      setClassesAsEvents(formattedClasses);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      alert("Failed to get classes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [customerId, classes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return isLoading ? (
    <Loading />
  ) : (
    <CalendarView
      // TODO: Fetch holidays from the backend
      // holidays={["2024-07-29", "2024-07-30", "2024-07-31"]}
      customerId={customerId}
      isAdminAuthenticated={isAdminAuthenticated}
      events={classesAsEvents}
      fetchData={fetchData}
    />
  );
}
