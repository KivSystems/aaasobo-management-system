"use client";

import { useEffect, useState, useCallback } from "react";
import { getClassesByInstructorId } from "@/app/helper/api/classesApi";
import { formatShortDate } from "@/app/helper/utils/dateUtils";
import InstructorClassDetail from "@/app/components/instructors-dashboard/class-schedule/InstructorClassDetail";
import InstructorClassesTable from "@/app/components/instructors-dashboard/class-schedule/InstructorClassesTable";
import styles from "./ClassDetails.module.scss";
import Link from "next/link";
import Loading from "../../elements/loading/Loading";

function ClassDetails({
  adminId,
  instructorId,
  classId,
  isAdminAuthenticated,
}: {
  adminId?: number | null;
  instructorId: number | null;
  classId: number | null;
  isAdminAuthenticated?: boolean;
}) {
  console.log("ClassDetails.tsx adminId", adminId);
  const [classDetail, setClassDetail] = useState<InstructorClassDetail | null>(
    null,
  );
  const [selectedDateClasses, setSelectedDateClasses] = useState<
    InstructorClassDetail[]
  >([]);
  const [classDate, setClassDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClassDetail = useCallback(async () => {
    if (!instructorId || !classId) return;

    try {
      const classes: InstructorClassDetail[] =
        await getClassesByInstructorId(instructorId);

      const classDetail = classes.find((eachClass) => eachClass.id === classId);
      setClassDetail(classDetail || null);

      const selectedClassDate = classDetail?.dateTime
        ? formatShortDate(new Date(classDetail.dateTime))
        : "";
      setClassDate(selectedClassDate);

      const classesOnSelectedDate = classes.filter(
        (eachClass) =>
          formatShortDate(new Date(eachClass.dateTime)) === selectedClassDate,
      );
      setSelectedDateClasses(classesOnSelectedDate);
    } catch (error) {
      console.error("Failed to fetch class detail:", error);
      setError("Failed to load class details. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [instructorId, classId]);

  useEffect(() => {
    fetchClassDetail();
  }, [fetchClassDetail]);

  const handleUpdateClassDetail = (
    completedClassId: number,
    attendedChildren: Child[],
    updatedStatus: ClassStatus,
  ) => {
    if (completedClassId !== classId) return;

    setClassDetail((prev) => {
      if (prev === null) return prev;

      return {
        ...prev,
        attendingChildren: attendedChildren,
        status: updatedStatus,
      };
    });
  };

  // Set the active tab to the instructor calendar tab.
  if (isAdminAuthenticated) localStorage.setItem("activeInstructorTab", "0");

  if (loading) return <Loading />;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.classDetails}>
      <nav className={styles.breadcrumb}>
        <ul className={styles.breadcrumb__list}>
          <li className={styles.breadcrumb__item}>
            {isAdminAuthenticated ? (
              <Link
                href={`/admins/${adminId}/instructor-list/${instructorId}`}
                passHref
              >
                Class Schedule
              </Link>
            ) : (
              <Link
                href={`/instructors/${instructorId}/class-schedule`}
                passHref
              >
                Class Schedule
              </Link>
            )}
          </li>
          <li className={styles.breadcrumb__separator}>{" >> "}</li>
          <li className={styles.breadcrumb__item}>Class Details</li>
        </ul>
      </nav>

      <div className={styles.classDetails__container}>
        <div className={styles.classDetails__classesList}>
          {instructorId !== null && classId !== null ? (
            <InstructorClassesTable
              adminId={adminId}
              instructorId={instructorId}
              selectedDateClasses={selectedDateClasses}
              timeZone="Asia/Manila"
              handleUpdateClassDetail={handleUpdateClassDetail}
              isAdminAuthenticate={isAdminAuthenticated}
              classDate={classDate}
              classId={classId}
            />
          ) : (
            <p>No classes available.</p>
          )}
        </div>

        <div className={styles.classDetails__classDetail}>
          <InstructorClassDetail
            classDetail={classDetail}
            timeZone="Asia/Manila"
          />
        </div>
      </div>
    </div>
  );
}

export default ClassDetails;
