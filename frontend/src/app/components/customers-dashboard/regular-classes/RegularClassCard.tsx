"use client";

import { PencilIcon, AcademicCapIcon } from "@heroicons/react/24/solid";
import {
  formatTime,
  getEndTime,
  getWeekday,
} from "@/app/helper/utils/dateUtils";
import styles from "./RegularClassCard.module.scss";
import {
  CHILDREN_LABEL,
  CLASS_URL_LABEL,
  STARTED_LABEL,
  ENDED_LABEL,
  NO_CHILDREN_ASSIGNED,
  NO_URL_PROVIDED,
  NO_DATE_SELECTED,
  EDIT_CLASS_ARIA_LABEL,
} from "@/app/helper/messages/customerDashboard";

interface RegularClassCardProps {
  recurringClass: RecurringClass;
  onEdit?: (id: number) => void;
  language: LanguageType;
}

function RegularClassCard({
  recurringClass,
  onEdit,
  language,
}: RegularClassCardProps) {
  const timeZone = "Asia/Tokyo"; // Use JST for consistency

  const classDateTime = new Date(recurringClass.dateTime);
  const startTime = formatTime(classDateTime, timeZone);
  const endTime = formatTime(getEndTime(classDateTime), timeZone);
  const day = getWeekday(classDateTime, timeZone);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(recurringClass.id);
    }
  };

  return (
    <div className={styles.card}>
      {/* Option 1: Edit button in top-right corner */}
      <div className={styles.cardHeader}>
        <div className={styles.instructorSection}>
          <AcademicCapIcon className={styles.instructorIcon} />
          <div className={styles.headerInfo}>
            <div className={styles.instructorName}>
              {recurringClass.instructor?.nickname || "Unknown Instructor"}
            </div>
            <div className={styles.scheduleTime}>
              {day} {startTime}-{endTime}
            </div>
          </div>
        </div>
        {onEdit && (
          <button
            onClick={handleEdit}
            className={styles.editButtonTopRight}
            aria-label={EDIT_CLASS_ARIA_LABEL[language]}
          >
            <PencilIcon className={styles.editIcon} />
          </button>
        )}
      </div>

      <div className={styles.divider}></div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <span className={styles.text}>
            <strong>{CHILDREN_LABEL[language]}:</strong>{" "}
            {recurringClass.recurringClassAttendance
              .map((attendance) => attendance.children.name)
              .join(", ") || NO_CHILDREN_ASSIGNED[language]}
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.text}>
            <strong>{CLASS_URL_LABEL[language]}:</strong>{" "}
            <a
              href={recurringClass.instructor?.classURL || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {recurringClass.instructor?.classURL
                ? (() => {
                    try {
                      const url = new URL(recurringClass.instructor.classURL);
                      return url.hostname.replace("www.", "");
                    } catch {
                      return recurringClass.instructor.classURL;
                    }
                  })()
                : NO_URL_PROVIDED[language]}
            </a>
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.text}>
            <strong>{STARTED_LABEL[language]}:</strong>{" "}
            {recurringClass.dateTime
              ? new Date(recurringClass.dateTime).toLocaleDateString(
                  language === "ja" ? "ja-JP" : "en-US",
                  {
                    timeZone,
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  },
                )
              : NO_DATE_SELECTED[language]}
          </span>
        </div>

        {recurringClass.endAt && (
          <div className={styles.detailItem}>
            <span className={styles.text}>
              <strong>{ENDED_LABEL[language]}:</strong>{" "}
              {new Date(recurringClass.endAt).toLocaleDateString(
                language === "ja" ? "ja-JP" : "en-US",
                {
                  timeZone,
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                },
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegularClassCard;
