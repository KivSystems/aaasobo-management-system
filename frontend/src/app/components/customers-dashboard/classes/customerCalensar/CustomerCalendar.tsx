"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import { DayCellMountArg, EventClickArg } from "@fullcalendar/core";
import { useLanguage } from "@/app/contexts/LanguageContext";
import Modal from "@/app/components/elements/modal/Modal";
import ClassDetail from "@/app/components/features/classDetail/ClassDetail";
import {
  createRenderEventContent,
  getValidRange,
} from "@/app/helper/utils/calendarUtils";
import CalendarLegend from "@/app/components/features/calendarLegend/CalendarLegend";

export default function CustomerCalendar({
  customerId,
  classes,
  createdAt,
  businessSchedule,
  colorsForEvents,
}: CustomerCalendarProps) {
  const [isClassDetailModalOpen, setIsClassDetailModalOpen] = useState(false);
  const [classDetail, setClassDetail] = useState<CustomerClass | null>(null);
  const { language } = useLanguage();

  const handleEventClick = (clickInfo: EventClickArg) => {
    const classId = clickInfo.event.extendedProps.classId;
    const selectedClassDetail = classes.find(
      (classItem) => classItem.classId === classId,
    );
    selectedClassDetail && setClassDetail(selectedClassDetail);
    setIsClassDetailModalOpen(true);
  };

  const validRange = () => getValidRange(createdAt, 3);
  const renderCustomerEventContent = createRenderEventContent("customer");

  const handleModalClose = () => {
    setClassDetail(null);
    setIsClassDetailModalOpen(false);
  };

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
        initialView={"dayGridMonth"}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        events={classes}
        eventClick={handleEventClick}
        eventContent={renderCustomerEventContent}
        validRange={validRange}
        locale={language === "ja" ? "ja" : "en"}
        dayCellContent={(arg) => {
          return { html: String(arg.date.getDate()) };
        }}
        contentHeight="auto"
        dayMaxEvents={true}
        editable={false}
        selectable={false}
        eventDisplay="block"
        allDaySlot={false}
        dayCellDidMount={dayCellColors}
      />

      {colorsForEvents.length > 0 && (
        <CalendarLegend colorsForEvents={colorsForEvents} language={language} />
      )}

      <Modal
        isOpen={isClassDetailModalOpen}
        onClose={handleModalClose}
        className="classDetail"
      >
        <ClassDetail
          classDetail={classDetail}
          customerId={customerId}
          isAdminAuthenticated
          handleModalClose={handleModalClose}
          language={language}
        />
      </Modal>
    </>
  );
}
