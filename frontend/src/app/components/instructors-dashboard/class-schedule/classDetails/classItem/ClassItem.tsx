import { formatTime24Hour, getEndTime } from "@/app/helper/utils/dateUtils";
import { useState } from "react";
import styles from "./ClassItem.module.scss";
import ClassStatus from "@/app/components/features/classDetail/classStatus/ClassStatus";
import { UsersIcon } from "@heroicons/react/24/solid";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import CheckboxInput from "@/app/components/elements/checkboxInput/CheckboxInput";
import { useRouter } from "next/navigation";
import {
  handleAttendanceUpdate,
  handleChildChange,
  handleClassStatusUpdate,
} from "@/app/helper/utils/classItemHandlers";

const ClassItem = ({
  instructorId,
  classItem,
  classId,
  isUpdatingData,
  setIsUpdatingData,
}: ClassItemProps) => {
  const initialAttendedChildrenIds = classItem.attendingChildren.map(
    (child) => child.id,
  );
  const [isEditingAttendance, setIsEditingAttendance] =
    useState<boolean>(false);
  const [attendedChildrenIdsToUpdate, setAttendedChildrenIdsToUpdate] =
    useState<number[]>(initialAttendedChildrenIds);

  const router = useRouter();

  const statusesForAttendance: ClassStatus[] = [
    "booked",
    "rebooked",
    "completed",
  ];
  const bookedStatuses: ClassStatus[] = ["booked", "rebooked"];

  const classDateTime = new Date(classItem.dateTime);
  const classStartTime = formatTime24Hour(classDateTime);
  const classStartTimeJST = formatTime24Hour(classDateTime, "Asia/Tokyo");
  const classEndTime = getEndTime(classDateTime);
  const isFreeTrial =
    classItem.isFreeTrial &&
    (classItem.status === "booked" || classItem.status === "rebooked");

  const handleCancelClick = () => {
    setAttendedChildrenIdsToUpdate(initialAttendedChildrenIds);
    setIsEditingAttendance(false);
  };

  return (
    <div
      key={classItem.id}
      className={`${styles.classItem} ${isFreeTrial ? styles.freeTrial : styles[classItem.status]} ${classItem.id === classId ? styles["classItem--selected"] : ""}`}
      onClick={() => {
        router.replace(
          `/instructors/${instructorId}/class-schedule/${classItem.id}`,
        );
      }}
    >
      <div className={styles.classItem__head}>
        <div className={styles.classItem__classInfo}>
          <ClassStatus
            status={classItem.status}
            isFreeTrial={isFreeTrial}
            className="classItem"
          />

          {statusesForAttendance.includes(classItem.status) && (
            <div className={styles.classItem__children}>
              <div className={styles.classItem__childrenIconContainer}>
                <UsersIcon className={styles.classItem__childrenIcon} />
              </div>

              {isEditingAttendance ? (
                <div className={styles.classItem__childrenToEdit}>
                  {classItem.customerChildren.map((child) => (
                    <CheckboxInput
                      label={child.name}
                      checked={attendedChildrenIdsToUpdate.includes(child.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(event) =>
                        handleChildChange(
                          event,
                          child.id,
                          setAttendedChildrenIdsToUpdate,
                        )
                      }
                    />
                  ))}
                </div>
              ) : initialAttendedChildrenIds.length === 0 ? (
                <div className={styles.classItem__childrenToEdit}>Absent</div>
              ) : (
                <div className={styles.classItem__childrenToEdit}>
                  {classItem.attendingChildren
                    .map((child) => child.name)
                    .join(", ")}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.classItem__time}>
          <span>{classStartTime}</span>
          <span>(JP: {classStartTimeJST})</span>
        </div>
      </div>

      <div className={styles.classItem__buttons}>
        {isEditingAttendance ? (
          <>
            <ActionButton
              btnText="Cancel"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelClick();
              }}
              className="cancelEditing"
              disabled={isUpdatingData}
            />
            <ActionButton
              btnText="Save Attendance"
              onClick={(e) => {
                e.stopPropagation();
                handleAttendanceUpdate({
                  classId: classItem.id,
                  instructorId,
                  classEndTime,
                  initialAttendedChildrenIds,
                  attendedChildrenIdsToUpdate,
                  isAdminAuthenticated: false,
                  setIsUpdatingData,
                  setIsEditingAttendance,
                });
              }}
              className="editAttendance"
              disabled={isUpdatingData}
            />
          </>
        ) : (
          <>
            {statusesForAttendance.includes(classItem.status) && (
              <ActionButton
                btnText="Edit Attendance"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingAttendance(true);
                }}
                className="editAttendance"
                disabled={isUpdatingData}
              />
            )}
            {bookedStatuses.includes(classItem.status) && (
              <ActionButton
                btnText="Complete Class"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClassStatusUpdate({
                    classId: classItem.id,
                    selectedStatus: "completed",
                    classEndTime,
                    isAdminAuthenticated: false,
                    instructorId,
                    setIsUpdatingData,
                  });
                }}
                className="completeBtn"
                disabled={isUpdatingData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClassItem;
