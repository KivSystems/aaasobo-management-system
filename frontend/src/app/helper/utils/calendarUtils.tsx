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
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
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
