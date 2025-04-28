"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./InstructorCalendarForAdmin.module.scss";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import { EventClickArg } from "@fullcalendar/core";
import {
  getCalendarAvailabilities,
  getCalendarClasses,
  getInstructorProfile,
} from "@/app/helper/api/instructorsApi";
import Loading from "../elements/loading/Loading";
import { useRouter } from "next/navigation";
import {
  createRenderEventContent,
  getValidRange,
} from "@/app/helper/utils/calendarUtils";
import { getClassSlotTimesForCalendar } from "@/app/helper/utils/dateUtils";

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
  const router = useRouter();

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
      const calendarValidRange = getValidRange(instructorCreatedAt);
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

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (clickInfo.event.title === "No booked class" || !isAdminAuthenticated)
      return;

    const classId = clickInfo.event.extendedProps.classId;
    const redirectURL = `/admins/instructor-list/${instructorId}/class-schedule/${classId}`;
    router.push(redirectURL);
  };

  const renderInstructorEventContent = createRenderEventContent("instructor");

  const { slotMinTime, slotMaxTime } = getClassSlotTimesForCalendar();

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
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              momentTimezonePlugin,
            ]}
            initialView={"timeGridWeek"}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={instructorCalendarEvents}
            eventClick={handleEventClick}
            eventContent={renderInstructorEventContent}
            validRange={calendarValidRange!}
            // TODO: After the 'Holiday' table is created, apply the styling to them
            // dayCellDidMount={dayCellDidMount}
            locale="en"
            contentHeight="auto"
            dayMaxEvents={true}
            editable={false}
            selectable={false}
            eventDisplay="block"
            allDaySlot={false}
            slotMinTime={slotMinTime}
            slotMaxTime={slotMaxTime}
          />
        </>
      )}
    </div>
  );
}

export default InstructorCalendarForAdmin;
