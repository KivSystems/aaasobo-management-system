import React, { useEffect, useState, useCallback } from "react";
import CalendarView from "@/app/components/features/calendarView/CalendarView";
import styles from "./ClassCalendar.module.scss";
import { formatFiveMonthsLaterEndOfMonth } from "@/app/helper/utils/dateUtils";
import { fetchClassesForCalendar } from "@/app/helper/api/classesApi";
import Loading from "../../elements/loading/Loading";
import ClassActions from "./classActions/ClassActions";

function ClassCalendar({
  customerId,
  isAdminAuthenticated,
}: {
  customerId: number;
  isAdminAuthenticated?: boolean;
}) {
  const [classesForCalendar, setClassesForCalendar] = useState<EventType[]>([]);
  const [classes, setClasses] = useState<ClassForCalendar[] | null>(null);
  const [rebookableClasses, setRebookableClasses] = useState<
    ClassForCalendar[] | undefined
  >(undefined);
  const [isBookableClassesModalOpen, setIsBookableClassesModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const classesData: ClassForCalendar[] = await fetchClassesForCalendar(
        customerId,
        "customer",
      );

      setClasses(classesData);

      const rebookableClasses = classesData
        .filter((eachClass) => {
          const fiveMonthsLaterEndOfMonth = new Date(
            formatFiveMonthsLaterEndOfMonth(eachClass.dateTime, "Asia/Tokyo"),
          );

          const now = new Date(
            new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
          );

          return (
            ((eachClass.status === "canceledByCustomer" &&
              eachClass.isRebookable) ||
              (eachClass.status === "canceledByInstructor" &&
                eachClass.isRebookable)) &&
            now <= fiveMonthsLaterEndOfMonth
          );
        })
        .sort((a, b) => {
          const dateA = new Date(a.dateTime).getTime();
          const dateB = new Date(b.dateTime).getTime();
          return dateA - dateB;
        });

      setRebookableClasses(rebookableClasses);

      const formattedClasses = classesData.map((eachClass) => {
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

      setClassesForCalendar(formattedClasses);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      alert("Failed to get classes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) return <div>{error}</div>;

  return (
    <main className={styles.calendarContainer}>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <ClassActions
            setIsBookableClassesModalOpen={setIsBookableClassesModalOpen}
            rebookableClasses={rebookableClasses}
            isAdminAuthenticated={isAdminAuthenticated}
            customerId={customerId}
            classes={classes}
            isBookableClassesModalOpen={isBookableClassesModalOpen}
            fetchData={fetchData}
            setError={setError}
          />

          <CalendarView
            events={classesForCalendar}
            // TODO: Fetch holidays from the backend
            // holidays={["2024-07-29", "2024-07-30", "2024-07-31"]}
            customerId={customerId}
            isAdminAuthenticated={isAdminAuthenticated}
            fetchData={fetchData}
          />
        </>
      )}
    </main>
  );
}

export default ClassCalendar;
