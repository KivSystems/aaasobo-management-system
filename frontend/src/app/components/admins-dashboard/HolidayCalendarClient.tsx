"use client";

import FullCalendar from "@fullcalendar/react";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";

const HolidayCalendarClient = ({
  isAdminAuthenticated,
  validRange,
}: HolidayCalendarClientProps) => {
  return (
    <FullCalendar
      plugins={[interactionPlugin, multiMonthPlugin]}
      initialView={"multiMonthYear"}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "",
      }}
      multiMonthMinWidth={300}
      validRange={validRange}
      locale="en"
      contentHeight="auto"
      selectable={true}
    />
  );
};

export default HolidayCalendarClient;
