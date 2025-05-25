"use client";

import {
  isPastPreviousDayDeadline,
  hasTimePassed,
} from "../../../helper/utils/dateUtils";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import styles from "./ClassDetail.module.scss";
import { UsersIcon } from "@heroicons/react/24/solid";
import { cancelClass } from "@/app/helper/api/classesApi";
import { revalidateCustomerCalendar } from "@/app/actions/revalidate";
import { toast } from "react-toastify";
import ClassStatus from "./classStatus/ClassStatus";
import ClassDateTime from "./classDateTime/ClassDateTime";
import ClassUrl from "./classUrl/ClassUrl";
import ClassNotification from "./classNotification/ClassNotification";
import ClassInstructor from "./classInstructor/ClassInstructor";
import { NO_CLASS_DETAILS } from "@/app/helper/messages/customerDashboard";

const ClassDetail = ({
  customerId, // Necessary when implementing the Rescheduling functionality
  classDetail,
  isAdminAuthenticated, // Necessary when implementing the Rescheduling functionality
  handleModalClose,
  language,
}: {
  customerId: number;
  classDetail: CustomerClass | null;
  isAdminAuthenticated?: boolean;
  handleModalClose: () => void;
  language: LanguageType;
}) => {
  if (!classDetail) {
    return <div>{NO_CLASS_DETAILS[language]}</div>;
  }

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

  return (
    <div className={`${styles.classCard} ${styles[classDetail.classStatus]}`}>
      <ClassStatus status={classDetail.classStatus} language={language} />

      <ClassInstructor
        classStatus={classDetail.classStatus}
        instructorIcon={classDetail.instructorIcon}
        instructorNickname={classDetail.instructorNickname}
      />

      <ClassDateTime classStart={classDetail.start} language={language} />

      {/* Children Attendance */}
      {(classDetail.classStatus === "booked" ||
        classDetail.classStatus === "rebooked" ||
        classDetail.classStatus === "completed") && (
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
      {/* Only render if the class status is "booked" or "rebooked", and the class has not ended yet. */}
      {(classDetail.classStatus === "booked" ||
        classDetail.classStatus === "rebooked") &&
        !hasTimePassed(classDetail.end) && (
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
    </div>
  );
};

export default ClassDetail;
