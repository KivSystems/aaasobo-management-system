import {
  formatShortDate,
  formatTime24Hour,
  isPastPreviousDayDeadline,
} from "@/app/helper/utils/dateUtils";
import styles from "./UpcomingClasses.module.scss";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useEffect } from "react";

export default function UpcomingClasses({
  upcomingClasses,
  selectedClasses,
  setSelectedClasses,
  isCancelingModalOpen,
}: UpcomingClassesProps) {
  useEffect(() => {
    if (!isCancelingModalOpen) setSelectedClasses([]);
  }, [isCancelingModalOpen, setSelectedClasses]);

  const toggleSelectClass = (classId: number, classDateTime: string) => {
    setSelectedClasses((prev: SelectedClass[]) => {
      const updated = prev.filter((item) => item.classId !== classId);
      if (updated.length === prev.length) {
        updated.push({ classId, classDateTime });
      }
      return updated;
    });
  };

  return (
    <>
      {upcomingClasses.map((eachClass) => {
        const classDateTime = new Date(eachClass.dateTime);
        // TODO: Determine the language (jp or en) for classDate based on context.
        // const classDate = formatShortDate(classDateTime, "ja-JP");
        const classDate = formatShortDate(classDateTime);
        const classTime = formatTime24Hour(classDateTime);

        const pastPrevDayDeadline = isPastPreviousDayDeadline(
          eachClass.dateTime,
        );

        // Check if the current class is selected
        const isSelected = selectedClasses.some(
          (item) => item.classId === eachClass.id,
        );

        return (
          <div
            key={eachClass.id}
            className={`${styles.upcomingClass} ${isSelected ? styles["upcomingClass--selected"] : ""} ${pastPrevDayDeadline ? styles["upcomingClass--disabled"] : ""}`}
            onClick={() => toggleSelectClass(eachClass.id, eachClass.dateTime)}
          >
            <div className={styles.checkbox}>
              {/* condition 1: before the day of the class => with checkbox*/}
              {/* condition 2: the same or after the day of the class => no checkbox*/}
              {!pastPrevDayDeadline ? (
                <input
                  type="checkbox"
                  checked={selectedClasses.some(
                    (item) => item.classId === eachClass.id,
                  )}
                  onChange={() =>
                    toggleSelectClass(eachClass.id, eachClass.dateTime)
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                ""
              )}
            </div>

            <div className={`${styles.item} ${styles["item--date"]}`}>
              <p>{classDate}</p>
              {pastPrevDayDeadline ? (
                <InformationCircleIcon className={styles.infoIcon} />
              ) : null}
            </div>

            <div className={styles.item}>
              <p>{classTime}</p>
            </div>

            <div className={`${styles.item} ${styles["item--instructor"]}`}>
              <Image
                src={`/instructors/${eachClass.instructor.icon}`}
                alt={eachClass.instructor.nickname}
                width={40}
                height={40}
                priority
                className={styles.instructorIcon}
              />
              <p>{eachClass.instructor.nickname}</p>
            </div>

            <div className={styles.item}>
              <p>{eachClass.attendingChildren.join(", ")}</p>
            </div>
          </div>
        );
      })}
    </>
  );
}
