import {
  isPastPreviousDayDeadline,
  isPastClassDateTime,
  formatShortDate,
  formatTime24Hour,
} from "../../../helper/utils/dateUtils";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import styles from "./ClassesTable.module.scss";
import Image from "next/image";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cancelSelectedClasses } from "@/app/actions/cancelSelectedClasses";
import {
  CANCELATION_NOT_ALLOWED_MESSAGE,
  CONFIRM_CLASS_CANCELLATION,
  FAILED_TO_CANCEL_CLASSES,
  SELECTED_CLASSES_CANCELLATION_SUCCESS,
} from "@/app/helper/messages/customerDashboard";

const ClassesTable = ({
  upcomingClasses,
  selectedClasses,
  setSelectedClasses,
  customerId,
  isAdminAuthenticated,
  handleCancelingModalClose,
}: ClassesTableProps) => {
  // if (!upcomingClasses) {
  //   return (
  //     // TODO: check the padding
  //     <div className={styles.classesTable__wrapper}>
  //       <div className={styles.classesTable__container}>
  //         No upcoming classes
  //       </div>
  //     </div>
  //   );
  // }

  const handleBulkCancel = async () => {
    if (selectedClasses.length === 0) return;

    // Exclude classes that have passed the previous day's cancellation deadline.
    const pastPrevDayClasses = selectedClasses.filter((eachClass) =>
      isPastPreviousDayDeadline(eachClass.classDateTime, "Asia/Tokyo"),
    );

    if (pastPrevDayClasses.length > 0) {
      alert(CANCELATION_NOT_ALLOWED_MESSAGE);

      const pastPrevDayClassIds = pastPrevDayClasses.map(
        (pastClass) => pastClass.classId,
      );
      const updatedSelectedClasses = selectedClasses.filter(
        (eachClass) => !pastPrevDayClassIds.includes(eachClass.classId),
      );
      return setSelectedClasses(updatedSelectedClasses);
    }

    const confirmed = window.confirm(CONFIRM_CLASS_CANCELLATION);
    if (!confirmed) return handleCancelingModalClose();

    const classesToCancel = selectedClasses.map(
      (classItem) => classItem.classId,
    );

    try {
      await cancelSelectedClasses(
        classesToCancel,
        isAdminAuthenticated,
        customerId,
      );

      handleCancelingModalClose();
      toast.success(SELECTED_CLASSES_CANCELLATION_SUCCESS);
    } catch (error) {
      // TODO: Using context, decide which language to use to display error message
      alert(FAILED_TO_CANCEL_CLASSES);
    }
  };

  const toggleSelectClass = (classId: number, classDateTime: string) => {
    setSelectedClasses((prev) => {
      const updated = prev.filter((item) => item.classId !== classId);
      if (updated.length === prev.length) {
        updated.push({ classId, classDateTime });
      }
      return updated;
    });
  };

  const showSameDayCancelNotice = upcomingClasses.some(
    ({ dateTime }) =>
      isPastPreviousDayDeadline(dateTime, "Asia/Tokyo") &&
      !isPastClassDateTime(dateTime, "Asia/Tokyo"),
  );

  const handleRowClick = (classId: number, dateTime: string) => {
    if (isPastPreviousDayDeadline(dateTime, "Asia/Tokyo")) return;
    toggleSelectClass(classId, dateTime);
  };

  return (
    <div className={styles.classesTable__wrapper}>
      <div className={styles.classesTable__container}>
        <div className={styles.classesTable__tableWrapper}>
          <table className={styles.classesTable__table}>
            <thead className={styles.classesTable__head}>
              <tr>
                <th className={styles.classesTable__th}></th>
                <th className={styles.classesTable__th}>Date</th>
                <th className={styles.classesTable__th}>Time</th>
                <th className={styles.classesTable__th}>Instructor</th>
                <th className={styles.classesTable__th}>Children</th>
              </tr>
            </thead>
            <tbody className={styles.classesTable__body}>
              {upcomingClasses.map((eachClass) => {
                const classDateTime = new Date(eachClass.dateTime);
                const classDate = formatShortDate(classDateTime);
                const classTime = formatTime24Hour(classDateTime);

                const pastPrevDayDeadline = isPastPreviousDayDeadline(
                  eachClass.dateTime,
                  "Asia/Tokyo",
                );
                const pastClassTimeDeadline = isPastClassDateTime(
                  eachClass.dateTime,
                  "Asia/Tokyo",
                );

                // Check if the current class is selected
                const isSelected = selectedClasses.some(
                  (item) =>
                    item.classId === eachClass.id &&
                    item.classDateTime === eachClass.dateTime,
                );

                return (
                  <tr
                    key={eachClass.id}
                    className={`${styles.classesTable__row} ${isSelected ? styles.classesTable__rowSelected : ""} ${pastPrevDayDeadline ? styles.tableRowDisabled : ""}`}
                    onClick={() =>
                      handleRowClick(eachClass.id, eachClass.dateTime)
                    }
                  >
                    <td className={styles.classesTable__td}>
                      {/* condition 1: before the day of the class => with checkbox*/}
                      {/* condition 2: the same day of the class or after the class starts => no checkbox*/}
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
                    </td>

                    <td className={styles.classesTable__td}>
                      <div className={styles.classesTable__dateContainer}>
                        <div className={styles.classesTable__date}>
                          {classDate}
                        </div>

                        {pastPrevDayDeadline && !pastClassTimeDeadline ? (
                          <InformationCircleIcon
                            className={styles.classesTable__infoIcon}
                          />
                        ) : null}
                      </div>
                    </td>

                    <td className={styles.classesTable__td}>
                      <div className={styles.classesTable__time}>
                        <p>{classTime}</p>
                      </div>
                    </td>

                    <td className={styles.classesTable__td}>
                      <div className={styles.classesTable__instructorContainer}>
                        <Image
                          src={`/instructors/${eachClass.instructor.icon}`}
                          alt={eachClass.instructor.nickname}
                          width={40}
                          height={40}
                          priority
                          className={styles.classesTable__instructorIcon}
                        />
                        <div className={styles.classesTable__instructorName}>
                          {eachClass.instructor.nickname}
                        </div>
                      </div>
                    </td>

                    <td className={styles.classesTable__td}>
                      {eachClass.attendingChildren.join(", ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {showSameDayCancelNotice && (
          <div className={styles.classesTable__noticeContainer}>
            <InformationCircleIcon
              className={styles.classesTable__noticeIcon}
            />
            <div className={styles.classesTable__notice}>
              If you need to cancel today&apos;s classes, please contact our
              staff via LINE. Please note that no make-up classes will be
              available in this case.
            </div>
          </div>
        )}
        <div className={styles.classesTable__buttons}>
          <ActionButton
            btnText="Back"
            className="back"
            onClick={handleCancelingModalClose}
          />
          <ActionButton
            onClick={handleBulkCancel}
            disabled={selectedClasses.length === 0}
            btnText="Cancel Selected Classes"
            className="cancelSelectedClasses"
          />
        </div>
      </div>
    </div>
  );
};

export default ClassesTable;
