import {
  formatBirthdateToISO,
  formatTime24Hour,
  formatTimeWithAddedMinutes,
  getDayOfWeek,
  getShortMonth,
  hasTimePassed,
  // isPastClassEndTime,
} from "@/app/helper/utils/dateUtils";
import styles from "./ClassDetailsCard.module.scss";
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";
import {
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  VideoCameraIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { UserIcon as UserIconOutline } from "@heroicons/react/24/outline";

const ClassDetailsCard = ({
  classDetail,
  timeZone,
}: {
  classDetail: InstructorClassDetail | null;
  timeZone: string;
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

  const statusClass =
    classDetail.status === "booked"
      ? styles.statusBooked
      : classDetail.status === "completed"
        ? styles.statusCompleted
        : classDetail.status === "canceledByInstructor"
          ? styles.statusCanceledByInstructor
          : styles.statusCanceled;

  return (
    <div className={styles.classCardContainer}>
      <div className={styles.classCardContainer__title}>Class Details</div>
      <div className={`${styles.classCard} ${statusClass}`}>
        {/* Class Status */}
        <div className={styles.classStatus}>
          <div className={styles.classStatus__iconContainer}>
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
          </div>

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

        {/* Date & TIme */}
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

        {/* Class URL */}
        {classDetail.status === "booked" && !hasTimePassed(classEndTime) ? (
          <div className={styles.classURL}>
            <div className={styles.classURL__iconContainer}>
              <VideoCameraIcon className={styles.classURL__icon} />
            </div>
            <div className={styles.classURL__details}>
              <div className={styles.classURL__url}>
                <a
                  href={classDetail.classURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {classDetail.classURL}
                </a>
              </div>
              <div className={styles.classURL__password}>
                Meeting ID: {classDetail.meetingId}
              </div>
              <div className={styles.classURL__password}>
                Passcode: {classDetail.passcode}
              </div>
            </div>
          </div>
        ) : (
          ""
        )}

        {/* Children */}
        <div className={styles.children}>
          <div className={styles.children__title}>
            {classDetail.status === "booked" || "canceledByCustomer"
              ? "Attending Children"
              : "Attended Children"}
          </div>

          {classDetail.attendingChildren.length === 0 ? (
            <div className={styles.children__header}>
              <div className={styles.children__iconContainer}>
                <UserIconOutline className={styles.children__icon} />
              </div>
              <div className={styles.children__nameContainer}>
                <div className={styles.children__nameTitle}>
                  The registered children were absent.
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.children__contentContainer}>
              {classDetail.attendingChildren.map((child) => (
                <div key={child.id} className={styles.children__content}>
                  <div className={styles.children__header}>
                    <div className={styles.children__iconContainer}>
                      <UserIconOutline className={styles.children__icon} />
                    </div>
                    <div className={styles.children__nameContainer}>
                      <div className={styles.children__nameTitle}>Name</div>
                      <div className={styles.children__name}>{child.name}</div>
                    </div>
                  </div>
                  <div className={styles.children__birthdateContainer}>
                    <div className={styles.children__birthdateTitle}>
                      Birthdate
                    </div>
                    <div className={styles.children__birthdate}>
                      {child.birthdate
                        ? formatBirthdateToISO(child.birthdate)
                        : "N/A"}
                    </div>
                  </div>
                  <div className={styles.children__personalInfoContainer}>
                    <div className={styles.children__personalInfoTitle}>
                      Notes
                    </div>
                    <div className={styles.children__personalInfo}>
                      {child.personalInfo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guardian */}
        <div className={styles.guardian}>
          <div className={styles.guardian__iconContainer}>
            <UserIcon className={styles.guardian__icon} />
          </div>
          <div className={styles.guardian__name}>
            Guardian: {classDetail.customerName}
          </div>
        </div>

        {/* Notification */}
        {classDetail.status === "booked" ? (
          <div className={styles.notification}>
            <div className={styles.notification__iconContainer}>
              <InformationCircleIcon className={styles.notification__icon} />
            </div>
            <p>
              If you need to cancel a class, please contact our staff promptly
              via Facebook.
            </p>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default ClassDetailsCard;
