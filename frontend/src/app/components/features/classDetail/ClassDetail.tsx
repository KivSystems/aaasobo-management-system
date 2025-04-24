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
import { cancelClass } from "@/app/helper/api/classesApi";
import { revalidateCustomerCalendar } from "@/app/actions/revalidate";
import { toast } from "react-toastify";

const ClassDetail = ({
  customerId, // Necessary when implementing the Rescheduling functionality
  classDetail,
  timeZone,
  isAdminAuthenticated, // Necessary when implementing the Rescheduling functionality
  handleModalClose,
}: {
  customerId: number;
  classDetail: CustomerClass | null;
  timeZone: string;
  isAdminAuthenticated?: boolean;
  handleModalClose: () => void;
}) => {
  if (!classDetail) {
    return <div>No class details available</div>;
  }

  const classDateTime = new Date(classDetail.start);
  const classMonth = getShortMonth(classDateTime);
  const classDay = classDateTime.getDate();
  const classDayOfWeek = getDayOfWeek(classDateTime);
  const classStartTime = formatTime24Hour(classDateTime);
  const classEndTime = formatTimeWithAddedMinutes(classDateTime, 25);

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

  const statusClass =
    classDetail.classStatus === "booked"
      ? styles.statusBooked
      : classDetail.classStatus === "completed"
        ? styles.statusCompleted
        : classDetail.classStatus === "canceledByInstructor"
          ? styles.statusCanceledByInstructor
          : styles.statusCanceled;

  return (
    <div className={`${styles.classCard} ${statusClass}`}>
      {/* Class Status */}
      <div className={styles.classStatus}>
        {classDetail.classStatus === "booked" ||
        classDetail.classStatus === "completed" ? (
          <CheckCircleIcon
            className={`${styles.classStatus__icon} ${statusClass}`}
          />
        ) : classDetail.classStatus === "canceledByInstructor" ? (
          <ExclamationTriangleIcon
            className={`${styles.classStatus__icon} ${statusClass}`}
          />
        ) : (
          <XCircleIcon
            className={`${styles.classStatus__icon} ${statusClass}`}
          />
        )}

        <div className={styles.classStatus__name}>
          {classDetail.classStatus === "booked"
            ? "Booked"
            : classDetail.classStatus === "completed"
              ? "Completed"
              : classDetail.classStatus === "canceledByCustomer"
                ? "Canceled by Customer"
                : classDetail.classStatus === "canceledByInstructor"
                  ? "Canceled by Instructor"
                  : "Unknown Status"}
        </div>
      </div>

      {/* Instructor */}
      <div className={styles.instructor}>
        <Image
          src={`/instructors/${classDetail.instructorIcon}`}
          alt={classDetail.instructorName}
          width={135}
          height={135}
          priority
          className={`${styles.instructor__icon} ${statusClass}`}
        />
        <div className={styles.instructor__name}>
          {classDetail.instructorName}
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
        <div className={styles.children__names}>{classDetail.title}</div>
      </div>

      {/* Class URL */}
      {classDetail.classStatus === "booked" &&
      !isPastClassEndTime(classDetail.start, "Asia/Tokyo") ? (
        <div className={styles.classURL}>
          <div className={styles.classURL__iconContainer}>
            <VideoCameraIcon className={styles.classURL__icon} />
          </div>
          <div className={styles.classURL__details}>
            <div className={styles.classURL__url}>
              <a
                href={classDetail.instructorClassURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {classDetail.instructorClassURL}
              </a>
            </div>
            <div className={styles.classURL__password}>
              Meeting ID: {classDetail.instructorMeetingId}
            </div>
            <div className={styles.classURL__password}>
              Passcode: {classDetail.instructorPasscode}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {/* Buttons */}
      {
        // condition: class status: booked, current date&time: before the day of the class
        classDetail.classStatus === "booked" &&
        !isPastPreviousDayDeadline(classDetail.start) ? (
          <div className={styles.buttons}>
            <ActionButton
              btnText="Back"
              className="back"
              onClick={handleModalClose}
            />
            <ActionButton
              onClick={() =>
                handleCancel(classDetail.classId, classDetail.start, customerId)
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
        classDetail.classStatus === "booked" &&
        !isPastPreviousDayDeadline(classDetail.start) ? (
          <div className={styles.notification}>
            <div className={styles.notification__iconContainer}>
              <InformationCircleIcon className={styles.notification__icon} />
            </div>
            <p>
              If cancelled by{" "}
              <span className={styles.notification__span}>
                {`${formatPreviousDay(new Date(classDetail.start), timeZone)}`}
              </span>
              , this class can be rescheduled until{" "}
              <span className={styles.notification__span}>
                {`${formatFiveMonthsLaterEndOfMonth(new Date(classDetail.start), timeZone)}`}
              </span>
              .
            </p>
          </div>
        ) : // condition 2: class status: booked, current date&time: on the same day of the class, but before the start of the class
        classDetail.classStatus === "booked" &&
          isPastPreviousDayDeadline(classDetail.start) &&
          !isPastClassDateTime(classDetail.start, "Asia/Tokyo") ? (
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
        ) : classDetail.classStatus === "canceledByCustomer" ? (
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
        ) : classDetail.classStatus === "canceledByInstructor" ? (
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
