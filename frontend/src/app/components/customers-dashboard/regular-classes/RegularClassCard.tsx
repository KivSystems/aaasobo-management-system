"use client";

import { PencilIcon, AcademicCapIcon } from "@heroicons/react/24/solid";
import {
  formatTime,
  getEndTime,
  getWeekday,
} from "@/app/helper/utils/dateUtils";
import styles from "./RegularClassCard.module.scss";

interface RegularClassCardProps {
  recurringClass: RecurringClass;
  onEdit?: (id: number) => void;
}

function RegularClassCard({ recurringClass, onEdit }: RegularClassCardProps) {
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
            aria-label="Edit class"
          >
            <PencilIcon className={styles.editIcon} />
          </button>
        )}
      </div>

      <div className={styles.divider}></div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <span className={styles.text}>
            <strong>Children:</strong>{" "}
            {recurringClass.recurringClassAttendance
              .map((attendance) => attendance.children.name)
              .join(", ") || "No children assigned"}
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.text}>
            <strong>Class URL:</strong>{" "}
            <a
              href={recurringClass.instructor?.classURL}
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
                : "No URL provided"}
            </a>
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.text}>
            <strong>Started:</strong>{" "}
            {classDateTime.toLocaleDateString("en-US", {
              timeZone,
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {recurringClass.endAt && (
          <div className={styles.detailItem}>
            <span className={styles.text}>
              <strong>Ended:</strong>{" "}
              {new Date(recurringClass.endAt).toLocaleDateString("en-US", {
                timeZone,
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegularClassCard;
