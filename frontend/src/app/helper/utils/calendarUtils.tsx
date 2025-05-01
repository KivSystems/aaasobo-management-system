import { DayCellContentArg, EventContentArg } from "@fullcalendar/core";
import styles from "../../components/features/calendarView/CalendarView.module.scss";
import Image from "next/image";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { formatTime24Hour } from "./dateUtils";

export const createRenderEventContent = (userType: UserType) => {
  const RenderEventContent = (eventInfo: EventContentArg) => {
    const classDateTime = new Date(eventInfo.event.startStr);
    const classTime = formatTime24Hour(classDateTime);

    const { title } = eventInfo.event;
    const { instructorIcon, instructorNickname, classStatus } =
      eventInfo.event.extendedProps;

    const isCustomer = userType === "customer";
    const isClickable = isCustomer || title !== "No booked class";

    return (
      <div
        className={styles.eventBlock}
        style={{
          cursor: isClickable ? "pointer" : "default",
        }}
      >
        {isCustomer && classStatus === "booked" && instructorIcon ? (
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
          className={`${styles.eventDetails} ${
            classStatus === "booked"
              ? styles.booked
              : classStatus === "completed"
                ? styles.completed
                : classStatus === "canceledByCustomer" ||
                    classStatus === "canceledByInstructor"
                  ? styles.canceled
                  : ""
          }`}
        >
          <div className={styles.eventTime}>{classTime} -</div>
          <div className={styles.eventTitle}>{title}</div>
        </div>
      </div>
    );
  };

  return RenderEventContent;
};

export const getValidRange = (createdAt: string) => {
  // The valid range starts from the account creation date and ends at the end of the month, three months later.
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 4, 1);

  return {
    start: createdAt.split("T")[0],
    end: end.toISOString().split("T")[0],
  };
};

// TODO: Applies custom styles to calendar cells based on holiday dates
export const createDayCellDidMount = (
  holidays: string[],
  styles: { [key: string]: string },
) => {
  const DayCellDidMount = (info: DayCellContentArg) => {
    const date = new Date(info.date);
    const formattedDate = date.toISOString().split("T")[0];

    if (!holidays.includes(formattedDate)) return;

    info.el.classList.add(styles.holidayCell);

    const dayNumber = info.el.querySelector(".fc-daygrid-day-number");
    if (dayNumber) {
      dayNumber.classList.add(styles.holidayDateNumber);
    }
  };

  return DayCellDidMount;
};

export const getClassSlotTimesForCalendar = () => {
  // Step 1: Get the user's timezone offset from UTC in minutes
  const timezoneOffsetMinutes = new Date().getTimezoneOffset();

  // Step 2: Calculate class start and end times, which are UTC midnight and noon (in Japan time: start at 09:00 and end at 21:00)
  const utcClassesStartTime = new Date(Date.UTC(1970, 0, 1, 0, 0, 0)); // 00:00 UTC
  const utcClassesEndTime = new Date(Date.UTC(1970, 0, 1, 12, 0, 0)); // 12:00 UTC

  // Step 3: Adjust UTC times to the user's local time by subtracting the timezone offset
  const localClassesStartTime = new Date(
    utcClassesStartTime.getTime() - timezoneOffsetMinutes * 60 * 1000,
  );
  const localClassesEndTime = new Date(
    utcClassesEndTime.getTime() - timezoneOffsetMinutes * 60 * 1000,
  );

  // Step 4: Format times to "HH:mm:ss"
  const formatTime = (date: Date) => date.toISOString().substring(11, 19);
  const formattedLocalClassesStartTime = formatTime(localClassesStartTime);
  const formattedLocalClassesEndTime = formatTime(localClassesEndTime);

  // Step 5: Compare and set correct min and max times
  // In some time zones (e.g., Vancouver), the local class start time (17:00) is later than the end time (05:00).
  // In such cases, the min and max times need to be reversed.
  const slotMinTime =
    formattedLocalClassesStartTime < formattedLocalClassesEndTime
      ? formattedLocalClassesStartTime
      : formattedLocalClassesEndTime;
  const slotMaxTime =
    formattedLocalClassesEndTime > formattedLocalClassesStartTime
      ? formattedLocalClassesEndTime
      : formattedLocalClassesStartTime;

  return {
    slotMinTime,
    slotMaxTime,
  };
};
