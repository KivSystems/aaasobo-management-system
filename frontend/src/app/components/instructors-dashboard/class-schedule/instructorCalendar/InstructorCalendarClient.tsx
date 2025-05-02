"use client";

import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import { EventClickArg } from "@fullcalendar/core";
import {
  createRenderEventContent,
  getClassSlotTimesForCalendar,
} from "@/app/helper/utils/calendarUtils";

const InstructorCalendarClient = ({
  instructorId,
  isAdminAuthenticated,
  instructorCalendarEvents,
  validRange,
}: InstructorCalendarClientProps) => {
  const router = useRouter();

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (clickInfo.event.title === "No booked class") return;

    const classId = clickInfo.event.extendedProps.classId;
    const redirectURL = isAdminAuthenticated
      ? `/admins/instructor-list/${instructorId}/class-schedule/${classId}`
      : `/instructors/${instructorId}/class-schedule/${classId}`;

    router.push(redirectURL);
  };

  const renderInstructorEventContent = createRenderEventContent("instructor");

  const classSlotTimes = getClassSlotTimesForCalendar();

  return (
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
      validRange={validRange}
      // TODO: After the 'Holiday' table is created, apply the styling to them
      // dayCellDidMount={dayCellDidMount}
      locale="en"
      contentHeight="auto"
      dayMaxEvents={true}
      editable={false}
      selectable={false}
      eventDisplay="block"
      allDaySlot={false}
      {...(classSlotTimes && {
        slotMinTime: classSlotTimes.start,
        slotMaxTime: classSlotTimes.end,
      })}
      slotLabelFormat={{
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
      }}
    />
  );
};

export default InstructorCalendarClient;
