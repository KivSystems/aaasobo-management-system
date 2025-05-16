import React, { useEffect, useState } from "react";
import {
  formatTime24Hour,
  isPastClassEndTime,
  nHoursLater,
} from "@/app/helper/utils/dateUtils";
import styles from "./InstructorClassesTable.module.scss";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { editClass } from "@/app/helper/api/classesApi";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";

const InstructorClassesTable = ({
  instructorId,
  selectedDateClasses,
  timeZone,
  handleUpdateClassDetail,
  isAdminAuthenticate,
  classDate,
  classId,
}: {
  instructorId: number;
  selectedDateClasses: InstructorClassDetail[] | null;
  timeZone: string;
  handleUpdateClassDetail: (
    completedClassId: number,
    attendedChildren: Child[],
    updatedStatus: ClassStatus,
  ) => void;
  isAdminAuthenticate?: boolean;
  classDate: string;
  classId: number;
}) => {
  const [classes, setClasses] = useState<InstructorClassDetail[] | null>(null);
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<Set<number>>(
    new Set(),
  );
  const [selectedStatus, setSelectedStatus] = useState<ClassStatus>("booked");

  useEffect(() => {
    setClasses(selectedDateClasses);
  }, [selectedDateClasses]);

  if (!selectedDateClasses) {
    return <div>No classes</div>;
  }

  const handleEditClick = (
    classId: number,
    children: Child[],
    classStart: string,
    status: ClassStatus,
  ) => {
    if (!isPastClassEndTime(classStart, timeZone) && !isAdminAuthenticate) {
      return alert(
        "You cannot edit the class as it is before the class end time.",
      );
    }
    setEditingClassId(classId);
    const initialCheckedChildren = new Set(children.map((child) => child.id));
    setSelectedChildrenIds(initialCheckedChildren);
    setSelectedStatus(status);
  };

  const handleChildChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    changedChildId: number,
  ) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      selectedChildrenIds.add(changedChildId);
    } else {
      selectedChildrenIds.delete(changedChildId);
    }
    setSelectedChildrenIds(new Set(selectedChildrenIds));
  };

  const handleStatusChange = (changedStatus: ClassStatus) => {
    setSelectedStatus(changedStatus);
  };

  const handleCancelClick = () => {
    setEditingClassId(null);
    setSelectedChildrenIds(new Set());
    setSelectedStatus("booked");
  };

  const completeClass = async (
    classToCompleteId: number,
    registeredChildren: Child[], // All of the initially registered children(all the children of the customer)
    classStart: string,
    updatedStatus: ClassStatus,
    childrenWithoutEditingAttendance?: Child[],
  ) => {
    if (
      !isPastClassEndTime(classStart, timeZone) &&
      updatedStatus === "completed"
    ) {
      return alert(
        "You cannot complete the class as it is before the class end time.",
      );
    }

    const attendedChildrenIds = childrenWithoutEditingAttendance
      ? childrenWithoutEditingAttendance.map((child) => child.id)
      : updatedStatus === "canceledByInstructor"
        ? undefined
        : Array.from(selectedChildrenIds);

    const rebookableUntil =
      updatedStatus === "canceledByInstructor"
        ? nHoursLater(180 * 24, new Date(classStart)).toISOString() // If the class is canceled by the instructor, set rebookableUntil to 180 days (* 24 * 60 minutes) after the class dateTime
        : updatedStatus === "completed"
          ? null
          : undefined;

    try {
      await editClass(classToCompleteId, {
        childrenIds: attendedChildrenIds,
        status: updatedStatus,
        rebookableUntil,
      });

      setClasses((prev) => {
        if (prev === null) return prev;

        return prev.map((eachClass) =>
          eachClass.id === classToCompleteId
            ? {
                ...eachClass,
                attendingChildren:
                  childrenWithoutEditingAttendance ||
                  registeredChildren.filter((child) =>
                    attendedChildrenIds?.includes(child.id),
                  ),
                status: updatedStatus,
              }
            : eachClass,
        );
      });

      handleUpdateClassDetail(
        classToCompleteId,
        childrenWithoutEditingAttendance ||
          registeredChildren.filter((child) =>
            attendedChildrenIds?.includes(child.id),
          ),
        updatedStatus,
      );
      toast.success("Class status has been updated successfully!");
    } catch (error) {
      console.error("Failed to edit class:", error);
    }

    setEditingClassId(null);
    setSelectedChildrenIds(new Set());
    setSelectedStatus("booked");
  };

  const statusToString = (status: ClassStatus): string => {
    switch (status) {
      case "booked":
        return "Booked";
      case "completed":
        return "Completed";
      default:
        return "Invalid Class Status";
    }
  };

  return (
    <div className={styles.instructorClasses}>
      <div className={styles.instructorClasses__classDate}>{classDate}</div>

      {classes &&
        classes
          .filter((eachClass) => eachClass.status !== "canceledByCustomer")
          .map((eachClass) => {
            const classDateTime = new Date(eachClass.dateTime);
            const classStartTime = formatTime24Hour(classDateTime);

            let statusClass;

            switch (eachClass.status) {
              case "booked":
                statusClass = styles.statusBooked;
                break;
              case "completed":
                statusClass = styles.statusCompleted;
                break;
              case "canceledByInstructor":
                statusClass = styles.statusCanceledByInstructor;
                break;
              default:
                statusClass = styles.statusCanceled;
                break;
            }

            return (
              <div
                key={eachClass.id}
                className={`${styles.instructorClasses__classItem} ${statusClass} ${eachClass.id === classId ? styles.currentClassBackground : ""}`}
              >
                <div className={styles.instructorClasses__classItemHead}>
                  <div className={styles.instructorClasses__classInfo}>
                    {isAdminAuthenticate && editingClassId === eachClass.id ? (
                      <div>
                        <label>
                          {!isPastClassEndTime(eachClass.dateTime, timeZone) ? (
                            <>
                              <input
                                type="checkbox"
                                checked={selectedStatus === "booked"}
                                onChange={() => handleStatusChange("booked")}
                              />
                              <span>Booked</span>{" "}
                            </>
                          ) : (
                            <>
                              <input
                                type="checkbox"
                                checked={selectedStatus === "completed"}
                                onChange={() => handleStatusChange("completed")}
                              />
                              <span>Completed</span>{" "}
                            </>
                          )}
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedStatus === "canceledByInstructor"}
                            onChange={() =>
                              handleStatusChange("canceledByInstructor")
                            }
                          />
                          <span>Canceled by Instructor</span>
                        </label>
                      </div>
                    ) : eachClass.status === "canceledByInstructor" ? (
                      <div
                        className={
                          styles.instructorClasses__classStatusContainer
                        }
                      >
                        <div
                          className={styles.instructorClasses__iconContainer}
                        >
                          <ExclamationTriangleIcon
                            className={`${styles.instructorClasses__classStatusIcon} ${statusClass}`}
                          />
                        </div>

                        <div className={styles.instructorClasses__classStatus}>
                          Canceled by Instructor
                        </div>
                      </div>
                    ) : (
                      <div
                        className={
                          styles.instructorClasses__classStatusContainer
                        }
                      >
                        <CheckCircleIcon
                          className={`${styles.instructorClasses__classStatusIcon} ${statusClass}`}
                        />
                        <div className={styles.instructorClasses__classStatus}>
                          {statusToString(eachClass.status)}
                        </div>
                      </div>
                    )}

                    <div className={styles.instructorClasses__children}>
                      <div
                        className={
                          styles.instructorClasses__childrenIconContainer
                        }
                      >
                        <UsersIcon
                          className={styles.instructorClasses__childrenIcon}
                        />
                      </div>

                      {editingClassId === eachClass.id ? (
                        <div
                          className={styles.instructorClasses__childrenToEdit}
                        >
                          {eachClass.customerChildren.map((child) => (
                            <div
                              key={child.id}
                              className={styles.instructorClasses__childToEdit}
                            >
                              <input
                                type="checkbox"
                                checked={selectedChildrenIds.has(child.id)}
                                onChange={(event) =>
                                  handleChildChange(event, child.id)
                                }
                                style={{ marginRight: "0.2rem" }}
                              />
                              <span>{child.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : eachClass.attendingChildren.length === 0 ? (
                        <div
                          className={styles.instructorClasses__childrenToEdit}
                        >
                          Absent
                        </div>
                      ) : (
                        <div
                          className={styles.instructorClasses__childrenToEdit}
                        >
                          {eachClass.attendingChildren
                            .map((child) => child.name)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.instructorClasses__time}>
                    {isAdminAuthenticate ? (
                      <Link
                        href={`/admins/instructor-list/${instructorId}/class-schedule/${eachClass.id}`}
                        passHref
                      >
                        {classStartTime}
                      </Link>
                    ) : (
                      <Link
                        href={`/instructors/${instructorId}/class-schedule/${eachClass.id}`}
                        passHref
                      >
                        {classStartTime}
                      </Link>
                    )}
                  </div>
                </div>

                <div className={styles.instructorClasses__buttons}>
                  {editingClassId === eachClass.id &&
                  eachClass.status === "booked" ? (
                    <>
                      <ActionButton
                        btnText="Cancel"
                        onClick={handleCancelClick}
                        className="cancelEditing"
                      />
                      <ActionButton
                        btnText="Complete"
                        onClick={() =>
                          completeClass(
                            eachClass.id,
                            eachClass.customerChildren,
                            eachClass.dateTime,
                            selectedStatus,
                          )
                        }
                        className="completeBtn"
                      />
                    </>
                  ) : editingClassId === eachClass.id &&
                    eachClass.status === "completed" ? (
                    <>
                      <ActionButton
                        btnText="Cancel"
                        onClick={handleCancelClick}
                        className="cancelEditing"
                      />
                      <ActionButton
                        btnText="Update"
                        onClick={() =>
                          completeClass(
                            eachClass.id,
                            eachClass.customerChildren,
                            eachClass.dateTime,
                            selectedStatus,
                          )
                        }
                        className="completeBtn"
                      />
                    </>
                  ) : !isAdminAuthenticate &&
                    eachClass.status === "canceledByInstructor" ? (
                    ""
                  ) : !isAdminAuthenticate &&
                    eachClass.status === "completed" ? (
                    <ActionButton
                      btnText="Edit"
                      onClick={() =>
                        handleEditClick(
                          eachClass.id,
                          eachClass.attendingChildren,
                          eachClass.dateTime,
                          eachClass.status,
                        )
                      }
                      className="editAttendance"
                    />
                  ) : (
                    <>
                      <ActionButton
                        btnText="Edit"
                        onClick={() =>
                          handleEditClick(
                            eachClass.id,
                            eachClass.attendingChildren,
                            eachClass.dateTime,
                            eachClass.status,
                          )
                        }
                        className="editAttendance"
                      />
                      <ActionButton
                        btnText="Complete"
                        onClick={() =>
                          completeClass(
                            eachClass.id,
                            eachClass.customerChildren,
                            eachClass.dateTime,
                            "completed",
                            eachClass.attendingChildren,
                          )
                        }
                        className="completeBtn"
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
    </div>
  );
};

export default InstructorClassesTable;
