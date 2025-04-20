"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import {
  DayCellContentArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import styles from "../../../features/calendarView/CalendarView.module.scss";
import {
  formatTime24Hour,
  isPastPreviousDayDeadline,
} from "@/app/helper/utils/dateUtils";
import Image from "next/image";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { cancelClass } from "@/app/helper/api/classesApi";
import { revalidateCustomerCalendar } from "@/app/actions/revalidate";
import { toast } from "react-toastify";
import Modal from "@/app/components/elements/modal/Modal";
import ClassDetail from "@/app/components/features/classDetail/ClassDetail";

export default function CustomerCalendar({
  isAdminAuthenticated,
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

  const renderEventContent = (eventInfo: EventContentArg) => {
    const classDateTime = new Date(eventInfo.event.startStr);
    const classTime = formatTime24Hour(classDateTime);

    const { instructorIcon, instructorNickname, classStatus } =
      eventInfo.event.extendedProps;
    const { title } = eventInfo.event;

    return (
      <div className={styles.eventBlock}>
        {classStatus === "booked" ? (
          <Image
            src={`/instructors/${instructorIcon}`}
            alt={instructorNickname || "Instructor"}
            width={30}
            height={30}
            priority
            className={styles.instructorIcon}
          />
        ) : classStatus === "completed" ? (
          <div className={styles.classStatusIcon}>
            <CheckCircleIcon className={styles.classStatusIcon__completed} />
          </div>
        ) : classStatus === "canceledByCustomer" ? (
          <div className={styles.classStatusIcon}>
            <XCircleIcon className={styles.classStatusIcon__canceled} />
          </div>
        ) : classStatus === "canceledByInstructor" ? (
          <div className={styles.classStatusIcon}>
            <ExclamationTriangleIcon
              className={styles.classStatusIcon__canceled}
            />
          </div>
        ) : null}
        <div
          className={`${styles.eventDetails} ${classStatus === "booked" ? styles.booked : classStatus === "completed" ? styles.completed : classStatus === "canceledByCustomer" || classStatus === "canceledByInstructor" ? styles.canceled : ""}`}
        >
          <div className={styles.eventTime}>{classTime} -</div>
          <div className={styles.eventTitle}>{title}</div>
        </div>
      </div>
    );
  };

  const validRange = () => {
    const now = new Date();
    // The calendar can be viewed until the end of the month, two months ahead.
    const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
    return {
      start: createdAt.split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  };

  const handleModalClose = () => {
    setClassDetail(null);
    setIsClassDetailModalOpen(false);
  };

  const handleCancel = async (
    classId: number,
    classDateTime: string,
    customerId: number,
  ) => {
    const isPastPreviousDay = isPastPreviousDayDeadline(classDateTime);

    if (isPastPreviousDay)
      return alert(
        "Classes cannot be canceled on or after the scheduled day of the class.",
      );

    const confirmed = window.confirm(
      "Are you sure you want to cancel this class?",
    );
    if (!confirmed) return;
    try {
      await cancelClass(classId);

      // TODO: Revalidation should be done directly from a server component or API call
      await revalidateCustomerCalendar(customerId, isAdminAuthenticated!);
      handleModalClose();
      toast.success("The class has been successfully canceled!");
    } catch (error) {
      console.error("Failed to cancel the class:", error);
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
        eventContent={renderEventContent}
        validRange={validRange}
        // TODO: After the 'Holiday' table is created, apply the styling to them
        // dayCellDidMount={dayCellDidMount}
        locale={language === "ja" ? "ja" : "en"}
        contentHeight="auto"
        dayMaxEvents={true}
        editable={false}
        selectable={false}
        eventDisplay="block"
        allDaySlot={false}
      />

      <Modal isOpen={isClassDetailModalOpen} onClose={handleModalClose}>
        <div className={styles.modal}>
          {customerId ? (
            <ClassDetail
              classDetail={classDetail}
              customerId={customerId}
              timeZone="Asia/Tokyo"
              handleCancel={handleCancel}
              isAdminAuthenticated
              handleModalClose={handleModalClose}
            />
          ) : (
            <p>No customer ID available</p>
          )}
        </div>
      </Modal>
    </>
  );
}
