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
import { initialSetup } from "@/app/helper/utils/initialSetup";
import InstructorCalendarClient from "../instructors-dashboard/class-schedule/instructorCalendar/InstructorCalendarClient";
import InstructorSearch from "@/app/components/admins-dashboard/InstructorSearch";
import {
  getAllBusinessSchedules,
  getAllEvents,
} from "@/app/helper/api/adminsApi";

function InstructorCalendarForAdmin({
  adminId,
  userSessionType,
}: {
  adminId: number | null;
  userSessionType: UserType;
}) {
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const [instructorName, setInstructorName] = useState<string | null>(null);
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

  // Perform initial setup for the admin user
  useEffect(() => {
    initialSetup("admin");
  }, []);

  const handleSendInstructor = async (id: number, name: string) => {
    localStorage.setItem("activeInstructor", [String(id), name].join(","));
    setInstructorId(id);
    setInstructorName(name);
  };

  useEffect(() => {
    const activeInstructor = localStorage.getItem("activeInstructor");

    if (activeInstructor === null) {
      return;
    }
    const [id, name] = activeInstructor.split(",");
    setInstructorId(parseInt(id));
    setInstructorName(name);
  }, []);

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
          <InstructorSearch handleSendInstructor={handleSendInstructor} />
          {userSessionType === "admin" && instructorName ? (
            <span className={styles.instructorName}>
              Instructor: &nbsp;{instructorName}
            </span>
          ) : null}
          <InstructorCalendarClient
            adminId={adminId}
            instructorId={instructorId}
            instructorCalendarEvents={instructorCalendarEvents}
            validRange={calendarValidRange!}
            userSessionType={userSessionType}
            businessSchedule={schedule.organizedData}
            colorsForEvents={colorsForEvents}
          />
        </>
      )}
    </div>
  );
}

export default InstructorCalendarForAdmin;
