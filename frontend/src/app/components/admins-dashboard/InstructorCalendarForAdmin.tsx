"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./InstructorCalendarForAdmin.module.scss";
import {
  getCalendarAvailabilities,
  getCalendarClasses,
  getInstructorProfile,
} from "@/app/helper/api/instructorsApi";
import Loading from "../elements/loading/Loading";
import { getValidRange } from "@/app/helper/utils/calendarUtils";
import InstructorCalendarClient from "../instructors-dashboard/class-schedule/instructorCalendar/InstructorCalendarClient";
import {
  getAllBusinessSchedules,
  getAllEvents,
} from "@/app/helper/api/adminsApi";

function InstructorCalendarForAdmin({
  adminId,
  instructorId,
  name,
  isAdminAuthenticated,
}: {
  adminId?: number | null;
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
  const [schedule, setSchedule] = useState<any>([]);
  const [colorsForEvents, setColorsForEvents] = useState<
    { event: string; color: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!instructorId) return;

    try {
      const [
        classes,
        instructorAvailabilities,
        instructorProfile,
        schedule,
        events,
      ] = await Promise.all([
        getCalendarClasses(instructorId),
        getCalendarAvailabilities(instructorId),
        getInstructorProfile(instructorId),
        getAllBusinessSchedules(),
        getAllEvents(),
      ]);

      setInstructorCalendarEvents([...classes, ...instructorAvailabilities]);
      const instructorCreatedAt = instructorProfile.createdAt;
      const calendarValidRange = getValidRange(instructorCreatedAt, 3);
      setCalendarValidRange(calendarValidRange);
      setSchedule(schedule);
      const colorsForEvents: { event: string; color: string }[] = events
        .map((e: EventColor) => ({
          event: e.Event,
          color: e["Color Code"],
        }))
        .filter((e: { event: string; color: string }) => e.color !== "#FFFFFF"); // Filter out events with white color (#FFFFFF)
      setColorsForEvents(colorsForEvents);
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
            adminId={adminId}
            instructorId={instructorId}
            instructorCalendarEvents={instructorCalendarEvents}
            validRange={calendarValidRange!}
            isAdminAuthenticated={isAdminAuthenticated}
            businessSchedule={schedule.organizedData}
            colorsForEvents={colorsForEvents}
          />
        </>
      )}
    </div>
  );
}

export default InstructorCalendarForAdmin;
