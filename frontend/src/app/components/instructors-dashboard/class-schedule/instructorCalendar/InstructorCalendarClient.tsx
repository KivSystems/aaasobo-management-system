"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import { EventClickArg } from "@fullcalendar/core";
import {
  createRenderEventContent,
  getClassSlotTimesForCalendar,
  getDayCellColorHandler,
} from "@/app/helper/utils/calendarUtils";
import CalendarLegend from "@/app/components/features/calendarLegend/CalendarLegend";

const InstructorCalendarClient = ({
  adminId,
  instructorId,
  userSessionType,
  instructorCalendarEvents,
  validRange,
  businessSchedule,
  colorsForEvents,
}: InstructorCalendarClientProps) => {
  const router = useRouter();
  const cacheBust = useId();

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (clickInfo.event.title === "No booked class") return;

    const classId = clickInfo.event.extendedProps.classId;
    const redirectURL =
      userSessionType === "admin"
        ? `/admins/${adminId}/calendar/${instructorId}/class-schedule/${classId}`
        : `/instructors/${instructorId}/class-schedule/${classId}`;

    router.push(redirectURL);
  };

  const renderInstructorEventContent = createRenderEventContent(
    "instructor",
    cacheBust,
  );

  const classSlotTimes = getClassSlotTimesForCalendar();

  const dayCellColors = getDayCellColorHandler(businessSchedule);

  return (
    <>
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
        dayCellDidMount={dayCellColors}
      />

      {colorsForEvents.length > 0 && (
        <CalendarLegend colorsForEvents={colorsForEvents} language="en" />
      )}
    </>
  );
};

export default InstructorCalendarClient;
