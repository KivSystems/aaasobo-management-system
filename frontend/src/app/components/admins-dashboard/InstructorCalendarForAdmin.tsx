"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./InstructorCalendarForAdmin.module.scss";
import {
  getCalendarAvailabilities,
  getCalendarClasses,
  getInstructorProfile,
} from "@/app/helper/api/instructorsApi";
import Loading from "../elements/loading/Loading";
import { getValidRange } from "@/app/helper/utils/calendarUtils";
import InstructorCalendarClient from "../instructors-dashboard/class-schedule/instructorCalendar/InstructorCalendarClient";

function InstructorCalendarForAdmin({
  instructorId,
  name,
  isAdminAuthenticated,
}: {
  instructorId: number | null;
  name?: string | null;
  isAdminAuthenticated?: boolean;
}) {
  const [instructorCalendarEvents, setInstructorCalendarEvents] = useState<
    EventType[]
  >([]);
  const [calendarValidRange, setCalendarValidRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!instructorId) return;

    try {
      const [classes, instructorAvailabilities, instructorProfile] =
        await Promise.all([
          getCalendarClasses(instructorId),
          getCalendarAvailabilities(instructorId),
          getInstructorProfile(instructorId),
        ]);

      setInstructorCalendarEvents([...classes, ...instructorAvailabilities]);
      const instructorCreatedAt = instructorProfile.createdAt;
      const calendarValidRange = getValidRange(instructorCreatedAt, 3);
      setCalendarValidRange(calendarValidRange);
    } catch (error) {
      setError("Failed to load classes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [instructorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!instructorId) return <></>;

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.calendarContainer}>
      {isLoading && <Loading />}
      {error && <div>{error}</div>}
      {!isLoading && !error && (
        <>
          {isAdminAuthenticated && name ? (
            <span className={styles.instructorName}>
              Instructor: &nbsp;{name}
            </span>
          ) : null}
          <InstructorCalendarClient
            instructorId={instructorId}
            instructorCalendarEvents={instructorCalendarEvents}
            validRange={calendarValidRange!}
            isAdminAuthenticated={isAdminAuthenticated}
          />
        </>
      )}
    </div>
  );
}

export default InstructorCalendarForAdmin;
