import React, { useEffect, useState, useCallback } from "react";
import CalendarView from "@/app/components/features/calendarView/CalendarView";
import styles from "./ClassCalendar.module.scss";
import {
  formatFiveMonthsLaterEndOfMonth,
  isPastPreviousDayDeadline,
} from "@/app/helper/utils/dateUtils";
import {
  cancelClass,
  fetchClassesForCalendar,
} from "@/app/helper/api/classesApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const [selectedClasses, setSelectedClasses] = useState<
    { classId: number; classDateTime: string }[]
  >([]);
  const [isBookableClassesModalOpen, setIsBookableClassesModalOpen] =
    useState(false);
  const [isCancelingModalOpen, setIsCancelingModalOpen] = useState(false);
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

  const handleCancelingModalClose = () => {
    setIsCancelingModalOpen(false);
    setSelectedClasses([]);
  };

  const handleBulkCancel = async () => {
    if (selectedClasses.length === 0) return;

    // Get classes that have passed the previous day cancelation deadline
    const pastPrevDayClasses = selectedClasses.filter((eachClass) =>
      isPastPreviousDayDeadline(eachClass.classDateTime, "Asia/Tokyo"),
    );

    if (pastPrevDayClasses.length > 0) {
      alert(
        "Classes cannot be canceled on or after the scheduled day of the class.",
      );
      const pastPrevDayClassIds = new Set(
        pastPrevDayClasses.map((pastClass) => pastClass.classId),
      );
      const updatedSelectedClasses = selectedClasses.filter(
        (eachClass) => !pastPrevDayClassIds.has(eachClass.classId),
      );
      return setSelectedClasses(updatedSelectedClasses);
    }

    // Get classes that are before the previous day's deadline
    const classesToCancel = selectedClasses.filter(
      (eachClass) =>
        !isPastPreviousDayDeadline(eachClass.classDateTime, "Asia/Tokyo"),
    );

    if (classesToCancel.length > 0) {
      const confirmed = window.confirm(
        `Are you sure you want to cancel these ${selectedClasses.length} classes?`,
      );
      if (!confirmed) return handleCancelingModalClose();
      try {
        await Promise.all(
          classesToCancel.map((eachClass) => cancelClass(eachClass.classId)),
        );
        setSelectedClasses([]);

        // Re-fetch data to update the state
        fetchData();
        handleCancelingModalClose();
        toast.success("The classes have been successfully canceled!");
      } catch (error) {
        console.error("Failed to cancel classes:", error);
        setError("Failed to cancel the classes. Please try again later.");
      }
    }
  };

  const toggleSelectClass = (classId: number, classDateTime: string) => {
    setSelectedClasses((prev) => {
      const updated = prev.filter((item) => item.classId !== classId);
      if (updated.length === prev.length) {
        updated.push({ classId, classDateTime });
      }
      return updated;
    });
  };

  if (error) return <div>{error}</div>;

  return (
    <main className={styles.calendarContainer}>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <ClassActions
            setIsCancelingModalOpen={setIsCancelingModalOpen}
            setIsBookableClassesModalOpen={setIsBookableClassesModalOpen}
            rebookableClasses={rebookableClasses}
            isAdminAuthenticated={isAdminAuthenticated}
            customerId={customerId}
            classes={classes}
            handleBulkCancel={handleBulkCancel}
            handleCancelingModalClose={handleCancelingModalClose}
            isCancelingModalOpen={isCancelingModalOpen}
            selectedClasses={selectedClasses}
            toggleSelectClass={toggleSelectClass}
            isBookableClassesModalOpen={isBookableClassesModalOpen}
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
