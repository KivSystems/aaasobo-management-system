"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import { EventClickArg } from "@fullcalendar/core";
import { useLanguage } from "@/app/contexts/LanguageContext";
import Modal from "@/app/components/elements/modal/Modal";
import ClassDetail from "@/app/components/features/classDetail/ClassDetail";
import {
  createRenderEventContent,
  getValidRange,
} from "@/app/helper/utils/calendarUtils";

export default function CustomerCalendar({
  customerId,
  classes,
  createdAt,
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

  const validRange = () => getValidRange(createdAt);
  const renderCustomerEventContent = createRenderEventContent("customer");

  const handleModalClose = () => {
    setClassDetail(null);
    setIsClassDetailModalOpen(false);
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
        // TODO: After the 'Holiday' table is created, apply the styling to them
        // dayCellDidMount={dayCellDidMount}
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
      />

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
