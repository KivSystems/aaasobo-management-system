"use client";

import FullCalendar from "@fullcalendar/react";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, DayCellMountArg } from "@fullcalendar/core";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useFormState } from "react-dom";
import Modal from "@/app/components/elements/modal/Modal";
import BusinessCalendarModal from "@/app/components/admins-dashboard/BusinessCalendarModal";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import { updateScheduleAction } from "@/app/actions/updateContent";
import { CONTENT_UPDATE_SUCCESS_MESSAGE } from "@/app/helper/messages/formValidation";
import { getAllBusinessSchedules } from "@/app/helper/api/adminsApi";

const BusinessCalendarClient = ({
  businessSchedule: initialSchedule,
  events,
  validRange,
  isAdminAuthenticated,
}: BusinessCalendarClientProps) => {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [updateResultState, formAction] = useFormState(
    updateScheduleAction,
    {},
  );
  const [businessSchedule, setBusinessSchedule] = useState(
    initialSchedule || [],
  );
  const [scheduleVersion, setScheduleVersion] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[] | []>([]);
  const { localMessages, clearErrorMessage } =
    useFormMessages(updateResultState);

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

  // Convert date to string in the format "MM/DD/YYYY"
  const dateToString = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Register or delete event on selected date
  const handleDateSelect = (arg: DateSelectArg) => {
    // Check if the user is authenticated as an admin
    if (!isAdminAuthenticated) {
      return;
    }

    const startDate = new Date(arg.start);
    const endDate = new Date(arg.end.getTime() - 24 * 60 * 60 * 1000);
    const startDateStr = dateToString(startDate);
    const endDateStr = dateToString(endDate);

    // If the start date is the current date or before, do not allow selection
    if (startDate < new Date()) {
      alert("Cannot select past dates.");
      return;
    }

    clearErrorMessage("eventId");
    setIsModalOpen(true);

    // Set selected dates for updating the schedule
    if (startDate.getDate() === endDate.getDate()) {
      setSelectedDates([startDateStr]);
    } else {
      setSelectedDates([startDateStr, endDateStr]);
    }

    // Save the selected calendar position to localStorage
    const currentYear = new Date().getFullYear();
    const selectedYear = startDate.getFullYear();

    if (selectedYear < currentYear) {
      localStorage.setItem("calendarPosition", "prev");
    } else if (selectedYear > currentYear) {
      localStorage.setItem("calendarPosition", "next");
    } else {
      localStorage.setItem("calendarPosition", "default");
    }
  };

  // Get the initial date to display the appropriate year in the calendar
  const getInitialDate = () => {
    const saved = localStorage.getItem("calendarPosition");
    switch (saved) {
      case "prev":
        return new Date(new Date().getFullYear() - 1, 1, 0).toISOString();
      case "next":
        return new Date(new Date().getFullYear() + 1, 1, 0).toISOString();
      case "default":
        return new Date().toISOString();
      default:
        return new Date().toISOString();
    }
  };

  // Fetch the schedule data when the schedule is updated
  const fetchSchedule = async () => {
    try {
      const data = await getAllBusinessSchedules();
      setBusinessSchedule(data.organizedData);
    } catch (err) {
      toast.error("Failed to fetch schedule data");
    }
  };

  // Handle form submission for updating the schedule
  useEffect(() => {
    if ("result" in updateResultState && updateResultState.result) {
      toast.success(CONTENT_UPDATE_SUCCESS_MESSAGE("schedule"));
      fetchSchedule().then(() => {
        setIsModalOpen(false);
        setSelectedDates([]);
        setScheduleVersion((prev) => prev + 1);
      });
    } else if (
      "errorMessage" in updateResultState &&
      updateResultState.errorMessage
    ) {
      toast.error(updateResultState.errorMessage);
    }
  }, [updateResultState]);

  // Display the failure message if the schedule is not loaded
  if (!businessSchedule || businessSchedule.length === 0 || !events) {
    return <div>Failed to load AaasoBo! schedule.</div>;
  }

  return (
    <>
      <FullCalendar
        key={scheduleVersion}
        ref={calendarRef}
        plugins={[interactionPlugin, multiMonthPlugin]}
        initialView="multiMonthYear"
        initialDate={getInitialDate()}
        headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
        timeZone="Asia/Tokyo"
        locale="en"
        contentHeight="auto"
        selectable
        multiMonthMinWidth={300}
        showNonCurrentDates={false}
        validRange={validRange}
        dayCellDidMount={dayCellColors}
        select={handleDateSelect}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="businessCalendarModal"
      >
        <form action={formAction}>
          <BusinessCalendarModal
            selectedDates={selectedDates}
            events={events}
            localMessages={localMessages}
            clearErrorMessage={clearErrorMessage}
          />
        </form>
      </Modal>
    </>
  );
};

export default BusinessCalendarClient;
