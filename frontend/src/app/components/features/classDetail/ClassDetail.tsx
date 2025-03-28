import {
  formatFiveMonthsLaterEndOfMonth,
  formatPreviousDay,
  formatTimeWithAddedMinutes,
  isPastPreviousDayDeadline,
  isPastClassDateTime,
  getShortMonth,
  getDayOfWeek,
  isPastClassEndTime,
  formatTime24Hour,
} from "../../../helper/utils/dateUtils";
import Image from "next/image";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import styles from "./ClassDetail.module.scss";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UsersIcon,
  VideoCameraIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

const ClassDetail = ({
  customerId, // Necessary when implementing the Rescheduling functionality
  classDetail,
  timeZone,
  handleCancel,
  isAdminAuthenticated, // Necessary when implementing the Rescheduling functionality
  handleModalClose,
}: {
  customerId: number;
  classDetail: ClassType | null;
  timeZone: string;
  handleCancel: (
    classId: number,
    classDateTime: string,
    customerId: number,
  ) => void;
  isAdminAuthenticated?: boolean;
  handleModalClose: () => void;
}) => {
  if (!classDetail) {
    return <div>No class details available</div>;
  }

  const classDateTime = new Date(classDetail.dateTime);
  const classMonth = getShortMonth(classDateTime);
  const classDay = classDateTime.getDate();
  const classDayOfWeek = getDayOfWeek(classDateTime);
  const classStartTime = formatTime24Hour(classDateTime);
  const classEndTime = formatTimeWithAddedMinutes(classDateTime, 25);

  const formatChildren = (children: Child[]) =>
    children.map((child) => child.name).join(", ");

  const statusClass =
    classDetail.status === "booked"
      ? styles.statusBooked
      : classDetail.status === "completed"
        ? styles.statusCompleted
        : classDetail.status === "canceledByInstructor"
          ? styles.statusCanceledByInstructor
          : styles.statusCanceled;

  return (
    <div className={`${styles.classCard} ${statusClass}`}>
      {/* Class Status */}
      <div className={styles.classStatus}>
        {classDetail.status === "booked" ||
        classDetail.status === "completed" ? (
          <CheckCircleIcon
            className={`${styles.classStatus__icon} ${statusClass}`}
          />
        ) : classDetail.status === "canceledByInstructor" ? (
          <ExclamationTriangleIcon
            className={`${styles.classStatus__icon} ${statusClass}`}
          />
        ) : (
          <XCircleIcon
            className={`${styles.classStatus__icon} ${statusClass}`}
          />
        )}

        <div className={styles.classStatus__name}>
          {classDetail.status === "booked"
            ? "Booked"
            : classDetail.status === "completed"
              ? "Completed"
              : classDetail.status === "canceledByCustomer"
                ? "Canceled by Customer"
                : classDetail.status === "canceledByInstructor"
                  ? "Canceled by Instructor"
                  : "Unknown Status"}
        </div>
      </div>

      {/* Instructor */}
      <div className={styles.instructor}>
        <Image
          src={`/instructors/${classDetail.instructor.icon}`}
          alt={classDetail.instructor.name}
          width={135}
          height={135}
          priority
          className={`${styles.instructor__icon} ${statusClass}`}
        />
        <div className={styles.instructor__name}>
          {classDetail.instructor.name}
        </div>
      </div>

      {/* Date & Time */}
      <div className={styles.dateTime}>
        <div className={styles.dateTime__iconContainer}>
          <CalendarDaysIcon className={styles.dateTime__icon} />
        </div>

        <div className={styles.dateTime__details}>
          <div className={styles.dateTime__date}>
            <div className={styles.dateTime__day}>{classDay}</div>
            <div className={styles.dateTime__month}>{classMonth}</div>
          </div>

          <div className={styles.dateTime__time}>
            <div className={styles.dateTime__dayOfWeek}>{classDayOfWeek}</div>
            <div className={styles.dateTime__classTime}>
              {classStartTime} - {classEndTime}
            </div>
          </div>
        </div>
      </div>

      {/* Children Attendance */}
      <div className={styles.children}>
        <div className={styles.children__iconContainer}>
          <UsersIcon className={styles.children__icon} />
        </div>
        <div className={styles.children__names}>
          {formatChildren(classDetail.classAttendance.children)}
        </div>
      </div>

      {/* Class URL */}
      {classDetail.status === "booked" &&
      !isPastClassEndTime(classDetail.dateTime, "Asia/Tokyo") ? (
        <div className={styles.classURL}>
          <div className={styles.classURL__iconContainer}>
            <VideoCameraIcon className={styles.classURL__icon} />
          </div>
          <div className={styles.classURL__details}>
            <div className={styles.classURL__url}>
              <a
                href={classDetail.instructor.classURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {classDetail.instructor.classURL}
              </a>
            </div>
            <div className={styles.classURL__password}>
              Meeting ID: {classDetail.instructor.meetingId}
            </div>
            <div className={styles.classURL__password}>
              Passcode: {classDetail.instructor.passcode}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {/* Buttons */}
      {
        // condition: class status: booked, current date&time: before the day of the class
        classDetail.status === "booked" &&
        !isPastPreviousDayDeadline(classDetail.dateTime) ? (
          <div className={styles.buttons}>
            <ActionButton
              btnText="Back"
              className="back"
              onClick={handleModalClose}
            />
            <ActionButton
              onClick={() =>
                handleCancel(classDetail.id, classDetail.dateTime, customerId)
              }
              btnText="Cancel Booking"
              className="cancelBooking"
            />
            {/* TODO: Allow the customer to reschedule a class from the modal class detail */}
            {/* {isAdminAuthenticated ? (
        <RedirectButton
          linkURL={`/admins/customer-list/${customerId}/classes/${classDetail.id}/reschedule`}
          btnText={"Reschedule"}
          Icon={PencilIcon}
          className="rescheduleBtn"
        />
      ) : (
        <RedirectButton
          linkURL={`/customers/${customerId}/classes/${classDetail.id}/reschedule`}
          btnText={"Reschedule"}
          Icon={PencilIcon}
          className="rescheduleBtn"
        />
      )} */}{" "}
          </div>
        ) : (
          <div className={styles.buttons}>
            <ActionButton
              btnText="Back"
              className="back"
              onClick={handleModalClose}
            />
          </div>
        )
      }

      {/* Notification */}
      {
        // condition 1: class status: booked, current date&time: before the day of the class
        classDetail.status === "booked" &&
        !isPastPreviousDayDeadline(classDetail.dateTime) ? (
          <div className={styles.notification}>
            <div className={styles.notification__iconContainer}>
              <InformationCircleIcon className={styles.notification__icon} />
            </div>
            <p>
              If cancelled by{" "}
              <span className={styles.notification__span}>
                {`${formatPreviousDay(new Date(classDetail.dateTime), timeZone)}`}
              </span>
              , this class can be rescheduled until{" "}
              <span className={styles.notification__span}>
                {`${formatFiveMonthsLaterEndOfMonth(new Date(classDetail.dateTime), timeZone)}`}
              </span>
              .
            </p>
          </div>
        ) : // condition 2: class status: booked, current date&time: on the same day of the class, but before the start of the class
        classDetail.status === "booked" &&
          isPastPreviousDayDeadline(classDetail.dateTime) &&
          !isPastClassDateTime(classDetail.dateTime, "Asia/Tokyo") ? (
          <div className={styles.notification}>
            <div className={styles.notification__iconContainer}>
              <InformationCircleIcon className={styles.notification__icon} />
            </div>
            <div>
              <p>
                If you need to cancel today&apos;s classes, please contact our
                staff{" "}
                <span className={styles.notification__span}>via LINE</span>.
                Please note that{" "}
                <span className={styles.notification__span}>
                  no make-up classes will be available
                </span>{" "}
                in this case.
              </p>
            </div>
          </div>
        ) : classDetail.status === "canceledByCustomer" ? (
          <div className={styles.notification}>
            <div className={styles.notification__iconContainer}>
              <InformationCircleIcon className={styles.notification__icon} />
            </div>
            <div>
              <p>
                Classes canceled by the day before are counted towards the
                number of bookable classes and are valid for 5 months.
              </p>
            </div>
          </div>
        ) : classDetail.status === "canceledByInstructor" ? (
          <div className={styles.notification}>
            <div className={styles.notification__iconContainer}>
              <InformationCircleIcon className={styles.notification__icon} />
            </div>
            <div>
              <p>
                Classes canceled by the instructor are counted towards the
                number of bookable classes and are valid for 5 months.
              </p>
            </div>
          </div>
        ) : (
          ""
        )
      }
    </div>
  );
};

export default ClassDetail;
