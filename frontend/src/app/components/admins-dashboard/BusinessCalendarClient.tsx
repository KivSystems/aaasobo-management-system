"use client";

import FullCalendar from "@fullcalendar/react";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import {
  DateSelectArg,
  EventClickArg,
  DayCellMountArg,
} from "@fullcalendar/core";

const BusinessCalendarClient = ({
  businessSchedule,
  validRange,
  isAdminAuthenticated,
}: BusinessCalendarClientProps) => {
  // Show message if the business schedule is not loaded
  if (!businessSchedule || businessSchedule.length === 0) {
    return <div>Failed to load AaasoBo! schedule.</div>;
  }

  // Map to store date to color mapping
  const dateToColorMap = new Map<string, string>(
    businessSchedule.map((item) => [item.date, item.color]),
  );

  // TODO: Implement holiday and event registration and remove functions (only for admin)

  return (
    <FullCalendar
      plugins={[interactionPlugin, multiMonthPlugin]}
      initialView={"multiMonthYear"}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "",
      }}
      timeZone="Asia/Tokyo"
      locale="en"
      contentHeight="auto"
      selectable={true}
      multiMonthMinWidth={300}
      showNonCurrentDates={false}
      validRange={validRange}
      slotEventOverlap={true}
      dayCellDidMount={(arg: DayCellMountArg) => {
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
      }}
    />
  );
};

export default BusinessCalendarClient;
