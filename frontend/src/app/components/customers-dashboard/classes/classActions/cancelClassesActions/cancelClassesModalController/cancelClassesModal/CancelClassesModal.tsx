import styles from "./CancelClassesModal.module.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cancelSelectedClasses } from "@/app/actions/cancelSelectedClasses";
import {
  CANCELATION_NOT_ALLOWED_MESSAGE,
  CONFIRM_CLASS_CANCELLATION,
  FAILED_TO_CANCEL_CLASSES,
  SELECTED_CLASSES_CANCELLATION_SUCCESS,
  TODAYS_CLASS_CANCELLATION_NOTICE,
} from "@/app/helper/messages/customerDashboard";
import { isPastPreviousDayDeadline } from "@/app/helper/utils/dateUtils";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import Table from "@/app/components/elements/table/Table";
import UpcomingClasses from "./upcomingClasses/UpcomingClasses";
import InfoBanner from "@/app/components/elements/infoBanner/InfoBanner";

export default function CancelClassesModal({
  upcomingClasses,
  selectedClasses,
  setSelectedClasses,
  customerId,
  isAdminAuthenticated,
  handleCancelingModalClose,
  toggleSelectClass,
}: CancelClassesModalProps) {
  // TODO: useCallback
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
      // TODO: Update upcomingClasses and show Loading UI
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

  const showSameDayCancelNotice =
    upcomingClasses &&
    upcomingClasses.some(({ dateTime }) =>
      isPastPreviousDayDeadline(dateTime, "Asia/Tokyo"),
    );

  return (
    <div className={styles.modalWrapper}>
      <div className={styles.modalContent}>
        <Table
          className="cancelClasses"
          headItems={["", "Date", "Time", "Instructor", "Children"]}
        >
          <UpcomingClasses
            upcomingClasses={upcomingClasses}
            selectedClasses={selectedClasses}
            toggleSelectClass={toggleSelectClass}
          />
        </Table>

        {showSameDayCancelNotice && (
          <InfoBanner info={TODAYS_CLASS_CANCELLATION_NOTICE} />
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
            btnText={`Cancel Classes ${selectedClasses.length > 0 ? `(${selectedClasses.length})` : ""}`}
            className="cancelSelectedClasses"
          />
        </div>
      </div>
    </div>
  );
}
