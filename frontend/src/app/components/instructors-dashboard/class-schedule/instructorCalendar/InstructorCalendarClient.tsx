"use client";

import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import { DayCellMountArg, EventClickArg } from "@fullcalendar/core";
import {
  createRenderEventContent,
  getClassSlotTimesForCalendar,
} from "@/app/helper/utils/calendarUtils";
import CalendarLegend from "@/app/components/features/calendarLegend/CalendarLegend";

const InstructorCalendarClient = ({
  adminId,
  instructorId,
  isAdminAuthenticated,
  instructorCalendarEvents,
  validRange,
  businessSchedule,
  colorsForEvents,
}: InstructorCalendarClientProps) => {
  const router = useRouter();

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (clickInfo.event.title === "No booked class") return;

    const classId = clickInfo.event.extendedProps.classId;
    const redirectURL = isAdminAuthenticated
      ? `/admins/${adminId}/instructor-list/${instructorId}/class-schedule/${classId}`
      : `/instructors/${instructorId}/class-schedule/${classId}`;

    router.push(redirectURL);
  };

  const renderInstructorEventContent = createRenderEventContent("instructor");

  const classSlotTimes = getClassSlotTimesForCalendar();

  // Map to store date to color mapping
  const dateToColorMap = new Map<string, string>(
    businessSchedule.map((item) => [item.date, item.color]),
  );

  // Set color for each date in the calendar
  const dayCellColors = (arg: DayCellMountArg) => {
    // Skip if the cell is not in the valid range (in previous or next month)
    if (arg.isOther) {
      return;
    }
    const dateStr = arg.date.toISOString().split("T")[0];
    const color = dateToColorMap.get(dateStr);
    // Set background color for the cell
    if (color) {
      arg.el.style.backgroundColor = color;
    }
  };

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
