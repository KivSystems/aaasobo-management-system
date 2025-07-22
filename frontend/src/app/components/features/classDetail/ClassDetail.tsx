"use client";

import {
  isPastPreviousDayDeadline,
  formatClassDetailFooter,
} from "../../../helper/utils/dateUtils";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import styles from "./ClassDetail.module.scss";
import { UsersIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import ClassStatus from "./classStatus/ClassStatus";
import ClassDateTime from "./classDateTime/ClassDateTime";
import ClassUrl from "./classUrl/ClassUrl";
import ClassNotification from "./classNotification/ClassNotification";
import ClassInstructor from "./classInstructor/ClassInstructor";
import {
  CANCEL_CLASS_CONFIRM_MESSAGE,
  CANNOT_CANCEL_ON_OR_AFTER_CLASS_DAY,
  NO_CLASS_DETAILS,
} from "@/app/helper/messages/customerDashboard";
import { cancelClassAction } from "@/app/actions/cancelSelectedClasses";

const ClassDetail = ({
  customerId,
  classDetail,
  isAdminAuthenticated,
  handleModalClose,
  language,
}: ClassDetailProps) => {
  if (!classDetail) {
    return <div>{NO_CLASS_DETAILS[language]}</div>;
  }

  const isFreeTrial =
    classDetail.isFreeTrial &&
    (classDetail.classStatus === "booked" ||
      classDetail.classStatus === "rebooked");
  const statusesForAttendance: ClassStatus[] = [
    "booked",
    "rebooked",
    "completed",
  ];
  const statusesForCancelBtn: ClassStatus[] = ["booked", "rebooked"];

  const handleCancel = async (
    classId: number,
    classDateTime: string,
    customerId: number,
  ) => {
    const isAfterPreviousDayDeadline = isPastPreviousDayDeadline(classDateTime);

    const confirmed = window.confirm(CANCEL_CLASS_CONFIRM_MESSAGE[language]);
    if (!confirmed) return;

    if (isAfterPreviousDayDeadline)
      return alert(CANNOT_CANCEL_ON_OR_AFTER_CLASS_DAY[language]);

    const cancelationResult = await cancelClassAction(
      classId,
      isAdminAuthenticated,
      customerId,
    );

    if (!cancelationResult.success)
      return alert(cancelationResult.message[language]);

    handleModalClose();
    toast.success(cancelationResult.message[language]);
  };

  return (
    <div
      className={`${styles.classCard} ${isFreeTrial ? styles.freeTrial : styles[classDetail.classStatus]}`}
    >
      <ClassStatus
        status={classDetail.classStatus}
        isFreeTrial={isFreeTrial}
        language={language}
      />

      <ClassInstructor
        classStatus={isFreeTrial ? "freeTrial" : classDetail.classStatus}
        instructorIcon={classDetail.instructorIcon}
        instructorNickname={classDetail.instructorNickname}
      />

      <ClassDateTime classStart={classDetail.start} language={language} />

      {/* Children Attendance */}
      {statusesForAttendance.includes(classDetail.classStatus) && (
        <div className={styles.children}>
          <div className={styles.children__iconContainer}>
            <UsersIcon className={styles.children__icon} />
          </div>
          <div className={styles.children__names}>{classDetail.title}</div>
        </div>
      )}

      <ClassUrl
        classEnd={classDetail.end}
        classStatus={classDetail.classStatus}
        classUrl={classDetail.instructorClassURL}
        meetingId={classDetail.instructorMeetingId}
        passCode={classDetail.instructorPasscode}
        language={language}
      />

      {/* Cancel Booking button */}
      {/* Only render if the class is "booked" or "rebooked" and hasn't passed the previous-day deadline. */}
      {statusesForCancelBtn.includes(classDetail.classStatus) &&
        !isPastPreviousDayDeadline(classDetail.start) && (
          <div className={styles.buttons}>
            <ActionButton
              onClick={() =>
                handleCancel(classDetail.classId, classDetail.start, customerId)
              }
              btnText={
                language === "ja" ? "予約をキャンセル" : "Cancel Booking"
              }
              className="cancelBooking"
            />
          </div>
        )}

      <ClassNotification
        classStatus={classDetail.classStatus}
        classStart={classDetail.start}
        classEnd={classDetail.end}
        rebookableUntil={classDetail.rebookableUntil}
        language={language}
      />

      <div className={styles.footer}>
        {formatClassDetailFooter(classDetail.updatedAt)} {classDetail.classCode}
      </div>
    </div>
  );
};

export default ClassDetail;
