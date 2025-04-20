"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import styles from "./CalendarView.module.scss";
import {
  DayCellContentArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import Modal from "../../elements/modal/Modal";
import {
  cancelClass,
  fetchClassesForCalendar,
  getClassesByCustomerId,
} from "../../../helper/api/classesApi";
import ClassDetail from "../classDetail/ClassDetail";
import {
  formatTime24Hour,
  isPastPreviousDayDeadline,
} from "../../../helper/utils/dateUtils";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { revalidateCustomerCalendar } from "@/app/actions/revalidate";

type InstructorCalendarViewProps = {
  events?: Array<{
    classId?: number;
    title: string;
    start: string;
    end: string;
    color: string;
    instructorIcon?: string;
    instructorNickname?: string;
    classStatus?:
      | "booked"
      | "completed"
      | "canceledByCustomer"
      | "canceledByInstructor";
  }>;
  holidays?: string[];
  customerId?: number;
  instructorId?: number;
  isAdminAuthenticated?: boolean;
  fetchData?: () => void;
};

const CalendarView: React.FC<InstructorCalendarViewProps> = ({
  events,
  holidays,
  customerId,
  instructorId,
  isAdminAuthenticated,
  fetchData,
}) => {
  const [isClassDetailModalOpen, setIsClassDetailModalOpen] = useState(false);
  const [classes, setClasses] = useState<ClassType[] | null>(null);
  const [classDetail, setClassDetail] = useState<ClassType | null>(null);
  const router = useRouter();

  const fetchClasses = useCallback(async () => {
    if (!customerId) return;

    try {
      const classes: ClassType[] = await getClassesByCustomerId(customerId);
      setClasses(classes);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  }, [customerId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Formats and displays the content of an event on the calendar view page
  const renderEventContent = (eventInfo: EventContentArg) => {
    const classDateTime = new Date(eventInfo.event.startStr);
    const classTime = formatTime24Hour(classDateTime);

    const { instructorIcon, instructorNickname, classStatus } =
      eventInfo.event.extendedProps;
    const { title } = eventInfo.event;

    const isClickable = eventInfo.event.title !== "No booked class";

    return (
      <div
        className={styles.eventBlock}
        style={{
          cursor: isClickable ? "pointer" : "default",
        }}
      >
        {classStatus === "booked" && instructorIcon ? (
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

  // // TODO: Applies custom styles to calendar cells based on holiday dates
  // const dayCellDidMount = (info: DayCellContentArg) => {
  //   const date = new Date(info.date);
  //   const formattedDate = date.toISOString().split("T")[0];

  //   if (!holidays.includes(formattedDate)) {
  //     return;
  //   }
  //   info.el.classList.add(styles.holidayCell);
  //   const dayNumber = info.el.querySelector(".fc-daygrid-day-number");
  //   if (dayNumber) {
  //     dayNumber.classList.add(styles.holidayDateNumber);
  //   }
  // };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const classId = clickInfo.event.extendedProps.classId;
    if (instructorId && clickInfo.event.title !== "No booked class") {
      if (isAdminAuthenticated) {
        router.push(
          `/admins/instructor-list/${instructorId}/class-schedule/${classId}`,
        );
        return;
      }
      router.push(`/instructors/${instructorId}/class-schedule/${classId}`);
    } else if (customerId) {
      if (!classes) return;
      const selectedClassDetail = classes.find(
        (eachClass) => eachClass.id === classId,
      );
      selectedClassDetail && setClassDetail(selectedClassDetail);
      setIsClassDetailModalOpen(true);
      // If the Afmin dashboard uses class details page, instead of the modal, the code below should be used
      // if (isAdminAuthenticated) {
      //   router.push(`/admins/customer-list/${customerId}/classes/${classId}`);
      //   return;
      // }
      // router.push(`/customers/${customerId}/classes/${classId}`);
    }
  };

  // To resolve the VS code complaint
  CalendarView.displayName = "CalendarView";

  const validRange = () => {
    const now = new Date();
    // TODO: 'start' should be the Instructor's 'createdDate'
    const start = new Date(2024, 0, 1);
    // The calendar can be viewed until the end of the month, two months ahead.
    const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
    return {
      start: start.toISOString().split("T")[0],
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
      // fetchData?.();
      fetchClasses();
      handleModalClose();
      toast.success("The class has been successfully canceled!");

      // TODO: Revalidation should be done directly from a server component or API call
      await revalidateCustomerCalendar(customerId, isAdminAuthenticated!);
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
        // initialView={instructorId ? "timeGridWeek" : "dayGridMonth"}
        initialView={"dayGridMonth"}
        headerToolbar={
          instructorId
            ? {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }
            : {
                left: "prev,next today",
                center: "title",
                right: "",
              }
        }
        events={events}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
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
      />

      {/* <Modal isOpen={isClassDetailModalOpen} onClose={handleModalClose}>
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
      </Modal> */}
    </>
  );
};

export default CalendarView;
